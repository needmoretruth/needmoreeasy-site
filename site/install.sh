#!/bin/sh
# Installs the prebuilt `nme` command from the latest NeedMoreEasy release.
#
#   curl -fsSL https://needmoreeasy.com/install.sh | sh
#
# nme goes into ~/.nme/bin, and that folder is added to PATH in your shell's
# start-up file so a new terminal finds it. The download is checked against the
# SHA-256 sums published with the release; nothing is installed if it differs.
#
#   NME_VERSION=0.10.0     install that version instead of the latest one
#   NME_HOME=/some/folder  install into /some/folder/bin instead of ~/.nme/bin
#   NME_NO_MODIFY_PATH=1   leave shell start-up files alone
#
# To uninstall: delete ~/.nme and the two lines marked "# NME" in the start-up
# file this script names when it finishes.
set -eu

repo="needmoretruth/needmoreeasy"
nme_home="${NME_HOME:-$HOME/.nme}"
bin="$nme_home/bin"

say() { printf '%s\n' "$*"; }
fail() { printf 'nme install: %s\n' "$*" >&2; exit 1; }

case "$(uname -s)" in
  Linux) os=unknown-linux-musl ;;
  Darwin) os=apple-darwin ;;
  *) fail "this script is for macOS and Linux. On Windows, run this in PowerShell: irm https://needmoreeasy.com/install.ps1 | iex" ;;
esac
case "$(uname -m)" in
  x86_64 | amd64) arch=x86_64 ;;
  arm64 | aarch64) arch=aarch64 ;;
  *) fail "there is no prebuilt nme for $(uname -m). It can be built from source: https://needmoreeasy.com/learn/install" ;;
esac
# A terminal running under Rosetta reports x86_64 on an Apple silicon Mac.
if [ "$os" = apple-darwin ] && [ "$arch" = x86_64 ] &&
  [ "$(sysctl -n hw.optional.arm64 2>/dev/null || echo 0)" = 1 ]; then
  arch=aarch64
fi
target="$arch-$os"
asset="nme-$target.tar.gz"
if [ -n "${NME_VERSION:-}" ]; then
  base="https://github.com/$repo/releases/download/v${NME_VERSION#v}"
else
  base="https://github.com/$repo/releases/latest/download"
fi

if command -v curl >/dev/null 2>&1; then
  fetch() { curl --proto '=https' --tlsv1.2 -fsSL "$1" -o "$2"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -q --https-only "$1" -O "$2"; }
else
  fail "this script needs curl or wget to download nme"
fi
if command -v sha256sum >/dev/null 2>&1; then
  sha256() { sha256sum "$1" | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
  sha256() { shasum -a 256 "$1" | awk '{print $1}'; }
else
  fail "this script needs sha256sum or shasum to check the download"
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT INT TERM

say "Downloading nme for $target ..."
fetch "$base/$asset" "$tmp/$asset" || fail "could not download $base/$asset"
fetch "$base/SHA256SUMS" "$tmp/SHA256SUMS" || fail "could not download $base/SHA256SUMS"
expected=$(awk -v file="$asset" '$2 == file || $2 == "*" file {print $1}' "$tmp/SHA256SUMS")
[ -n "$expected" ] || fail "$asset is not listed in the release's SHA256SUMS"
[ "$(sha256 "$tmp/$asset")" = "$expected" ] ||
  fail "the download does not match its published SHA-256 sum, so nothing was installed"

tar -xzf "$tmp/$asset" -C "$tmp"
mkdir -p "$bin"
cp "$tmp/nme-$target/nme" "$bin/nme.new"
chmod 755 "$bin/nme.new"
mv -f "$bin/nme.new" "$bin/nme"
rm -rf "$nme_home/licenses"
cp -R "$tmp/nme-$target/licenses" "$nme_home/licenses"
cp "$tmp/nme-$target/LICENSE" "$tmp/nme-$target/THIRD-PARTY-NOTICES.md" "$nme_home/"

say "Installed $("$bin/nme" --version) in $bin"

startup=""
case ":$PATH:" in
  *":$bin:"*) ;;
  *)
    if [ "${NME_NO_MODIFY_PATH:-0}" = 1 ]; then
      say "Add $bin to PATH to use nme from any folder."
    else
      case "$(basename "${SHELL:-sh}")" in
        zsh) startup="$HOME/.zshrc" ;;
        bash) if [ "$os" = apple-darwin ]; then startup="$HOME/.bash_profile"; else startup="$HOME/.bashrc"; fi ;;
        fish) startup="$HOME/.config/fish/conf.d/nme.fish" ;;
        *) startup="$HOME/.profile" ;;
      esac
      if ! grep -qsF "$bin" "$startup"; then
        mkdir -p "$(dirname "$startup")"
        case "$startup" in
          *.fish) printf '# NME\nfish_add_path "%s"\n' "$bin" >>"$startup" ;;
          *) printf '\n# NME\nexport PATH="%s:$PATH"\n' "$bin" >>"$startup" ;;
        esac
      fi
      say "Added $bin to PATH in $startup. Open a new terminal to use nme."
    fi
    ;;
esac

python=""
for candidate in python3 python; do
  if command -v "$candidate" >/dev/null 2>&1 &&
    "$candidate" -c 'import sys; sys.exit(sys.version_info < (3, 8))' 2>/dev/null; then
    python="$candidate"
    break
  fi
done
if [ -n "$python" ]; then
  say "nme runs your programs with $("$python" --version 2>&1)."
else
  say ""
  say "One more step: nme turns your program into Python and runs it with Python 3.8"
  say "or newer, which this computer does not have yet. Install it from"
  say "https://www.python.org/downloads/ and nme is ready."
fi
say ""
say "Try it:  echo 'say Hello' > hello.nme && nme run hello"
