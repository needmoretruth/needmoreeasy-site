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
// 되돌리기 기록이 글과 어긋나면 페이지가 기록을 비우면서 이 말을 남긴다.
// 그 길은 닿을 수 없어야 하므로, 한 번이라도 나오면 실패다.
page.on('console', (m) => {
  if (m.type() === 'warning' && m.text().includes('되돌리기 기록이 글과 어긋나')) {
    errors.push('되돌리기 기록이 글과 어긋나 비워짐 — ' + m.text());
  }
});

await page.goto(BASE + '/ko/index.html', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.querySelector('#engine-dot')?.dataset.state === 'ready', null, { timeout: 60000 });
console.log('실행기 준비됨');

// the story example asks one question. The examples are shown one group at a
// time now, so the group has to be chosen before its chips exist.
await page.evaluate(() => {
  const group = [...document.querySelectorAll('#example-groups .chip')].find((c) => c.textContent.includes('게임'));
  group.click();
  const chip = [...document.querySelectorAll('#examples .chip')].find((c) => c.textContent.includes('짧은 이야기'));
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
  const all = [...document.querySelectorAll('#python .pyline')];
  const at = all.find((row) => row.dataset.at === 'true');
  return at ? { line: String(all.indexOf(at)), text: at.textContent } : null;
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

// A band that says nothing must not be standing there. `.problem { display:
// grid }` beat the browser's own rule for the `hidden` attribute, so an empty
// red-tinted stripe sat under the editor of every program that was fine. The
// attribute alone proves nothing; the measured height does.
const quietBand = await page.evaluate(() => {
  const el = document.querySelector('#problem');
  return { attr: el.hidden, height: Math.round(el.getBoundingClientRect().height) };
});
if (!quietBand.attr) errors.push('문제가 없는데 오류 띠가 켜져 있음');
if (quietBand.height !== 0) errors.push('숨긴 오류 띠가 자리를 차지함: ' + quietBand.height + 'px');

// A program that does not compile used to turn the Run button off and put a
// wall of bilingual compiler text in the Python pane. Someone looking at the
// editor saw a button that did nothing. The band under the editor has to say
// which line, quote it, say what is wrong and what to try, and pressing Run
// has to take the caret to that line.
// 낱말을 반쯤 썼을 뿐인데 빨간 띠가 떴다가 사라지면 그것은 알림이 아니라
// 깜빡임이다. 되던 프로그램이 처음 깨질 때는 반 초 붙들었다가 보여 준다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '안녕하세요 말해줘\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForFunction(() => document.querySelector('#python').dataset.state === 'ok'
  && document.querySelector('#problem').hidden, null, { timeout: 15000 });
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '안녕하세요 말해줘\n끝\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(430);
const heldBack = await page.evaluate(() => document.querySelector('#problem').hidden);
await page.waitForTimeout(1400);
const shownLater = await page.evaluate(() => document.querySelector('#problem').hidden);
if (!heldBack) errors.push('프로그램이 깨지자마자 오류 띠가 떴음 — 치는 동안 깜빡인다');
if (shownLater) errors.push('손을 멈췄는데도 오류 띠가 끝내 나오지 않음');
console.log(errors.length ? 'FAIL 오류 띠 붙들기' : '치는 동안에는 오류가 깜빡이지 않고, 멈추면 나옴');

await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '안녕하세요 말해줘\n끝\n세 번째 줄';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(1500);
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

// The four lines above answer most errors. The one they do not answer is
// "what is this rule, and why". That is the error code's own page, and it
// belongs in the band, folded, in the language of the page — not behind a
// number the reader is expected to look up somewhere else.
// Measured on the `<details>` itself: a browser that hides folded content
// keeps the inner paragraph's own box alive, so only the box around it tells
// the truth about what the reader sees.
const detail = await page.evaluate(() => {
  const box = document.querySelector('#problem-detail');
  const text = document.querySelector('#problem-detail-text');
  box.open = false;
  const shut = Math.round(box.getBoundingClientRect().height);
  box.open = true;
  return {
    hidden: box.hidden,
    shut,
    open: Math.round(box.getBoundingClientRect().height),
    words: text.textContent.trim(),
    summary: document.querySelector('#problem-detail-summary').textContent.trim(),
  };
});
if (detail.hidden) errors.push('오류 설명 접이식이 숨어 있음');
if (detail.open <= detail.shut + 10) {
  errors.push(`펼쳐도 설명이 나타나지 않음: 접었을 때 ${detail.shut}px · 폈을 때 ${detail.open}px`);
}
if (detail.words.length < 40) errors.push('오류 설명이 너무 짧음: ' + detail.words);
for (const [what, value] of [['설명', detail.words], ['접이식 이름', detail.summary]]) {
  if (!/[가-힣]/.test(value)) errors.push(`한국어 쪽 ${what}이 한국어가 아님: ` + value);
}
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

// 정리하기 — 아무렇게나 쓴 프로그램을 한 표기로 다시 쓴다. 지켜야 하는 것은
// 셋이다: 글자가 실제로 바뀔 것, 파이썬이 글자 하나까지 그대로일 것, 되돌리면
// 쓴 그대로 돌아올 것. 「바뀌었다」만 보면 프로그램을 망가뜨려도 통과한다.
const MESSY = 'store score as 1\nplease repeat 2 times\n  give score\nend\n';
await page.evaluate((text) => {
  const editor = document.querySelector('#editor');
  editor.value = text;
  editor.dispatchEvent(new Event('input', { bubbles: true }));
}, MESSY);
await page.waitForTimeout(500);
const beforeTidy = await page.evaluate(() => ({
  nme: document.querySelector('#editor').value,
  python: document.querySelector('#python').textContent,
}));
await page.evaluate(() => {
  document.querySelector('[data-tidy-level="sentence"]').click();
  document.querySelector('[data-tidy-lang="ko"]').click();
});
await page.click('#tidy');
await page.waitForTimeout(600);
const afterTidy = await page.evaluate(() => ({
  nme: document.querySelector('#editor').value,
  python: document.querySelector('#python').textContent,
  note: document.querySelector('#tidy-note').textContent.trim(),
  undoShown: !document.querySelector('#tidy-undo').hidden,
  lines: document.querySelector('#editor').value.split('\n').length,
}));
if (afterTidy.nme === beforeTidy.nme) errors.push('정리했는데 글자가 그대로임');
if (afterTidy.python !== beforeTidy.python) errors.push('정리했더니 파이썬이 달라짐');
if (afterTidy.lines !== beforeTidy.nme.split('\n').length) errors.push('정리했더니 줄 수가 달라짐');
if (!afterTidy.undoShown) errors.push('정리한 뒤 되돌리기 단추가 없음');
if (!/줄/.test(afterTidy.note)) errors.push('몇 줄을 다시 썼는지 알려 주지 않음: ' + afterTidy.note);
if (!afterTidy.nme.includes('말해줘') && !afterTidy.nme.includes('보여줘')) {
  errors.push('한국어 문장 표기로 정리되지 않음: ' + JSON.stringify(afterTidy.nme.slice(0, 60)));
}
await page.click('#tidy-undo');
await page.waitForTimeout(400);
const undone = await page.evaluate(() => ({
  nme: document.querySelector('#editor').value,
  undoShown: !document.querySelector('#tidy-undo').hidden,
}));
if (undone.nme !== MESSY) errors.push('되돌렸는데 쓴 그대로가 아님');
if (undone.undoShown) errors.push('되돌린 뒤에도 되돌리기 단추가 남아 있음');

// 실행되지 않는 프로그램은 정리할 수 없다. 조용히 실패하지 말고 어느 줄인지
// 가리켜야 한다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '안녕하세요 말해줘\n끝\n';
  editor.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(500);
await page.click('#tidy');
await page.waitForTimeout(400);
const blocked = await page.evaluate(() => ({
  note: document.querySelector('#tidy-note').textContent.trim(),
  bandHidden: document.querySelector('#problem').hidden,
  nme: document.querySelector('#editor').value,
}));
if (blocked.bandHidden) errors.push('정리할 수 없는데 오류 띠가 나오지 않음');
if (!/실행/.test(blocked.note)) errors.push('왜 정리할 수 없는지 말해 주지 않음: ' + blocked.note);
if (blocked.nme !== '안녕하세요 말해줘\n끝\n') errors.push('정리할 수 없는데 글자를 건드림');
console.log(errors.length ? 'FAIL 정리하기' : '정리하기 — 표기만 바뀌고 파이썬은 그대로, 되돌리기도 됨');

// 이름 바꾸기 목록은 「일」만이 아니라 프로그램이 기억해 둔 값까지 담아야 한다.
// 4,337줄에 이름이 400개인 프로그램에서 여섯 개만 뜨던 것이 이 검사가 지키는
// 것이고, 커서가 놓인 이름은 이미 골라져 있어야 한다.
await page.evaluate(() => { location.hash = '#example=job'; });
await page.waitForFunction(() => (document.querySelector('#python')?.textContent?.length ?? 0) > 30, null, { timeout: 30000 });
await page.waitForTimeout(500);
const renaming = await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  const first = editor.value.split('\n').find((line) => /^\s*\S/.test(line) && !line.startsWith('#')) ?? '';
  const word = (first.match(/[\wÀ-\uffff]{2,}/g) ?? []).pop() ?? '';
  const at = editor.value.indexOf(word);
  editor.focus();
  editor.setSelectionRange(at + 1, at + 1);
  document.querySelector('[data-rename-open]').click();
  const box = document.querySelector('#rename-from');
  const list = document.querySelector('#rename-names');
  return {
    kinds: [...new Set([...list.options].map((o) => (o.label.split(' — ')[1] ?? '')))].filter(Boolean),
    count: list.options.length,
    caretWord: word,
    picked: box.value,
    spots: document.querySelector('#rename-count').textContent,
  };
});
if (renaming.count < 2) errors.push(`이름 바꾸기 목록에 ${renaming.count}개뿐 — 일과 값이 다 있어야 함`);
if (renaming.kinds.length < 2) errors.push(`이름 갈래가 ${renaming.kinds.join('/') || '없음'} — 「일」과 「값」이 다 있어야 함`);
console.log(renaming.kinds.length >= 2
  ? `이름 바꾸기 목록에 일과 값이 함께 나옴  ${renaming.kinds.join(' / ')}`
  : 'FAIL 이름 바꾸기 목록');
