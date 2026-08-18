/* End-to-end from a guide: the "run it" link must land in the playground with
 * the program already typed, and pressing Run must produce that program's own
 * output.
 *
 *   node scripts/check-site-slow-engine.mjs [base-url]
 *
 * Every line below used to be printed and not checked; a review on 2026-08-18
 * fed it a Python traceback and it exited 0.
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
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(String(error).split('\n')[0]));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text().slice(0, 140)); });

await page.goto(BASE + guidePath('hello', 'ko'), { waitUntil: 'networkidle' });
const link = page.locator('.snippet-tools a').first();
const href = (await link.getAttribute('href')) ?? '';
ok('가이드의 첫 예제가 실행 링크를 갖고 있음', href.includes('#code='), href.slice(0, 50));
await link.click();
await page.waitForLoadState('networkidle');
ok('연습장으로 옮겨감', page.url().includes('#code='), page.url().slice(-30));

const typed = await page.locator('#editor').inputValue();
ok('프로그램이 이미 적혀 있음', typed.trim().length > 0, JSON.stringify(typed.slice(0, 40)));

await page.waitForFunction(() => !document.querySelector('#run').disabled, null, { timeout: 60000 });
await page.click('#run');
await page.waitForFunction(
  () => document.querySelector('#terminal').textContent.trim().length > 0,
  null,
  { timeout: 60000 },
);
const output = ((await page.locator('#terminal').textContent()) ?? '').trim();
// The guide's first program says hello; whatever it says, it must be its own
// words and not a Python traceback.
ok('출력이 나옴', output.length > 0, JSON.stringify(output.slice(0, 60)));
ok('출력이 파이썬 오류가 아님',
   !/Traceback|SyntaxError|NameError|line \d+, in /.test(output));
ok('진행바가 감춰짐', await page.locator('#boot-progress').isHidden());
ok('알림이 감춰짐', await page.locator('#boot-alert').isHidden());
ok('콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' / '));

await browser.close();
console.log(bad === 0 ? '가이드에서 연습장까지 정상' : `가이드→연습장 경로에서 ${bad}가지가 잘못되었습니다`);
process.exit(bad === 0 ? 0 : 1);
