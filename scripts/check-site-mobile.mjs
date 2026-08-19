/* The playground on a real phone, driven by real touches.
 *
 * The owner's instruction was that many people will write code on a phone, so
 * mobile has to be excellent rather than merely not broken. A width-only sweep
 * cannot see any of that: it runs a desktop browser narrowed down, clicks
 * elements through the DOM, and never opens a keyboard. This opens a touch
 * context, taps at real coordinates, and shrinks the viewport the way a
 * keyboard does.
 *
 *   node scripts/check-site-mobile.mjs [base-url]
 */
import { chromium, devices } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:8931';
const browser = await chromium.launch();
// A phone context: touch events instead of mouse, no hover, 3x pixels.
const context = await browser.newContext({
  ...devices['Pixel 7'],
  colorScheme: 'dark',
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

let failures = 0;
const ok = (what, detail = '') => console.log(`ok   ${what}${detail ? '  ' + detail : ''}`);
const bad = (what, detail = '') => { failures += 1; console.log(`FAIL ${what}${detail ? '  ' + detail : ''}`); };
const check = (cond, what, detail) => (cond ? ok(what, detail) : bad(what, detail));

const overflow = () => page.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);

await page.goto(BASE + '/ko/index.html', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(
  () => document.querySelector('#engine-dot')?.dataset.state === 'ready',
  null, { timeout: 90000 });
ok('실행기가 준비됨');

// 1. iOS zooms the page in when a focused field is under 16px. Android does
//    not, but the rule is cheap to keep and the site has one editor for both.
const fontSize = await page.evaluate(() =>
  parseFloat(getComputedStyle(document.querySelector('#editor')).fontSize));
check(fontSize >= 16, '편집기 글씨가 16px 이상이라 확대되지 않음', `${fontSize}px`);

// 2. Everything a finger must hit has to be big enough to hit. 44px is the
//    smaller of the two platform guidelines.
const small = await page.evaluate(() => {
  const wanted = '#run, .chip, .file-tabs button, [data-download-editor], [data-copy-link], #send';
  return [...document.querySelectorAll(wanted)]
    .filter((el) => el.offsetParent !== null)
    .map((el) => ({ id: el.id || el.textContent.trim().slice(0, 12), box: el.getBoundingClientRect() }))
    .filter(({ box }) => box.height < 44 || box.width < 44)
    .map(({ id, box }) => `${id} ${Math.round(box.width)}×${Math.round(box.height)}`);
});
check(small.length === 0, '손가락으로 누르는 것이 모두 44px 이상', small.join(', '));

// 3. A real tap on an example chip, at its own coordinates.
const chip = page.locator('.chip', { hasText: '짧은 이야기' }).first();
await chip.tap();
await page.waitForTimeout(400);
const loaded = await page.inputValue('#editor');
check(loaded.length > 0, '예제 조각을 손으로 눌러 열림', `${loaded.split('\n').length}줄`);

// 4. A phone with the keyboard open has about 380px of page left. Shrink to
//    that BEFORE running, which is the real order of events, then run by
//    tapping. Nothing here scrolls the page on purpose: reaching the question
//    has to be the site's job, not the test's.
await page.setViewportSize({ width: 412, height: 380 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.locator('#run').tap();
await page.waitForSelector('#input-row:not([hidden])', { timeout: 30000 });
await page.waitForTimeout(900);   // the scroll is animated
ok('질문 칸이 나타남');

const reachable = await page.evaluate(() => {
  const seen = (selector) => {
    const box = document.querySelector(selector)?.getBoundingClientRect();
    if (!box) return null;
    return box.top >= 0 && box.bottom <= window.innerHeight && box.height > 0;
  };
  return { input: seen('#term-input'), send: seen('#send') };
});
check(reachable.input === true, '키보드가 올라와도 사이트가 입력칸을 보여 줌');
check(reachable.send === true, '키보드가 올라와도 보내기 단추가 화면 안에 있음');
check(await overflow() <= 0, '키보드가 올라와도 가로로 넘치지 않음', `${await overflow()}px`);

await page.locator('#term-input').tap();
await page.locator('#term-input').fill('왼쪽');
await page.locator('#send').tap();
await page.waitForFunction(
  () => document.querySelector('#terminal').textContent.includes('여기까지입니다'),
  null, { timeout: 30000 });
ok('손으로 답을 보내고 프로그램이 끝남');

await page.setViewportSize({ width: 412, height: 915 });
await page.waitForTimeout(800);

// 6. Long output must scroll inside the terminal, never widen the page.
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = 'print("O" * 400)';
  editor.dispatchEvent(new Event('input'));
});
// Run uses the last compiled program, so wait until the Python pane is
// actually showing this one before pressing it.
await page.waitForFunction(
  () => (document.querySelector('#python').textContent || '').includes('O" * 400'),
  null, { timeout: 20000 });
await page.locator('#run').tap();
await page.waitForFunction(
  () => (document.querySelector('#terminal').textContent || '').includes('OOOO'),
  null, { timeout: 45000 }).catch(() => {});
const long = (await page.textContent('#terminal')) || '';
check(long.includes('OOOO'), '아주 긴 한 줄이 출력됨', `${long.trim().length}자`);
check(await overflow() <= 0, '긴 출력이 나와도 쪽이 가로로 넘치지 않음', `${await overflow()}px`);
const scrolls = await page.evaluate(() => {
  const term = document.querySelector('#terminal');
  return term.scrollWidth > term.clientWidth || getComputedStyle(term).overflowWrap === 'break-word'
    || getComputedStyle(term).whiteSpace.includes('wrap');
});
check(scrolls, '긴 줄이 터미널 안에서 처리됨');

// 7. Save files, by touch: put the example in file 1, open another example,
//    come back and find it still there. This is the loss the owner named.
await page.locator('.file-tabs button[data-file="1"]').tap();
await page.waitForTimeout(300);
await page.evaluate(() => {
  const editor = document.querySelector('#editor');
  editor.value = '내가 쓴 것 말해줘';
  editor.dispatchEvent(new Event('input'));
});
await page.waitForTimeout(300);
await page.locator('.file-tabs button[data-file="example"]').tap();
await page.waitForTimeout(200);
const otherChip = page.locator('.chip').nth(2);
await otherChip.tap();
await page.waitForTimeout(400);
await page.locator('.file-tabs button[data-file="1"]').tap();
await page.waitForTimeout(300);
const kept = await page.inputValue('#editor');
check(kept.includes('내가 쓴 것'), '예제를 보고 와도 손으로 쓴 것이 남아 있음');

// 8. Nothing on the page may be wider than the phone, on either homepage.
for (const path of ['/ko/index.html', '/index.html']) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  check(await overflow() <= 0, `${path} 가 가로로 넘치지 않음`, `${await overflow()}px`);
}

check(errors.length === 0, '콘솔 오류 없음', errors.slice(0, 2).join(' | '));

await browser.close();
if (failures) {
  console.log(`\n손 조작 점검에서 ${failures}가지가 어긋납니다`);
  process.exit(1);
}
console.log('\n손으로 하는 조작이 모두 정상입니다');