if (renaming.picked !== '' && renaming.caretWord !== '' && !renaming.caretWord.startsWith(renaming.picked)) {
  errors.push(`커서가 「${renaming.caretWord}」에 있는데 칸에는 「${renaming.picked}」가 들어감`);
}
if (renaming.picked !== '' && !/\d/.test(renaming.spots)) {
  errors.push(`이름을 골랐는데 몇 곳인지 말해 주지 않음: 「${renaming.spots}」`);
}

// ⭐고친 직후에 이름 바꾸기를 누른다.
//
// 이름 바꾸기는 프로그램과 그 프로그램의 파이썬을 줄줄이 견주어 안전을 판정한다.
// 그런데 방금 고친 줄은 아직 컴파일되지 않았으므로, 견주는 기준이 한 판 낡은
// 상태다. 그러면 멀쩡한 이름도 「그 낱말은 화면에 내보내는 글에도 들어 있어서」로
// 거절당한다 — 오너가 2026-08-23에 "이름 바꾸기 기능이 모든 변수를 찾지 못하고"
// 라고 한 것이 이것이다. 이름이 틀린 것이 아니라 기준이 낡았던 것이다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '__첫이름은 3\n__첫이름 말해줘\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForFunction(() => document.querySelector('#python').dataset.state === 'ok'
  && document.querySelector('#python').textContent.includes('__첫이름'), null, { timeout: 20000 });
