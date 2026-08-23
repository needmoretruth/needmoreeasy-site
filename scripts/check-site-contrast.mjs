/* Contrast QA sweep for needmoreeasy.com.
 *
 * Two passes, because the two ways this can break are different:
 *
 *   1. The tokens themselves. Every ink token is measured on every surface it
 *      can land on, and --line-strong is measured as it is actually painted.
 *      This is the pass that would have caught the bug it was written for:
 *      --line-strong carried a comment promising 3:1 while its value gave
 *      1.93:1, because the alpha had been read off the page white instead of
 *      off the element's own fill, which is what a border composites over.
 *   2. The pages as rendered. Every element that paints text is measured
 *      against the backdrop it really has, and every control's edge against
 *      the faces on both sides of it.
 *
 * Thresholds are WCAG 2.2: 4.5:1 for text, 3:1 for large text (24px, or
 * 18.66px when bold), 3:1 for a control's boundary. Prints one line per
 * failure and exits non-zero. */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:8931';
const PAGES = ['/index.html', '/ko/index.html', '/learn/guides', '/learn/syntax'];

/* Installed into every page before it loads, so both passes can call it
 * without the module and the page having to share a scope. */
function installMeasuring() {
  const parse = (css) => {
    const m = String(css).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const n = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
  };
  const over = (fg, bg) => ({
    r: fg.a * fg.r + (1 - fg.a) * bg.r,
    g: fg.a * fg.g + (1 - fg.a) * bg.g,
    b: fg.a * fg.b + (1 - fg.a) * bg.b,
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (one, other) => {
    const a = lum(one), b = lum(other);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  const hex = (c) => '#' + [c.r, c.g, c.b]
    .map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  /* The painted face behind an element: the first ancestor with an opaque
   * background, with every translucent one above it composited back down. */
  const backdrop = (el) => {
    const stack = [];
    for (let node = el; node; node = node.parentElement) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (!c || c.a === 0) continue;
      stack.push(c);
      if (c.a === 1) break;
    }
    if (!stack.length || stack[stack.length - 1].a !== 1) {
      stack.push(parse(getComputedStyle(document.documentElement).backgroundColor)
        || { r: 255, g: 255, b: 255, a: 1 });
    }
    let face = stack.pop();
    while (stack.length) face = over(stack.pop(), face);
    return face;
  };
  /* A custom property comes back exactly as it was written — '#000000',
   * 'rgba(0, 0, 0, 0.45)' — so it is pushed through a probe element and read
   * back as the rgb the browser actually paints. */
  const probe = document.createElement('span');
  probe.style.display = 'none';
  const token = (name) => {
    if (!probe.isConnected) document.documentElement.append(probe);
    probe.style.color = '';
    probe.style.color = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return parse(getComputedStyle(probe).color);
  };
  window.measuring = { parse, over, ratio, hex, backdrop, token };
}

const browser = await chromium.launch();
let failures = 0;
let measured = 0;
const note = (msg) => { failures += 1; console.log('FAIL ' + msg); };

/* --- pass 1: the tokens ---------------------------------------------------
 * A token pair that fails here fails everywhere it is used, and it fails in
 * one line of CSS rather than in fifty places in the DOM. */
for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({ colorScheme: theme });
  await context.addInitScript(installMeasuring);
  const page = await context.newPage();
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  const rows = await page.evaluate(() => {
    const { over, ratio, hex, token } = window.measuring;
    const SURFACES = ['--bg', '--surface', '--surface-2', '--surface-hover', '--sunk'];
    /* --sunk-deep is the terminal's face and it is translucent, so it is
     * measured as it lands: on the pane behind it. It passes today; it is in
     * the list so that the next person to touch it finds out if it stops. */
    const OVER_SURFACE = ['--sunk-deep'];
    const out = [];
    for (const surface of [...SURFACES, ...OVER_SURFACE]) {
      const raw = token(surface);
      const face = OVER_SURFACE.includes(surface) ? over(raw, token('--surface')) : raw;
      /* Text tiers. --ink-faint is the floor and it is used for small text,
       * so it is held to 4.5 like the rest. */
      for (const ink of ['--ink', '--ink-soft', '--ink-faint']) {
        const c = token(ink);
        out.push({ what: `${ink} on ${surface}`, got: ratio(c, face), need: 4.5, shown: hex(c) });
      }
      /* A translucent border paints over the element's own background, so it
       * is composited onto this surface and then measured against it. */
      const edge = over(token('--line-strong'), face);
      out.push({ what: `--line-strong on ${surface}`, got: ratio(edge, face), need: 3, shown: hex(edge) });
    }
    /* Status colours carry meaning, so they are held to the text floor on the
     * faces they are used on. */
    for (const [ink, soft] of [['--ok', '--ok-soft'], ['--warn', '--warn-soft'], ['--bad', '--bad-soft']]) {
      const c = token(ink);
      for (const surface of ['--surface', '--surface-2', '--sunk']) {
        out.push({ what: `${ink} on ${surface}`, got: ratio(c, token(surface)), need: 4.5, shown: hex(c) });
      }
      const face = over(token(soft), token('--surface'));
      out.push({ what: `${ink} on ${soft}`, got: ratio(c, face), need: 4.5, shown: hex(c) });
    }
    return out;
  });
  for (const row of rows) {
    measured += 1;
    if (row.got + 0.005 < row.need) {
      note(`${theme} 토큰 ${row.what} ${row.shown} — ${row.got.toFixed(2)}:1 (${row.need}:1 필요)`);
    }
  }
  await context.close();
}

/* --- pass 2: the pages as rendered --------------------------------------- */
for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({ colorScheme: theme });
  await context.addInitScript(installMeasuring);
  for (const path of PAGES) {
    for (const width of [390, 1280]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      const found = await page.evaluate(() => {
        const { parse, over, ratio, hex, backdrop } = window.measuring;
        const bad = [];
        let seen = 0;
        /* Each of these picks one of several. The chosen one is exempt from
         * the edge rule, and pays for the exemption below. */
        const GROUPS = [
          { sel: '.seg', child: 'button', on: '[aria-pressed="true"]' },
  { sel: '.example-groups', child: 'button', on: '[aria-pressed="true"]' },
          { sel: '.file-tabs', child: 'button', on: '[aria-selected="true"]' },
          { sel: '.play-tabs', child: 'button', on: '[aria-selected="true"]' },
          { sel: '.theme-toggle', child: 'button', on: '[aria-pressed="true"]' },
          { sel: '.lang-toggle', child: 'a', on: '[aria-current="true"]' },
        ];
        const label = (el) => (el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')).slice(0, 44);
        const paintsText = (el) => [...el.childNodes]
          .some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);

        for (const el of document.querySelectorAll('body *')) {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          const rect = el.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) continue;
          /* A disabled control is exempt (WCAG 1.4.3, 1.4.11), and so is
           * anything the page is deliberately fading — a mid-transition
           * opacity is a moment, not a state a person reads. */
          if (el.matches(':disabled') || el.closest('[disabled], [aria-disabled="true"]')) continue;
          if (Number(style.opacity) < 0.99) continue;

          if (paintsText(el)) {
            seen += 1;
            const face = backdrop(el);
            const ink = parse(style.color);
            const shown = ink.a < 1 ? over(ink, face) : ink;
            const size = parseFloat(style.fontSize);
            const weight = Number(style.fontWeight) || 400;
            const large = size >= 24 || (size >= 18.66 && weight >= 700);
            const need = large ? 3 : 4.5;
            const got = ratio(shown, face);
            if (got + 0.005 < need) {
              bad.push(`글자 ${label(el)} ${hex(shown)} / ${hex(face)} — ${got.toFixed(2)}:1 (${need}:1 필요)`);
            }
          }

          /* A control's own edge. Only when the edge is what marks it: if the
           * fill already stands 3:1 off the face around it, the fill is the
           * boundary and the border is decoration.
           *
           * The one-of-several groups are exempt, because what marks the
           * chosen cell there is its label — black and semibold against grey
           * and regular — and not its hairline. That exemption is not taken
           * on trust: the sweep below measures the label change and fails if
           * it ever stops being the thing that says which one is chosen. */
          if (el.closest(GROUPS.map((g) => g.sel).join(', '))) continue;
          if (!el.matches('button, input, select, textarea, .btn, .chip, [role="tab"], [role="button"]')) continue;
          if (!parseFloat(style.borderTopWidth) || style.borderTopStyle === 'none') continue;
          const own = parse(style.backgroundColor);
          const outside = backdrop(el.parentElement || document.body);
          const fill = own && own.a > 0 ? (own.a < 1 ? over(own, outside) : own) : outside;
          if (ratio(fill, outside) >= 3) continue;
          const border = parse(style.borderTopColor);
          if (!border || border.a === 0) continue;
          const edge = border.a < 1 ? over(border, fill) : border;
          seen += 1;
          const inside = ratio(edge, fill);
          const out = ratio(edge, outside);
          if (Math.min(inside, out) + 0.005 < 3) {
            bad.push(`테두리 ${label(el)} ${hex(edge)} — 안쪽 ${inside.toFixed(2)}:1 · 바깥 ${out.toFixed(2)}:1 (3:1 필요)`);
          }
        }
        /* Text a stylesheet draws rather than the document: a placeholder, and
         * the ::before/::after that carry the empty-terminal note, the list
         * numbers, the running caret and the alert mark. `getComputedStyle`
         * with no second argument cannot see any of it, so a sweep over child
         * text nodes misses every one — which is how a placeholder sat at
         * 4.27:1 on the dark page with the check green. */
        const drawn = (el, part) => {
          const style = getComputedStyle(el, part);
          const ink = parse(style.color);
          if (!ink || ink.a === 0) return;
          const face = backdrop(el);
          const shown = ink.a < 1 ? over(ink, face) : ink;
          const size = parseFloat(style.fontSize);
          const weight = Number(style.fontWeight) || 400;
          const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
          const got = ratio(shown, face);
          seen += 1;
          if (got + 0.005 < need) {
            bad.push(`${part} ${label(el)} ${hex(shown)} / ${hex(face)}`
              + ` — ${got.toFixed(2)}:1 (${need}:1 필요)`);
          }
        };
        for (const el of document.querySelectorAll('[placeholder]')) {
          const rect = el.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) continue;
          drawn(el, '::placeholder');
        }
        for (const el of document.querySelectorAll('body *')) {
          const rect = el.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) continue;
          if (getComputedStyle(el).visibility === 'hidden') continue;
          for (const part of ['::before', '::after']) {
            const content = getComputedStyle(el, part).content;
            // Only the ones that draw letters. A shape drawn with an empty
            // string is a graphic, and a graphic is not held to the text floor.
            const letters = /^attr\(/.test(content)
              || /["'][^"']*[^"'\s][^"']*["']/.test(content);
            if (!letters) continue;
            drawn(el, part);
          }
        }

        /* The exemption, made to earn itself. */
        for (const group of GROUPS) {
          for (const box of document.querySelectorAll(group.sel)) {
            const kids = [...box.querySelectorAll(group.child)]
              .filter((k) => k.getBoundingClientRect().width > 2);
            const chosen = kids.find((k) => k.matches(group.on));
            const other = kids.find((k) => !k.matches(group.on));
            if (!chosen || !other) continue;
            const face = backdrop(chosen);
            const ink = (el) => {
              const c = parse(getComputedStyle(el).color);
              return c.a < 1 ? over(c, face) : c;
            };
            seen += 1;
            const apart = ratio(ink(chosen), ink(other));
            if (apart + 0.005 < 3) {
              bad.push(`고른 것 표시 ${group.sel} ${hex(ink(chosen))} / ${hex(ink(other))}`
                + ` — 글자 차이 ${apart.toFixed(2)}:1 (3:1 필요, 테두리가 대신하지 못함)`);
            }
          }
        }
        return { bad: [...new Set(bad)], seen };
      });
      measured += found.seen;
      for (const line of found.bad) note(`${theme} ${width} ${path}: ${line}`);
      await page.close();
    }
  }
  await context.close();
}

await browser.close();
console.log(failures
  ? `\n${failures}건이 대비 기준에 못 미칩니다 (${measured}곳 측정)`
  : `\n대비 ${measured}곳 전부 기준을 넘습니다`);
process.exit(failures ? 1 : 0);
