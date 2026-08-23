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
const FREEZE_CAP = 300;
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

const seen = await page.evaluate(async () => {
  const editor = document.querySelector('#editor');
  const python = document.querySelector('#python');
  const freezes = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) freezes.push(Math.round(entry.duration));
  }).observe({ entryTypes: ['longtask'] });

  // Typing 'x' in front of the first line usually breaks that line, and that
  // is fine — a keystroke mid-word breaks the program all the time and the
  // page has to keep up with it either way. So what is waited for is the pane
  // answering at all, not the pane being happy.
  const was = python.textContent;
  const wasState = python.dataset.state;
  const started = performance.now();
  editor.focus();
  editor.setSelectionRange(0, 0);
  // A real keystroke, not a value assignment: the page listens for `input`.
  editor.setRangeText('x', 0, 0, 'end');
  editor.dispatchEvent(new Event('input', { bubbles: true }));

  const caughtUp = await new Promise((done) => {
    const look = () => {
      if (python.textContent !== was || python.dataset.state !== wasState) done(performance.now() - started);
      else if (performance.now() - started > 60000) done(-1);
      else requestAnimationFrame(look);
    };
    look();
  });
  // Long tasks are reported after the fact; give the observer a turn.
  await new Promise((wake) => setTimeout(wake, 300));
  return { caughtUp: Math.round(caughtUp), freezes };
});

const worst = seen.freezes.length ? Math.max(...seen.freezes) : 0;
if (worst > FREEZE_CAP) {
  problems.push(`한 글자를 치는 동안 화면이 ${worst}ms 멈춤 (${FREEZE_CAP}ms까지 봐줌) — 컴파일이 메인 스레드로 돌아왔을 수 있음`);
}
if (seen.caughtUp < 0) problems.push('한 글자를 친 뒤 파이썬이 60초 안에 따라오지 못함');
else if (seen.caughtUp > COMPILE_CAP) problems.push(`한 글자에 파이썬이 ${seen.caughtUp}ms 걸림 (${COMPILE_CAP}ms까지 봐줌)`);

console.log(`ok   ${lines}줄짜리 프로그램에서 한 글자`);
console.log(`     화면이 멈춘 가장 긴 순간  ${worst}ms   (멈춤 ${seen.freezes.length}건${seen.freezes.length ? ': ' + seen.freezes.join(', ') : ''})`);
console.log(`     파이썬이 따라오기까지     ${seen.caughtUp}ms`);

await browser.close();
if (problems.length) {
  for (const one of problems) console.log(`FAIL ${one}`);
  process.exit(1);
}
console.log('\n긴 프로그램에서도 화면이 멈추지 않습니다');