await page.evaluate(() => document.querySelector('[data-rename-open]').click());
await page.fill('#rename-from', '__첫이름');
await page.fill('#rename-to', '__둘째이름');
await page.evaluate(() => {
  // 한 줄을 더 쓰고, 컴파일이 걸리기도 전에 바꾸기를 누른다.
  const editor = document.querySelector('#editor');
  document.querySelector('#editor-msg').textContent = '';
  editor.value = '__첫이름은 3\n__첫이름 말해줘\n__첫이름 말해줘\n';
  editor.dispatchEvent(new Event('input'));
  document.querySelector('#rename-go').click();
});
await page.waitForFunction(() => document.querySelector('#editor-msg').textContent !== ''
  && !document.querySelector('#rename-go').disabled, null, { timeout: 30000 }).catch(() => {});
const freshBase = await page.evaluate(() => ({
  msg: document.querySelector('#editor-msg').textContent,
  nme: document.querySelector('#editor').value,
}));
const renamedAll = (freshBase.nme.match(/__둘째이름/g) ?? []).length;
if (renamedAll !== 3) {
  errors.push(`고친 직후에 누른 이름 바꾸기가 ${renamedAll}곳만 바꿈 — 낡은 기준으로 견줬다: ${freshBase.msg}`);
}
console.log(renamedAll === 3
  ? '고치자마자 눌러도 이름 바꾸기가 세 곳 다 바꿈'
  : 'FAIL 고친 직후 이름 바꾸기');

// 이어서 한 번 더. 첫 번째가 끝나자마자 두 번째를 눌러도 되어야 한다.
await page.fill('#rename-from', '__둘째이름');
await page.fill('#rename-to', '__셋째이름');
await page.evaluate(() => { document.querySelector('#editor-msg').textContent = ''; });
await page.click('#rename-go');
await page.waitForFunction(() => document.querySelector('#editor-msg').textContent !== ''
  && !document.querySelector('#rename-go').disabled, null, { timeout: 30000 }).catch(() => {});
const again = await page.evaluate(() => ({
  msg: document.querySelector('#editor-msg').textContent,
  nme: document.querySelector('#editor').value,
}));
if (!again.nme.includes('__셋째이름')) errors.push('연달아 두 번째 이름 바꾸기가 거절당함: ' + again.msg);
console.log(again.nme.includes('__셋째이름')
  ? '이름 바꾸기를 연달아 두 번 해도 둘 다 적용됨'
  : 'FAIL 연달아 이름 바꾸기');

