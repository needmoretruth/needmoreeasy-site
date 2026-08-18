/* Checks the published site from outside, the way a visitor meets it.
 *
 *   node scripts/check-live.mjs [https://needmoreeasy.com]
 *
 * `deploy.sh` already confirms three addresses answer 200. This goes further:
 * it opens the page in a browser, waits for the compiler and the engine, runs
 * a program, and checks the things a status code cannot see — that a wrong
 * address says 404 rather than quietly showing the home page, that a guide
 * carries a working "run it" link, and that a Korean browser lands on /ko/.
 */
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://needmoreeasy.com').replace(/\/$/, '');
const browser = await chromium.launch();
let failures = 0;
const note = (message) => { failures += 1; console.log('FAIL ' + message); };
const ok = (message) => console.log('ok   ' + message);

/* 1. the two landing pages actually work, engine and all */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + '/ko/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#engine-dot')?.dataset.state === 'ready', null, { timeout: 120000 });
  await page.evaluate(() => {
    const editor = document.querySelector('#editor');
    editor.value = '시간 재기 시작해\n천천히 말해줘 살아 있습니다\n잰시간 말해줘';
    editor.dispatchEvent(new Event('input'));
  });
  await page.waitForTimeout(500);
  await page.click('#run');
  await page.waitForFunction(() => document.querySelector('#terminal').textContent.includes('살아 있습니다'), null, { timeout: 30000 });
  ok('연습장이 새 문장 문법을 컴파일하고 실행함');
  if (errors.length) note('콘솔 오류: ' + errors.slice(0, 2).join(' | '));
  await page.close();
}

/* 2. a wrong address must say so */
{
  const page = await browser.newPage();
  const response = await page.goto(BASE + '/there-is-no-such-page', { waitUntil: 'domcontentloaded' });
  if (response.status() !== 404) note(`없는 주소가 ${response.status()}를 돌려줌 (404여야 함)`);
  else ok('없는 주소가 404를 돌려줌');
  await page.close();
}

/* 3. a guide's "run it" link carries its program into the playground */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/ko/learn/guides/88-timer', { waitUntil: 'domcontentloaded' });
  const href = await page.getAttribute('.snippet-tools a', 'href');
  if (!href || !href.includes('#code=')) {
    note('가이드에 실행 링크가 없음');
  } else {
    await page.goto(BASE + href, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const value = await page.inputValue('#editor');
    if (!value.includes('시간 재기')) note('실행 링크가 프로그램을 싣지 못함');
    else ok('가이드의 실행 링크가 프로그램을 연습장으로 옮김');
  }
  await page.close();
}

/* 4. a Korean browser is sent to the Korean site, once */
{
  const context = await browser.newContext({ locale: 'ko-KR' });
  const page = await context.newPage();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  if (new URL(page.url()).pathname !== '/ko/') note('한국어 브라우저가 /ko/로 가지 않음');
  else ok('한국어 브라우저가 /ko/로 감');
  await context.close();
}

/* 5. the link-preview image is really there */
{
  const page = await browser.newPage();
  const response = await page.goto(BASE + '/assets/og.png');
  if (!response.ok()) note('링크 미리보기 그림이 없음');
  else ok('링크 미리보기 그림이 있음');
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures}건 실패` : '\n배포된 사이트가 밖에서 보아도 정상입니다');
process.exit(failures ? 1 : 0);
