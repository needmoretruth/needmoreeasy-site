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
import { guidePath } from './site-paths.mjs';

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

/* 1b. the compiler on the page has to be the one the pin names.
 *
 * On 2026-08-22 the site said 0.7.1, the pin was right, the wasm hash matched
 * what was deployed — and the compiler on the page was still three fixes
 * behind, because those fixes had never been committed. A status code cannot
 * see that and neither can a hash. The only thing that can is compiling a line
 * that used to come out wrong.
 *
 * Each entry is a program and the Python that release must produce. Add one
 * whenever a release turns on something a reader could not do before. */
{
  const CHANGES = [
    ['0.8.0 이름 끝의 「면」이 대입을 삼키지 않음',
     '적이름은 황금가면 도적왕 레마르\n적이름 말해줘',
     '적이름 = "황금가면 도적왕 레마르"'],
    ['0.8.0 정수 몫',
     '총점은 47\n줄수는 총점을 5로 나눈 몫\n줄수 말해줘',
     '줄수 = 총점 // 5'],
    ['0.8.0 글자를 숫자로',
     '답글은 42\n답은 답글을 숫자로 바꾼 것\n답 말해줘',
     '답 = int(답글)'],
    // 0.9.0 refuses this one, so the pair is the other way round: what must
    // reach the reader is the refusal, not a line of Python.
    ['0.9.0 참이 될 수 없는 비교를 거절함',
     '수호룬은 거짓\n선택을 물어봐 수호룬, 폭약\n만약에 선택이 수호룬과 같으면\n    골랐습니다 말해줘\n끝',
     null],
  ];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/ko/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#engine-dot')?.dataset.state === 'ready', null, { timeout: 120000 });

  const build = await page.textContent('#foot-build');
  if (build && build.trim()) ok(`바닥글이 빌드를 밝힘 — 컴파일러${build}`);
  else note('바닥글에 빌드 커밋이 없음');

  for (const [name, source, expected] of CHANGES) {
    const seen = await page.evaluate(async (code) => {
      const editor = document.querySelector('#editor');
      editor.value = code;
      editor.dispatchEvent(new Event('input'));
      await new Promise((wake) => setTimeout(wake, 700));
      return {
        python: document.querySelector('#python')?.textContent ?? '',
        state: document.querySelector('#python')?.dataset.state ?? '',
        problem: document.querySelector('#problem')?.textContent ?? '',
      };
    }, source);
    // `expected === null` means the release turned this program into a
    // refusal. A compiler that still accepts it is one release behind, and
    // the Python it produces looks perfectly fine — which is the whole point.
    if (expected === null) {
      if (seen.state === 'error') ok(name);
      else note(`${name} — 거절되지 않고 컴파일됨: ${seen.python.trim().split('\n')[0] || '(없음)'}`);
    } else if (seen.python.includes(expected)) {
      ok(name);
    } else {
      note(`${name} — 나온 것: ${seen.python.trim().split('\n')[0] || '(없음)'}`);
    }
  }
  await page.close();
}

/* 1c. the largest program on the site has to compile in the browser.
 *
 * Everything above compiles a few lines. `peace` is 4,337 of them, and it is
 * the one program a visitor is most likely to arrive for — the site offers it
 * as the answer to "how far does the sentence syntax go?". A compiler that
 * handles every short example and falls over on this one has failed at exactly
 * the thing the page is advertising.
 *
 * The timing is reported rather than asserted. It is here so that a later
 * release which doubles it is visible in the deploy log instead of being
 * discovered by a reader whose tab has stopped responding. */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/ko/#example=peace', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#engine-dot')?.dataset.state === 'ready', null, { timeout: 120000 });

  const started = Date.now();
  const seen = await page.evaluate(async () => {
    const editor = document.querySelector('#editor');
    const python = document.querySelector('#python');
    // The compile is debounced and the program is large, so wait for the pane
    // to stop growing rather than for a fixed time.
    let last = -1;
    for (let tick = 0; tick < 60; tick += 1) {
      await new Promise((wake) => setTimeout(wake, 500));
      const now = python?.textContent?.length ?? 0;
      if (now > 0 && now === last) break;
      last = now;
    }
    return {
      wrote: editor?.value?.split('\n').length ?? 0,
      became: python?.textContent?.replace(/\n$/, '').split('\n').length ?? 0,
      state: python?.dataset.state,
      first: python?.textContent?.trim().split('\n')[0] ?? '',
    };
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  if (seen.wrote < 4000) {
    note(`가장 큰 예제가 실리지 않음 — 편집 칸이 ${seen.wrote}줄`);
  } else if (seen.state === 'error') {
    note(`가장 큰 예제(${seen.wrote}줄)가 컴파일되지 않음 — ${seen.first}`);
  } else if (seen.became !== seen.wrote) {
    // One NME statement is exactly one physical Python line, so the two panes
    // must have the same number of lines. A mismatch means a statement was
    // swallowed or split, which no short example would reveal.
    note(`가장 큰 예제의 줄이 어긋남 — 쓴 것 ${seen.wrote}줄, 된 것 ${seen.became}줄`);
  } else {
    ok(`가장 큰 예제 ${seen.wrote}줄이 브라우저에서 컴파일됨  ${seconds}초`);
  }
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
  await page.goto(BASE + guidePath('timer', 'ko'), { waitUntil: 'domcontentloaded' });
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