// ⛔찾기 칸에 한 글자를 치면 초점이 편집 칸으로 넘어가, 다음 글자가 프로그램
// 안에 박히던 자리다(오너 2026-08-23: "한글자씩만 입력할수있고 코드수정으로
// 넘어가서 이상하게 써져"). 세 글자를 이어 칠 수 있어야 하고, 초점은 찾기 칸에
// 그대로 있어야 한다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '가나다 말해줘\n가나다 말해줘\n';
  editor.dispatchEvent(new Event('input'));
  document.querySelector('#editor-bar-close').click();
  document.querySelector('[data-find-open]').click();
});
await page.waitForTimeout(200);
await page.keyboard.type('가나다', { delay: 80 });
await page.waitForTimeout(200);
const finding = await page.evaluate(() => ({
  where: document.activeElement ? document.activeElement.id : '',
  typed: document.querySelector('#find-text').value,
  nme: document.querySelector('#editor').value,
  count: document.querySelector('#find-count').textContent,
}));
if (finding.where !== 'find-text') errors.push(`찾기 칸에 치는 동안 초점이 「${finding.where}」로 넘어감`);
if (finding.typed !== '가나다') errors.push(`찾기 칸에 「${finding.typed}」만 들어감 — 이어 칠 수 없음`);
if (finding.nme !== '가나다 말해줘\n가나다 말해줘\n') errors.push('찾기에 친 글자가 프로그램 안으로 들어감: ' + finding.nme);
console.log(finding.where === 'find-text' && finding.typed === '가나다'
  ? `찾기 칸은 초점을 뺏지 않고 이어 칠 수 있음  (${finding.count})`
  : 'FAIL 찾기 칸');
await page.evaluate(() => document.querySelector('#editor-bar-close').click());

// ⛔한글은 한 글자가 두세 번의 입력으로 온다 — `ㄲ`, `끄`, `끝`. 그 사이의
// 것은 아무도 쓴 적 없는 반쪽짜리 글자다. 컴파일이 시작될 때마다 파이썬 칸의
// 부제가 「파이썬으로 바꾸는 중입니다」로 바뀌므로, 그것을 세면 조합하는 동안
// 몇 번 컴파일했는지 알 수 있다. 답은 0이어야 하고, 글자가 끝나면 1이어야 한다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '안녕 말해줘\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForFunction(() => document.querySelector('#python').dataset.state === 'ok'
  && document.querySelector('#python').textContent.includes('안녕'), null, { timeout: 20000 });
await page.evaluate(() => {
  const note = document.querySelector('#python-note');
  globalThis.nmeCompiles = 0;
  new MutationObserver(() => {
    if (note.textContent.includes('바꾸는 중')) globalThis.nmeCompiles += 1;
  }).observe(note, { childList: true, characterData: true, subtree: true });
  const editor = document.querySelector('#editor');
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
  editor.dispatchEvent(new CompositionEvent('compositionstart'));
  for (const half of ['ㄲ', '끄']) {
    editor.value = editor.value.replace(/[ㄲ끄]?$/, half);
    editor.dispatchEvent(new Event('input'));
  }
});
await page.waitForTimeout(1200);
const whileComposing = await page.evaluate(() => globalThis.nmeCompiles);
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = editor.value.replace(/끄$/, '끝');
  editor.dispatchEvent(new CompositionEvent('compositionend'));
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(1200);
const afterLetter = await page.evaluate(() => globalThis.nmeCompiles);
if (whileComposing !== 0) errors.push(`한글 한 글자를 만드는 동안 ${whileComposing}번 컴파일함 — 반쪽짜리 글자를 컴파일한다`);
if (afterLetter < 1) errors.push('글자를 다 만들었는데도 컴파일하지 않음');
console.log(whileComposing === 0 && afterLetter >= 1
  ? '한글을 만드는 동안에는 컴파일하지 않고, 글자가 끝나면 한다'
  : 'FAIL 한글 조합 중 컴파일');

// ⛔한 글자 때문에 프로그램이 깨졌다고 파이썬 판을 통째로 비우면, 판이 400px
// 접히면서 아래에 있던 것이 전부 위로 올라온다 — 읽던 자리를 잃는다.
// (오너 2026-08-23: "화면이 위로 넘어가버려서 흐름이 끊겨")
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '하나 말해줘\n둘 말해줘\n셋 말해줘\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForFunction(() => document.querySelector('#python').dataset.state === 'ok'
  && document.querySelectorAll('#python .pyline').length === 4, null, { timeout: 20000 });
