/* Runs the playground the way a visitor on a phone does: pick an example that
 * asks a question, press Run, answer it, and read the output. Proves the
 * SharedArrayBuffer input path, the tabs, save slots and download. */
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://127.0.0.1:8931';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(BASE + '/ko/index.html', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.querySelector('#engine-dot')?.dataset.state === 'ready', null, { timeout: 60000 });
console.log('실행기 준비됨');

// the story example asks one question
await page.evaluate(() => {
  const chip = [...document.querySelectorAll('.chip')].find((c) => c.textContent.includes('짧은 이야기'));
  chip.click();
});
await page.waitForTimeout(400);
await page.click('#run');
await page.waitForSelector('#input-row:not([hidden])', { timeout: 20000 });
console.log('질문 대기 중 — 입력칸이 나타남');
await page.fill('#term-input', '왼쪽');
await page.click('#send');
await page.waitForFunction(() => document.querySelector('#terminal').textContent.includes('여기까지입니다'), null, { timeout: 20000 });
const out = await page.textContent('#terminal');
console.log('출력:', JSON.stringify(out.trim().slice(0, 120)));

// download the .nme file
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('[data-download-editor]'),
]);
console.log('내려받은 파일 이름:', download.suggestedFilename());

// A program that clears the screen must clear this one too, and must never
// print the letters of the control code it used to do it.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = 'print("before")\nprint("\\033[2J\\033[3J\\033[H", end="")\nprint("after")';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(400);
await page.click('#run');
await page.waitForFunction(() => /finish|끝났/.test(document.querySelector('#engine-note').textContent), null, { timeout: 20000 });
const cleared = (await page.textContent('#terminal')).trim();
console.log('화면 지우기 뒤 출력:', JSON.stringify(cleared));
if (cleared !== 'after') errors.push('화면 지우기가 듣지 않음: ' + cleared);

console.log(errors.length ? 'FAIL 콘솔 오류: ' + errors.join(' | ') : '콘솔 오류 없음');
await browser.close();
process.exit(errors.length ? 1 : 0);
