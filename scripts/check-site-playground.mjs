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

// A line that came back as its own text is marked, and the note under the pane
// appears only when a program has both kinds. That is the "why isn't this
// working?" case; a story where every line is words is not surprising.
for (const [what, program, wantMarks, wantNote] of [
  ['half and half', 'show hello\nthe door opened slowly\nset friends to an empty list', 1, true],
  ['all words', 'the door opened slowly\nnobody was there', 2, false],
  ['all commands', 'show hello\nset friends to an empty list', 0, false],
]) {
  await page.evaluate((t) => {
    const editor = document.querySelector('#editor');
    editor.value = t;
    editor.dispatchEvent(new Event('input'));
  }, program);
  await page.waitForTimeout(600);
  const seen = await page.evaluate(() => ({
    marks: document.querySelectorAll('#python .pyline[data-echo="true"]').length,
    note: !document.querySelector('#echo-note').hidden,
  }));
  if (seen.marks !== wantMarks || seen.note !== wantNote) {
    errors.push(`그대로 나오는 줄 표시가 어긋남 (${what}): ${JSON.stringify(seen)}`);
  }
}
console.log(errors.length ? 'FAIL 그대로 나오는 줄' : '그대로 나오는 줄이 표시되고, 안내는 섞였을 때만 뜸');

// What each of the program's own names held when it stopped. It is shown after
// a failure too, which is the case it matters most in.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = 'set friends to an empty list\nappend Mina to friends\nset count to how many friends\nshow count';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(600);
await page.click('#run');
await page.waitForFunction(() => /finish|끝났/.test(document.querySelector('#engine-note').textContent), null, { timeout: 20000 });
await page.waitForTimeout(300);
const named = await page.evaluate(() => {
  const box = document.querySelector('#values');
  if (!box || box.hidden) return null;
  const rows = [...document.querySelectorAll('#values-list dt')].map((dt) => [
    dt.textContent, dt.nextElementSibling?.textContent,
  ]);
  return Object.fromEntries(rows);
});
if (!named) errors.push('프로그램이 만든 이름 칸이 나오지 않음');
else {
  if (named.friends !== "['Mina']") errors.push('목록 값이 다름: ' + named.friends);
  if (named.count !== '1') errors.push('숫자 값이 다름: ' + named.count);
  // The eight helpers `use date latest` binds are the language's, not the
  // writer's; if they ever appear here the filter has stopped working.
  if ('input' in named || 'print' in named) errors.push('파이썬 내장이 섞여 나옴');
}

// A module's own furniture is the language's, not the writer's: `use date
// latest` binds eight helpers and two version strings, and none of them are
// what the person wrote.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = 'use date latest\nset mine to 5\nshow mine';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(600);
await page.click('#run');
await page.waitForFunction(() => /finish|끝났/.test(document.querySelector('#engine-note').textContent), null, { timeout: 20000 });
await page.waitForTimeout(300);
const afterModule = await page.evaluate(() =>
  [...document.querySelectorAll('#values-list dt')].map((n) => n.textContent));
if (JSON.stringify(afterModule) !== JSON.stringify(['mine'])) {
  errors.push('모듈이 묶은 이름이 섞여 나옴: ' + JSON.stringify(afterModule));
}

// A program that stopped half way still says what was in its names.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = 'set half to 7\nprint(1 / 0)';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(600);
await page.click('#run');
await page.waitForFunction(() => /finish|끝났|오류|fail/.test(document.querySelector('#engine-note').textContent), null, { timeout: 20000 });
await page.waitForTimeout(300);
const afterFailure = await page.evaluate(() => {
  const dt = [...document.querySelectorAll('#values-list dt')].find((n) => n.textContent === 'half');
  return dt ? dt.nextElementSibling?.textContent : null;
});
if (afterFailure !== '7') errors.push('멈춘 프로그램의 이름 값이 안 보임: ' + afterFailure);
console.log(errors.length ? 'FAIL 이름 값' : '프로그램이 만든 이름과 값이 보임(멈췄을 때도)');

// One NME statement is exactly one Python line, so the caret's line marks the
// line it became. If the two ever stop lining up this is what says so.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '# note\nshow hello\n\nset friends to an empty list\nappend Mina to friends\nshow how many friends';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(700);
const lineCount = await page.evaluate(() => document.querySelectorAll('#python .pyline').length);
if (lineCount !== 6) errors.push(`파이썬 칸의 줄 수가 원본과 다름: ${lineCount}`);
const paired = await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  const upto = editor.value.split('\n').slice(0, 6).join('\n').length;
  editor.focus();
  editor.setSelectionRange(upto, upto);
  editor.dispatchEvent(new Event('keyup'));
  const at = document.querySelector('#python .pyline[data-at="true"]');
  return at ? { line: at.dataset.line, text: at.textContent } : null;
});
if (!paired || paired.line !== '5' || !paired.text.includes('len(')) {
  errors.push('편집기 줄과 파이썬 줄이 짝지어지지 않음: ' + JSON.stringify(paired));
}
await page.evaluate(() => document.querySelector('#editor').blur());
await page.waitForTimeout(150);
const afterBlur = await page.evaluate(() => document.querySelectorAll('#python .pyline[data-at="true"]').length);
if (afterBlur !== 0) errors.push('편집기에서 손을 뗐는데 줄 표시가 남음');
console.log(errors.length ? 'FAIL 줄 짝짓기' : '편집기 줄과 파이썬 줄이 짝지어짐');