const tall = await page.evaluate(() => document.querySelectorAll('#python .pyline').length);
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '하나 말해줘\n둘 말해줘\n셋 말해줘\n끝\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForFunction(() => document.querySelector('#python').dataset.state !== 'ok', null, { timeout: 20000 });
const kept = await page.evaluate(() => ({
  rows: document.querySelectorAll('#python .pyline').length,
  state: document.querySelector('#python').dataset.state,
  behind: document.querySelector('.pane-python').dataset.behind ?? '',
  band: !document.querySelector('#problem').hidden,
}));
if (kept.rows < tall) errors.push(`깨진 순간 파이썬 판이 ${tall}줄에서 ${kept.rows}줄로 접힘 — 화면이 위로 올라간다`);
if (kept.behind !== 'true') errors.push('조금 전 파이썬을 그대로 두면서 뒤처졌다는 표시를 하지 않음');
if (!kept.band) errors.push('깨졌는데 아래 띠가 무엇이 걸렸는지 말해 주지 않음');
console.log(kept.rows >= tall && kept.behind === 'true'
  ? '깨져도 파이썬 판은 접히지 않고, 뒤처졌다고만 말함'
  : 'FAIL 깨졌을 때 판 접힘');

// 건너뛰기 링크는 「쓰는 칸으로」라고 말한다. 좁은 화면에서 파이썬 칸을 켜 두면
// 쓰는 칸이 display:none이 되어 포커스를 받지 못한다 — 그러면 링크는 아무 데도
// 데려가지 못하고, 머리글을 지나가려던 사람은 문서 맨 위로 되돌아간다.
await page.evaluate(() => document.querySelector('.play-tabs [data-view="python"]').click());
await page.waitForTimeout(200);
await page.evaluate(() => document.querySelector('.skip-link').focus());
await page.keyboard.press('Enter');
await page.waitForTimeout(250);
const skipped = await page.evaluate(() => ({
  id: document.activeElement ? document.activeElement.id : '',
  view: document.querySelector('.panes').dataset.view,
}));
if (skipped.id !== 'editor') {
  errors.push('파이썬 칸이 열려 있을 때 건너뛰기가 쓰는 칸에 못 감 — ' + (skipped.id || '아무 데도'));
  console.log('FAIL 건너뛰기');
} else {
  console.log('파이썬 칸이 열려 있어도 건너뛰기가 쓰는 칸으로 데려감');
}

// ───────────────────────────── 되돌리기·다시 하기
//
// 이 페이지는 예제·세이브·이름 바꾸기·정리 어느 것을 눌러도 편집 칸의 value에
// 통째로 대입한다. 그러면 브라우저가 갖고 있던 되돌리기 기록이 그 순간 비워진다.
// 그래서 되돌리기는 페이지가 직접 들고 있어야 하고, 아래 다섯 갈래가 그것이
// 실제로 되는지를 본다.

await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '하나 말해줘\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(200);

// 1) 낱말 단위로 끊어서 되돌린다 — 한 글자씩도, 통째로도 아니다.
await page.locator('#editor').click();
await page.keyboard.press('Control+End');
await page.keyboard.type('둘 셋');
await page.waitForTimeout(300);
const afterTyping = await page.inputValue('#editor');
await page.keyboard.press('Control+z');
await page.waitForTimeout(150);
const onceBack = await page.inputValue('#editor');
await page.keyboard.press('Control+z');
await page.waitForTimeout(150);
const twiceBack = await page.inputValue('#editor');
await page.keyboard.press('Control+Shift+z');
await page.waitForTimeout(150);
const forward = await page.inputValue('#editor');
if (!afterTyping.endsWith('둘 셋')) errors.push('친 글자가 들어가지 않음: ' + JSON.stringify(afterTyping.slice(-8)));
if (onceBack === afterTyping) errors.push('되돌리기가 아무것도 하지 않음');
// 「둘 셋」을 쳤으면 한 번에 「셋」만 지워져야 한다. 글자 하나씩이면 「둘 셋」이
// 「둘 」이 되기까지 두 번 눌러야 하고, 통째로면 첫 번째에 「둘」까지 사라진다.
if (onceBack.endsWith('둘 셋') || !onceBack.endsWith('둘 ')) {
  errors.push(`한 번 되돌렸더니 「${afterTyping.slice(-8)}」→「${onceBack.slice(-8)}」 — 낱말 단위가 아니다`);
}
if (twiceBack.includes('둘')) errors.push('두 번 되돌렸는데도 친 것이 남아 있음');
if (forward !== onceBack) errors.push('다시 하기가 되돌리기를 되짚지 못함');
console.log(onceBack !== afterTyping && twiceBack !== onceBack && forward === onceBack
  ? '되돌리기가 낱말 단위로 끊기고, 다시 하기가 되짚음'
  : 'FAIL 되돌리기·다시 하기');

