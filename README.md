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
site/src/          the pages' scripts, in TypeScript; compiled into site/assets/
site/install.*     the one-line installers for the prebuilt `nme` (shell and PowerShell)
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
npm install                        # typescript, esbuild and playwright; once per checkout
node scripts/build-scripts.mjs     # type-check site/src/*.ts and compile it into site/assets/
node scripts/serve.mjs             # preview on :8787, with the production headers
node scripts/check-examples.mjs    # every playground example must compile AND run
node scripts/check-site-code.mjs   # every program printed on the home pages compiles to real Python
node scripts/check-site-links.mjs  # every internal link resolves, none redirects
node scripts/check-site-layout.mjs # 7 widths x 2 themes: overflow, console, theme toggle
node scripts/check-site-playground.mjs  # run a program, answer a question, download it
node scripts/check-site-structure.mjs   # ids, alt text, heading levels, page language
node scripts/check-site-boot-failures.mjs  # what a visitor sees when a download fails
node scripts/check-site-slow-engine.mjs    # a guide's run-it link, and Run before the engine lands
node scripts/check-site-docs.mjs       # the guide filter, a wide table, the index drawer
node scripts/check-site-files.mjs      # the three files, the example tab, the AI band
node scripts/check-live.mjs        # open the published site and check it from outside
node scripts/make-og-image.mjs     # redraw the link-preview card from the site's own CSS
bash scripts/deploy.sh             # build both wasm modules, check the guides' code, run every check, publish, verify
```

The `check-site-*` scripts that take an address need a preview server running (they take its
address as an argument) and Playwright, which `npm install` puts in this
repository's own `node_modules`. `deploy.sh` starts and stops its own server and
refuses to publish if any check fails.

The guides, the syntax list and the AI prompts are written in the
[language repository](https://github.com/needmoretruth/needmoreeasy) and turned
into pages here, so the scripts expect it checked out next to this one
(`../needmoreeasy`), or wherever `NME_REPO` points. `deploy.sh` reads the
Cloudflare account it publishes to from `~/.config/nme/cloudflare.env`, or the
file `NME_ENV_FILE` names; that file never lives in the repository.

`scripts/serve.mjs` compiles `site/src/` first when the output is missing or
older than the source, so a fresh checkout can be previewed with one command.

`scripts/serve.mjs` sends the two cross-origin isolation headers on purpose. The
playground's interactive `input()` needs `SharedArrayBuffer`, which the browser
only grants to an isolated page, so a preview without those headers silently
tests a different code path than production.

## Things worth knowing before changing anything

- **The pages' scripts are TypeScript.** `site/src/*.ts` is the source;
  `site/assets/{theme,site,examples,play-worker}.js` is build output, ignored by
  git and overwritten by `scripts/build-scripts.mjs`. Editing the `.js` file
  loses the edit at the next build. The type check runs in `deploy.sh` before
  every other check, so a type error stops a publish. Nothing about the site is
  less static for it: the browser still receives plain JavaScript.
- **The compiler is pinned.** `crates/nme-web/Cargo.toml` names one upstream
  commit. Moving it changes what the site teaches, so move it deliberately and
  re-run the example check.
- **Two modules, on purpose.** The compiler is ~0.75 MB over the wire and loads
  with the page; the Python engine is ~6 MB and loads only when someone presses
  Run. Merging them would make every visitor pay for the engine.
- **The browser engine is RustPython, not CPython.** It has no file system and
  no network. The site says so next to the playground; keep that true.
- **`site/_headers` carries the security policy.** A new third-party asset means
  editing the Content-Security-Policy there, or it will be blocked. There is no
  `unsafe-inline`, so an inline `<script>` or `<style>` is dead on arrival —
  that is why the theme is applied by `assets/theme.js` rather than by a line in
  the page.
- **Links never carry `.html`.** Pages serves `learn/guides.html` at
  `/learn/guides` and 308-redirects the extension form, so writing the extension
  costs a redirect on every navigation. `check-site-links.mjs` enforces this.
- **Colour is reserved.** The design is achromatic; red, yellow and green mean
  failure, in progress and ready, and appear nowhere else. `site/assets/site.css`
  opens with the rule, and every `var(--ok|--warn|--bad)` should be a status.
- **The reveal animation has a failsafe.** Anything still hidden four seconds
  after load is shown anyway, so a reader who never scrolls — or a tool that
  renders the whole page at once — never sees an empty section.

## Licence

Apache-2.0, in `LICENSE`.

The two WebAssembly files the site serves are linked from other people's code as
well as ours — RustPython under MIT, the frozen CPython standard library under
the PSF licence, and malachite under LGPL-3.0. `THIRD-PARTY-NOTICES.md` lists
all 171 crates and explains how to rebuild the engine against your own malachite,
which is what the LGPL asks for. Licence texts are in `licenses/`.
