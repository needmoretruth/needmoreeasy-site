/* The documentation pages behave: the filter narrows the guide list, a wide
 * table scrolls inside its own box instead of the page, and the index rail is a
 * drawer on a phone and a column on a desk.
 *
 *   node scripts/check-site-docs.mjs [base-url]
 *
 * This used to print those four facts and exit 0 whatever they were. A review
 * on 2026-08-18 broke each of them on purpose — `가이드 0편`, a page overflowing
 * by 2,680px, a rail open at 360px — and the script stayed green. Printing is
 * not checking; every line below now has an assertion beside it.
 */
import { chromium } from 'playwright';
import { guidePath } from './site-paths.mjs';

const BASE = (process.argv[2] || 'http://localhost:8787').replace(/\/$/, '');

let bad = 0;
const ok = (name, condition, detail = '') => {
  console.log(`${condition ? 'ok  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`);
  if (!condition) bad += 1;
};

const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(String(error).split('\n')[0]));

await page.goto(BASE + '/ko/learn/guides', { waitUntil: 'networkidle' });
const total = await page.locator('#guide-list > li').count();
ok('가이드 목록에 편이 있음', total > 50, `${total}편`);
await page.fill('#guide-filter', '파일');
await page.waitForTimeout(250);
const shown = await page.locator('#guide-list > li:visible').count();
ok('검색이 목록을 좁힘', shown > 0 && shown < total, `${total} → ${shown}`);
const counter = (await page.locator('#guide-count').textContent()) ?? '';
ok('세는 숫자가 실제와 같음', counter.includes(String(shown)), counter.trim());
await page.fill('#guide-filter', '');
await page.waitForTimeout(250);
ok('검색을 지우면 전부 돌아옴',
   (await page.locator('#guide-list > li:visible').count()) === total);

for (const width of [320, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(BASE + '/ko/learn/syntax', { waitUntil: 'networkidle' });
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  const scrolls = await page.evaluate(() => {
    const box = document.querySelector('.table-scroll');
    return box ? box.scrollWidth > box.clientWidth : null;
  });
  ok(`문법 목록 ${width}px에서 페이지가 옆으로 넘치지 않음`, over <= 0, `${over}px`);
  if (width === 320) {
    ok('좁은 화면에서 표는 자기 상자 안에서 스크롤함', scrolls === true);
  }
}

// The rail is a drawer on a phone and an open column on a desk.
for (const [width, shouldBeOpen] of [[360, false], [1200, true]]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(BASE + guidePath('repeat', 'ko'), { waitUntil: 'networkidle' });
  const open = await page.locator('.doc-rail').evaluate((element) => element.open);
  ok(`${width}px에서 목록 서랍이 ${shouldBeOpen ? '열려' : '닫혀'} 있음`, open === shouldBeOpen);
}

ok('콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' / '));

await browser.close();
console.log(bad === 0 ? '문서 페이지 동작 점검 통과' : `문서 페이지에서 ${bad}가지가 잘못되었습니다`);
process.exit(bad === 0 ? 0 : 1);