// 2) 한글 한 글자는 한 걸음이다.
//
// 조합 중에는 input이 두세 번 오므로, 그것을 그대로 기록하면 한 글자를 지우는 데
// 되돌리기를 세 번 눌러야 한다. 반쪽짜리 글자(ㄲ·끄)가 되살아나면 더 나쁘다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '하나 말해줘\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(250);
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
  editor.dispatchEvent(new CompositionEvent('compositionstart'));
  for (const half of ['ㄲ', '끄']) {
    editor.value = editor.value.replace(/[ㄲ끄]?$/, half);
    editor.dispatchEvent(new Event('input'));
  }
  editor.value = editor.value.replace(/끄$/, '끝');
  editor.dispatchEvent(new CompositionEvent('compositionend'));
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(400);
const withLetter = await page.inputValue('#editor');
await page.keyboard.press('Control+z');
await page.waitForTimeout(200);
const letterGone = await page.inputValue('#editor');
if (!withLetter.endsWith('끝')) errors.push('한글 조합 흉내가 글자를 넣지 못함');
if (/[ㄲ끄끝]/.test(letterGone)) {
  errors.push(`한글 한 글자를 한 번에 못 지움 — 남은 것 「${letterGone.slice(-4)}」`);
}
console.log(!/[ㄲ끄끝]/.test(letterGone)
  ? '한글 한 글자가 되돌리기 한 번에 통째로 지워짐'
  : 'FAIL 한글 한 글자 되돌리기');

// 3) 이름 바꾸기는 몇 곳을 고쳤든 한 걸음이다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '__셋째이름은 3\n__셋째이름 말해줘\n__셋째이름에 1 더해\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForFunction(() => document.querySelector('#python').dataset.state === 'ok'
  && document.querySelector('#python').textContent.includes('__셋째이름'), null, { timeout: 20000 });
await page.evaluate(() => document.querySelector('[data-rename-open]').click());
await page.fill('#rename-from', '__셋째이름');
await page.fill('#rename-to', '__넷째이름');
await page.click('#rename-go');
await page.waitForFunction(() => document.querySelector('#editor').value.includes('__넷째이름'), null, { timeout: 30000 });
const renamedText = await page.inputValue('#editor');
await page.evaluate(() => document.querySelector('#editor-undo').click());
await page.waitForTimeout(300);
const renameBack = await page.inputValue('#editor');
const spots = (renamedText.match(/__넷째이름/g) ?? []).length;
if (spots < 3) errors.push(`이름 바꾸기가 ${spots}곳만 고침 — 셋이어야 함`);
if ((renameBack.match(/__넷째이름/g) ?? []).length !== 0) {
  errors.push('되돌리기 한 번으로 이름 바꾸기가 통째로 돌아오지 않음');
}
if ((renameBack.match(/__셋째이름/g) ?? []).length !== 3) {
  errors.push('되돌린 뒤에 옛 이름이 세 곳 다 있지 않음');
}
console.log(spots >= 3 && (renameBack.match(/__셋째이름/g) ?? []).length === 3
  ? `이름 바꾸기 ${spots}곳이 되돌리기 한 번에 함께 돌아옴`
  : 'FAIL 이름 바꾸기 되돌리기');

// 4) 남의 프로그램으로는 되돌아가지 않는다.
//
// 예제를 누르면 화면에 있던 것은 그 사람의 글이 아니게 된다. 거기서 되돌리기를
// 누르면 앞사람의 프로그램이 튀어나와야 할 이유가 없고, 그것은 놀라움이다.
await page.evaluate(() => {
  const group = [...document.querySelectorAll('#example-groups .chip')].find((c) => c.textContent.includes('처음'));
  if (group) group.click();
});
await page.waitForTimeout(300);
await page.evaluate(() => {
  const chip = [...document.querySelectorAll('#examples .chip')][1];
  if (chip) chip.click();
});
await page.waitForTimeout(900);
const freshOpen = await page.evaluate(() => ({
  text: document.querySelector('#editor').value,
  undo: document.querySelector('#editor-undo').getAttribute('aria-disabled') === 'true',
}));
if (!freshOpen.undo) errors.push('예제를 열었는데 되돌리기가 살아 있음 — 남의 프로그램으로 되돌아간다');
// 그리고 브라우저 자신의 되돌리기가 새어 나오지 않아야 한다.
//
// value에 통째로 대입해도 크로미움·웹킷은 자기 되돌리기 기록을 비우지 않는다.
// 비워진 것처럼 보일 뿐이어서, 여러 번 누른 뒤 다시하기를 누르면 예제가 열리기
// 전의 글이 지금 프로그램 위에 겹쳐 들어온다.
//
// 아래는 자판으로 두드린다. 페이지는 그것을 keydown과 beforeinput 두 곳에서
// 막는데, 실제로 둘 다 듣는지는 따로 확인했다 — keydown 쪽을 꺼 두고 이 검사를
// 돌렸더니 그대로 통과했다. 오른쪽 클릭 메뉴의 「실행 취소」와 맥 편집 메뉴는
// beforeinput 쪽으로 오고, 그 둘은 스크립트로 누를 수 없다.
await page.locator('#editor').click();
for (let i = 0; i < 5; i += 1) await page.keyboard.press('Control+z');
for (let i = 0; i < 5; i += 1) await page.keyboard.press('Control+Shift+z');
await page.waitForTimeout(400);
const afterHammer = await page.inputValue('#editor');
if (afterHammer !== freshOpen.text) {
  errors.push('예제를 연 뒤 되돌리기를 연타했더니 글이 바뀜 — 브라우저 자신의 기록이 새어 나온다');
}
console.log(afterHammer === freshOpen.text
  ? '되돌리기를 연타해도 브라우저 자신의 옛 기록이 새어 나오지 않음'
  : 'FAIL 브라우저 되돌리기가 새어 나옴');
