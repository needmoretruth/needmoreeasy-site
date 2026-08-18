/* The three files, the tab examples open in, and the three messages for
 * someone else's AI.
 *
 * These exist because of one complaint that is easy to have and hard to
 * forgive: you are writing a program, you forget how something went, you open
 * an example to look — and what you wrote is gone. So the promise this script
 * defends is narrow and absolute: **nothing but the visitor puts anything into
 * File 1, 2 or 3.** Not an example chip, not a link somebody sent, not a
 * reload.
 *
 *   node scripts/check-site-files.mjs http://127.0.0.1:8931
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:8931';
const MINE = '내 소중한 코드 말해줘';

let bad = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${extra ? '  ' + extra : ''}`);
  if (!cond) bad += 1;
};

const browser = await chromium.launch();
// A phone, because that is where the tabs are hardest to get right.
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).split('\n')[0]));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });

await page.goto(BASE + '/ko/index.html', { waitUntil: 'load' });
await page.waitForTimeout(1200);

/* --- the AI band ------------------------------------------------------- */
await page.click('details[data-prompt="sentence"] summary');
await page
  .waitForFunction(
    () => (document.querySelector('details[data-prompt="sentence"] [data-prompt-text]')?.textContent ?? '').length > 2000,
    null,
    { timeout: 15000 },
  )
  .catch(() => {});
const promptLength = await page.$eval(
  'details[data-prompt="sentence"] [data-prompt-text]',
  (element) => element.textContent.length,
);
ok('AI에게 줄 글이 펼칠 때 실제로 불러와짐', promptLength > 2000, `${promptLength}자`);

/* --- the three files ---------------------------------------------------- */
await page.click('.file-tabs [data-file="1"]');
await page.fill('#editor', MINE);
await page.waitForTimeout(400);
ok('파일 1로 바뀌면 이름도 바뀜', (await page.textContent('#editor-title')).includes('파일 1'));

await page.click('.file-tabs [data-file="example"]');
await page.waitForTimeout(200);
const chips = await page.$$('#examples .chip');
if (chips.length > 3) await chips[3].click();
await page.waitForTimeout(500);
ok('예제는 예제 칸에서 열림', !(await page.inputValue('#editor')).includes('내 소중한'));

await page.click('.file-tabs [data-file="1"]');
await page.waitForTimeout(300);
ok('예제를 보고 와도 파일 1은 그대로', (await page.inputValue('#editor')) === MINE);

await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(1200);
ok('새로고침해도 열려 있던 파일이 열림', (await page.textContent('#editor-title')).includes('파일 1'));
ok('새로고침해도 내용이 남음', (await page.inputValue('#editor')) === MINE);

/* --- moving something into a file --------------------------------------- */
await page.click('.file-tabs [data-file="example"]');
await page.waitForTimeout(300);
const carried = await page.inputValue('#editor');
await page.click('[data-copy-to="2"]');
await page.waitForTimeout(300);
ok('비어 있는 파일에는 한 번에 들어감', (await page.textContent('#editor-title')).includes('파일 2'));
ok('넣은 것이 그대로 들어감', (await page.inputValue('#editor')) === carried);

await page.click('.file-tabs [data-file="example"]');
await page.waitForTimeout(200);
await page.click('[data-copy-to="2"]');
await page.waitForTimeout(200);
ok('내용이 있는 파일은 한 번 물어봄', (await page.textContent('[data-copy-to="2"]')).includes('덮어쓸까요'));
await page.click('[data-copy-to="2"]');
await page.waitForTimeout(300);
ok('두 번째로 누르면 덮어씀', (await page.textContent('#editor-title')).includes('파일 2'));

/* --- a link somebody sent ------------------------------------------------ */
await page.goto(BASE + '/ko/index.html#code=7JWI64WV7ZWY7IS47JqUISDrp5DtlbTspJgK', { waitUntil: 'load' });
await page.waitForTimeout(1200);
ok('링크로 온 프로그램도 예제 칸에서 열림', (await page.textContent('#editor-title')).includes('예제'));
await page.click('.file-tabs [data-file="1"]');
await page.waitForTimeout(300);
ok('링크로 들어와도 파일 1은 안전', (await page.inputValue('#editor')) === MINE);

ok('콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' / '));

await browser.close();
console.log(bad === 0 ? '파일 셋과 AI 프롬프트 띠가 정상입니다' : `${bad}가지가 잘못되었습니다`);
process.exit(bad === 0 ? 0 : 1);
