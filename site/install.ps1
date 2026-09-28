# Installs the prebuilt `nme` command from the latest NeedMoreEasy release.
#
#   irm https://needmoreeasy.com/install.ps1 | iex
#
# nme.exe goes into %LOCALAPPDATA%\nme\bin, and that folder is added to your
# user PATH so a new terminal finds it. The download is checked against the
# SHA-256 sums published with the release; nothing is installed if it differs.
#
#   $env:NME_VERSION = '0.10.0'   install that version instead of the latest one
#   $env:NME_HOME = 'D:\nme'      install into D:\nme\bin instead
#   $env:NME_NO_MODIFY_PATH = '1' leave PATH alone
#
# To uninstall: delete %LOCALAPPDATA%\nme and remove its bin folder from your
# user PATH (Settings > System > About > Advanced system settings >
# Environment Variables).

function Install-Nme {
    $ErrorActionPreference = 'Stop'
    $ProgressPreference = 'SilentlyContinue'
    $repo = 'needmoretruth/needmoreeasy'
    $nmeHome = if ($env:NME_HOME) { $env:NME_HOME } else { Join-Path $env:LOCALAPPDATA 'nme' }
    $bin = Join-Path $nmeHome 'bin'

    # Windows on ARM runs the x64 build through its built-in emulation.
    if ($env:PROCESSOR_ARCHITECTURE -notin @('AMD64', 'ARM64')) {
        throw "there is no prebuilt nme for $($env:PROCESSOR_ARCHITECTURE). It can be built from source: https://needmoreeasy.com/learn/install"
    }
    $target = 'x86_64-pc-windows-msvc'
    $asset = "nme-$target.zip"
    $base = if ($env:NME_VERSION) {
        "https://github.com/$repo/releases/download/v$($env:NME_VERSION.TrimStart('v'))"
    } else {
        "https://github.com/$repo/releases/latest/download"
    }

    # Windows PowerShell 5.1 still defaults to TLS 1.0 on some machines.
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

    $tmp = Join-Path ([IO.Path]::GetTempPath()) ("nme-install-" + [Guid]::NewGuid())
    New-Item -ItemType Directory -Path $tmp | Out-Null
    try {
        Write-Host "Downloading nme for $target ..."
        $archive = Join-Path $tmp $asset
        $sums = Join-Path $tmp 'SHA256SUMS'
        Invoke-WebRequest -UseBasicParsing -Uri "$base/$asset" -OutFile $archive
        Invoke-WebRequest -UseBasicParsing -Uri "$base/SHA256SUMS" -OutFile $sums
        $expected = Get-Content $sums | ForEach-Object {
            $fields = $_ -split '\s+'
            if ($fields.Count -ge 2 -and $fields[1].TrimStart('*') -eq $asset) { $fields[0] }
        } | Select-Object -First 1
        if (-not $expected) { throw "$asset is not listed in the release's SHA256SUMS" }
        $actual = (Get-FileHash -Algorithm SHA256 -Path $archive).Hash
        if ($actual -ne $expected) {
            throw 'the download does not match its published SHA-256 sum, so nothing was installed'
        }

        Expand-Archive -Path $archive -DestinationPath $tmp -Force
        $unpacked = Join-Path $tmp "nme-$target"
        New-Item -ItemType Directory -Path $bin -Force | Out-Null
        Copy-Item (Join-Path $unpacked 'nme.exe') (Join-Path $bin 'nme.exe') -Force
        Copy-Item (Join-Path $unpacked 'LICENSE'), (Join-Path $unpacked 'THIRD-PARTY-NOTICES.md') $nmeHome -Force
        Copy-Item (Join-Path $unpacked 'licenses') $nmeHome -Recurse -Force
    } finally {
        Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
    }

    $nme = Join-Path $bin 'nme.exe'
    Write-Host "Installed $(& $nme --version) in $bin"

    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $entries = if ($userPath) { $userPath -split ';' } else { @() }
    if ($entries -notcontains $bin) {
        if ($env:NME_NO_MODIFY_PATH -eq '1') {
            Write-Host "Add $bin to your PATH to use nme from any folder."
        } else {
            $newPath = if ($userPath) { "$userPath;$bin" } else { $bin }
            [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
            Write-Host "Added $bin to your user PATH. New terminals will find nme."
        }
    }
    if (($env:Path -split ';') -notcontains $bin) { $env:Path = "$bin;$env:Path" }

    $python = $null
    foreach ($candidate in @('py', 'python')) {
        if (Get-Command $candidate -ErrorAction SilentlyContinue) {
            & $candidate -c 'import sys; sys.exit(sys.version_info < (3, 8))' 2>$null
            if ($LASTEXITCODE -eq 0) { $python = $candidate; break }
        }
    }
    if ($python) {
        Write-Host "nme runs your programs with $(& $python --version 2>&1)."
    } else {
        Write-Host ''
        Write-Host 'One more step: nme turns your program into Python and runs it with Python 3.8'
        Write-Host 'or newer, which this computer does not have yet. Install it from'
        Write-Host 'https://www.python.org/downloads/ (keep "py launcher" ticked) and nme is ready.'
    }
    Write-Host ''
    Write-Host "Try it:  Set-Content hello.nme 'say Hello'; nme run hello"
}

Install-Nme
