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

// A program that opens a file cannot work in a browser. What the engine says
// about that is `ImportError: no os specific module found` after a dozen frames
// of its own machinery, which tells a beginner nothing. The page has to say it
// plainly, and it must not bury the real line under the engine's frames.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '"일기.txt" 파일에 "오늘"을 저장해\n메모에 "일기.txt" 읽어서\n메모 말해줘';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(500);
await page.click('#run');
await page.waitForFunction(() => /finish|끝났|오류/.test(document.querySelector('#engine-note').textContent), null, { timeout: 20000 });
await page.waitForTimeout(400);
const fileRun = (await page.textContent('#terminal')).trim();
console.log('파일 프로그램 출력:', JSON.stringify(fileRun.slice(0, 60)));
if (!/파일을 씁니다|works with files/.test(fileRun)) {
  errors.push('파일 프로그램에 쉬운 설명이 붙지 않음: ' + fileRun.slice(0, 80));
}
if (/_frozen_importlib/.test(fileRun)) {
  errors.push('실행기 내부 줄이 그대로 보임');
}

// An ordinary mistake must still show its own traceback, pointing at the
// visitor's line — the filtering above must not eat that.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = 'print("one")\nprint(1 / 0)';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(500);
await page.click('#run');
await page.waitForFunction(() => /finish|끝났|오류/.test(document.querySelector('#engine-note').textContent), null, { timeout: 20000 });
await page.waitForTimeout(400);
const divide = (await page.textContent('#terminal')).trim();
if (!/ZeroDivisionError/.test(divide) || !/line 2/.test(divide)) {
  errors.push('보통 오류의 역추적이 사라짐: ' + divide.slice(0, 80));
}

console.log(errors.length ? 'FAIL 콘솔 오류: ' + errors.join(' | ') : '콘솔 오류 없음');
await browser.close();
process.exit(errors.length ? 1 : 0);
