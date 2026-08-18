/* End-to-end: a guide's "run it" link must land in the playground with the
 * program already typed, and pressing Run must produce output. */
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'http://localhost:8787').replace(/\/$/, '');

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(BASE + '/ko/learn/guides/01-hello', { waitUntil: 'networkidle' });
const link = page.locator('.snippet-tools a').first();
const href = await link.getAttribute('href');
console.log('첫 실행 링크:', href.slice(0, 60));
await link.click();
await page.waitForLoadState('networkidle');
console.log('주소:', page.url().slice(0, 60));
const typed = await page.locator('#editor').inputValue();
console.log('편집기 내용:', JSON.stringify(typed));

await page.waitForFunction(() => !document.querySelector('#run').disabled, null, { timeout: 60000 });
await page.click('#run');
await page.waitForFunction(() => document.querySelector('#terminal').textContent.trim().length > 0, null, { timeout: 60000 });
console.log('출력:', JSON.stringify((await page.locator('#terminal').textContent()).trim()));
console.log('진행바 감춤:', await page.locator('#boot-progress').isHidden());
console.log('알림 감춤:', await page.locator('#boot-alert').isHidden());
if (errors.length) console.log('콘솔 오류:', errors.slice(0, 4));
await browser.close();