console.log(freshOpen.undo
  ? '예제를 열면 되돌리기 기록이 그 프로그램의 것으로 새로 시작함'
  : 'FAIL 예제를 열어도 되돌리기가 남아 있음');

// 5) 파일마다 자기 기록을 가진다.
//
// 파일 셋은 서로 다른 프로그램이다. 파일 2에서 친 것을 되돌리려고 눌렀는데
// 파일 1에서 친 것이 되돌아가면 그것은 글을 잃는 것이다.
await page.evaluate(() => document.querySelector('[data-file="1"]').click());
await page.waitForTimeout(400);
await page.locator('#editor').click();
await page.keyboard.press('Control+End');
await page.keyboard.type('첫째파일글');
await page.waitForTimeout(400);
await page.evaluate(() => document.querySelector('[data-file="2"]').click());
await page.waitForTimeout(400);
await page.locator('#editor').click();
await page.keyboard.press('Control+End');
await page.keyboard.type('둘째파일글');
await page.waitForTimeout(400);
await page.evaluate(() => document.querySelector('[data-file="1"]').click());
await page.waitForTimeout(400);
await page.keyboard.press('Control+z');
await page.waitForTimeout(300);
const perFile = await page.evaluate(() => ({
  now: document.querySelector('#editor').value,
  tab: document.querySelector('[data-file="1"]').getAttribute('aria-selected'),
}));
if (perFile.tab !== 'true') errors.push('파일 1로 돌아오지 못함');
if (perFile.now.includes('첫째파일글')) errors.push('파일 1에서 되돌렸는데 그 파일의 글이 지워지지 않음');
if (perFile.now.includes('둘째파일글')) errors.push('파일 1에 파일 2의 글이 들어 있음');
console.log(!perFile.now.includes('첫째파일글') && !perFile.now.includes('둘째파일글')
  ? '파일마다 되돌리기 기록이 따로 있음'
  : 'FAIL 파일별 되돌리기 기록');


// 6) 되돌리기는 방금 고친 자리로 간다.
//
// 커서 자리를 따로 들고 있으면 그것이 낡는다 — 상자 안에서 다른 곳을 눌러도
// input도 blur도 오지 않기 때문이다. 200번째 줄을 고치고 세 번째 줄로 옮겨
// 고친 뒤 되돌리면, 커서가 200번째 줄로 날아가고 화면도 거기로 굴러갔다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = Array.from({ length: 220 }, (_, i) => `줄${i} 말해줘`).join('\n');
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(400);
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  const far = editor.value.indexOf('줄200');
  editor.focus();
  editor.setSelectionRange(far + 4, far + 4);
});
await page.keyboard.type('멀리');
await page.waitForTimeout(300);
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  const near = editor.value.indexOf('줄3 ');
  editor.setSelectionRange(near + 2, near + 2);
  editor.scrollTop = 0;
});
await page.keyboard.type('가까이');
await page.waitForTimeout(300);
await page.keyboard.press('Control+z');
await page.waitForTimeout(400);
const landed = await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  return {
    line: editor.value.slice(0, editor.selectionStart).split('\n').length,
    top: Math.round(editor.scrollTop),
    text: editor.value,
  };
});
if (landed.text.includes('가까이')) errors.push('되돌렸는데 방금 친 글이 남아 있음');
if (!landed.text.includes('멀리')) errors.push('되돌리기가 앞의 걸음까지 지워 버림');
if (landed.line > 6) errors.push(`되돌린 뒤 커서가 ${landed.line}번째 줄 — 고친 자리는 4번째 줄이다`);
if (landed.top > 80) errors.push(`되돌린 뒤 화면이 ${landed.top}px 굴러가 있음 — 고친 자리는 맨 위다`);
console.log(landed.line <= 6 && landed.top <= 80 && !landed.text.includes('가까이')
  ? `되돌리기가 방금 고친 자리(${landed.line}번째 줄)로 감`
  : 'FAIL 되돌린 자리');