// A program may paint its own output. The site's surfaces stay achromatic and
// keep red, yellow and green for machine state; this is not one of them, it is
// what the visitor's program printed. What must never happen is the letters of
// the control code appearing as text, which is what used to happen.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = 'print("\\033[31mred\\033[0m plain")\nprint("\\033[1;42mbold on green\\033[0m")';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(500);
await page.click('#run');
await page.waitForFunction(
  () => document.querySelector('#terminal').textContent.includes('bold on green'),
  null, { timeout: 20000 }).catch(() => {});
const painted = await page.textContent('#terminal');
const html = await page.innerHTML('#terminal');
if (/\[[0-9;]*m/.test(painted) || painted.includes('033')) {
  errors.push('색 코드의 글자가 화면에 그대로 보임: ' + painted.trim().slice(0, 60));
}
for (const wanted of ['sgr-fg-red', 'sgr-bold', 'sgr-bg-green']) {
  if (!html.includes(wanted)) errors.push(`프로그램이 요청한 색이 그려지지 않음: ${wanted}`);
}
if (!/red plain/.test(painted)) errors.push('색 뒤의 평범한 글자가 사라짐');
console.log(errors.length
  ? 'FAIL 색: ' + errors.join(' | ')
  : '프로그램이 칠한 색이 그려지고, 코드 글자는 새어 나오지 않음');

// A program that does not compile used to turn the Run button off and put a
// wall of bilingual compiler text in the Python pane. Someone looking at the
// editor saw a button that did nothing. The band under the editor has to say
// which line, quote it, say what is wrong and what to try, and pressing Run
// has to take the caret to that line.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '안녕하세요 말해줘\n끝\n세 번째 줄';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(700);
const band = await page.evaluate(() => ({
  hidden: document.querySelector('#problem').hidden,
  line: document.querySelector('#problem-line').textContent,
  title: document.querySelector('#problem-title').textContent,
  source: document.querySelector('#problem-source').textContent,
  why: document.querySelector('#problem-why').textContent,
  fix: document.querySelector('#problem-fix').textContent,
  code: document.querySelector('#problem-code').textContent,
  runAlive: document.querySelector('#run').disabled === false,
  blocked: document.querySelector('#run').dataset.blocked === 'true',
}));
if (band.hidden) errors.push('컴파일이 실패했는데 오류 띠가 숨어 있음');
if (band.line !== '줄 2') errors.push('오류 띠가 줄 번호를 틀림: ' + band.line);
if (band.source !== '끝') errors.push('오류 띠가 그 줄을 그대로 보여 주지 않음: ' + band.source);
for (const [what, value] of [['제목', band.title], ['이유', band.why], ['고치는 법', band.fix]]) {
  if (!value || value.trim() === '') errors.push(`오류 띠에 ${what}이 비어 있음`);
}
if (!/E\d{4}/.test(band.code)) errors.push('오류 번호가 없음: ' + band.code);
if (!band.runAlive) errors.push('실행 단추가 꺼져 있음 — 왜 안 되는지 말할 기회가 사라짐');
if (!band.blocked) errors.push('실행 단추가 막힌 상태로 표시되지 않음');
await page.click('#run');
await page.waitForTimeout(400);
const caret = await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  return {
    line: editor.value.slice(0, editor.selectionStart).split('\n').length,
    picked: editor.value.slice(editor.selectionStart, editor.selectionEnd),
  };
});
if (caret.line !== 2 || caret.picked !== '끝') {
  errors.push('실행을 눌러도 그 줄로 데려가지 않음: ' + JSON.stringify(caret));
}
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '안녕하세요 말해줘';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(700);
const bandGone = await page.evaluate(() => ({
  hidden: document.querySelector('#problem').hidden,
  blocked: document.querySelector('#run').dataset.blocked ?? null,
}));
if (!bandGone.hidden || bandGone.blocked !== null) errors.push('고쳤는데 오류 띠가 남아 있음');
console.log(errors.length ? 'FAIL 오류 알림' : '어느 줄이 왜 걸렸는지 편집 칸 아래에서 보임');

// The coding screen hands the whole window to the editor. What must hold is
// that the editor really grows, the page chrome really goes, and the way back
// exists — including for someone who arrived by link and never saw a button.
await page.evaluate(() => { location.hash = 'screen=code'; });
await page.waitForTimeout(500);
const opened = await page.evaluate(() => {
  const editor = document.querySelector('#editor').getBoundingClientRect();
  return {
    on: document.documentElement.dataset.focus === 'true',
    editorHeight: Math.round(editor.height),
    headVisible: getComputedStyle(document.querySelector('.site-head')).display !== 'none',
    runVisible: document.querySelector('#run').getBoundingClientRect().bottom <= window.innerHeight,
    sideways: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
  };
});
if (!opened.on) errors.push('주소의 screen=code로 코딩 화면이 열리지 않음');
if (opened.editorHeight < 240) errors.push('코딩 화면인데 편집 칸이 작음: ' + opened.editorHeight);
if (opened.headVisible) errors.push('코딩 화면인데 페이지 머리가 남아 있음');
if (!opened.runVisible) errors.push('코딩 화면에서 실행 단추가 화면 밖에 있음');
if (opened.sideways > 1) errors.push('코딩 화면이 옆으로 넘침: ' + opened.sideways);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
const closed = await page.evaluate(() => document.documentElement.dataset.focus ?? null);
if (closed !== null) errors.push('Esc를 눌러도 코딩 화면이 닫히지 않음');
console.log(errors.length ? 'FAIL 코딩 화면' : '코딩 화면이 창 전체를 쓰고 Esc로 돌아옴');

console.log(errors.length ? 'FAIL 콘솔 오류: ' + errors.join(' | ') : '콘솔 오류 없음');
await browser.close();
process.exit(errors.length ? 1 : 0);
