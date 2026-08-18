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
node scripts/serve.mjs             # preview on :8787, with the production headers
node scripts/check-examples.mjs    # every playground example must compile AND run
node scripts/check-site-links.mjs  # every internal link resolves, none redirects
node scripts/check-site-layout.mjs # 5 widths x 2 themes: overflow, console, theme toggle
node scripts/check-site-playground.mjs  # run a program, answer a question, download it
node scripts/check-site-structure.mjs   # ids, alt text, heading levels, page language
node scripts/check-live.mjs        # open the published site and check it from outside
node scripts/make-og-image.mjs     # redraw the link-preview card from the site's own CSS
bash scripts/deploy.sh             # build both wasm modules, run every check, publish, verify
```

The four `check-site-*` scripts need a preview server running (they take its
address as an argument) and Playwright, which lives in `~/nmt/web/scripts` and
is reachable here through the `node_modules` symlink. `deploy.sh` starts and
stops its own server and refuses to publish if any check fails.

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
