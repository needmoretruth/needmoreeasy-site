/* Structure and accessibility basics on one page of each shape: duplicate ids,
 * images without alt text, buttons with no accessible name, heading levels that
 * skip a step, a single h1, a language and a title. None of these show up in a
 * screenshot, and all of them matter to someone using a screen reader.
 *
 * The skip link is driven for real — Tab, then Enter — because the markup
 * cannot tell you whether it works. `href="#x"` moves focus only when #x can
 * take focus; against a plain <section> the browser scrolls, leaves focus on
 * <body>, and the next Tab restarts at the top of the page. That is exactly
 * what the one thing meant to save a keyboard user from the header was doing.
 *
 *   node scripts/check-site-structure.mjs [base-url]
 */
import { chromium } from 'playwright';
import { guidePath } from './site-paths.mjs';
const BASE = process.argv[2] || 'http://127.0.0.1:8931';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let bad = 0;
for (const path of ['/index.html', '/ko/index.html', guidePath('timer', 'ko'), '/learn/prompts', '/ko/learn/guides']) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  const out = await page.evaluate(() => {
    const ids = {};
    for (const el of document.querySelectorAll('[id]')) ids[el.id] = (ids[el.id] || 0) + 1;
    const dupes = Object.entries(ids).filter(([, n]) => n > 1).map(([id]) => id);
    const imgs = [...document.querySelectorAll('img:not([alt])')].length;
    const namelessButtons = [...document.querySelectorAll('button')]
      .filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label')).length;
    const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => Number(h.tagName[1]));
    let jumps = 0;
    for (let i = 1; i < headings.length; i += 1) if (headings[i] - headings[i - 1] > 1) jumps += 1;
    const h1 = document.querySelectorAll('h1').length;
    const lang = document.documentElement.lang;
    const title = document.title.length;
    return { dupes, imgs, namelessButtons, jumps, h1, lang, title };
  });
  const skip = await page.evaluate(() => {
    const link = document.querySelector('.skip-link');
    return link ? { href: link.getAttribute('href') } : null;
  });
  const problems = [];
  if (skip) {
    const want = skip.href.slice(1);
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement?.className || '');
    if (!String(first).includes('skip-link')) problems.push('첫 Tab이 건너뛰기 링크가 아님');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(120);
    const landed = await page.evaluate(() => {
      const el = document.activeElement;
      return { id: el?.id || '', tag: el?.tagName || '' };
    });
    if (landed.id !== want) {
      problems.push(`건너뛰기가 포커스를 못 옮김 — #${want}로 갔어야 하는데 ${landed.tag}${landed.id ? '#' + landed.id : ''}에 있음`);
    }
  }
  if (out.dupes.length) problems.push('중복 id ' + out.dupes.join(','));
  if (out.imgs) problems.push('alt 없는 그림 ' + out.imgs);
  if (out.namelessButtons) problems.push('이름 없는 단추 ' + out.namelessButtons);
  if (out.jumps) problems.push('제목 단계 건너뜀 ' + out.jumps);
  if (out.h1 !== 1) problems.push('h1이 ' + out.h1 + '개');
  if (!out.lang) problems.push('lang 없음');
  if (!out.title) problems.push('title 없음');
  console.log(`${path.padEnd(32)} ${problems.length ? 'FAIL ' + problems.join(' | ') : 'ok'}`);
  bad += problems.length;
}
await browser.close();
console.log(bad ? `\n${bad}건 실패` : '\n구조·접근성 기본 점검 통과');
process.exit(bad ? 1 : 0);
