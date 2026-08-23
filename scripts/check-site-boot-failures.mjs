/* What the visitor sees when a download does not arrive.
 *
 *   node scripts/check-site-boot-failures.mjs [base-url]
 *
 * The three paths here are invisible until the day they happen, which is why
 * they are checked at all. They used to be *printed* rather than checked: a
 * review on 2026-08-18 forced `실행 단추 잠김: false` and `다시 시도 보임: false`
 * and this script still exited 0. Every observation now carries an assertion.
 */
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'http://localhost:8787').replace(/\/$/, '');

let bad = 0;
const ok = (name, condition, detail = '') => {
  console.log(`${condition ? 'ok  ' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`);
  if (!condition) bad += 1;
};

const browser = await chromium.launch();

// 1) the compiler never arrives
{
  const page = await (await browser.newContext()).newPage();
  await page.route('**/wasm/nme_bg.wasm', (route) => route.abort());
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#boot-alert:not([hidden])', { timeout: 30000 });
  const said = ((await page.locator('#boot-alert p').textContent()) ?? '').trim();
  ok('컴파일러가 안 오면 무슨 일인지 말해 줌', said.length > 20, said.slice(0, 60));
  ok('  실행 단추가 잠김', await page.locator('#run').isDisabled());
  ok('  다시 시도가 보임', await page.locator('#boot-retry').isVisible());
  await page.close();
}

// 2) the engine never arrives, and Run is pressed anyway
{
  const page = await (await browser.newContext()).newPage();
  await page.route('**/wasm-run/nmerun_bg.wasm', (route) => route.abort());
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('#run').disabled, null, { timeout: 30000 });
  await page.click('#run');
  await page.waitForSelector('#boot-alert:not([hidden])', { timeout: 30000 });
  const said = ((await page.locator('#boot-alert p').textContent()) ?? '').trim();
  ok('실행기가 안 오면 무슨 일인지 말해 줌', said.length > 20, said.slice(0, 60));
  ok('  다시 시도가 보임', await page.locator('#boot-retry').isVisible());
  await page.close();
}

// 3) the engine is slow: Run must say so, keep the bar moving, then fire itself
{
  const page = await (await browser.newContext()).newPage();
  await page.route('**/wasm-run/nmerun_bg.wasm', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 6000));
    await route.continue();
  });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('#run').disabled, null, { timeout: 30000 });
  await page.click('#run');
  const waiting = ((await page.locator('#engine-note').textContent()) ?? '').trim();
  ok('기다리는 중이라고 말해 줌', waiting.length > 10, waiting.slice(0, 60));
  ok('  진행바가 보임', await page.locator('#boot-progress').isVisible());
  await page.waitForFunction(
    () => document.querySelector('#terminal').textContent.includes('Hello'),
    null,
    { timeout: 90000 },
  );
  const first = ((await page.locator('#terminal').textContent()) ?? '').trim().split('\n')[0];
  ok('  실행기가 도착하자 스스로 실행됨', first.includes('Hello'), first);
  ok('  알림은 뜨지 않았음', await page.locator('#boot-alert').isHidden());
  await page.close();
}

/* 4) the two halves of the engine come from different builds.
 *
 * The engine is a WebAssembly file plus the small script that binds it to this
 * page, and they only work as a pair — the binding is by name, and the names
 * carry a hash of the build. A browser holding an old copy of either half
 * pairs them wrongly, and the visitor gets
 *
 *   LinkError: WebAssembly.instantiate(): Import #0 "./nmerun_bg.js"
 *   "__wbg_readLine_…": function import requires a callable
 *
 * which the owner ran into on 2026-08-23. Nothing they can do clears it: every
 * reload finds the same stale copy. So the page fetches both halves past the
 * cache and starts a new worker, once. Here the first request for the script
 * is answered with one from "another build", and the page has to come back
 * from it on its own.
 */
{
  const page = await (await browser.newContext()).newPage();
  let served = 0;
  await page.route('**/wasm-run/nmerun.js', async (route) => {
    served += 1;
    const response = await route.fetch();
    const real = await response.text();
    const body = served === 1
      ? real.replace(/__wbg_readLine_[0-9a-f]+/g, '__wbg_readLine_0000000000000000')
      : real;
    await route.fulfill({ response, body });
  });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  let healed = true;
  await page.waitForFunction(
    () => document.querySelector('#engine-dot')?.dataset.state === 'ready',
    null,
    { timeout: 120000 },
  ).catch(() => { healed = false; });
  ok('실행기의 두 짝이 다른 판이어도 스스로 다시 받아 준비됨', healed, `요청 ${served}번`);
  ok('  고치는 동안 알림을 띄우지 않음', await page.locator('#boot-alert').isHidden());
  await page.close();
}

await browser.close();
console.log(bad === 0 ? '내려받기 실패 네 갈래 모두 정상' : `내려받기 실패 처리에서 ${bad}가지가 잘못되었습니다`);
process.exit(bad === 0 ? 0 : 1);