// 7) 파일에 넣어도 원래 있던 파일의 기록이 남아 있다.
//
// 넣기는 같은 글을 두 파일에 두는 일이다. 기록을 옮겨 버리면, 두고 온 파일로
// 돌아왔을 때 방금까지 치던 것을 되돌릴 수 없다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '먼저 쓴 글 말해줘\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('[data-file="1"]').click());
await page.waitForTimeout(300);
await page.locator('#editor').click();
await page.keyboard.press('Control+End');
await page.keyboard.type('__옮길글');
await page.waitForTimeout(400);
await page.evaluate(() => {
  // 파일 2에는 이미 글이 있으므로 한 번은 「덮어쓸까요」로 묻고 두 번째가 확인이다.
  const put = document.querySelector('[data-copy-to="2"]');
  put.click(); put.click();
});
await page.waitForTimeout(600);
const moved = await page.evaluate(() => ({
  where: document.querySelector('[data-file="2"]').getAttribute('aria-selected'),
  undo: document.querySelector('#editor-undo').getAttribute('aria-disabled') === 'true',
}));
if (moved.where !== 'true') errors.push('파일 2에 넣었는데 파일 2로 가지 않음');
if (moved.undo) errors.push('파일에 넣었더니 되돌리기가 죽음 — 같은 글인데 걸음을 잃었다');
await page.evaluate(() => document.querySelector('[data-file="1"]').click());
await page.waitForTimeout(400);
const leftBehind = await page.evaluate(() => document.querySelector('#editor-undo').getAttribute('aria-disabled') === 'true');
if (leftBehind) errors.push('두고 온 파일의 되돌리기 기록이 사라짐');
console.log(!moved.undo && !leftBehind
  ? '파일에 넣어도 양쪽 다 되돌리기 기록을 가짐'
  : 'FAIL 파일에 넣기와 되돌리기 기록');

// 8) 정리한 뒤 다른 프로그램을 열면 「정리 전으로」는 사라진다.
//
// 그 단추는 어느 한 프로그램의 정리 전 모습을 가리킨다. 다른 프로그램이 올라온
// 뒤에도 남아 있으면, 누르는 순간 남의 글이 지금 글을 덮는다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '셋은   3\n셋 말해줘\n';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForFunction(() => document.querySelector('#python').dataset.state === 'ok', null, { timeout: 20000 });
await page.click('#tidy');
await page.waitForFunction(() => document.querySelector('#tidy-undo').hidden === false, null, { timeout: 20000 })
  .catch(() => errors.push('정리했는데 「정리 전으로」가 나타나지 않음'));
await page.evaluate(() => {
  const group = [...document.querySelectorAll('#example-groups .chip')].find((c) => c.textContent.includes('처음'));
  if (group) group.click();
});
await page.waitForTimeout(300);
await page.evaluate(() => { document.querySelectorAll('#examples .chip')[2]?.click(); });
await page.waitForTimeout(900);
const afterOther = await page.evaluate(() => document.querySelector('#tidy-undo').hidden);
if (!afterOther) errors.push('다른 예제를 열었는데 「정리 전으로」가 아직 떠 있음');
console.log(afterOther
  ? '다른 프로그램을 열면 「정리 전으로」가 함께 사라짐'
  : 'FAIL 정리 전으로가 남아 있음');

// 9) 한 번 되돌리는 데 줄을 통째로 다시 그리지 않는다.
//
// 되돌리기 한 번은 한 군데를 도로 붙이는 일이다. 색칠한 줄을 전부 새로 만들면
// 긴 프로그램에서 한 번 누를 때마다 십분의 일 초가 든다. 세는 검사라서 기계가
// 바빠도 흔들리지 않는다.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = Array.from({ length: 600 }, (_, i) => `줄${i} 말해줘`).join('\n');
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(600);
await page.locator('#editor').click();
await page.keyboard.press('Control+End');
await page.keyboard.type('바꾼글');
await page.waitForTimeout(400);
await page.evaluate(() => {
  window.__inkGone = 0;
  const layer = document.querySelector('#editor-ink');
  window.__inkWatch = new MutationObserver((list) => {
    for (const m of list) window.__inkGone += m.removedNodes.length;
  });
  window.__inkWatch.observe(layer, { childList: true });
});
await page.keyboard.press('Control+z');
await page.waitForTimeout(400);
const inkGone = await page.evaluate(() => {
  window.__inkWatch.disconnect();
  return { gone: window.__inkGone, rows: document.querySelector('#editor-ink').children.length };
});
if (inkGone.gone > 10) {
  errors.push(`되돌리기 한 번에 색칠한 줄 ${inkGone.gone}개를 새로 그림 — 한 군데만 고치면 된다`);
}
console.log(inkGone.gone <= 10
  ? `되돌리기 한 번이 색칠한 줄 ${inkGone.gone}개만 건드림 (전체 ${inkGone.rows}줄)`
  : 'FAIL 되돌릴 때마다 전부 다시 그림');

console.log(errors.length ? 'FAIL 콘솔 오류: ' + errors.join(' | ') : '콘솔 오류 없음');
await browser.close();
process.exit(errors.length ? 1 : 0);
