/* Visual and structural QA sweep for needmoreeasy.com.
 * Checks every page shape at five widths, in both themes and both languages:
 * horizontal overflow, console errors, tap-target size, contrast-critical
 * elements present. Prints one line per failure and exits non-zero. */
import { chromium } from 'playwright';
import { guidePath } from './site-paths.mjs';

const BASE = process.argv[2] || 'http://127.0.0.1:8931';
// 320 is the narrowest phone still in use, 360 and 430 bracket the common
// ones, 768 is a tablet, 1280 a laptop, 1920 the desktop the owner uses.
const WIDTHS = [320, 360, 390, 430, 768, 1280, 1920];
const PAGES = [
  '/index.html',
  '/ko/index.html',
  '/learn/guides',
  '/ko/learn/guides',
  guidePath('repeat', 'en'),
  guidePath('repeat', 'ko'),
  '/learn/prompts',
  '/ko/learn/prompts',
  '/learn/syntax',
];

const browser = await chromium.launch();
let failures = 0;
const note = (msg) => { failures += 1; console.log('FAIL ' + msg); };

for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({ colorScheme: theme });
  for (const path of PAGES) {
    for (const width of WIDTHS) {
      const page = await context.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(350);

      const info = await page.evaluate(() => {
        const doc = document.documentElement;
        const small = [];
        for (const el of document.querySelectorAll('a, button, input, textarea, [role="tab"]')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (el.closest('.doc-rail, .doc-toc, .prose, .site-foot, .doc-crumbs, .head-nav, .lang-toggle')) continue;
          // Inline links inside a sentence are exempt from tap-target size (WCAG 2.5.8).
          if (el.tagName === 'A' && el.parentElement && ['P', 'LI', 'SPAN'].includes(el.parentElement.tagName)) continue;
          if (r.height < 28) small.push((el.className || el.tagName) + ' h=' + Math.round(r.height));
        }
        return {
          scrollW: doc.scrollWidth,
          clientW: doc.clientWidth,
          bodyBg: getComputedStyle(document.body).backgroundColor,
          stage: !!document.querySelector('.stage .orb'),
          themeToggle: document.querySelectorAll('[data-theme-choice]').length,
          small: small.slice(0, 4),
        };
      });

      const tag = `${theme} ${width} ${path}`;
      if (info.scrollW > info.clientW + 1) note(`${tag}: 가로 넘침 ${info.scrollW} > ${info.clientW}`);
      if (!info.stage) note(`${tag}: 배경 무대 없음`);
      if (info.themeToggle !== 3) note(`${tag}: 테마 단추 ${info.themeToggle}개`);
      if (info.bodyBg === 'rgba(0, 0, 0, 0)') note(`${tag}: 본문 배경 없음`);
      if (info.small.length) note(`${tag}: 누르기 작은 요소 ${info.small.join(', ')}`);
      if (errors.length) note(`${tag}: 콘솔 오류 ${errors.slice(0, 2).join(' | ')}`);
      await page.close();
    }
  }
  await context.close();
}

/* A phone held sideways is short and wide — 844x390 — which no portrait width
 * exercises. The playground must still show both panes and must not overflow. */
{
  const context = await browser.newContext();
  for (const [width, height] of [[844, 390], [740, 360]]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    await page.goto(BASE + '/ko/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const out = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      columns: getComputedStyle(document.querySelector('.panes')).gridTemplateColumns.split(' ').length,
    }));
    if (out.overflow) note(`가로 ${width}x${height}: 가로 넘침`);
    if (width >= 820 && out.columns !== 2) note(`가로 ${width}x${height}: 두 칸이 아님`);
    if (width < 820 && out.columns !== 1) note(`가로 ${width}x${height}: 한 칸이 아님`);
    await page.close();
  }
  await context.close();
}

/* Nothing may stay invisible on a page nobody scrolled. The reveal animation
 * hides its targets until they come into view, so it needs a failsafe; without
 * one, a reader who lands and reads without touching the wheel — or any tool
 * that renders the whole page at once — sees empty sections. Checked once per
 * landing page rather than at every width, because it costs four seconds. */
{
  const context = await browser.newContext();
  for (const path of ['/index.html', '/ko/index.html']) {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    // 4s failsafe plus the 0.7s transition and its stagger.
    await page.waitForTimeout(5600);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal')]
      .filter((el) => Number(getComputedStyle(el).opacity) < 0.9)
      .map((el) => String(el.className).slice(0, 30)).slice(0, 3));
    if (hidden.length) note(`${path}: 스크롤 없이 안 보이는 요소 ${hidden.join(', ')}`);
    await page.close();
  }
  await context.close();
}

/* The theme toggle has to do two things a screenshot cannot prove: change the
 * painted colour, and still be in force after a reload. */
{
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.click('[data-theme-choice="dark"]');
  const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  if (before === after) note('테마 단추를 눌러도 배경색이 그대로');
  await page.reload({ waitUntil: 'domcontentloaded' });
  const kept = await page.evaluate(() => ({
    attr: document.documentElement.getAttribute('data-theme'),
    bg: getComputedStyle(document.body).backgroundColor,
    pressed: document.querySelector('[data-theme-choice="dark"]').getAttribute('aria-pressed'),
  }));
  if (kept.attr !== 'dark') note('다시 열면 어두운 테마가 풀림');
  if (kept.bg !== after) note('다시 열면 배경색이 달라짐');
  if (kept.pressed !== 'true') note('다시 열면 어두움 단추가 눌린 상태가 아님');
  await page.click('[data-theme-choice="system"]');
  const back = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  if (back !== null) note('기기 설정으로 되돌아가지 않음');
  await context.close();
}

await browser.close();
console.log(failures ? `\n${failures}건 실패` : '\n모든 폭·모든 테마에서 문제 없음, 테마 단추도 실제로 바뀌고 유지됨');
process.exit(failures ? 1 : 0);
