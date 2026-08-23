/* Does typing still freeze the page?
 *
 *   node scripts/check-site-speed.mjs [base-url]
 *
 * The largest example the site offers is 4,337 lines, and compiling it takes
 * seconds. That is a separate problem. This one is about where those seconds
 * are spent: while the compiler ran on the page's own thread, one keystroke
 * stopped the tab dead for 3,966 ms — no caret, no scrolling, no repaint —
 * and on a slower machine it was worse. Compiling now happens in a worker, so
 * the page keeps painting while it waits.
 *
 * Nothing about that is visible in a screenshot, in the markup, or in a check
 * that waits for the right text to appear. It is only visible as a long task,
 * and it has to be measured with `PerformanceObserver`: a `setTimeout` poll
 * cannot see it, because the freeze stops the poll as well — the timers all
 * fire at once afterwards and report a wait far shorter than the real one.
 * Two sessions were fooled by exactly that on the same day.
 *
 * So: type one character into the biggest program there is, and watch the main
 * thread. The compile itself is timed and printed rather than asserted, so a
 * change that makes the compiler twice as slow shows up in the deploy log
 * instead of being found by a visitor whose tab stopped responding.
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:8931';
/* A frame is 16 ms. Anything over 50 ms is a "long task" by the browser's own
 * definition; this allows a good deal more than that, because one compile does
 * land on the main thread to be drawn, and that draw is real work. What it
 * does not allow is a compile being done there. */
/* Two different edits, because they used to cost different things.
 *
 * A letter inside a line changes one line of the Python and one line of the
 * coloured copy. Pressing Enter changes how many lines there are, which is
 * what both of those used to rebuild from nothing: 145 ms and 231 ms for one
 * keystroke on this program. Both are now the size of the edit rather than the
 * size of the program, and both measure zero — no task over 50 ms at all.
 * The allowances are what a slower machine may take without anyone noticing;
 * they are not where this is. */
const LETTER_CAP = 80;
const LINE_CAP = 100;
const COMPILE_CAP = 20000;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const problems = [];

await page.goto(`${BASE}/ko/#example=peace`, { waitUntil: 'domcontentloaded' });
// The pane ships with data-state="ok" on it, so waiting for that alone waits
// for nothing at all: it is true before the compiler has even arrived. Wait
// for Python to actually be in there.
await page.waitForFunction(
  () => (document.querySelector('#python')?.textContent?.length ?? 0) > 10000,
  null,
  { timeout: 180000 },
);
await page.waitForTimeout(1200);

const lines = await page.evaluate(() => document.querySelector('#editor').value.split('\n').length);
if (lines < 4000) problems.push(`가장 큰 예제가 실리지 않음 — ${lines}줄`);

/* One real keystroke, sent by the browser rather than written into the box.
 *
 * This used to put the letter in with `setRangeText`, which rewrites the whole
 * 88 KB value: 110 ms of the browser's own string and layout work, none of it
 * this page's, and all of it inside the number being reported. Measuring with
 * an instrument that costs more than the thing measured hides exactly the
 * regression this check exists to catch.
 *
 * What is timed is how long the page takes to answer — not how long it waits
 * before admitting a program is broken, which is held back half a second on
 * purpose (see `compileNow`), so both edits keep the program working. */
const arm = (place) => page.evaluate((where) => {
  const editor = document.querySelector('#editor');
  editor.focus();
  // Inside a line: the second line of every example is a comment, so a letter
  // put there changes that line of the Python and nothing else.
  const at = where === 'letter'
    ? editor.value.indexOf('\n', editor.value.indexOf('\n') + 1)
    : editor.value.length;
  editor.setSelectionRange(at, at);
}, place);

const watchFrom = () => page.evaluate(() => {
  const python = document.querySelector('#python');
  const freezes = [];
  const watch = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) freezes.push(Math.round(entry.duration));
  });
  watch.observe({ entryTypes: ['longtask'] });
  // The pane is one element per line with no text between them, so a line
  // added or taken away shows in the count and not in the text.
  const mark = () => `${python.textContent.length}:${python.children.length}:${python.dataset.state}`;
  const was = mark();
  const started = performance.now();
  globalThis.nmeSpeed = {
    freezes,
    caughtUp: new Promise((done) => {
      const look = () => {
        if (mark() !== was) done(performance.now() - started);
        else if (performance.now() - started > 60000) done(-1);
        else requestAnimationFrame(look);
      };
      look();
    }),
    finish: async () => {
      const caughtUp = await globalThis.nmeSpeed.caughtUp;
      // Long tasks are reported after the fact; give the observer a turn.
      await new Promise((wake) => setTimeout(wake, 400));
      watch.disconnect();
      return { caughtUp: Math.round(caughtUp), freezes };
    },
  };
});

async function typeOne(place) {
  await arm(place);
  await page.waitForTimeout(400);
  await watchFrom();
  if (place === 'letter') await page.keyboard.type('자');
  else await page.keyboard.press('Enter');
  return page.evaluate(() => globalThis.nmeSpeed.finish());
}

const measured = [
  { what: '줄 안에서 한 글자', cap: LETTER_CAP, seen: await typeOne('letter') },
  { what: '줄 하나 더', cap: LINE_CAP, seen: await typeOne('line') },
];

console.log(`ok   ${lines}줄짜리 프로그램`);
for (const { what, cap, seen } of measured) {
  const worst = seen.freezes.length ? Math.max(...seen.freezes) : 0;
  if (worst > cap) {
    problems.push(`${what}: 화면이 ${worst}ms 멈춤 (${cap}ms까지 봐줌) — 한 줄이 아니라 프로그램 전체를 다시 그렸을 수 있음`);
  }
  if (seen.caughtUp < 0) problems.push(`${what}: 파이썬이 60초 안에 따라오지 못함`);
  else if (seen.caughtUp > COMPILE_CAP) problems.push(`${what}: 파이썬이 ${seen.caughtUp}ms 걸림 (${COMPILE_CAP}ms까지 봐줌)`);
  console.log(`     ${what}`);
  console.log(`       화면이 멈춘 가장 긴 순간  ${worst}ms   (멈춤 ${seen.freezes.length}건${seen.freezes.length ? ': ' + seen.freezes.join(', ') : ''})`);
  console.log(`       파이썬이 따라오기까지     ${seen.caughtUp}ms`);
}

await browser.close();
if (problems.length) {
  for (const one of problems) console.log(`FAIL ${one}`);
  process.exit(1);
}
console.log('\n긴 프로그램에서도 화면이 멈추지 않습니다');
