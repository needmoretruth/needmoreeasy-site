/* Visual and structural QA sweep for needmoreeasy.com.
 * Checks every page shape at five widths, in both themes and both languages:
 * horizontal overflow, console errors, tap-target size, contrast-critical
 * elements present. Prints one line per failure and exits non-zero. */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:8931';
const WIDTHS = [320, 390, 768, 1280, 1920];
const PAGES = [
  '/index.html',
  '/ko/index.html',
  '/learn/guides.html',
  '/ko/learn/guides.html',
  '/learn/guides/05-repeat.html',
  '/ko/learn/guides/05-repeat.html',
  '/learn/prompts.html',
  '/ko/learn/prompts.html',
  '/learn/syntax.html',
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
