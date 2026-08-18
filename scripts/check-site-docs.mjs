import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:8787/ko/learn/guides.html', { waitUntil: 'networkidle' });
const total = await page.locator('#guide-list > li').count();
await page.fill('#guide-filter', '파일');
await page.waitForTimeout(200);
const shown = await page.locator('#guide-list > li:visible').count();
console.log(`가이드 ${total}편 중 "파일" 검색 → ${shown}편`, await page.locator('#guide-count').textContent());

for (const width of [320, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('http://localhost:8787/ko/learn/syntax.html', { waitUntil: 'networkidle' });
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const scrolls = await page.evaluate(() => {
    const box = document.querySelector('.table-scroll');
    return box ? box.scrollWidth > box.clientWidth : null;
  });
  console.log(`문법 목록 ${width}px — 페이지 넘침 ${over}px, 표는 자기 상자 안에서 스크롤: ${scrolls}`);
}

// the rail must be open on a wide screen and closed on a phone
for (const width of [360, 1200]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('http://localhost:8787/ko/learn/guides/05-repeat.html', { waitUntil: 'networkidle' });
  console.log(`${width}px 목록 서랍 열림:`, await page.locator('.doc-rail').evaluate((el) => el.open));
}
if (errors.length) console.log('오류:', errors);
await browser.close();
