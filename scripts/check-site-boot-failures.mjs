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

await browser.close();
console.log(bad === 0 ? '내려받기 실패 세 갈래 모두 정상' : `내려받기 실패 처리에서 ${bad}가지가 잘못되었습니다`);
process.exit(bad === 0 ? 0 : 1);
