# needmoreeasy.com

The website for the [NeedMoreEasy](https://github.com/needmoretruth/needmoreeasy)
language. A static site on Cloudflare Pages with the real compiler and a real
Python interpreter compiled to WebAssembly, so a visitor can write NME and see
both the Python it becomes and the output it produces — without installing
anything and without a server anywhere in the path.

```
crates/nme-web/    NME source  ->  Python source        (wraps the upstream nme-core)
crates/nme-run/    Python source -> output              (embeds RustPython)
site/              the site itself; this folder is what gets published
scripts/           build + deploy + a preview server + the example regression check
```

## Live

| Address | What it does |
|---|---|
| `needmoreeasy.com` | the site; English at the root |
| `needmoreeasy.com/ko/` | the Korean version |
| `www.needmoreeasy.com` | same site |
| `nmelang.com` | 301 to `needmoreeasy.com`, path preserved |

English is the site. A visitor whose browser asks for Korean is forwarded to
`/ko/` once; clicking `EN` stores that choice and stops the forwarding for good.
The check is a few lines of JavaScript on the page — no Workers, no server, and
therefore nothing to pay for.

## Working on it

```sh
node scripts/serve.mjs          # preview on :8787, with the production headers
node scripts/check-examples.mjs # every playground example must compile AND run
bash scripts/deploy.sh          # build both wasm modules, publish, verify externally
```

`scripts/serve.mjs` sends the two cross-origin isolation headers on purpose. The
playground's interactive `input()` needs `SharedArrayBuffer`, which the browser
only grants to an isolated page, so a preview without those headers silently
tests a different code path than production.

## Things worth knowing before changing anything

- **The compiler is pinned.** `crates/nme-web/Cargo.toml` names one upstream
  commit. Moving it changes what the site teaches, so move it deliberately and
  re-run the example check.
- **Two modules, on purpose.** The compiler is ~0.75 MB over the wire and loads
  with the page; the Python engine is ~6 MB and loads only when someone presses
  Run. Merging them would make every visitor pay for the engine.
- **The browser engine is RustPython, not CPython.** It has no file system and
  no network. The site says so next to the playground; keep that true.
- **`site/_headers` carries the security policy.** A new third-party asset means
  editing the Content-Security-Policy there, or it will be blocked.
