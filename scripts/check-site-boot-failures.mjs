/* What the visitor sees when a download does not arrive. */
import { chromium } from 'playwright';

const browser = await chromium.launch();

// 1) the compiler never arrives
{
  const page = await (await browser.newContext()).newPage();
  await page.route('**/wasm/nme_bg.wasm', (route) => route.abort());
  await page.goto('http://localhost:8787/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#boot-alert:not([hidden])', { timeout: 30000 });
  console.log('컴파일러 없음 알림:', (await page.locator('#boot-alert p').textContent()).slice(0, 70));
  console.log('  실행 단추 잠김:', await page.locator('#run').isDisabled());
  console.log('  다시 시도 보임:', await page.locator('#boot-retry').isVisible());
  await page.close();
}

// 2) the engine never arrives, and Run is pressed anyway
{
  const page = await (await browser.newContext()).newPage();
  await page.route('**/wasm-run/nmerun_bg.wasm', (route) => route.abort());
  await page.goto('http://localhost:8787/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('#run').disabled, null, { timeout: 30000 });
  await page.click('#run');
  await page.waitForSelector('#boot-alert:not([hidden])', { timeout: 30000 });
  console.log('실행기 없음 알림:', (await page.locator('#boot-alert p').textContent()).slice(0, 70));
  await page.close();
}

// 3) the engine is slow: Run must wait and then fire by itself
{
  const page = await (await browser.newContext()).newPage();
  await page.route('**/wasm-run/nmerun_bg.wasm', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 6000));
    await route.continue();
  });
  await page.goto('http://localhost:8787/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('#run').disabled, null, { timeout: 30000 });
  await page.click('#run');
  console.log('기다리는 중 문구:', await page.locator('#engine-note').textContent());
  console.log('  진행바 보임:', await page.locator('#boot-progress').isVisible());
  await page.waitForFunction(() => document.querySelector('#terminal').textContent.includes('Hello'), null, { timeout: 90000 });
  console.log('  스스로 실행됨:', (await page.locator('#terminal').textContent()).trim().split('\n')[0]);
  await page.close();
}

await browser.close();
