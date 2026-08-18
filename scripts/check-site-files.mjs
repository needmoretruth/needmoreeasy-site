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
ok('AI에게 줄 글이 펼칠 때 실제로 불러와짐', promptLength > 500, `${promptLength}자`);
// The pane shows the opening only; the whole message still has to be there.
const wholeLength = await page.evaluate(async () => {
  const response = await fetch('/assets/prompts/sentence.ko.txt');
  return response.ok ? (await response.text()).length : 0;
});
ok('글 전체가 그대로 있음', wholeLength > 10000, `${wholeLength}자`);

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

/* --- the order a visitor actually presses things in ----------------------- */
/* Open File 1, then press an example chip without switching tabs first. The
 * chip must move the view to the Examples tab and leave File 1 untouched. */
await page.click('.file-tabs [data-file="1"]');
await page.waitForTimeout(300);
const chipsAgain = await page.$$('#examples .chip');
if (chipsAgain.length > 5) await chipsAgain[5].click();
await page.waitForTimeout(500);
ok('파일을 열어 둔 채 예제를 눌러도 예제 칸으로 감',
   (await page.textContent('#editor-title')).includes('예제'));
await page.click('.file-tabs [data-file="1"]');
await page.waitForTimeout(300);
ok('그래도 파일 1은 그대로', (await page.inputValue('#editor')) === MINE);

/* --- a link somebody sent ------------------------------------------------ */
/* The step below must be a real navigation, not a hash change.
 *
 * This check used to `goto` the same address with only `#code=…` added, which
 * Chrome treats as a same-document navigation: the page never reloads, the
 * playground is never constructed again, and the check quietly exercised the
 * `hashchange` path instead. Meanwhile the real path — arriving at the site
 * from one of the 885 "run this" links in the guides — wiped all three files,
 * and this check stayed green through it. Leaving the page first is what makes
 * the next `goto` a fresh load. */
await page.goto('about:blank');
await page.goto(BASE + '/ko/index.html#code=7JWI64WV7ZWY7IS47JqUISDrp5DtlbTspJgK', { waitUntil: 'load' });
await page.waitForTimeout(1500);
ok('링크로 온 프로그램도 예제 칸에서 열림', (await page.textContent('#editor-title')).includes('예제'));
await page.click('.file-tabs [data-file="1"]');
await page.waitForTimeout(300);
ok('링크로 들어와도 파일 1은 안전', (await page.inputValue('#editor')) === MINE);
await page.click('.file-tabs [data-file="2"]');
await page.waitForTimeout(300);
ok('링크로 들어와도 파일 2는 안전', (await page.inputValue('#editor')).trim() !== '');

/* --- the saved-programs drawer must not write into a file ----------------- */
await page.click('.file-tabs [data-file="3"]');
await page.fill('#editor', '파일 3의 내 코드 말해줘');
await page.waitForTimeout(400);
await page.click('.file-tabs [data-file="example"]');
await page.waitForTimeout(200);
await page.fill('#editor', '보관함에 넣을 것 말해줘');
await page.waitForTimeout(400);
const drawer = await page.$('details.slots');
if (drawer) await page.evaluate(() => { document.querySelector('details.slots')?.setAttribute('open', ''); });
await page.click('#slot-save');
await page.waitForTimeout(300);
const nameField = await page.$('.slots input[type="text"]');
if (nameField) {
  await nameField.fill('보관1');
  const save = await page.$('.slots form button[type="submit"], .slots form .btn-primary');
  if (save) await save.click();
  await page.waitForTimeout(300);
}
await page.click('.file-tabs [data-file="3"]');
await page.waitForTimeout(300);
const slotOpen = await page.$('.slot-open');
if (slotOpen) {
  await slotOpen.click();
  await page.waitForTimeout(400);
}
await page.click('.file-tabs [data-file="3"]');
await page.waitForTimeout(300);
ok('보관함에서 열어도 파일 3은 그대로', (await page.inputValue('#editor')) === '파일 3의 내 코드 말해줘');

/* --- an armed "overwrite?" must not survive a tab switch ------------------ */
await page.click('.file-tabs [data-file="example"]');
await page.waitForTimeout(200);
await page.fill('#editor', '덮어쓰기 확인 시험');
await page.waitForTimeout(400);
await page.click('[data-copy-to="3"]');
await page.waitForTimeout(200);
await page.click('.file-tabs [data-file="1"]');
await page.waitForTimeout(300);
const armed = await page.$eval('[data-copy-to="3"]', (element) => element.textContent ?? '');
ok('칸을 옮기면 「덮어쓸까요」가 풀림', !armed.includes('덮어쓸까요'), armed.trim());

/* --- a copy button keeps its own name ------------------------------------ */
const linkLabel = await page.$eval('[data-copy-link]', (element) => element.textContent ?? '');
await page.click('[data-copy-link]');
await page.waitForTimeout(150);
await page.click('[data-copy-link]');
await page.waitForTimeout(2200);
ok('복사 단추가 제 이름을 되찾음',
   (await page.$eval('[data-copy-link]', (element) => element.textContent ?? '')) === linkLabel,
   linkLabel.trim());

/* --- the English page, which has its own copy of all of this -------------- */
const english = await context.newPage();
await english.goto(BASE + '/index.html', { waitUntil: 'load' });
await english.waitForTimeout(1200);
await english.click('.file-tabs [data-file="1"]');
await english.fill('#editor', 'show my English program');
await english.waitForTimeout(400);
ok('영어 화면에도 파일 탭이 있음',
   (await english.textContent('#editor-title')).includes('File 1'));
await english.goto('about:blank');
await english.goto(BASE + '/index.html#code=c2hvdyBIZWxsbwo', { waitUntil: 'load' });
await english.waitForTimeout(1500);
await english.click('.file-tabs [data-file="1"]');
await english.waitForTimeout(300);
ok('영어 화면도 링크로 들어오면 파일이 안전',
   (await english.inputValue('#editor')) === 'show my English program');
await english.close();

ok('콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' / '));

await browser.close();
console.log(bad === 0 ? '파일 셋과 AI 프롬프트 띠가 정상입니다' : `${bad}가지가 잘못되었습니다`);
process.exit(bad === 0 ? 0 : 1);
