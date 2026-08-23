/* needmoreeasy.com — page behaviour.
 *
 * Three jobs, in order of how much of this file they take:
 *   1. the playground (compile as you type, run in a worker, blocking input)
 *   2. language routing (English is the site itself; /ko/ is the toggle)
 *   3. small conveniences (copy buttons)
 *
 * There is no server anywhere in here. The compiler is WebAssembly on this
 * thread; the Python engine is WebAssembly in a worker. A visitor's code never
 * leaves their machine, which is also why the page can promise that.
 *
 * This is the source. `scripts/build-scripts.mjs` type-checks it and compiles
 * it to `site/assets/site.js`, which is the file the page loads.
 */

import { EXAMPLES, GROUPS, GROUP_LABELS, ALL_LABEL } from './examples.js';
import { COMPILER_BYTES, COMPILER_COMMIT, COMPILER_SHA256 } from './engine-meta.js';
import type { Example, ExampleGroup, ExampleLanguage } from './examples.js';

/* What the strip is filtered by. 'all' is not a group an example can belong
 * to — it is the absence of a filter — so it is a separate word rather than an
 * eighth member of ExampleGroup, and the two places that compare a group
 * against it have to say so. */
type GroupChoice = ExampleGroup | 'all';

const LANG: ExampleLanguage = document.documentElement.lang === 'ko' ? 'ko' : 'en';
const STORE_KEY = 'nme-lang';

const TEXT = {
  en: {
    compiled: 'Python',
    compiledNote: 'what the compiler produced',
    errorLabel: 'what the compiler says',
    errorNote: 'fix this line and it will compile',
    bootCompiler: 'fetching the compiler…',
    compiling: 'turning it into Python…',
    bootEngine: 'fetching the Python engine — 11 MB, once…',
    engineReady: 'ready to run',
    waitingToRun: 'the engine has not arrived yet — this will run the moment it does',
    compilerLate: 'The compiler has not arrived, so nothing can run yet. Check your connection and try again.',
    engineLate: 'The Python engine could not be fetched, so the program cannot run here. Check your connection and try again.',
    retry: 'try again',
    running: 'running…',
    finished: 'finished',
    stopped: 'stopped',
    failed: 'ended with an error',
    stoppedByYou: '— stopped —',
    askHint: 'the program is waiting for an answer',
    noSharedMemory:
      'This browser will not give the page shared memory, so the program cannot pause for an answer. Type the answers below, one per line, before running.',
    answersLabel: 'Answers, one per line',
    copy: 'copy',
    copied: 'copied',
    fixFirst: 'Fix the program first — the compiler could not read it.',
    runHint: 'Run (Ctrl+Enter)',
    focusOn: 'Coding screen',
    focusOff: 'Back to the page',
    focusOffShort: 'Exit',
    focusHint: 'Give the whole window to the editor (Esc comes back)',
    lineWord: 'line',
    problemMore: 'error code',
    goToLine: 'take me to that line',
    blockedHint: 'One line cannot be read yet — the note under the editor says which.',
    noPythonYet: 'No Python yet. The band under the editor says which line stopped it, and why.',
    slotSaved: 'saved',
    slotName: 'Name for this slot',
    slotFirst: 'My program',
    slotDelete: 'delete for good?',
    slotSave: 'Save',
    slotCancel: 'Cancel',
    rename: 'rename',
    remove: 'delete',
    untitled: 'untitled',
    fileWord: 'File',
    examplesWord: 'Examples',
    exampleNote:
      'This tab is for looking at examples, so anything here can be replaced by the next one you open. To keep it, put it in a file.',
    fileNote: 'This file stays in this browser. Nothing else ever writes to it.',
    overwrite: 'overwrite?',
    promptFailed: 'The message could not be fetched. Open it as a page instead.',
    storageRefused:
      'This browser is refusing to store anything, so these files last only until you leave the page. Copy or download anything you want to keep.',
    promptClipped:
      '… the first part only. Copy takes the whole message; "open as a page" shows all of it.',
    needsFiles:
      'This program works with files on your computer, and a browser has nowhere to keep them. Install NME on your own machine and it will run there.',
    needsNetwork:
      'This program uses the network, which a program on this page cannot reach. Install NME on your own machine and it will run there.',
    tidyIdle:
      'Write it any way you like. This rewrites it in one way of writing, and the program stays the same.',
    tidyBlocked:
      'Tidying reads what the program means, so it has to run first. The band below says which line stopped it.',
    tidySame: 'Already written this way — nothing moved.',
    tidyDone: (lines: number): string =>
      lines === 1 ? 'Rewrote 1 line. The program does the same thing.'
        : `Rewrote ${lines} lines. The program does the same thing.`,
    tidyUndone: 'Put back the way you wrote it.',
    tidyWait: 'The compiler has not arrived yet.',
    findNone: 'not found',
    findAt: (at: number, of: number) => `${at} of ${of}`,
    renameNoJobs: 'This program has nothing named yet — no jobs and no remembered values.',
    renameJobs: 'jobs',
    renameValues: 'values it remembers',
    renameNeedName: 'Type the new name.',
    renameBadName: 'A name is one word, with no spaces and no digit at the front.',
    renameTaken: 'Something in this program is already called that.',
    renameDone: (count: number, to: string) => `Renamed ${count} ${count === 1 ? 'place' : 'places'} to ${to}.`,
    renameNothing: 'Nothing to rename — nowhere in this program is that a name.',
    renameUnsafe: 'Not renamed. That word is also part of what the program prints, so changing it would change what the program says.',
    renameBroken: 'Not renamed. The program stops compiling with that name.',
    renameWait: 'The compiler has not arrived yet.',
    versionFixed: 'This one is about the way it is written, so it stays as written.',
    versionSame: 'The sentence version is the one shown — the rewrite did not hold.',
  },
  ko: {
    compiled: 'Python',
    compiledNote: '컴파일러가 만든 결과',
    errorLabel: '컴파일러가 알려주는 내용',
    errorNote: '이 줄을 고치면 됩니다',
    bootCompiler: '컴파일러를 내려받는 중입니다…',
    compiling: '파이썬으로 바꾸는 중입니다…',
    bootEngine: '파이썬 실행기를 내려받는 중입니다 — 11MB, 처음 한 번만…',
    engineReady: '실행 준비가 됐습니다',
    waitingToRun: '실행기가 아직 도착하지 않았습니다. 도착하는 즉시 실행합니다.',
    compilerLate: '컴파일러가 도착하지 않아 아직 아무것도 실행할 수 없습니다. 연결을 확인하고 다시 시도해 주세요.',
    engineLate: '파이썬 실행기를 내려받지 못해서 여기서는 실행할 수 없습니다. 연결을 확인하고 다시 시도해 주세요.',
    retry: '다시 시도',
    running: '실행 중…',
    finished: '실행이 끝났습니다',
    stopped: '멈췄습니다',
    failed: '오류로 끝났습니다',
    stoppedByYou: '— 멈춤 —',
    askHint: '프로그램이 답을 기다리고 있습니다',
    noSharedMemory:
      '이 브라우저가 페이지에 공유 메모리를 주지 않아서, 프로그램이 도중에 멈춰 답을 받을 수 없습니다. 실행 전에 아래에 답을 한 줄에 하나씩 적어 주세요.',
    answersLabel: '답(한 줄에 하나씩)',
    copy: '복사',
    copied: '복사했습니다',
    fixFirst: '먼저 프로그램을 고쳐 주세요. 컴파일러가 읽지 못했습니다.',
    runHint: '실행 (Ctrl+Enter)',
    focusOn: '코딩 화면',
    focusOff: '페이지로 돌아가기',
    focusOffShort: '나가기',
    focusHint: '창 전체를 편집 칸에 씁니다 (Esc를 누르면 돌아옵니다)',
    lineWord: '줄',
    problemMore: '오류 번호',
    goToLine: '그 줄로 가기',
    blockedHint: '아직 읽지 못한 줄이 하나 있습니다. 편집 칸 아래에 어느 줄인지 적혀 있습니다.',
    noPythonYet: '아직 파이썬을 만들지 못했습니다. 편집 칸 아래에 어느 줄이 왜 걸렸는지 적혀 있습니다.',
    slotSaved: '저장했습니다',
    slotName: '이 슬롯의 이름',
    slotFirst: '내 프로그램',
    slotDelete: '정말 지울까요?',
    slotSave: '저장',
    slotCancel: '취소',
    rename: '이름 바꾸기',
    remove: '지우기',
    untitled: '이름 없음',
    fileWord: '파일',
    examplesWord: '예제',
    exampleNote:
      '이 칸은 예제를 보는 곳이라, 다음 예제를 열면 지금 것이 사라집니다. 계속 두려면 파일에 넣으세요.',
    fileNote: '이 파일은 이 브라우저에 남습니다. 다른 것이 여기에 쓰는 일은 없습니다.',
    overwrite: '덮어쓸까요?',
    promptFailed: '글을 가져오지 못했습니다. 문서로 열어 보세요.',
    storageRefused:
      '이 브라우저가 저장을 막고 있어서, 이 파일들은 창을 닫으면 사라집니다. 남기고 싶은 것은 복사하거나 내려받아 두세요.',
    promptClipped:
      '… 여기까지만 보여 줍니다. 「전체 복사」는 글 전체를 복사하고, 「문서로 열기」는 전부 보여 줍니다.',
    needsFiles:
      '이 프로그램은 컴퓨터의 파일을 씁니다. 브라우저 안에는 파일을 둘 곳이 없어서 여기서는 되지 않습니다. 본인 컴퓨터에 NME를 설치하면 그곳에서 됩니다.',
    needsNetwork:
      '이 프로그램은 인터넷을 씁니다. 이 화면에서 도는 프로그램은 인터넷에 닿을 수 없습니다. 본인 컴퓨터에 NME를 설치하면 그곳에서 됩니다.',
    tidyIdle:
      '아무렇게나 쓰셔도 됩니다. 한 가지 표기로 다시 써 드리고, 프로그램이 하는 일은 그대로입니다.',
    tidyBlocked:
      '정리는 프로그램의 뜻을 읽어서 다시 쓰는 것이라, 먼저 실행되는 상태여야 합니다. 아래 칸에 어느 줄에서 막혔는지 적혀 있습니다.',
    tidySame: '이미 이 표기로 쓰여 있어서 바뀐 줄이 없습니다.',
    tidyDone: (lines: number): string => `${lines}줄을 다시 썼습니다. 프로그램이 하는 일은 그대로입니다.`,
    tidyUndone: '쓰셨던 그대로 되돌렸습니다.',
    tidyWait: '컴파일러가 아직 도착하지 않았습니다.',
    findNone: '없습니다',
    findAt: (at: number, of: number) => `${of}개 가운데 ${at}번째`,
    renameNoJobs: '이 프로그램에는 아직 이름 붙인 것이 없습니다 — 일도 값도 없습니다.',
    renameJobs: '일',
    renameValues: '기억해 둔 값',
    renameNeedName: '새 이름을 적어 주세요.',
    renameBadName: '이름은 한 낱말입니다. 사이에 빈칸을 두지 않고, 숫자로 시작하지 않습니다.',
    renameTaken: '그 이름을 쓰는 것이 이 프로그램에 이미 있습니다.',
    renameDone: (count: number, to: string) => `${count}곳을 ${to}로 바꿨습니다.`,
    renameNothing: '바꿀 곳이 없습니다. 이 프로그램에서 그것을 이름으로 쓰는 자리가 없습니다.',
    renameUnsafe: '바꾸지 않았습니다. 그 낱말은 프로그램이 화면에 내보내는 글에도 들어 있어서, 바꾸면 프로그램이 하는 말이 달라집니다.',
    renameBroken: '바꾸지 않았습니다. 그 이름으로는 프로그램이 컴파일되지 않습니다.',
    renameWait: '컴파일러가 아직 도착하지 않았습니다.',
    versionFixed: '이 예제는 「어떻게 쓰는가」 자체가 내용이라 쓰인 그대로 둡니다.',
    versionSame: '다시 쓰기가 확인을 통과하지 못해 문장 표기 그대로 보여 드립니다.',
  },
}[LANG];

/* --- reading the page ---------------------------------------------------- */

/* Everything this file touches is fetched through one of these three, so that
 * "the page must have this" and "the page may have this" are different lines
 * rather than the same line and a hope. Each one checks what it found against
 * the kind of element it is about to be used as, which is what lets the rest
 * of the file stay free of type assertions.
 */
type ElementKind<T extends Element> = abstract new (...args: never[]) => T;

function queryOne<T extends Element>(root: ParentNode, selector: string, kind: ElementKind<T>): T {
  const found = root.querySelector(selector);
  if (found instanceof kind) return found;
  throw new Error(`the page is missing ${selector}`);
}

function queryMaybe<T extends Element>(root: ParentNode, selector: string, kind: ElementKind<T>): T | null {
  const found = root.querySelector(selector);
  return found instanceof kind ? found : null;
}

function queryAll<T extends Element>(root: ParentNode, selector: string, kind: ElementKind<T>): T[] {
  return [...root.querySelectorAll(selector)].filter((node): node is T => node instanceof kind);
}

/* --- language routing ---------------------------------------------------- */

function rememberLanguageChoice(): void {
  queryAll(document, '[data-lang-choice]', HTMLElement).forEach((link) => {
    link.addEventListener('click', () => {
      const choice = link.dataset.langChoice;
      if (choice === undefined) return;
      try {
        localStorage.setItem(STORE_KEY, choice);
      } catch {
        /* private mode: the choice simply is not remembered */
      }
    });
  });
}

/* The English page is the site's front door, so it is the only page that ever
 * forwards. It forwards once, only for a visitor whose browser asks for Korean
 * and who has never chosen a language here. Anyone who clicks "EN" stays. */
function forwardKoreanSpeakersOnce(): void {
  if (LANG !== 'en') return;
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORE_KEY);
  } catch {
    return;
  }
  if (stored) return;
  const wantsKorean = (navigator.languages || [navigator.language || ''])
    .some((tag) => String(tag).toLowerCase().startsWith('ko'));
  if (!wantsKorean) return;
  location.replace('/ko/' + location.hash);
}

/* --- theme, motion, depth ------------------------------------------------ */

const THEME_KEY = 'nme-theme';

/* Three states, not two. "System" is a real choice: it is what a visitor who
 * set their phone to switch at sunset already asked for, so it stays the
 * default and the toggle can always get back to it. */
function wireTheme(): void {
  const buttons = queryAll(document, '[data-theme-choice]', HTMLElement);
  if (!buttons.length) return;

  const current = (): string => {
    const attribute = document.documentElement.getAttribute('data-theme');
    return attribute === 'dark' || attribute === 'light' ? attribute : 'system';
  };
  const paint = (): void => {
    const now = current();
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === now));
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const choice = button.dataset.themeChoice;
      if (choice === undefined) return;
      if (choice === 'system') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', choice);
      try {
        if (choice === 'system') localStorage.removeItem(THEME_KEY);
        else localStorage.setItem(THEME_KEY, choice);
      } catch {
        /* private mode: the choice lasts for this page only */
      }
      paint();
    });
  });
  paint();
}

/* Panels rise into place as they are reached. Everything starts visible in the
 * markup; the hidden state is added here, so a reader without script — or one
 * who asked for less motion — sees a complete page either way. */
function wireReveal(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const targets = queryAll(document,
    '.hero-text, .hero-figure, .play-head, .card, .split > div, .links li, .prompt-card, .notice',
    HTMLElement);
  if (!targets.length) return;

  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      seen.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  targets.forEach((node, index) => {
    node.classList.add('reveal');
    // A short stagger between siblings reads as one movement rather than
    // several. Anything longer than a fifth of a second feels like a delay.
    node.style.setProperty('transition-delay', `${Math.min(index % 6, 5) * 35}ms`);
    seen.observe(node);
  });

  // Failsafe. Anything still hidden after a few seconds is shown anyway: a
  // reader who never scrolls, a tool that renders the whole page at once, or
  // an observer that never fires must not be left looking at empty sections.
  // Four seconds is long enough that a scrolling reader still sees the motion.
  setTimeout(() => {
    seen.disconnect();
    targets.forEach((node) => node.classList.add('in'));
  }, 4000);
}

/* The header is part of the page until the page moves under it. */
function wireHeaderEdge(): void {
  const head = queryMaybe(document, '.site-head', HTMLElement);
  if (!head) return;
  const sync = (): void => {
    head.setAttribute('data-scrolled', String(window.scrollY > 8));
    // Once a reader is well into a page, the row of section links is not what
    // they are here for, and on a 740px-tall phone the header was taking 22%
    // of the screen. Deep in the page it keeps only the brand and the two
    // toggles; at the top everything is back.
    head.setAttribute('data-deep', String(window.scrollY > 240));
  };
  sync();
  addEventListener('scroll', sync, { passive: true });
}

/* The header stays at the top of the window, so an anchor has to leave room for
 * it or the heading you tapped for lands underneath it. The room needed is not
 * a constant: at 320 and 360 the header wraps onto three rows and is 138px
 * tall, while the CSS reserved 80. Measure it and let the CSS do the rest. */
function wireHeaderHeight(): void {
  const head = queryMaybe(document, '.site-head', HTMLElement);
  if (!head) return;
  const sync = (): void => {
    const height = Math.round(head.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--head-h', `${height}px`);
  };
  sync();
  addEventListener('resize', sync);
  // Web fonts and the wrapping they change arrive after the first measurement.
  if ('fonts' in document) void document.fonts.ready.then(sync);
}

/* The hero says "you write this, it becomes that". Revealing the second block
 * a beat after the first makes the page say it too, once, on arrival. */
function wireHeroLines(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const blocks = queryAll(document, '.hero-figure pre.code', HTMLElement);
  if (blocks.length !== 2) return;

  blocks.forEach((block, blockIndex) => {
    const lines = (block.textContent ?? '').replace(/\n$/, '').split('\n');
    block.textContent = '';
    lines.forEach((text, index) => {
      const line = document.createElement('span');
      line.className = 'code-line';
      line.textContent = text;
      line.style.setProperty('--i', String(index + blockIndex * 4.5));
      block.append(line, document.createTextNode(index === lines.length - 1 ? '' : '\n'));
    });
  });
}

/* --- saving what you wrote ----------------------------------------------- */

/* A download the browser makes itself: no server sees the program, which is
 * the same promise the rest of the playground makes. */
function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* --- copy buttons -------------------------------------------------------- */

function wireCopyButtons(): void {
  queryAll(document, '[data-copy]', HTMLElement).forEach((button) => {
    button.addEventListener('click', async () => {
      const targetId = button.dataset.copy;
      if (targetId === undefined) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.innerText);
        flashLabel(button, TEXT.copied);
      } catch {
        /* clipboard blocked — the text is on screen and selectable anyway */
      }
    });
  });
}

/* A prompt is thousands of words long, so it is copied from the file rather
 * than from anything on screen: one press, whole document, no scrolling. */
/* --- the three messages for someone else's AI ---------------------------- */

/* The band at the top of the home page. Each entry says what its message is
 * for; the message itself — twenty to forty thousand characters of it — is
 * fetched only when somebody opens that entry, so it costs the page nothing
 * until it is wanted. Without JavaScript the "open as a page" link beside it
 * still works, which is why that link is in the HTML rather than made here.
 */
const promptTexts = new Map<string, string>();

async function fetchPrompt(name: string, lang: string): Promise<string | null> {
  const key = `${name}.${lang}`;
  const held = promptTexts.get(key);
  if (held !== undefined) return held;
  try {
    const response = await fetch(`/assets/prompts/${key}.txt`);
    if (!response.ok) return null;
    const text = await response.text();
    promptTexts.set(key, text);
    return text;
  } catch {
    return null;
  }
}

function wireAiPrompts(): void {
  for (const box of queryAll(document, 'details[data-prompt]', HTMLDetailsElement)) {
    const name = box.dataset.prompt;
    const lang = box.dataset.lang;
    if (name === undefined || lang === undefined) continue;
    const readout = queryMaybe(box, '[data-prompt-text]', HTMLElement);
    const copy = queryMaybe(box, '[data-prompt-copy]', HTMLElement);
    const save = queryMaybe(box, '[data-prompt-download]', HTMLElement);

    /* Twenty-five thousand characters in a box eight lines tall is not reading,
     * it is a place a finger gets stuck on a phone. The opening is shown; the
     * copy button and the page link still carry all of it. */
    const shownPart = (text: string): string => {
      const lines = text.split('\n');
      if (lines.length <= 45) return text;
      return `${lines.slice(0, 45).join('\n')}\n\n${TEXT.promptClipped}`;
    };

    const load = async (): Promise<string | null> => {
      const text = await fetchPrompt(name, lang);
      if (readout) {
        readout.textContent = text === null ? TEXT.promptFailed : shownPart(text);
        readout.dataset.state = text === null ? 'error' : 'ok';
      }
      return text;
    };

    box.addEventListener('toggle', () => {
      if (box.open) void load();
    });
    if (copy) {
      copy.addEventListener('click', () => {
        void (async () => {
          const text = await load();
          const worked = text !== null && (await copyText(text));
          flashLabel(copy, worked ? TEXT.copied : TEXT.promptFailed, 1600);
        })();
      });
    }
    if (save) {
      save.addEventListener('click', () => {
        void (async () => {
          const text = await load();
          if (text === null) {
            // Pressing a button and having nothing at all happen is worse than
            // an error: the visitor cannot tell it from a browser that ate the
            // download.
            flashLabel(save, TEXT.promptFailed, 1600);
            return;
          }
          downloadText(`nme-${name}-prompt.${lang}.txt`, text);
        })();
      });
    }
  }
}

function wireFileCopyButtons(): void {
  const label = LANG === 'ko' ? '복사했습니다' : 'copied';
  const failed = LANG === 'ko' ? '복사하지 못했습니다' : 'copy failed';
  queryAll(document, '[data-copy-file]', HTMLElement).forEach((button) => {
    button.addEventListener('click', async () => {
      const file = button.dataset.copyFile;
      if (file === undefined) return;
      try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await navigator.clipboard.writeText(await response.text());
        flashLabel(button, label, 1600);
      } catch {
        flashLabel(button, failed, 1600);
      }
    });
  });
}

/* --- Python colouring ---------------------------------------------------- */

const PY_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
  'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
  'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
  'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

const HTML_ESCAPES: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

function escapeHtml(text: string): string {
  return text.replace(/[&<>]/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}

/* Deliberately small: strings, comments, numbers, keywords. Anything cleverer
 * would need a real Python lexer, and this pane is for reading, not editing. */
function highlightPython(source: string): string {
  const pattern = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*|\b\d+(?:\.\d+)?\b|[A-Za-z_\u00c0-\uffff][\w\u00c0-\uffff]*)/g;
  let result = '';
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    const piece = match[0];
    result += escapeHtml(source.slice(last, match.index));
    last = match.index + piece.length;
    if (piece.startsWith('#')) {
      result += `<span class="tok-com">${escapeHtml(piece)}</span>`;
    } else if (/^["']/.test(piece)) {
      result += `<span class="tok-str">${escapeHtml(piece)}</span>`;
    } else if (/^\d/.test(piece)) {
      result += `<span class="tok-num">${escapeHtml(piece)}</span>`;
    } else if (PY_KEYWORDS.has(piece)) {
      result += `<span class="tok-kw">${escapeHtml(piece)}</span>`;
    } else {
      result += escapeHtml(piece);
    }
  }
  return result + escapeHtml(source.slice(last));
}

/* Colour for the box a person writes in.
 *
 * Deliberately smaller than the Python pane's. A comment is a `#` and what
 * follows it, exactly as in Python, and it takes the green every editor in
 * the world gives a comment. Quoted text and numbers take the quiet tokens.
 *
 * Nothing else is touched, and that is the point rather than an omission: in
 * NME an ordinary word is ordinary text, so painting words as keywords would
 * be claiming a meaning the compiler may not have given them. The one thing
 * the reader is promised here — a `#` line does nothing — is the one thing
 * this paints.
 *
 * One line at a time, so that a keystroke repaints one line. A triple-quoted
 * Python string that runs over several lines is therefore not tracked across
 * them; each of its lines is read on its own. That costs a fragment of colour
 * inside the rare embedded block and buys typing that does not slow down as
 * the program grows. */
const NME_PATTERN =
  /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#.*$|\b\d+(?:\.\d+)?\b)/g;

function highlightNmeLine(line: string): string {
  let result = '';
  let last = 0;
  for (const match of line.matchAll(NME_PATTERN)) {
    const piece = match[0];
    result += escapeHtml(line.slice(last, match.index));
    last = match.index + piece.length;
    const kind = piece.startsWith('#') ? 'tok-com' : /^["']/.test(piece) ? 'tok-str' : 'tok-num';
    result += `<span class="${kind}">${escapeHtml(piece)}</span>`;
  }
  result += escapeHtml(line.slice(last));
  // An empty block has no height, and a line of the copy has to be exactly as
  // tall as the line of the box above it.
  return result === '' ? '<br>' : result;
}

/* One NME statement becomes exactly one physical Python line — `transpile.rs`
 * fails the build if an edit ever changes the newline count — so line 4 of what
 * you wrote is line 4 of the Python beside it, blank lines and comments
 * included. Nothing on this page used that, and it is the clearest thing the
 * two panes can say: put the caret on a line and see what that line became.
 *
 * Highlighting runs over the whole text first so a triple-quoted string spanning
 * several lines is still tokenised as one string; the result is then cut on the
 * newlines that are outside a tag. */
/* A line that came back as its own text.
 *
 * NME's whole promise is that ordinary words stay ordinary words, so a line
 * becoming `print("that same line")` is correct and expected — for a story.
 * It is also exactly what happens when someone meant a command and the
 * compiler did not read it as one, and that is the "why isn't this working?"
 * the owner reported on 2026-08-19.
 *
 * Nothing here guesses which of the two it was. The lines are marked, and the
 * note under the pane appears only when the program has **both** kinds: a
 * story where every line is words has nothing surprising in it, and neither
 * does a program with no words in it at all. A program that is half and half
 * is the one worth pointing at.
 */
function echoedLines(source: string, python: string): Set<number> {
  const wrote = source.split('\n');
  const made = python.split('\n');
  const echoed = new Set<number>();
  for (let at = 0; at < made.length && at < wrote.length; at += 1) {
    const line = (made[at] ?? '').trim();
    const said = (wrote[at] ?? '').trim();
    if (!said || !line.startsWith('print("') || !line.endsWith('")')) continue;
    if (line.slice(7, -2) === said) echoed.add(at);
  }
  return echoed;
}

function byLine(html: string, echoed: Set<number>): string {
  let depth = 0;
  let line = '';
  const lines: string[] = [];
  for (let at = 0; at < html.length; at += 1) {
    const ch = html[at];
    if (ch === '<') depth += 1;
    else if (ch === '>') depth -= 1;
    else if (ch === '\n' && depth === 0) {
      lines.push(line);
      line = '';
      continue;
    }
    line += ch;
  }
  lines.push(line);
  return lines
    .map((text, at) => {
      const mark = echoed.has(at) ? ' data-echo="true"' : '';
      return `<span class="pyline" data-line="${at}"${mark}>${text}</span>`;
    })
    .join('\n');
}

/* --- finding in the code, and renaming a job ------------------------------ */

/* What counts as one letter of a name. NME names are Korean at least as often
 * as they are English, so this cannot be `\w`: it has to hold Hangul as well
 * as the digits and the underscore a name may carry inside it. Two runs of the
 * same letters are the same name only when neither side of them is another
 * letter — otherwise `평화` would match inside `평화로운`. */
const NAME_LETTER = /[\wÀ-￿]/;

function isNameLetter(ch: string | undefined): boolean {
  return ch !== undefined && NAME_LETTER.test(ch);
}

/* Every place `name` stands on its own in `text`, as an index.
 *
 * "On its own" cannot mean "with a space on both sides", because Korean does
 * not write it that way: `더하기라는 일` is the job `더하기` with the ending
 * `라는` welded to it, and `공격을` is `공격` with `을`. So only the FRONT of
 * the word is fenced — the letter before it may not be part of a name — and
 * what comes after is settled by `known`, the set of names the program really
 * has. At each candidate the longest name in that set that starts here wins:
 * `더하기라는` yields `더하기` because `더하기라는` is not a name anyone made,
 * while `더하기값` yields `더하기값` and is therefore left alone. With no set
 * to consult, the old rule stands and both sides are fenced. */
function wholeWordSpots(text: string, name: string, known?: ReadonlySet<string>): number[] {
  const spots: number[] = [];
  if (name === '') return spots;
  let at = text.indexOf(name);
  while (at !== -1) {
    if (!isNameLetter(text[at - 1])) {
      if (known === undefined) {
        if (!isNameLetter(text[at + name.length])) spots.push(at);
      } else if (longestKnownAt(text, at, known) === name) {
        spots.push(at);
      }
    }
    at = text.indexOf(name, at + 1);
  }
  return spots;
}

/* The longest name in `known` that starts at `at`, or '' if none does. The run
 * of name letters at `at` is at most a handful long, so this walks it down
 * from the far end rather than searching the set. */
function longestKnownAt(text: string, at: number, known: ReadonlySet<string>): string {
  let end = at;
  while (end < text.length && isNameLetter(text[end])) end += 1;
  for (let stop = end; stop > at; stop -= 1) {
    const piece = text.slice(at, stop);
    if (known.has(piece)) return piece;
  }
  return '';
}

function replaceWholeWord(text: string, from: string, to: string, known?: ReadonlySet<string>): string {
  let out = '';
  let last = 0;
  for (const at of wholeWordSpots(text, from, known)) {
    out += text.slice(last, at) + to;
    last = at + from.length;
  }
  return out + text.slice(last);
}

/* Every name the compiled program actually has, read off the Python with its
 * quoted strings taken out. This is what tells `더하기라는` from `더하기값`. */
function knownNames(python: string): Set<string> {
  const found = new Set<string>();
  for (const match of outsideStrings(python).matchAll(/[\wÀ-￿]+/g)) {
    const word = match[0];
    if (!/^[0-9]/.test(word)) found.add(word);
  }
  return found;
}

/* The parts of a line of Python that are NOT inside a quoted string. A name
 * that survives only inside quotes is a word the program prints, not a job
 * being called, and renaming it would change what the program says. */
function outsideStrings(line: string): string {
  let out = '';
  let quote = '';
  for (let at = 0; at < line.length; at += 1) {
    const ch = line[at] ?? '';
    if (quote !== '') {
      if (ch === '\\') { at += 1; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; out += ' '; continue; }
    out += ch;
  }
  return out;
}

/* `line` with `to` written back as `from`, but only where it is a name. What
 * is inside a quoted string is left exactly as it is, which is the whole point
 * of the check this serves. */
function putNameBack(line: string, to: string, from: string): string {
  let out = '';
  let plain = '';
  let quote = '';
  const flush = (): void => { out += replaceWholeWord(plain, to, from); plain = ''; };
  for (let at = 0; at < line.length; at += 1) {
    const ch = line[at] ?? '';
    if (quote !== '') {
      out += ch;
      if (ch === '\\' && at + 1 < line.length) { out += line[at + 1] ?? ''; at += 1; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") { flush(); quote = ch; out += ch; continue; }
    plain += ch;
  }
  flush();
  return out;
}

interface ProgramNames {
  readonly jobs: readonly string[];
  readonly values: readonly string[];
}

/* Every name this program gives to something, read out of the Python the
 * compiler produced rather than out of the sentences. Reading the Python is
 * what makes this work the same at all three levels and in both languages, and
 * it is the only way to tell a name from a word that merely looks like one.
 *
 * It used to collect `def` lines and nothing else, so a program with a hundred
 * remembered values offered six things to rename. A value is a name too, and
 * the safety of a rename never came from this list: it comes from compiling
 * the renamed program and checking the Python is the same one, letter for
 * letter, with the new name put back to the old. Anything in here that is not
 * really a name simply fails that check and nothing is applied.
 *
 * Strings are stripped first, so a word the program prints is not mistaken for
 * a name it keeps. */
const NAME_RUN = '[\\wÀ-\uffff]+';
const WHOLE_NAME = new RegExp(`^${NAME_RUN}$`);
const PARAM_NAME = new RegExp(`^\\s*\\*{0,2}(${NAME_RUN})`);

function programNames(python: string): ProgramNames {
  const jobs = new Set<string>();
  const values = new Set<string>();
  const keep = (name: string | undefined, into: Set<string>): void => {
    if (name === undefined) return;
    const word = name.trim();
    if (word !== '' && !/^[0-9]/.test(word) && WHOLE_NAME.test(word)) into.add(word);
  };
  const job = new RegExp(`^\\s*def\\s+(${NAME_RUN})\\s*\\(([^)]*)\\)`);
  const loop = new RegExp(`^\\s*for\\s+(.+?)\\s+in\\s`);
  const put = new RegExp(`^\\s*(${NAME_RUN}(?:\\s*,\\s*${NAME_RUN})*)\\s*(?:[-+*/%]|//|\\*\\*)?=(?!=)`);
  const named = new RegExp(`\\bas\\s+(${NAME_RUN})`);
  const declared = new RegExp(`^\\s*(?:global|nonlocal)\\s+(.+)$`);
  for (const raw of python.split('\n')) {
    const line = outsideStrings(raw);
    const isJob = job.exec(line);
    if (isJob) {
      keep(isJob[1], jobs);
      // A parameter is a name the program uses like any other, and renaming it
      // is a rename everywhere or nowhere, which is what the check enforces.
      for (const piece of (isJob[2] ?? '').split(',')) {
        keep(PARAM_NAME.exec(piece)?.[1], values);
      }
      continue;
    }
    for (const pattern of [loop, put, named, declared]) {
      const hit = pattern.exec(line);
      if (hit === null) continue;
      for (const piece of (hit[1] ?? '').split(',')) keep(piece, values);
    }
  }
  for (const name of jobs) values.delete(name);
  return { jobs: [...jobs], values: [...values] };
}

interface RenameOutcome {
  readonly text: string;
  readonly count: number;
  readonly unsafe: boolean;
  readonly broken: boolean;
}

/* Rename one job everywhere it IS that job, and nowhere else.
 *
 * The owner's rule was exact: rename the job, and do not touch other code that
 * merely has the same letters in it. Searching the text cannot tell those
 * apart — `공격` can be a job on one line and the word a story prints on the
 * next — so this does not search the text. It asks the compiler twice.
 *
 * One NME statement becomes exactly one physical Python line, so line N of the
 * program is line N of the Python beside it. For every line that contains the
 * name, the Python for THAT line is stripped of its quoted strings; if the
 * name is still there, the line used it as a name and the line is rewritten.
 * If the name only survives inside quotes, the line was printing the word, and
 * it is left alone.
 *
 * Then the whole program is compiled again and checked line by line: the new
 * Python, with the new name put back to the old one OUTSIDE its strings, has
 * to be exactly what it was. If one line is not, the rename moved something
 * that was not a name, and nothing at all is applied. */
async function renameJob(
  source: string,
  python: string,
  from: string,
  to: string,
  compileOne: (text: string) => Promise<CompileOutcome | null>,
): Promise<RenameOutcome | null> {
  const nothing = { text: source, count: 0, unsafe: false, broken: false };
  const known = knownNames(python);
  const wrote = source.split('\n');
  const made = python.split('\n');
  const out = wrote.slice();
  let count = 0;
  for (let at = 0; at < wrote.length; at += 1) {
    const line = wrote[at] ?? '';
    const spots = wholeWordSpots(line, from, known);
    if (spots.length === 0) continue;
    if (wholeWordSpots(outsideStrings(made[at] ?? ''), from).length === 0) continue;
    out[at] = replaceWholeWord(line, from, to, known);
    count += spots.length;
  }
  if (count === 0) return nothing;
  const text = out.join('\n');
  // `null` means the check never ran: something else asked the compiler for
  // something newer. Nothing is applied without the check.
  const after = await compileOne(text);
  if (after === null) return null;
  if (!after.ok) return { ...nothing, broken: true };
  const remade = after.python.split('\n');
  if (remade.length !== made.length) return { ...nothing, unsafe: true };
  for (let at = 0; at < made.length; at += 1) {
    const was = made[at] ?? '';
    const now = remade[at] ?? '';
    if (now !== was && putNameBack(now, to, from) !== was) return { ...nothing, unsafe: true };
  }
  return { text, count, unsafe: false, broken: false };
}

/* --- documentation pages -------------------------------------------------- */

/* The index rail is a <details> so that it collapses on a phone. On a wide
 * screen it is a permanent column, and a reader with JavaScript off still gets
 * a working disclosure rather than an empty box. */
/* A row that scrolls sideways with no edge fade looks like a row that simply
 * ends, and on a phone both the menu in the header and the strip of examples
 * are wider than the screen. Each end is marked, and only the end that really
 * has more beyond it, so the fade is a promise rather than decoration. */
function wireStrip(strip: HTMLElement): () => void {
  const mark = (): void => {
    const more = strip.scrollWidth - strip.clientWidth;
    strip.dataset.more = more > 4 ? 'true' : 'false';
    // The strip may carry the page's side padding inside itself, and scroll
    // snapping parks the first item after it — so "at the start" is that
    // padding, not zero.
    const inset = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
    strip.dataset.atStart = String(strip.scrollLeft <= inset + 2);
    strip.dataset.atEnd = String(strip.scrollLeft >= more - 2);
  };
  strip.addEventListener('scroll', mark, { passive: true });
  addEventListener('resize', mark);
  mark();
  return mark;
}

function wireDocRail(): void {
  const rail = queryMaybe(document, '.doc-rail', HTMLDetailsElement);
  if (!rail) return;
  const wide = matchMedia('(min-width: 900px)');
  const sync = (): void => { rail.open = wide.matches; };
  sync();
  wide.addEventListener('change', sync);

  // Bring the current guide into view inside the rail only. `scrollIntoView`
  // would move the page itself, dropping the reader below the title.
  const current = queryMaybe(rail, '[aria-current="page"]', HTMLElement);
  if (current && rail.scrollHeight > rail.clientHeight) {
    rail.scrollTop = current.offsetTop - rail.clientHeight / 2;
  }
}

/* Eighty-five guides is too many to scroll through on a phone, so the list
 * filters as you type. Filtering happens over text the page already carries;
 * nothing is fetched. */
function wireGuideFilter(): void {
  const input = queryMaybe(document, '#guide-filter', HTMLInputElement);
  const list = queryMaybe(document, '#guide-list', HTMLElement);
  const count = queryMaybe(document, '#guide-count', HTMLElement);
  if (!input || !list) return;
  const items = [...list.children].filter((node): node is HTMLElement => node instanceof HTMLElement);
  const template = count ? (count.textContent ?? '').replace(/\d+/, '%d') : '';

  input.addEventListener('input', () => {
    const needle = input.value.trim().toLowerCase();
    let shown = 0;
    for (const item of items) {
      const hit = !needle || (item.dataset.find || '').includes(needle);
      item.hidden = !hit;
      if (hit) shown += 1;
    }
    if (count) count.textContent = template.replace('%d', String(shown));
  });
}

/* --- downloads the visitor can watch ------------------------------------- */

type ProgressReport = (loaded: number, total: number) => void;

/* `init()` would happily fetch the WebAssembly itself, but then nobody can say
 * how far along it is. Reading the body in chunks costs nothing and turns a
 * blank wait into a progress bar. `expected` is the uncompressed size stamped
 * in at build time, because `content-length` describes the compressed bytes. */
async function fetchWithProgress(url: string, expected: number, onProgress: ProgressReport): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  if (!response.body) return response;

  const total = expected || Number(response.headers.get('content-length')) || 0;
  let loaded = 0;
  onProgress(0, total);
  const counted = response.body.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      loaded += chunk.byteLength;
      onProgress(loaded, total);
      controller.enqueue(chunk);
    },
  }));
  return new Response(counted, { headers: { 'content-type': 'application/wasm' } });
}

/* --- what the two WebAssembly modules say -------------------------------- */

/* Both modules answer in JSON rather than in objects, which keeps the glue out
 * of this file — at the price of the text arriving here as `unknown`. These
 * two readers are where that text becomes a shape the rest of the file can
 * rely on; anything unexpected reads as "it did not work", which is what the
 * old code did too, one field at a time. */
interface CompileOutcome {
  readonly ok: boolean;
  readonly python: string;
  readonly diagnostic: string;
  readonly problems: readonly CompileProblem[];
}

/* One problem the compiler found, already taken apart by `nme-web`: which
 * line, what is wrong in plain language, and what to try instead. The page
 * carries both languages and picks the one the page is written in. */
interface CompileProblem {
  readonly code: string;
  readonly line: number;
  readonly title: string;
  readonly message: string;
  readonly hint: string;
  /* The error code's own page, in a few sentences: what the rule is and how
   * to get out of it. The band shows it folded away, because the line and
   * the fix above it answer most cases on their own. */
  readonly detail: string;
}

function textAt(value: object, key: string): string {
  if (!(key in value)) return '';
  const found: unknown = Reflect.get(value, key);
  return typeof found === 'string' ? found : '';
}

function readProblems(raw: object): readonly CompileProblem[] {
  if (!('problems' in raw)) return [];
  const list: unknown = raw.problems;
  if (!Array.isArray(list)) return [];
  const problems: CompileProblem[] = [];
  for (const entry of list) {
    if (typeof entry !== 'object' || entry === null) continue;
    const line: unknown = 'line' in entry ? Reflect.get(entry, 'line') : 0;
    problems.push({
      code: textAt(entry, 'code'),
      line: typeof line === 'number' && line > 0 ? line : 0,
      title: textAt(entry, LANG === 'ko' ? 'titleKo' : 'titleEn'),
      message: textAt(entry, LANG === 'ko' ? 'messageKo' : 'messageEn'),
      hint: textAt(entry, LANG === 'ko' ? 'hintKo' : 'hintEn'),
      detail: textAt(entry, LANG === 'ko' ? 'detailKo' : 'detailEn'),
    });
  }
  return problems;
}

/* What tidying produced: the rewritten program and how many lines moved. A
 * program that does not compile comes back with the same problems `compile`
 * reports, because tidying reads what the program means and a line the
 * compiler cannot read has no meaning to rewrite. */
interface TidyOutcome {
  readonly ok: boolean;
  readonly nme: string;
  readonly changed: number;
  readonly problems: readonly CompileProblem[];
}

function readTidyOutcome(json: string): TidyOutcome {
  const raw: unknown = JSON.parse(json);
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, nme: '', changed: 0, problems: [] };
  }
  const ok = 'ok' in raw && raw.ok === true;
  const nme = 'nme' in raw && typeof raw.nme === 'string' ? raw.nme : '';
  const changed = 'changed' in raw && typeof raw.changed === 'number' ? raw.changed : 0;
  return { ok, nme, changed, problems: readProblems(raw) };
}

function readCompileOutcome(json: string): CompileOutcome {
  const raw: unknown = JSON.parse(json);
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, python: '', diagnostic: json, problems: [] };
  }
  const ok = 'ok' in raw && raw.ok === true;
  const python = 'python' in raw && typeof raw.python === 'string' ? raw.python : '';
  const diagnostic = 'diagnostic' in raw && typeof raw.diagnostic === 'string' ? raw.diagnostic : '';
  return { ok, python, diagnostic, problems: readProblems(raw) };
}

/* What the worker sends back. Both ends of this are in this repository, so the
 * union below is the whole protocol; `readWorkerMessage` turns the `unknown`
 * that arrives on the wire into one of these, or into nothing at all, which
 * the switch ignores exactly as the old `default: break` did. */
/* One name the program made and what it held when the program stopped. */
interface NameValue {
  readonly name: string;
  readonly shown: string;
}

type WorkerMessage =
  | { readonly type: 'progress'; readonly loaded: number; readonly total: number }
  | { readonly type: 'ready' }
  | { readonly type: 'out'; readonly text: string }
  | { readonly type: 'ask' }
  | {
      readonly type: 'done';
      readonly ok: boolean;
      readonly error: string | null;
      readonly values: readonly NameValue[];
    }
  | { readonly type: 'fatal'; readonly error: string };

function readWorkerMessage(data: unknown): WorkerMessage | null {
  if (typeof data !== 'object' || data === null || !('type' in data)) return null;
  const kind = data.type;
  if (kind === 'ready') return { type: 'ready' };
  if (kind === 'ask') return { type: 'ask' };
  if (kind === 'progress') {
    const loaded = 'loaded' in data ? data.loaded : undefined;
    const total = 'total' in data ? data.total : undefined;
    if (typeof loaded !== 'number' || typeof total !== 'number') return null;
    return { type: 'progress', loaded, total };
  }
  if (kind === 'out') {
    const text = 'text' in data ? data.text : undefined;
    return typeof text === 'string' ? { type: 'out', text } : null;
  }
  if (kind === 'done') {
    const ok = 'ok' in data ? data.ok : undefined;
    const error = 'error' in data ? data.error : undefined;
    if (typeof ok !== 'boolean') return null;
    const values: NameValue[] = [];
    if ('values' in data && Array.isArray(data.values)) {
      for (const item of data.values) {
        if (typeof item !== 'object' || item === null) continue;
        if (!('name' in item) || !('shown' in item)) continue;
        const { name, shown } = item;
        if (typeof name === 'string' && typeof shown === 'string') values.push({ name, shown });
      }
    }
    return { type: 'done', ok, error: typeof error === 'string' ? error : null, values };
  }
  if (kind === 'fatal') {
    const error = 'error' in data ? data.error : undefined;
    return typeof error === 'string' ? { type: 'fatal', error } : null;
  }
  return null;
}

/* --- the playground ------------------------------------------------------ */

const ANSWER_CAPACITY = 4096;
const SLOT_KEY = 'nme-slots-v1';
const DRAFT_KEY = 'nme-draft-v1';
const FILES_KEY = 'nme-files-v1';

/* Four tabs over one editor: three files that are the visitor's, and one place
 * where examples open.
 *
 * The reason they are separate is a complaint that is easy to have and hard to
 * forgive: you are writing something, you forget how a loop went, you open an
 * example to look — and your program is gone. So an example never lands in a
 * file. It opens in its own tab, and it takes a deliberate press to move it
 * into File 1, 2 or 3. Nothing else writes to those three. */
/* Which way each key moves along the file tabs. `first` and `last` are the
 * ends; the numbers are one step either way. */
const KEY_STEPS: Readonly<Record<string, number | 'first' | 'last' | undefined>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
  ArrowDown: 1,
  Home: 'first',
  End: 'last',
};

/* What a program's own colours mean.
 *
 * The site's own surfaces stay achromatic and keep red, yellow and green for
 * saying what state the machine is in. A program's output is not the site's
 * surface — it is what the person wrote — so the colours it asks for are drawn.
 * The owner settled this on 2026-08-19: *내가 말한 저 디자인은 사이트 디자인이고
 * 프로그램은 NME라서 별도잖아. 당연히 NME는 유저 자율성을 높여야지.*
 *
 * Only SGR (`ESC [ … m`) is honoured. Every other control sequence is still
 * dropped rather than printed, and the clear-screen pair still clears. */
const SGR_CLASS: Readonly<Record<number, string>> = {
  1: 'sgr-bold', 2: 'sgr-dim', 3: 'sgr-italic', 4: 'sgr-underline',
  30: 'sgr-fg-black', 31: 'sgr-fg-red', 32: 'sgr-fg-green', 33: 'sgr-fg-yellow',
  34: 'sgr-fg-blue', 35: 'sgr-fg-magenta', 36: 'sgr-fg-cyan', 37: 'sgr-fg-white',
  90: 'sgr-fg-grey', 91: 'sgr-fg-red', 92: 'sgr-fg-green', 93: 'sgr-fg-yellow',
  94: 'sgr-fg-blue', 95: 'sgr-fg-magenta', 96: 'sgr-fg-cyan', 97: 'sgr-fg-white',
  40: 'sgr-bg-black', 41: 'sgr-bg-red', 42: 'sgr-bg-green', 43: 'sgr-bg-yellow',
  44: 'sgr-bg-blue', 45: 'sgr-bg-magenta', 46: 'sgr-bg-cyan', 47: 'sgr-bg-white',
  100: 'sgr-bg-grey', 101: 'sgr-bg-red', 102: 'sgr-bg-green', 103: 'sgr-bg-yellow',
  104: 'sgr-bg-blue', 105: 'sgr-bg-magenta', 106: 'sgr-bg-cyan', 107: 'sgr-bg-white',
};

/* Codes that turn something off rather than on: the whole lot, the weight, the
 * slant, the underline, the ink, the paper. */
const SGR_OFF: Readonly<Record<number, readonly string[] | 'all'>> = {
  0: 'all',
  22: ['sgr-bold', 'sgr-dim'],
  23: ['sgr-italic'],
  24: ['sgr-underline'],
  39: ['sgr-fg-black', 'sgr-fg-red', 'sgr-fg-green', 'sgr-fg-yellow', 'sgr-fg-blue',
       'sgr-fg-magenta', 'sgr-fg-cyan', 'sgr-fg-white', 'sgr-fg-grey'],
  49: ['sgr-bg-black', 'sgr-bg-red', 'sgr-bg-green', 'sgr-bg-yellow', 'sgr-bg-blue',
       'sgr-bg-magenta', 'sgr-bg-cyan', 'sgr-bg-white', 'sgr-bg-grey'],
};

const SGR = /\u001b\[([0-9;]*)m/;
const CONTROL = /\u001b\[[0-9;?]*[A-Za-z]/g;

const FILE_IDS = ['example', '1', '2', '3'] as const;
type FileId = (typeof FILE_IDS)[number];
type FileShelf = Record<FileId, string>;

function isFileId(value: string): value is FileId {
  return FILE_IDS.some((id) => id === value);
}

function emptyShelf(): FileShelf {
  return { example: '', 1: '', 2: '', 3: '' };
}

interface SharedAnswerMemory {
  readonly buffer: SharedArrayBuffer;
  readonly control: Int32Array;
  readonly bytes: Uint8Array;
}

interface Slot {
  id: string;
  name: string;
  source: string;
  updated: number;
}

interface SlotShelf {
  list: Slot[];
  current: string | null;
}

interface RunRequest {
  readonly type: 'run';
  readonly python: string;
  readonly sab: SharedArrayBuffer | undefined;
  readonly answers: string[] | undefined;
}

type StatusLight = 'ready' | 'busy' | 'bad';

/* `Array.isArray` reports `any[]`, which would leak an implicit `any` into
 * everything downstream. Widening it to `unknown[]` here — no assertion, just
 * a narrower return type — keeps the leak inside this one function. */
function asArray(value: unknown): readonly unknown[] | null {
  return Array.isArray(value) ? value : null;
}

/* The "delete for good?" countdown used to live on the button as an expando
 * property. A side table says the same thing without inventing a field on a
 * DOM element that the DOM does not have. */
const slotDeleteTimers = new WeakMap<HTMLElement, number>();
const fileOverwriteTimers = new WeakMap<HTMLElement, number>();

/* A button's own words, kept from the first time they are replaced.
 * Reading `button.textContent` at replacement time looked right and was not:
 * press a copy button twice inside its 1.4-second window and the second press
 * saved "copied" as the original, so the button read "copied" for the rest of
 * the visit — and on the playground toolbar, where the buttons differ, that
 * left two identical buttons. */
const originalLabels = new WeakMap<HTMLElement, string>();

function labelOf(button: HTMLElement): string {
  const held = originalLabels.get(button);
  if (held !== undefined) return held;
  const original = button.textContent ?? '';
  originalLabels.set(button, original);
  return original;
}

/* Says one word on a button and puts its own word back afterwards. */
function flashLabel(button: HTMLElement, text: string, milliseconds = 1400): void {
  const original = labelOf(button);
  const waiting = labelTimers.get(button);
  if (waiting !== undefined) clearTimeout(waiting);
  button.textContent = text;
  labelTimers.set(button, setTimeout(() => {
    labelTimers.delete(button);
    button.textContent = original;
  }, milliseconds));
}

const labelTimers = new WeakMap<HTMLElement, number>();

/* Some failures are not the program's fault and not the writer's either — they
 * are this page's. A program that opens a file gets
 * `ImportError: no os specific module found` from the engine, which tells a
 * beginner nothing at all. Guide 37 warns about it; this says the same thing at
 * the moment it happens. */
/* The engine's own machinery shows up in a traceback — twelve frames of
 * `_frozen_importlib` before the line that matters. None of it is the visitor's
 * program and none of it helps. */
function withoutEngineFrames(error: string): string {
  const kept = error
    .split('\n')
    .filter((line) => !/_frozen_importlib|^\s*File "(fnmatch|os|pathlib|importlib)"/.test(line));
  return kept.join('\n').replace(/\n{3,}/g, '\n\n');
}

function whatWentWrong(error: string): string | null {
  if (/no os specific module found|No module named '(os|pathlib|shutil|glob)'/.test(error)) {
    return TEXT.needsFiles;
  }
  if (/No module named '(urllib|socket|http|ssl|requests)'/.test(error)) {
    return TEXT.needsNetwork;
  }
  return null;
}

/* --- the compiler, on its own thread -------------------------------------- */

interface CompileAsk {
  readonly type: 'compile' | 'tidy';
  readonly id: number;
  readonly source: string;
  readonly level: string;
  readonly language: string;
}

/* The page's end of `compile-worker.ts`. One request at a time, newest wins.
 *
 * A call into WebAssembly cannot be interrupted from outside: it runs to its
 * end whether or not anybody still wants the answer. Every keystroke makes the
 * running compile pointless, so the only way to stop paying for it is to end
 * the thread it is on. That is affordable here because the module is compiled
 * from bytes once — about 5 ms — and every worker after the first is handed
 * that same module, which instantiates in well under a millisecond.
 *
 * A request that is thrown away settles to `null` rather than rejecting or
 * hanging for ever. Every caller reads that the same way: a newer answer is
 * already on its way, so do nothing and let it arrive. */
class CompilerLink {
  private worker: Worker | null = null;
  private module: WebAssembly.Module | null = null;
  private next = 1;
  private open: { readonly id: number; readonly settle: (json: string | null) => void } | null = null;
  private readonly onFatal: (error: string) => void;

  constructor(onFatal: (error: string) => void) {
    this.onFatal = onFatal;
  }

  async start(bytes: BufferSource): Promise<void> {
    this.module = await WebAssembly.compile(bytes);
    this.spawn();
  }

  private spawn(): Worker {
    const worker = new Worker('/assets/compile-worker.js', { type: 'module' });
    worker.onmessage = (event: MessageEvent<unknown>): void => this.hear(event.data);
    worker.onerror = (event: ErrorEvent): void => this.onFatal(event.message || String(event));
    if (this.module) worker.postMessage({ type: 'start', module: this.module });
    this.worker = worker;
    return worker;
  }

  private hear(raw: unknown): void {
    if (typeof raw !== 'object' || raw === null || !('type' in raw)) return;
    if (raw.type === 'fatal') {
      this.onFatal('error' in raw && typeof raw.error === 'string' ? raw.error : '');
      return;
    }
    if (raw.type !== 'done') return;
    if (!('id' in raw) || typeof raw.id !== 'number') return;
    if (!('json' in raw) || typeof raw.json !== 'string') return;
    const open = this.open;
    if (open === null || open.id !== raw.id) return;
    this.open = null;
    open.settle(raw.json);
  }

  private ask(ask: CompileAsk): Promise<string | null> {
    const running = this.open;
    if (running !== null) {
      this.open = null;
      this.worker?.terminate();
      this.spawn();
      running.settle(null);
    }
    const worker = this.worker ?? this.spawn();
    return new Promise((settle) => {
      this.open = { id: ask.id, settle };
      worker.postMessage(ask);
    });
  }

  compile(source: string): Promise<string | null> {
    this.next += 1;
    return this.ask({ type: 'compile', id: this.next, source, level: '', language: '' });
  }

  tidy(source: string, level: string, language: string): Promise<string | null> {
    this.next += 1;
    return this.ask({ type: 'tidy', id: this.next, source, level, language });
  }
}

class Playground {
  readonly editor: HTMLTextAreaElement;
  /* The coloured copy under the editor, and the box that holds the two
   * layers. Both optional: the documentation pages run this same file and
   * have no playground, and an older page may not have the layer at all. */
  readonly inkStack: HTMLElement | null;
  readonly inkLayer: HTMLElement | null;
  /* What the copy is currently showing, line by line, so that a keystroke can
   * be turned into "which lines changed" without reading the DOM. */
  private inkLines: string[] = [];
  private inkPainted = false;
  /* Nothing hides the box's own text until the listener that keeps the copy
   * up to date is attached. If anything above this in the wiring throws, the
   * editor is left as a plain black-on-white textarea rather than as an empty
   * box with an invisible program in it. */
  private inkReady = false;
  readonly python: HTMLElement;
  readonly pythonState: HTMLElement;
  readonly pythonNote: HTMLElement | null;
  readonly echoNote: HTMLElement | null;
  /* The line under the editor that says a `#` line does nothing. A beginner
   * reads the comments in an example as part of the program — the owner said
   * so. The box now paints them green, which shows that they are a different
   * kind of thing but not what kind, so the sentence stays: colour is the
   * mark and this is the explanation of it. Shown only while the program
   * actually has a comment in it. */
  readonly hashNote: HTMLElement | null;
  readonly terminal: HTMLElement;
  /* Where the program's own names are listed once it stops. Optional: the
   * documentation pages run this same file and have no playground. */
  readonly values: HTMLElement | null = null;
  readonly valuesList: HTMLElement | null = null;
  /* Which SGR classes are switched on right now. A program sets a colour once
   * and everything after it is in that colour, so this outlives one `print`. */
  private readonly ink = new Set<string>();
  readonly runButton: HTMLButtonElement;
  readonly stopButton: HTMLButtonElement;
  readonly chips: HTMLElement;
  readonly inputRow: HTMLElement;
  readonly input: HTMLInputElement;
  readonly sendButton: HTMLButtonElement;
  readonly note: HTMLElement;
  readonly answersWrap: HTMLElement | null;
  readonly answers: HTMLTextAreaElement | null;
  readonly dot: HTMLElement | null;
  readonly panes: HTMLElement | null;
  readonly pythonPane: HTMLElement | null;
  readonly tabs: HTMLElement[];
  readonly slotList: HTMLElement | null;
  readonly slotFlash: HTMLElement | null;
  readonly fileTabs: HTMLElement[];
  readonly fileNote: HTMLElement | null;
  readonly fileNoteText: HTMLElement | null;
  readonly editorTitle: HTMLElement | null;
  readonly root: HTMLElement;
  readonly progress: HTMLElement;
  readonly progressFill: HTMLElement;
  readonly alert: HTMLElement;
  readonly alertText: HTMLElement;
  readonly retryButton: HTMLButtonElement;
  /* The button that hands the whole window to the editor. Optional for the
   * same reason as the values panel: documentation pages have no playground. */
  readonly focusToggle: HTMLButtonElement | null;
  /* The band under the editor that says which line the compiler could not
   * read. Optional for the same reason as the rest: documentation pages run
   * this file and have no playground. */
  readonly problem: HTMLElement | null;
  readonly problemLine: HTMLButtonElement | null;
  readonly problemTitle: HTMLElement | null;
  readonly problemSource: HTMLElement | null;
  readonly problemWhy: HTMLElement | null;
  readonly problemFix: HTMLElement | null;
  readonly problemCode: HTMLElement | null;
  readonly problemDetail: HTMLDetailsElement | null;
  readonly problemDetailText: HTMLElement | null;
  /* The row that rewrites the program into one level and one language.
   * Optional for the same reason as the rest: documentation pages run this
   * file and have no playground. */
  readonly tidyButton: HTMLButtonElement | null;
  readonly tidyUndoButton: HTMLButtonElement | null;
  readonly tidyNote: HTMLElement | null;
  readonly tidyBar: HTMLElement | null;
  /* The row of six group names above the examples, and the row under them that
   * shows the open example in another syntax or the other language. Optional
   * for the same reason as the rest. */
  readonly groupBar: HTMLElement | null;
  readonly versionBar: HTMLElement | null;
  readonly versionNote: HTMLElement | null;
  readonly editorBar: HTMLElement | null;
  readonly findRow: HTMLElement | null;
  readonly findText: HTMLInputElement | null;
  readonly findCount: HTMLElement | null;
  readonly renameRow: HTMLElement | null;
  readonly renameFrom: HTMLSelectElement | null;
  readonly renameTo: HTMLInputElement | null;
  readonly editorMsg: HTMLElement | null;
  findAt = -1;

  worker: Worker | null;
  readonly compiler: CompilerLink;
  compiled: string;
  /* The exact text that produced `compiled`. Compiling is no longer instant,
   * so "is the Python beside this program still the Python for it?" is a real
   * question — Run asks it before it runs anything. */
  compiledFrom: string;
  /* How long the last compile took. The wait after the last keystroke is set
   * from it rather than from a guess: a four-line program should answer as you
   * type, and a four-thousand-line one should wait until you pause. */
  compileMs: number;
  debounce: number;
  compilerReady: boolean;
  engineReady: boolean;
  pendingRun: boolean;
  running: boolean;
  readonly sharedMemory: SharedAnswerMemory | null;
  slots: SlotShelf;
  files: FileShelf;
  activeFile: FileId;
  /* False once a write to the browser's storage has been refused. Safari in
   * private browsing and a full origin quota both throw, and the page used to
   * swallow that and go on saying "this file stays in this browser". */
  storageWorks = true;

  retryAction: (() => void) | null = null;
  naming: ((name: string) => void) | null = null;
  nameRow: HTMLFormElement | null = null;
  nameField: HTMLInputElement | null = null;
  grow: (() => void) | null = null;
  freshTimer: number | undefined = undefined;
  /* What the editor held before the last tidy, so one press puts it back.
   * Empty means there is nothing to undo. */
  beforeTidy: string | null = null;
  flashTimer: number | undefined = undefined;
  /* Which example is on screen, which group is being shown, and which of the
   * six ways of writing it the visitor asked for. `openExample` is null once
   * they have opened one of their own files instead. */
  openExample: Example | null = null;
  exampleGroup: GroupChoice = GROUPS[0] ?? 'start';
  exampleLevel = 'sentence';
  exampleLang: ExampleLanguage = LANG;
  markChips: (() => void) | null = null;

  constructor(root: ParentNode) {
    // `root` is the playground element itself, so it has to be looked up from
    // the document rather than searched inside.
    this.root = queryOne(document, '#playground', HTMLElement);
    this.editor = queryOne(root, '#editor', HTMLTextAreaElement);
    this.inkStack = queryMaybe(root, '#editor-stack', HTMLElement);
    this.inkLayer = queryMaybe(root, '#editor-ink', HTMLElement);
    this.python = queryOne(root, '#python', HTMLElement);
    this.pythonState = queryOne(root, '#python-state', HTMLElement);
    this.pythonNote = queryMaybe(root, '#python-note', HTMLElement);
    this.echoNote = queryMaybe(root, '#echo-note', HTMLElement);
    this.hashNote = queryMaybe(root, '#hash-note', HTMLElement);
    this.terminal = queryOne(root, '#terminal', HTMLElement);
    this.runButton = queryOne(root, '#run', HTMLButtonElement);
    this.stopButton = queryOne(root, '#stop', HTMLButtonElement);
    this.chips = queryOne(root, '#examples', HTMLElement);
    this.inputRow = queryOne(root, '#input-row', HTMLElement);
    this.values = queryMaybe(root, '#values', HTMLElement);
    this.valuesList = queryMaybe(root, '#values-list', HTMLElement);
    this.input = queryOne(root, '#term-input', HTMLInputElement);
    this.sendButton = queryOne(root, '#send', HTMLButtonElement);
    this.note = queryOne(root, '#engine-note', HTMLElement);
    this.answersWrap = queryMaybe(root, '#answers-wrap', HTMLElement);
    this.answers = queryMaybe(root, '#answers', HTMLTextAreaElement);
    this.dot = queryMaybe(root, '#engine-dot', HTMLElement);
    this.panes = queryMaybe(root, '.panes', HTMLElement);
    this.pythonPane = queryMaybe(root, '.pane-python', HTMLElement);
    this.tabs = queryAll(root, '.play-tabs [data-view]', HTMLElement);
    this.slotList = queryMaybe(root, '#slot-list', HTMLElement);
    this.slotFlash = queryMaybe(root, '#slot-flash', HTMLElement);
    this.fileTabs = queryAll(root, '.file-tabs [data-file]', HTMLElement);
    this.fileNote = queryMaybe(root, '#file-note', HTMLElement);
    this.fileNoteText = queryMaybe(root, '#file-note-text', HTMLElement);
    this.editorTitle = queryMaybe(root, '#editor-title', HTMLElement);
    this.progress = queryOne(root, '#boot-progress', HTMLElement);
    this.progressFill = queryOne(this.progress, 'i', HTMLElement);
    this.alert = queryOne(root, '#boot-alert', HTMLElement);
    this.alertText = queryOne(this.alert, 'p', HTMLElement);
    this.retryButton = queryOne(root, '#boot-retry', HTMLButtonElement);
    this.focusToggle = queryMaybe(root, '#focus-toggle', HTMLButtonElement);
    this.problem = queryMaybe(root, '#problem', HTMLElement);
    this.problemLine = queryMaybe(root, '#problem-line', HTMLButtonElement);
    this.problemTitle = queryMaybe(root, '#problem-title', HTMLElement);
    this.problemSource = queryMaybe(root, '#problem-source', HTMLElement);
    this.problemWhy = queryMaybe(root, '#problem-why', HTMLElement);
    this.problemFix = queryMaybe(root, '#problem-fix', HTMLElement);
    this.problemCode = queryMaybe(root, '#problem-code', HTMLElement);
    this.problemDetail = queryMaybe(root, '#problem-detail', HTMLDetailsElement);
    this.problemDetailText = queryMaybe(root, '#problem-detail-text', HTMLElement);
    this.tidyButton = queryMaybe(root, '#tidy', HTMLButtonElement);
    this.tidyUndoButton = queryMaybe(root, '#tidy-undo', HTMLButtonElement);
    this.tidyNote = queryMaybe(root, '#tidy-note', HTMLElement);
    this.tidyBar = queryMaybe(root, '.tidy-bar', HTMLElement);
    this.groupBar = queryMaybe(root, '#example-groups', HTMLElement);
    this.versionBar = queryMaybe(root, '#version-bar', HTMLElement);
    this.versionNote = queryMaybe(root, '#version-note', HTMLElement);
    this.editorBar = queryMaybe(root, '#editor-bar', HTMLElement);
    this.findRow = queryMaybe(root, '#find-row', HTMLElement);
    this.findText = queryMaybe(root, '#find-text', HTMLInputElement);
    this.findCount = queryMaybe(root, '#find-count', HTMLElement);
    this.renameRow = queryMaybe(root, '#rename-row', HTMLElement);
    this.renameFrom = queryMaybe(root, '#rename-from', HTMLSelectElement);
    this.renameTo = queryMaybe(root, '#rename-to', HTMLInputElement);
    this.editorMsg = queryMaybe(root, '#editor-msg', HTMLElement);

    this.worker = null;
    this.compiler = new CompilerLink((error) => {
      this.compilerReady = false;
      this.showAlert(`${TEXT.compilerLate} (${error})`, () => { void this.start(); });
    });
    this.compiled = '';
    this.compiledFrom = '';
    this.compileMs = 0;
    this.debounce = 0;
    this.compilerReady = false;
    this.engineReady = false;
    this.pendingRun = false;
    this.running = false;
    this.sharedMemory = this.makeSharedMemory();

    this.slots = this.readSlots();
    this.files = emptyShelf();
    this.activeFile = 'example';

    this.buildGroups();
    this.drawChips();
    this.wire();
    this.drawSlots();
    this.runButton.disabled = true;
    this.setStatus('busy');
    // What the visitor last had on screen outranks the tour, and a link that
    // carries a program outranks both.
    // The shelf is read first and unconditionally; only then may a link in the
    // address bar decide what is on screen.
    this.readShelf();
    const first = EXAMPLES[LANG][0];
    if (!this.loadFromHash() && !this.showActiveFile() && first) void this.load(first);
    this.drawFiles();
  }

  /* A guide links here with the program it is teaching in the URL, so a
   * reader on a phone can run the example without retyping it. */
  loadFromHash(): boolean {
    const hash = location.hash.slice(1);
    const asked = /(?:^|&)example=([\w-]+)/.exec(hash);
    if (asked) {
      const found = EXAMPLES[LANG].find((example) => example.id === asked[1]);
      if (found) {
        void this.load(found);
        return true;
      }
    }
    const carried = /(?:^|&)code=([A-Za-z0-9_-]+)/.exec(hash);
    const encoded = carried ? carried[1] : undefined;
    if (encoded === undefined) return false;
    try {
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
      // A link someone sent you is somebody else's program: it opens where
      // examples open, so it cannot overwrite one of your three files.
      this.activeFile = 'example';
      this.files.example = new TextDecoder().decode(bytes);
      this.setEditorText(this.files.example);
      this.terminal.textContent = '';
      return true;
    } catch {
      return false;
    }
  }

  /* A `#` line is the one thing on this page that looks like a program and is
   * not one. The note appears only while there is such a line to explain, so
   * it is an answer to what is on screen rather than a permanent caption. */
  markHashNote(): void {
    if (!this.hashNote) return;
    const has = this.editor.value.split('\n').some((line) => line.trimStart().startsWith('#'));
    this.hashNote.hidden = !has;
  }

  /* One dot, three states, and they are the only colours the page spends:
   * green it can run, yellow something is still arriving, red it failed. */
  setStatus(state: StatusLight): void {
    if (this.dot) this.dot.dataset.state = state;
  }

  setProgress(loaded: number, total: number): void {
    this.progress.hidden = false;
    if (!total) {
      this.progress.dataset.mode = 'waiting';
      this.progress.removeAttribute('aria-valuenow');
      return;
    }
    const percent = Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
    this.progress.dataset.mode = 'loading';
    this.progressFill.style.width = `${percent}%`;
    this.progress.setAttribute('aria-valuenow', String(percent));
  }

  hideProgress(): void {
    this.progress.hidden = true;
    this.progress.removeAttribute('aria-valuenow');
  }

  /* Every failure a visitor can hit here is a failed download, so the notice
   * always carries the one action that can fix it. */
  showAlert(text: string, retry: (() => void) | null): void {
    this.setStatus('bad');
    this.alertText.textContent = text;
    this.alert.hidden = false;
    this.retryButton.hidden = !retry;
    this.retryAction = retry || null;
  }

  hideAlert(): void {
    this.alert.hidden = true;
    this.retryAction = null;
  }

  /* SharedArrayBuffer exists only on a cross-origin-isolated page. When it is
   * missing the playground degrades to answers-in-advance rather than
   * pretending the Run button is broken. */
  makeSharedMemory(): SharedAnswerMemory | null {
    if (typeof SharedArrayBuffer === 'undefined' || !self.crossOriginIsolated) {
      if (this.answersWrap) {
        this.answersWrap.hidden = false;
        const message = queryMaybe(this.answersWrap, '[data-no-shared-memory]', HTMLElement);
        if (message) message.textContent = TEXT.noSharedMemory;
      }
      return null;
    }
    const buffer = new SharedArrayBuffer(8 + ANSWER_CAPACITY);
    return {
      buffer,
      control: new Int32Array(buffer, 0, 2),
      bytes: new Uint8Array(buffer, 8),
    };
  }

  /* --- the examples ------------------------------------------------------
   *
   * Thirty-seven chips in one strip told a first-time visitor nothing about
   * what any of them were, which is what the owner said out loud: there are so
   * many examples that you cannot tell what is what. So the strip shows one
   * group at a time and the six group names sit above it.
   *
   * Under the strip is the other half of what was asked for: one example, six
   * versions. The language is a swap — both sets are written by hand, so the
   * Korean example has Korean text inside it and not just Korean keywords. The
   * level is a rewrite, by the same tidier the page already ships, so the
   * beginner and Python versions are the real thing rather than a copy that
   * can drift away from the sentence one. */
  buildGroups(): void {
    if (!this.groupBar) return;
    const groups: readonly GroupChoice[] = ['all', ...GROUPS];
    for (const group of groups) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip group-chip';
      button.textContent = group === 'all' ? ALL_LABEL[LANG] : GROUP_LABELS[LANG][group];
      // How many are behind each name. Without it the row is seven doors with
      // nothing written on them, and "everything" does not say how much that
      // is — which is the first thing anyone wants to know.
      const many = document.createElement('span');
      many.className = 'group-count';
      many.textContent = String(group === 'all'
        ? EXAMPLES[LANG].length
        : EXAMPLES[LANG].filter((example) => example.group === group).length);
      button.append(many);
      button.setAttribute('aria-pressed', String(group === this.exampleGroup));
      button.dataset.group = group;
      button.addEventListener('click', () => this.showGroup(group));
      this.groupBar.append(button);
    }
    wireStrip(this.groupBar);
  }

  showGroup(group: GroupChoice): void {
    this.exampleGroup = group;
    this.groupBar?.querySelectorAll('.group-chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip instanceof HTMLElement && chip.dataset.group === group));
    });
    this.drawChips();
  }

  drawChips(): void {
    this.chips.textContent = '';
    // Under "everything" the chips still come out group by group, so the run
    // of examples reads the same as it does inside a single group.
    const shown = this.exampleGroup === 'all'
      ? GROUPS.flatMap((group) => EXAMPLES[LANG].filter((example) => example.group === group))
      : EXAMPLES[LANG].filter((example) => example.group === this.exampleGroup);
    for (const example of shown) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.textContent = example.label;
      button.dataset.example = example.id;
      button.setAttribute('aria-pressed', String(example.id === this.openExample?.id));
      button.addEventListener('click', () => { void this.load(example); });
      this.chips.append(button);
    }
    this.chips.scrollLeft = 0;
    if (this.markChips) this.markChips();
  }

  /* The label under the chips is only true while an example is what is on
   * screen; one of the visitor's own three files is not an example and has no
   * other five versions. */
  drawVersions(): void {
    if (!this.versionBar) return;
    const example = this.openExample;
    this.versionBar.hidden = this.activeFile !== 'example' || example === null;
    for (const button of queryAll(this.versionBar, '[data-example-level]', HTMLButtonElement)) {
      button.setAttribute('aria-pressed', String(button.dataset.exampleLevel === this.exampleLevel));
      // An example whose whole lesson is how it is written is left as written.
      button.disabled = example?.fixed === true || example?.fails === true;
    }
    for (const button of queryAll(this.versionBar, '[data-example-lang]', HTMLButtonElement)) {
      button.setAttribute('aria-pressed', String(button.dataset.exampleLang === this.exampleLang));
    }
    if (this.versionNote) {
      this.versionNote.textContent =
        example === null ? '' : example.fixed === true || example.fails === true ? TEXT.versionFixed : '';
    }
  }

  /* The source to put in the editor for the example that is open: the entry
   * from the language that was asked for, rewritten into the level that was
   * asked for. A rewrite that the compiler will not stand behind is not shown
   * at all — the sentence version is, and the note says why. */
  async exampleSource(example: Example): Promise<string> {
    const set = EXAMPLES[this.exampleLang];
    const base = set.find((other) => other.id === example.id) ?? example;
    if (base.fixed === true || base.fails === true || this.exampleLevel === 'sentence') return base.source;
    if (!this.compilerReady) {
      if (this.versionNote) this.versionNote.textContent = TEXT.tidyWait;
      return base.source;
    }
    const json = await this.compiler.tidy(base.source, this.exampleLevel, this.exampleLang);
    if (json === null) return base.source;
    const outcome = readTidyOutcome(json);
    if (!outcome.ok || outcome.nme.trim() === '') {
      if (this.versionNote) this.versionNote.textContent = TEXT.versionSame;
      return base.source;
    }
    return outcome.nme;
  }

  wireVersions(): void {
    if (!this.versionBar) return;
    for (const button of queryAll(this.versionBar, '[data-example-level]', HTMLButtonElement)) {
      button.addEventListener('click', () => {
        this.exampleLevel = button.dataset.exampleLevel ?? 'sentence';
        void this.reopenExample();
      });
    }
    for (const button of queryAll(this.versionBar, '[data-example-lang]', HTMLButtonElement)) {
      button.addEventListener('click', () => {
        const asked = button.dataset.exampleLang;
        this.exampleLang = asked === 'ko' || asked === 'en' ? asked : LANG;
        void this.reopenExample();
      });
    }
  }

  /* The same example again, in whichever of the six ways is chosen now. */
  async reopenExample(): Promise<void> {
    const example = this.openExample;
    if (!example) {
      this.drawVersions();
      return;
    }
    if (this.versionNote) this.versionNote.textContent = '';
    this.setEditorText(await this.exampleSource(example));
    this.terminal.textContent = '';
    this.drawVersions();
    void this.compileNow();
    this.writeFiles();
    if (this.grow) this.grow();
  }

  wire(): void {
    // Moving the caret shows which Python line the current line became. It is
    // free — the compile is debounced, this is not part of it.
    for (const kind of ['keyup', 'click', 'focus', 'blur'] as const) {
      this.editor.addEventListener(kind, () => this.markLine());
    }

    // Find and rename live in one bar under the editor's own heading, so that
    // the two things that act on the program you are writing sit with it and
    // not with the buttons that copy it away.
    for (const button of queryAll(document, '[data-find-open]', HTMLElement)) {
      button.addEventListener('click', () => this.openEditorBar('find'));
    }
    for (const button of queryAll(document, '[data-rename-open]', HTMLElement)) {
      button.addEventListener('click', () => this.openEditorBar('rename'));
    }
    queryMaybe(document, '#editor-bar-close', HTMLElement)
      ?.addEventListener('click', () => this.closeEditorBar());
    queryMaybe(document, '#find-next', HTMLElement)
      ?.addEventListener('click', () => this.runFind(1));
    queryMaybe(document, '#find-prev', HTMLElement)
      ?.addEventListener('click', () => this.runFind(-1));
    queryMaybe(document, '#rename-go', HTMLElement)
      ?.addEventListener('click', () => { void this.doRename(); });
    this.findText?.addEventListener('input', () => { this.findAt = -1; this.runFind(0); });
    this.findText?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); this.runFind(event.shiftKey ? -1 : 1); }
      if (event.key === 'Escape') { event.preventDefault(); this.closeEditorBar(); }
    });
    this.renameTo?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); void this.doRename(); }
      if (event.key === 'Escape') { event.preventDefault(); this.closeEditorBar(); }
    });
    // The key everyone already presses to look for something. The browser's
    // own find cannot see inside a text box, so this one takes it over while
    // the caret is in the program.
    this.editor.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        this.openEditorBar('find');
      }
    });

    /* How long to wait after the last keystroke. A short program compiles in
     * a few milliseconds and should answer while you type; a four-thousand-line
     * one takes seconds, and starting a compile between two letters of a word
     * only throws it away again. So the wait is half of what the last compile
     * actually cost, held between a tenth of a second and four tenths
     * of a second — measured, not guessed, and it re-tunes itself as the
     * program grows or as the compiler gets faster. The cap is low because a
     * compile that is overtaken is now cancelled outright: waiting longer
     * saves a little battery and costs everyone the wait. */
    this.editor.addEventListener('input', () => {
      clearTimeout(this.debounce);
      const wait = Math.min(400, Math.max(120, Math.round(this.compileMs / 2)));
      this.debounce = setTimeout(() => {
        void this.compileNow();
        this.writeFiles();
        this.drawFiles();
      }, wait);
    });

    // On a phone the two code panes become two tabs over one panel. They carry
    // the tablist roles, so they owe a reader the same keyboard behaviour the
    // file tabs give: one stop in the page's tab order, arrows between them.
    const showPane = (tab: HTMLElement): void => {
      const view = tab.dataset.view;
      if (this.panes && view !== undefined) this.panes.dataset.view = view;
      this.tabs.forEach((other) => {
        const open = other === tab;
        other.setAttribute('aria-selected', String(open));
        other.tabIndex = open ? 0 : -1;
      });
    };
    for (const [at, tab] of this.tabs.entries()) {
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
      tab.addEventListener('click', () => showPane(tab));
      tab.addEventListener('keydown', (event) => {
        const step = KEY_STEPS[event.key];
        if (step === undefined) return;
        event.preventDefault();
        const last = this.tabs.length - 1;
        const to = step === 'first' ? 0 : step === 'last' ? last
          : Math.min(last, Math.max(0, at + step));
        const next = this.tabs[to];
        if (next === undefined) return;
        next.focus();
        showPane(next);
      });
    }

    this.wireSkipLink();
    this.wireTools();
    this.wireFiles();
    this.wireOtherTabs();
    this.wireSlots();
    // Closing the tab inside the 180 ms typing debounce used to lose the last
    // burst of typing. `pagehide` fires for a close, a reload and a back-forward
    // cache entry alike, which `beforeunload` does not.
    addEventListener('pagehide', () => {
      clearTimeout(this.debounce);
      this.writeFiles();
    });
    this.wireEditorHeight();
    this.wireEditorInk();
    this.wireChipStrip();
    this.wireVersions();
    this.wireFocus();
    this.wireTidy();
    this.runButton.addEventListener('click', () => { void this.run(); });
    if (this.problemLine) {
      this.problemLine.addEventListener('click', () => {
        const line = this.problemLine?.textContent?.match(/\d+/)?.[0];
        if (line) this.goToLine(Number(line));
      });
    }
    // Ctrl/Cmd + Enter runs, the way every editor a programmer will meet next
    // already does. The button carries the same shortcut in its tooltip.
    this.editor.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (!this.runButton.disabled) void this.run();
      }
    });
    this.runButton.title = TEXT.runHint;
    this.retryButton.addEventListener('click', () => {
      const action = this.retryAction;
      this.hideAlert();
      if (action) action();
    });
    this.stopButton.addEventListener('click', () => this.stop(true));
    this.sendButton.addEventListener('click', () => this.answer());
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.answer();
      }
    });
  }

  /* The examples in a group do not fit a phone, so they are one strip you
   * swipe. The marks have to be redone every time the group changes, which is
   * why the function that sets them is kept. */
  wireChipStrip(): void {
    this.markChips = wireStrip(this.chips);
  }

  /* --- the coding screen ------------------------------------------------
   *
   * Some visits are for reading the page and some are for writing a program.
   * The second kind wants the window, not a box inside an explanation: a big
   * editor, the Python beside it, and Run within reach. It is one attribute on
   * the root element, so nothing here has to know about layout.
   *
   * `#screen=code` in the address opens it directly, which is what a link
   * called "coding screen" needs. A hash-only move never reloads the page, so
   * `hashchange` has to be listened for as well as read at boot. */
  setFocus(on: boolean): void {
    const root = document.documentElement;
    if (on) root.dataset.focus = 'true';
    else root.removeAttribute('data-focus');
    if (this.focusToggle) {
      // In the corner of the file strip on a phone there is room for a word,
      // not for a sentence.
      const narrow = matchMedia('(max-width: 819px)').matches;
      const out = narrow ? TEXT.focusOffShort : TEXT.focusOff;
      this.focusToggle.textContent = on ? out : TEXT.focusOn;
      this.focusToggle.setAttribute('aria-pressed', String(on));
    }
    // The editor's height is measured in one mode and set by CSS in the other.
    if (this.grow) this.grow();
    if (on) this.editor.focus();
  }

  /* --- tidying ----------------------------------------------------------
   *
   * The owner asked for this in one sentence: write the program fast and
   * badly — abbreviations, words in the wrong order, whichever language comes
   * to mind — and then have it rewritten cleanly. The compiler already
   * accepts all of that; this is the other half, the part that puts it back
   * into one way of writing so somebody else can read it.
   *
   * The program has to compile first. Tidying rewrites what each line
   * *means*, so a line the compiler cannot read has no meaning to rewrite,
   * and saying that plainly is better than tidying half a program.
   *
   * Every rewrite is checked by the compiler before it is offered: the Python
   * has to come out byte for byte the same. So pressing this can change how
   * the program reads and never what it does. */
  tidyChoice(kind: 'lang' | 'level'): string {
    const chosen = this.tidyBar?.querySelector(`[data-tidy-${kind}][aria-pressed="true"]`);
    const value = chosen instanceof HTMLElement ? chosen.dataset[kind === 'lang' ? 'tidyLang' : 'tidyLevel'] : undefined;
    return value ?? (kind === 'lang' ? LANG : 'sentence');
  }

  sayTidy(message: string): void {
    if (this.tidyNote) this.tidyNote.textContent = message;
  }

  async tidyNow(): Promise<void> {
    if (!this.compilerReady) {
      this.sayTidy(TEXT.tidyWait);
      return;
    }
    const before = this.editor.value;
    const json = await this.compiler.tidy(before, this.tidyChoice('level'), this.tidyChoice('lang'));
    // Typing during the rewrite takes the compiler back; the text on screen is
    // what the visitor wants, so this quietly stands down.
    if (json === null) return;
    const outcome = readTidyOutcome(json);
    if (!outcome.ok) {
      // The band under the editor is where a line number belongs, and it is
      // already there for the same reason. Point at it rather than repeat it.
      this.sayTidy(TEXT.tidyBlocked);
      const first = outcome.problems[0];
      if (first) {
        this.showProblem(first);
        this.flashProblem();
      }
      return;
    }
    if (outcome.changed === 0 || outcome.nme === before) {
      this.sayTidy(TEXT.tidySame);
      return;
    }
    this.beforeTidy = before;
    this.setEditorText(outcome.nme);
    this.sayTidy(TEXT.tidyDone(outcome.changed));
    if (this.tidyUndoButton) this.tidyUndoButton.hidden = false;
    void this.compileNow();
    this.writeFiles();
    this.drawFiles();
    if (this.grow) this.grow();
  }

  undoTidy(): void {
    if (this.beforeTidy === null) return;
    this.setEditorText(this.beforeTidy);
    this.beforeTidy = null;
    if (this.tidyUndoButton) this.tidyUndoButton.hidden = true;
    this.sayTidy(TEXT.tidyUndone);
    void this.compileNow();
    this.writeFiles();
    this.drawFiles();
    if (this.grow) this.grow();
  }

  wireTidy(): void {
    if (!this.tidyBar) return;
    this.sayTidy(TEXT.tidyIdle);
    this.tidyButton?.addEventListener('click', () => { void this.tidyNow(); });
    this.tidyUndoButton?.addEventListener('click', () => this.undoTidy());
    for (const kind of ['lang', 'level'] as const) {
      const group = this.tidyBar.querySelectorAll(`[data-tidy-${kind}]`);
      group.forEach((button) => {
        button.addEventListener('click', () => {
          group.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
          this.sayTidy(TEXT.tidyIdle);
        });
      });
    }
  }

  wireFocus(): void {
    const asked = (): boolean => /(?:^|[#&])screen=code(?:&|$)/.test(location.hash);
    if (this.focusToggle) {
      this.focusToggle.title = TEXT.focusHint;
      this.focusToggle.textContent = TEXT.focusOn;
      this.focusToggle.addEventListener('click', () => {
        this.setFocus(document.documentElement.dataset.focus !== 'true');
      });
    }
    addEventListener('hashchange', () => {
      if (asked()) this.setFocus(true);
    });
    // Esc is what every full-window surface answers to, and it is the only way
    // back for someone who opened this from a link and never saw the button.
    addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.documentElement.dataset.focus !== 'true') return;
      event.preventDefault();
      this.setFocus(false);
    });
    if (asked()) this.setFocus(true);
  }

  /* --- the coloured copy under the editor --------------------------------
   *
   * Why there is a copy at all, and why the box's own text is hidden by
   * script rather than by the stylesheet, is written where the CSS is. This
   * is the machinery: keep the copy the same shape as the box, the same
   * text as the box, and scrolled to the same place as the box. */

  /* Everything that decides where a glyph lands. The box changes its padding
   * on a narrow screen, its font size on the coding screen, and its width
   * whenever a scrollbar appears, so none of it can be written once in CSS
   * and left alone. `clientWidth` is used rather than the border box because
   * it is the one measurement that already has the scrollbar taken out of
   * it — get that wrong and the copy wraps a line the box does not. */
  syncInkBox(): void {
    const layer = this.inkLayer;
    if (!layer) return;
    const box = getComputedStyle(this.editor);
    layer.style.width = `${this.editor.clientWidth}px`;
    layer.style.height = `${this.editor.clientHeight}px`;
    layer.style.font = box.font;
    layer.style.fontFamily = box.fontFamily;
    layer.style.fontSize = box.fontSize;
    /* Both layers are pinned to a whole number of pixels. A textarea keeps
     * all of its lines inside one block and a stack of blocks does not, so a
     * fractional line height rounds differently in the two and the difference
     * piles up: measured on the 4,343-line game, 27.2px put the copy 75px
     * below the box by the end of the program. At 27px the two agree to the
     * pixel over the whole file. */
    const step = Math.round(parseFloat(box.lineHeight));
    if (Number.isFinite(step) && step > 0) {
      this.editor.style.lineHeight = `${step}px`;
      layer.style.lineHeight = `${step}px`;
    } else {
      layer.style.lineHeight = box.lineHeight;
    }
    layer.style.letterSpacing = box.letterSpacing;
    layer.style.wordSpacing = box.wordSpacing;
    layer.style.tabSize = box.tabSize;
    layer.style.padding = box.padding;
    layer.style.whiteSpace = box.whiteSpace === 'normal' ? 'pre-wrap' : box.whiteSpace;
    layer.style.overflowWrap = box.overflowWrap;
    layer.style.wordBreak = box.wordBreak;
    layer.style.textIndent = box.textIndent;
    layer.scrollTop = this.editor.scrollTop;
    layer.scrollLeft = this.editor.scrollLeft;
  }

  /* Repaint the copy from the box.
   *
   * A keystroke changes one line, so only that line is rebuilt. Pressing
   * Enter, pasting or loading an example changes a run of them, and the run
   * is found by walking in from both ends. Without this a 4,300-line program
   * costs a tenth of a second of layout per character; with it, the cost is
   * the size of the edit and not the size of the program. */
  paintInk(rebuild = false): void {
    const layer = this.inkLayer;
    const stack = this.inkStack;
    if (!layer || !stack) return;
    if (!this.inkReady) return;
    const lines = this.editor.value.split('\n');
    if (!this.inkPainted || rebuild || this.inkLines.length !== lines.length) {
      const fresh = lines.map((line) => {
        const row = document.createElement('div');
        row.className = 'ink-line';
        row.innerHTML = highlightNmeLine(line);
        return row;
      });
      layer.replaceChildren(...fresh);
      this.inkLines = lines;
      this.inkPainted = true;
      stack.dataset.ink = 'on';
      this.syncInkBox();
      return;
    }
    let head = 0;
    while (head < lines.length && lines[head] === this.inkLines[head]) head += 1;
    if (head === lines.length) return;
    let tail = lines.length - 1;
    while (tail > head && lines[tail] === this.inkLines[tail]) tail -= 1;
    const rows = layer.children;
    for (let at = head; at <= tail; at += 1) {
      const row = rows[at];
      const line = lines[at];
      if (row instanceof HTMLElement && line !== undefined) row.innerHTML = highlightNmeLine(line);
    }
    this.inkLines = lines;
  }

  wireEditorInk(): void {
    const stack = this.inkStack;
    const layer = this.inkLayer;
    if (!stack || !layer) return;

    this.editor.addEventListener('input', () => this.paintInk());
    this.editor.addEventListener('scroll', () => {
      layer.scrollTop = this.editor.scrollTop;
      layer.scrollLeft = this.editor.scrollLeft;
    });

    /* While an input method is composing, the box paints its own text and the
     * copy steps aside. Coming back is held for a moment: in Korean one
     * syllable is one composition, so a sentence is a string of them, and
     * swapping back between each pair would be a flicker on every letter. */
    let settle = 0;
    this.editor.addEventListener('compositionstart', () => {
      clearTimeout(settle);
      stack.dataset.composing = 'true';
    });
    this.editor.addEventListener('compositionend', () => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        this.paintInk();
        delete stack.dataset.composing;
      }, 220);
    });

    const watch = new ResizeObserver(() => this.syncInkBox());
    watch.observe(this.editor);
    addEventListener('resize', () => this.syncInkBox());

    this.inkReady = true;
    this.paintInk(true);
  }

  /* Every path that puts a program into the box goes through here, so that
   * the copy underneath can never be showing something else. Typing does not:
   * it fires `input`, which the wiring above listens for. */
  setEditorText(text: string): void {
    this.editor.value = text;
    this.paintInk(true);
  }

  /* On a phone the editor is the whole screen's worth of space there is, so
   * it grows with the program instead of making the writer scroll inside a
   * box eight lines tall. On a wide screen the two panes stay level. */
  wireEditorHeight(): void {
    const narrow = matchMedia('(max-width: 819px)');
    const grow = (): void => {
      // On the coding screen the editor fills the height the layout gives it,
      // so an inline height measured from the program would fight the CSS.
      if (!narrow.matches || document.documentElement.dataset.focus === 'true') {
        this.editor.style.height = '';
        return;
      }
      this.editor.style.height = 'auto';
      this.editor.style.height =
        `${Math.min(this.editor.scrollHeight + 4, Math.round(window.innerHeight * 0.55))}px`;
      // The Run bar only rides the bottom of the screen when the program is
      // long enough that it would otherwise be scrolled away. On a short
      // program a floating bar has nothing to solve and covers the code.
      this.root.dataset.tall =
        String(this.editor.scrollHeight > Math.round(window.innerHeight * 0.5));
    };
    this.grow = grow;
    this.editor.addEventListener('input', grow);
    addEventListener('resize', grow);
    narrow.addEventListener('change', grow);
    grow();
  }

  /* --- taking the code away --------------------------------------------- */

  /* The skip link promises the writing box, and on a phone the writing box can
   * be behind the Python tab. A hidden element cannot take focus, so there the
   * plain href would scroll nowhere and leave focus on <body> — the header
   * un-skipped, which is the whole thing the link exists to prevent. Open the
   * pane that holds it first and let the browser do the rest. With scripting
   * off the markup already works on its own: the page ships with the writing
   * pane open. */
  wireSkipLink(): void {
    const link = queryMaybe(document, '.skip-link', HTMLAnchorElement);
    if (link === null) return;
    link.addEventListener('click', () => {
      const id = link.getAttribute('href')?.slice(1);
      if (id === undefined || id === '') return;
      const target = document.getElementById(id);
      if (target === null || target.offsetParent !== null) return;
      const holder = target.closest('.pane');
      if (holder === null) return;
      const view = holder.classList.contains('pane-nme') ? 'nme' : 'python';
      const tab = this.tabs.find((one) => one.dataset.view === view);
      if (tab !== undefined) tab.click();
    });
  }

  wireTools(): void {
    const flash = (button: HTMLElement, ok: boolean): void => {
      if (ok) flashLabel(button, TEXT.copied);
    };
    const on = (selector: string, act: (button: HTMLElement) => void): void => {
      const button = queryMaybe(document, selector, HTMLElement);
      if (button) button.addEventListener('click', () => act(button));
    };

    on('[data-copy-editor]', async (button) => flash(button, await copyText(this.editor.value)));
    // A link that carries the program itself. The guides already use this
    // shape, so sharing what you wrote costs no server and no account.
    on('[data-copy-link]', async (button) => flash(button, await copyText(this.shareLink())));
    on('[data-copy-python]', async (button) => flash(button, await copyText(this.compiled || this.python.textContent || '')));
    on('[data-download-editor]', () => downloadText(`${this.fileStem()}.nme`, this.editor.value));
    on('[data-download-python]', () => {
      if (this.compiled) downloadText(`${this.fileStem()}.py`, this.compiled);
    });
  }

  /* base64url of the UTF-8 bytes, which is what `loadFromHash` reads back. */
  shareLink(): string {
    const bytes = new TextEncoder().encode(this.editor.value);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const encoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
    // `/ko/index.html` and `/ko/` are the same page; share the short one.
    const path = location.pathname.replace(/index\.html$/, '');
    return `${location.origin}${path}#code=${encoded}`;
  }

  /* Named after the slot when there is one, so a folder of downloads still
   * says which program is which. */
  fileStem(): string {
    const slot = this.slots.list.find((one) => one.id === this.slots.current);
    const name = (slot ? slot.name : 'program').trim().replace(/[\\/:*?"<>|\s]+/g, '-');
    return name.slice(0, 48) || 'program';
  }

  /* --- save slots -------------------------------------------------------- */

  readSlots(): SlotShelf {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(SLOT_KEY) || 'null');
      if (typeof raw === 'object' && raw !== null && 'list' in raw) {
        const stored = asArray(raw.list);
        if (stored) {
          const current = 'current' in raw ? raw.current : undefined;
          return {
            list: stored.map(readSlot).filter((one): one is Slot => one !== null),
            current: typeof current === 'string' ? current : null,
          };
        }
      }
    } catch {
      /* unreadable or blocked storage behaves like an empty shelf */
    }
    return { list: [], current: null };
  }

  writeSlots(): void {
    try {
      localStorage.setItem(SLOT_KEY, JSON.stringify(this.slots));
    } catch {
      /* full or private storage: the slots live for this page only */
    }
  }

  /* --- the three files, and the tab examples open in ---------------------- */

  writeFiles(): void {
    this.files[this.activeFile] = this.editor.value;
    try {
      localStorage.setItem(
        FILES_KEY,
        JSON.stringify({ files: this.files, active: this.activeFile }),
      );
    } catch {
      // Full or blocked storage. The files still work for this visit, but the
      // page must stop claiming they will survive it.
      if (this.storageWorks) {
        this.storageWorks = false;
        this.drawFiles();
      }
    }
  }

  /* Reads the shelf off the browser and into `this.files`, and nothing else.
   *
   * This is split from "put something in the editor" on purpose. It used to do
   * both, and the constructor called it as `loadFromHash() || restoreFiles()`,
   * so arriving from any guide's "run this" link short-circuited it — the shelf
   * was never read, the empty one stayed in memory, and the next save wrote
   * that emptiness over three files of somebody's work. There are 885 of those
   * links on this site. Reading the shelf now happens first and always. */
  readShelf(): void {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(FILES_KEY);
    } catch {
      this.storageWorks = false;
      return;
    }
    if (raw === null) {
      // Before there were files there was one draft. It was whatever the
      // editor last held, which is what the example tab now holds.
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) this.files.example = draft;
      } catch {
        /* no draft to carry over */
      }
      return;
    }
    try {
      const stored: unknown = JSON.parse(raw);
      if (typeof stored === 'object' && stored !== null && 'files' in stored) {
        const shelf: unknown = stored.files;
        if (typeof shelf === 'object' && shelf !== null) {
          for (const id of FILE_IDS) {
            const value: unknown = id in shelf ? Reflect.get(shelf, id) : '';
            this.files[id] = typeof value === 'string' ? value : '';
          }
        }
        const active: unknown = 'active' in stored ? stored.active : '';
        if (typeof active === 'string' && isFileId(active)) this.activeFile = active;
        return;
      }
    } catch {
      /* falls through to the rescue below */
    }
    // Unreadable. Do not write the empty shelf over it — a person may still be
    // able to get their text out of it by hand, and overwriting is the one
    // thing that makes that impossible.
    try {
      localStorage.setItem(`${FILES_KEY}.unreadable`, raw);
      localStorage.removeItem(FILES_KEY);
    } catch {
      /* nothing more can be done for it */
    }
  }

  /* Puts the open file into the editor. False when there was nothing to put. */
  showActiveFile(): boolean {
    const carried = this.files[this.activeFile];
    if (!carried) return false;
    this.setEditorText(carried);
    void this.compileNow();
    if (this.grow) this.grow();
    return true;
  }

  /* Another tab on the same site holds its own copy of the shelf, and both
   * write the whole thing. Without this, whichever tab saved last erased the
   * other one's work with no sign on screen. A file this tab is not editing is
   * taken from the other tab; the open one is left alone, because the person
   * is looking at it. */
  wireOtherTabs(): void {
    addEventListener('storage', (event) => {
      if (event.key !== FILES_KEY || event.newValue === null) return;
      try {
        const stored: unknown = JSON.parse(event.newValue);
        if (typeof stored !== 'object' || stored === null || !('files' in stored)) return;
        const shelf: unknown = stored.files;
        if (typeof shelf !== 'object' || shelf === null) return;
        for (const id of FILE_IDS) {
          if (id === this.activeFile) continue;
          const value: unknown = id in shelf ? Reflect.get(shelf, id) : '';
          if (typeof value === 'string') this.files[id] = value;
        }
        this.drawFiles();
      } catch {
        /* another tab wrote something unreadable; keep what we have */
      }
    });
  }

  /* Which tab is open, which files have something in them, what the editor
   * is called, and what the row under the tabs says. */
  drawFiles(): void {
    for (const tab of this.fileTabs) {
      const id = tab.dataset.file;
      if (id === undefined || !isFileId(id)) continue;
      const open = id === this.activeFile;
      tab.setAttribute('aria-selected', String(open));
      // A tablist holds one stop in the page's tab order: Tab reaches the open
      // tab, and the arrow keys move between them from there. Without this the
      // markup promises a tablist to a screen reader and then behaves like
      // four ordinary buttons.
      tab.tabIndex = open ? 0 : -1;
      const held = id === this.activeFile ? this.editor.value : this.files[id];
      tab.dataset.used = String(id !== 'example' && held.trim() !== '');
    }
    if (this.editorTitle) {
      this.editorTitle.textContent =
        this.activeFile === 'example'
          ? TEXT.examplesWord
          : `${TEXT.fileWord} ${this.activeFile}`;
    }
    if (this.fileNoteText) {
      this.fileNoteText.textContent = !this.storageWorks
        ? TEXT.storageRefused
        : this.activeFile === 'example'
          ? TEXT.exampleNote
          : TEXT.fileNote;
    }
    if (this.fileNote) this.fileNote.dataset.state = this.storageWorks ? 'ok' : 'warn';
    if (this.fileNote) this.fileNote.hidden = false;
    this.drawVersions();
    for (const button of queryAll(document, '[data-copy-to]', HTMLElement)) {
      button.hidden = button.dataset.copyTo === this.activeFile;
    }
  }

  switchFile(id: FileId): void {
    if (id === this.activeFile) return;
    clearTimeout(this.debounce);
    this.disarmOverwrites();
    this.writeFiles();
    this.activeFile = id;
    if (id !== 'example') this.openExample = null;
    this.setEditorText(this.files[id]);
    this.terminal.textContent = '';
    this.slots.current = null;
    this.drawFiles();
    this.drawSlots();
    void this.compileNow();
    this.writeFiles();
    if (this.grow) this.grow();
  }

  /* Moving what is on screen into one of the three files. A file that already
   * holds something asks once, in the button itself, before it is replaced —
   * the same two-press shape the delete button uses. */
  /* Puts down any armed "overwrite?" confirmation. A confirmation is about one
   * program going into one file; if either changes, the answer no longer means
   * what it meant, so it must not survive. */
  disarmOverwrites(except?: HTMLElement): void {
    for (const button of queryAll(document, '[data-copy-to]', HTMLElement)) {
      if (button === except) continue;
      const waiting = fileOverwriteTimers.get(button);
      if (waiting === undefined) continue;
      clearTimeout(waiting);
      fileOverwriteTimers.delete(button);
      const original = originalLabels.get(button);
      if (original !== undefined) button.textContent = original;
    }
  }

  putInFile(id: FileId, button: HTMLElement): void {
    // The last keystrokes are still sitting in the typing debounce; without
    // this they stay in the file being left instead of travelling with the text.
    clearTimeout(this.debounce);
    this.files[this.activeFile] = this.editor.value;
    this.disarmOverwrites(button);
    const source = this.editor.value;
    const waiting = fileOverwriteTimers.get(button);
    if (this.files[id].trim() !== '' && waiting === undefined) {
      const original = originalLabels.get(button) ?? button.textContent ?? '';
      originalLabels.set(button, original);
      button.textContent = `${TEXT.fileWord} ${id} ${TEXT.overwrite}`;
      fileOverwriteTimers.set(
        button,
        setTimeout(() => {
          fileOverwriteTimers.delete(button);
          button.textContent = original;
        }, 4000),
      );
      return;
    }
    if (waiting !== undefined) {
      clearTimeout(waiting);
      fileOverwriteTimers.delete(button);
    }
    this.files[id] = source;
    this.activeFile = id;
    this.setEditorText(source);
    this.drawFiles();
    this.writeFiles();
    this.flashSaved();
    if (this.grow) this.grow();
  }

  wireFiles(): void {
    for (const [at, tab] of this.fileTabs.entries()) {
      tab.addEventListener('click', () => {
        const id = tab.dataset.file;
        if (id !== undefined && isFileId(id)) this.switchFile(id);
      });
      // Left and right walk the tabs, Home and End jump to the ends. Switching
      // a file is cheap and undoable, so the tab that gains focus opens — the
      // pattern a reader of these roles expects.
      tab.addEventListener('keydown', (event) => {
        const step = KEY_STEPS[event.key];
        if (step === undefined) return;
        event.preventDefault();
        const last = this.fileTabs.length - 1;
        const to = step === 'first' ? 0 : step === 'last' ? last
          : Math.min(last, Math.max(0, at + step));
        const next = this.fileTabs[to];
        const id = next?.dataset.file;
        if (next === undefined || id === undefined || !isFileId(id)) return;
        next.focus();
        this.switchFile(id);
      });
    }
    for (const button of queryAll(document, '[data-copy-to]', HTMLElement)) {
      button.addEventListener('click', () => {
        const id = button.dataset.copyTo;
        if (id !== undefined && isFileId(id)) this.putInFile(id, button);
      });
    }
  }

  drawSlots(): void {
    if (!this.slotList) return;
    this.slotList.textContent = '';
    for (const slot of this.slots.list) {
      const item = document.createElement('li');
      item.className = 'slot';
      item.dataset.current = String(slot.id === this.slots.current);

      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'slot-open';
      open.textContent = slot.name || TEXT.untitled;
      open.addEventListener('click', () => this.openSlot(slot.id));

      const rename = document.createElement('button');
      rename.type = 'button';
      rename.className = 'slot-edit';
      rename.title = TEXT.rename;
      rename.setAttribute('aria-label', `${TEXT.rename}: ${slot.name}`);
      rename.textContent = '✎';
      rename.addEventListener('click', () => this.renameSlot(slot.id));

      const drop = document.createElement('button');
      drop.type = 'button';
      drop.className = 'slot-drop';
      drop.title = TEXT.remove;
      drop.setAttribute('aria-label', `${TEXT.remove}: ${slot.name}`);
      drop.textContent = '×';
      drop.addEventListener('click', () => this.deleteSlot(slot.id, drop));

      item.append(open, rename, drop);
      this.slotList.append(item);
    }
  }

  wireSlots(): void {
    const save = queryMaybe(document, '#slot-save', HTMLElement);
    const fresh = queryMaybe(document, '#slot-new', HTMLElement);
    if (save) save.addEventListener('click', () => this.saveIntoSlot());
    if (fresh) fresh.addEventListener('click', () => this.saveIntoSlot(true));
    this.buildNameRow();
  }

  /* The name is asked for inside the page rather than in a browser dialog:
   * one look, one place, and it can be styled like everything else here. */
  buildNameRow(): void {
    const box = queryMaybe(document, '.slots', HTMLElement);
    if (!box) return;
    const row = document.createElement('form');
    row.className = 'slot-name-row';
    row.hidden = true;

    const label = document.createElement('label');
    label.className = 'slot-name-label';
    label.textContent = TEXT.slotName;
    label.htmlFor = 'slot-name-input';

    const field = document.createElement('input');
    field.type = 'text';
    field.id = 'slot-name-input';
    field.className = 'term-input';
    field.maxLength = 60;
    field.autocomplete = 'off';

    const confirm = document.createElement('button');
    confirm.type = 'submit';
    confirm.className = 'btn btn-primary';
    confirm.textContent = TEXT.slotSave;

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn-ghost';
    cancel.textContent = TEXT.slotCancel;
    cancel.addEventListener('click', () => { row.hidden = true; });

    row.append(label, field, confirm, cancel);
    row.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = field.value.trim();
      if (!name) { field.focus(); return; }
      row.hidden = true;
      if (this.naming) this.naming(name);
    });

    box.append(row);
    this.nameRow = row;
    this.nameField = field;
  }

  askName(suggested: string, done: (name: string) => void): void {
    const row = this.nameRow;
    const field = this.nameField;
    if (!row || !field) { done(suggested); return; }
    this.naming = done;
    field.value = suggested;
    row.hidden = false;
    field.focus();
    field.select();
  }

  saveIntoSlot(forceNew?: boolean): void {
    const existing = this.slots.list.find((one) => one.id === this.slots.current);
    if (!forceNew && existing) {
      existing.source = this.editor.value;
      existing.updated = Date.now();
      this.writeSlots();
      this.drawSlots();
      this.flashSaved();
      return;
    }
    const suggested = this.slots.list.length
      ? `${TEXT.slotFirst} ${this.slots.list.length + 1}`
      : TEXT.slotFirst;
    this.askName(suggested, (name) => {
      const slot: Slot = { id: `s${Date.now().toString(36)}`, name, source: this.editor.value, updated: Date.now() };
      this.slots.list.push(slot);
      this.slots.current = slot.id;
      this.writeSlots();
      this.drawSlots();
      this.flashSaved();
    });
  }

  /* A saved program opens where examples open, not into whichever file happens
   * to be in front. It used to land in the open file and quietly replace what
   * was there — the drawer writing into File 3 is exactly the thing the three
   * files promise cannot happen. */
  openSlot(id: string): void {
    const slot = this.slots.list.find((one) => one.id === id);
    if (!slot) return;
    clearTimeout(this.debounce);
    this.disarmOverwrites();
    if (this.activeFile !== 'example') {
      this.files[this.activeFile] = this.editor.value;
      this.activeFile = 'example';
    }
    this.slots.current = id;
    this.files.example = slot.source;
    this.openExample = null;
    this.setEditorText(slot.source);
    this.terminal.textContent = '';
    this.chips.querySelectorAll('.chip').forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
    this.writeSlots();
    this.drawSlots();
    void this.compileNow();
    this.writeFiles();
    this.drawFiles();
    if (this.grow) this.grow();
  }

  renameSlot(id: string): void {
    const slot = this.slots.list.find((one) => one.id === id);
    if (!slot) return;
    this.askName(slot.name, (name) => {
      slot.name = name;
      this.writeSlots();
      this.drawSlots();
    });
  }

  /* Deleting asks once, in place: the first press turns the cross into the
   * question, the second answers it, and walking away answers no. */
  deleteSlot(id: string, button: HTMLElement): void {
    if (button.dataset.sure !== 'true') {
      button.dataset.sure = 'true';
      button.textContent = TEXT.slotDelete;
      clearTimeout(slotDeleteTimers.get(button));
      slotDeleteTimers.set(button, setTimeout(() => {
        button.dataset.sure = 'false';
        button.textContent = '×';
      }, 4000));
      return;
    }
    this.slots.list = this.slots.list.filter((one) => one.id !== id);
    if (this.slots.current === id) this.slots.current = null;
    this.writeSlots();
    this.drawSlots();
  }

  flashSaved(): void {
    const flash = this.slotFlash;
    if (!flash) return;
    flash.textContent = TEXT.slotSaved;
    flash.dataset.on = 'true';
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => { flash.dataset.on = 'false'; }, 1600);
  }

  /* An example opens in its own tab. It can never land in one of the three
   * files, because that is where the visitor's own work is. */
  async load(example: Example): Promise<void> {
    clearTimeout(this.debounce);
    this.disarmOverwrites();
    if (this.activeFile !== 'example') {
      this.writeFiles();
      this.activeFile = 'example';
    }
    this.slots.current = null;
    this.openExample = example;
    if (this.versionNote) this.versionNote.textContent = '';
    this.setEditorText(await this.exampleSource(example));
    // A link may open an example from a group that is not the one on show.
    // Showing everything is not a group to be corrected away from.
    if (this.exampleGroup !== 'all' && example.group !== this.exampleGroup) {
      this.showGroup(example.group);
    } else {
      this.chips.querySelectorAll('.chip').forEach((chip) => {
        chip.setAttribute('aria-pressed', String(chip instanceof HTMLElement && chip.dataset.example === example.id));
      });
    }
    this.terminal.textContent = '';
    this.drawSlots();
    this.drawFiles();
    void this.compileNow();
    this.writeFiles();
    if (this.grow) this.grow();
  }

  /* --- finding in the code, and renaming a job ---------------------------- */

  openEditorBar(mode: 'find' | 'rename'): void {
    if (!this.editorBar) return;
    this.editorBar.hidden = false;
    if (this.findRow) this.findRow.hidden = mode !== 'find';
    if (this.renameRow) this.renameRow.hidden = mode !== 'rename';
    this.say('');
    if (mode === 'find') {
      this.findAt = -1;
      this.findText?.focus();
      this.findText?.select();
      this.runFind(0);
    } else {
      // Put the caret on a name and press the button: that name is already
      // chosen. Four hundred names in a list is fine to have and painful to
      // scroll, and the one you want is nearly always the one you are looking
      // at. This is what F2 does in an editor.
      this.fillJobNames(this.nameAtCaret());
      this.renameTo?.focus();
    }
  }

  closeEditorBar(): void {
    if (this.editorBar) this.editorBar.hidden = true;
    this.editor.focus();
  }

  say(message: string): void {
    if (this.editorMsg) this.editorMsg.textContent = message;
  }

  /* Step through the places the text appears: 0 stays where you are, 1 goes on,
   * -1 goes back. The editor is a plain text box, so showing a hit means
   * selecting it — which also lets the reader start editing it straight away. */
  runFind(step: number): void {
    if (!this.findText || !this.findCount) return;
    const needle = this.findText.value;
    if (needle === '') { this.findCount.textContent = ''; this.findAt = -1; return; }
    const hay = this.editor.value;
    const spots: number[] = [];
    let at = hay.indexOf(needle);
    while (at !== -1) { spots.push(at); at = hay.indexOf(needle, at + 1); }
    if (spots.length === 0) {
      this.findCount.textContent = TEXT.findNone;
      this.findAt = -1;
      return;
    }
    if (this.findAt < 0) {
      // Start from wherever the caret already is, so Find carries on from
      // where the reader is looking rather than from the top of the file.
      const from = this.editor.selectionStart;
      const next = spots.findIndex((spot) => spot >= from);
      this.findAt = next === -1 ? 0 : next;
    } else {
      this.findAt = (this.findAt + step + spots.length) % spots.length;
    }
    const spot = spots[this.findAt] ?? 0;
    this.editor.focus();
    this.editor.setSelectionRange(spot, spot + needle.length);
    this.scrollEditorTo(spot);
    this.findCount.textContent = TEXT.findAt(this.findAt + 1, spots.length);
  }

  /* A text box does not scroll to a selection that script put there. Counting
   * the newlines before it gives the line, and the line times its height is
   * where the box has to be. */
  scrollEditorTo(spot: number): void {
    const height = parseFloat(getComputedStyle(this.editor).lineHeight);
    if (!Number.isFinite(height) || height <= 0) return;
    const want = (this.editor.value.slice(0, spot).split('\n').length - 1) * height;
    const top = this.editor.scrollTop;
    const box = this.editor.clientHeight;
    if (want < top || want > top + box - height * 2) {
      this.editor.scrollTop = Math.max(0, want - box / 2);
    }
  }

  /* The two kinds are kept apart in the list because they read differently to
   * whoever is looking for one: a job is something the program does, a value
   * is something it remembers. Anything the compiler invented that is not
   * written in the program is dropped — offering a name that cannot be found
   * in the editor is offering a button that does nothing. */
  /* The name the caret is sitting in, or inside — Korean writes `회복약회복은`
   * where the name is `회복약회복`, so the longest name the compiler knows at
   * that spot is the answer, not the run of letters. */
  nameAtCaret(): string | null {
    if (this.compiled === '') return null;
    const text = this.editor.value;
    let at = this.editor.selectionStart;
    while (at > 0 && isNameLetter(text[at - 1])) at -= 1;
    if (!isNameLetter(text[at])) return null;
    const word = longestKnownAt(text, at, knownNames(this.compiled));
    return word === '' ? null : word;
  }

  fillJobNames(want: string | null = null): void {
    const box = this.renameFrom;
    if (!box) return;
    const found = programNames(this.compiled);
    // Korean glues its particles onto the end of a name, so `회복약회복` is
    // written `회복약회복은` half the time. Asking whether the exact word is
    // in the editor answers "no" for almost every Korean name; the same
    // longest-known-name walk the rename itself uses answers it properly.
    const known = knownNames(this.compiled);
    const source = this.editor.value;
    const shown = (list: readonly string[]): string[] => list
      .filter((name) => wholeWordSpots(source, name, known).length > 0)
      .sort((a, b) => a.localeCompare(b));
    const jobs = shown(found.jobs);
    const values = shown(found.values);
    const had = want ?? box.value;
    box.textContent = '';
    const kinds: { readonly label: string; readonly names: readonly string[] }[] = [
      { label: TEXT.renameJobs, names: jobs },
      { label: TEXT.renameValues, names: values },
    ];
    for (const { label, names } of kinds) {
      if (names.length === 0) continue;
      const group = document.createElement('optgroup');
      group.label = `${label} (${names.length})`;
      for (const name of names) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        group.append(option);
      }
      box.append(group);
    }
    const total = jobs.length + values.length;
    box.disabled = total === 0;
    if (jobs.includes(had) || values.includes(had)) box.value = had;
    if (total === 0) this.say(TEXT.renameNoJobs);
  }

  async doRename(): Promise<void> {
    if (!this.renameFrom || !this.renameTo) return;
    if (!this.compilerReady) { this.say(TEXT.renameWait); return; }
    const from = this.renameFrom.value;
    const to = this.renameTo.value.trim();
    if (from === '') { this.say(TEXT.renameNoJobs); return; }
    if (to === '') { this.say(TEXT.renameNeedName); return; }
    if (to === from) { this.say(TEXT.renameNeedName); return; }
    if (/\s/.test(to) || /^[0-9]/.test(to) || !isNameLetter(to[0])) { this.say(TEXT.renameBadName); return; }
    if (wholeWordSpots(this.editor.value, to).length > 0) { this.say(TEXT.renameTaken); return; }
    const outcome = await renameJob(this.editor.value, this.compiled, from, to,
      async (text) => {
        const json = await this.compiler.compile(text);
        return json === null ? null : readCompileOutcome(json);
      });
    if (outcome === null) return;
    if (outcome.broken) { this.say(TEXT.renameBroken); return; }
    if (outcome.unsafe) { this.say(TEXT.renameUnsafe); return; }
    if (outcome.count === 0) { this.say(TEXT.renameNothing); return; }
    this.setEditorText(outcome.text);
    this.writeFiles();
    this.drawFiles();
    this.say(TEXT.renameDone(outcome.count, to));
    this.renameTo.value = '';
    // The list is read out of the Python, so it can only be refilled once the
    // Python for the renamed program is here.
    await this.compileNow();
    this.fillJobNames();
  }

  /* Ask for Python and put it up when it arrives. Nothing here blocks the
   * page any more, so two things had to become explicit: the answer can be for
   * text that has already been typed over — that is the `null` — and the pane
   * keeps showing the last good Python meanwhile, with the note saying it is
   * behind rather than pretending it is current. */
  async compileNow(): Promise<void> {
    this.markHashNote();
    if (!this.compilerReady) {
      this.pythonState.textContent = TEXT.bootCompiler;
      return;
    }
    const source = this.editor.value;
    if (this.pythonNote) this.pythonNote.textContent = TEXT.compiling;
    const started = performance.now();
    const json = await this.compiler.compile(source);
    if (json === null) return;
    this.compileMs = performance.now() - started;
    this.compiledFrom = source;
    const outcome = readCompileOutcome(json);
    // A quick pulse on the Python pane whenever it is rebuilt. Compiling as
    // you type is the thing this page is for, and without a flicker the pane
    // looks static even while it is changing.
    const pane = this.pythonPane;
    if (pane) {
      pane.dataset.fresh = 'true';
      clearTimeout(this.freshTimer);
      this.freshTimer = setTimeout(() => { pane.dataset.fresh = 'false'; }, 450);
    }
    if (outcome.ok) {
      this.compiled = outcome.python;
      this.python.dataset.state = 'ok';
      const echoed = echoedLines(source, outcome.python);
      this.python.innerHTML = byLine(highlightPython(outcome.python), echoed);
      this.markLine();
      // Both kinds in one program is the case worth pointing at; all words or
      // all commands is not surprising and says nothing.
      if (this.echoNote) {
        const statements = outcome.python
          .split('\n')
          .filter((line, at) => line.trim() !== '' && !echoed.has(at)).length;
        this.echoNote.hidden = echoed.size === 0 || statements === 0;
      }
      this.pythonState.textContent = TEXT.compiled;
      if (this.pythonNote) this.pythonNote.textContent = TEXT.compiledNote;
      this.runButton.disabled = this.running;
      this.runButton.removeAttribute('data-blocked');
      this.runButton.title = TEXT.runHint;
      this.showProblem(null);
      if (this.alertText.textContent === TEXT.fixFirst) this.hideAlert();
    } else {
      this.compiled = '';
      this.python.dataset.state = 'error';
      if (this.echoNote) this.echoNote.hidden = true;
      // The compiler's own rendered text says everything twice, once in each
      // language, with a caret line. That belongs in the band below, taken
      // apart and in this page's language; here it was a wall of text a
      // beginner reads as noise. The fallback stays for the day the band is
      // not there or the compiler sends no structured problem.
      const first = outcome.problems[0];
      this.python.textContent = this.problem && first ? TEXT.noPythonYet : outcome.diagnostic;
      this.pythonState.textContent = TEXT.errorLabel;
      // The subtitle said "what the compiler produced" next to a message that
      // says the opposite. One of them has to change with the state.
      if (this.pythonNote) this.pythonNote.textContent = TEXT.errorNote;
      // The button stays alive on purpose. A dead button is not information:
      // it says "no" without saying why, and that is exactly what a beginner
      // cannot get past. Pressing it now takes you to the line.
      this.runButton.disabled = this.running;
      this.runButton.dataset.blocked = 'true';
      this.runButton.title = TEXT.blockedHint;
      this.showProblem(outcome.problems[0] ?? null);
    }
  }

  /* --- what is wrong, where, and what to try ----------------------------- */

  showProblem(problem: CompileProblem | null): void {
    const band = this.problem;
    if (!band) return;
    if (!problem) {
      band.hidden = true;
      return;
    }
    const lines = this.editor.value.split('\n');
    const said = problem.line > 0 ? lines[problem.line - 1] ?? '' : '';
    if (this.problemLine) {
      this.problemLine.hidden = problem.line === 0;
      this.problemLine.textContent = `${TEXT.lineWord} ${problem.line}`;
      this.problemLine.title = TEXT.goToLine;
    }
    if (this.problemTitle) this.problemTitle.textContent = problem.title;
    if (this.problemSource) {
      this.problemSource.hidden = said.trim() === '';
      this.problemSource.textContent = said;
    }
    if (this.problemWhy) {
      this.problemWhy.hidden = problem.message === '';
      this.problemWhy.textContent = problem.message;
    }
    if (this.problemFix) {
      this.problemFix.hidden = problem.hint === '';
      this.problemFix.textContent = problem.hint;
    }
    if (this.problemCode) {
      this.problemCode.hidden = problem.code === '';
      this.problemCode.textContent = `${TEXT.problemMore} ${problem.code}`;
    }
    if (this.problemDetail && this.problemDetailText) {
      this.problemDetail.hidden = problem.detail === '';
      this.problemDetailText.textContent = problem.detail;
      // Whoever opened this once wants it open: the next error is the next
      // thing they do not understand, not a reason to fold the answer away.
    }
    band.hidden = false;
  }

  /* Put the caret on a line and show it. A number is only useful if it takes
   * you somewhere. */
  goToLine(line: number): void {
    const lines = this.editor.value.split('\n');
    if (line < 1 || line > lines.length) return;
    let at = 0;
    for (let index = 0; index < line - 1; index += 1) at += (lines[index] ?? '').length + 1;
    this.editor.focus();
    this.editor.setSelectionRange(at, at + (lines[line - 1] ?? '').length);
    // A textarea does not scroll to the caret on its own when the caret was
    // moved by script rather than by typing.
    const rows = this.editor.value.substring(0, at).split('\n').length;
    const height = this.editor.scrollHeight / Math.max(1, lines.length);
    this.editor.scrollTop = Math.max(0, (rows - 3) * height);
    this.markLine();
  }

  flashProblem(): void {
    const band = this.problem;
    if (!band || band.hidden) return;
    band.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    band.dataset.flash = 'true';
    setTimeout(() => { band.removeAttribute('data-flash'); }, 600);
  }

  /* Boot happens in two visible stages: the compiler (small, needed to show
   * any Python at all) and then the engine (large, needed only to press Run).
   * Neither is allowed to fail quietly. */
  async start(): Promise<void> {
    this.runButton.disabled = true;
    this.note.textContent = TEXT.bootCompiler;
    this.setProgress(0, COMPILER_BYTES);
    try {
      const source = await fetchWithProgress(
        new URL('./wasm/nme_bg.wasm', import.meta.url).href,
        COMPILER_BYTES,
        (loaded, total) => this.setProgress(loaded, total),
      );
      await this.compiler.start(await source.arrayBuffer());
    } catch (error) {
      this.hideProgress();
      this.note.textContent = '';
      this.showAlert(`${TEXT.compilerLate} (${String(error)})`, () => { void this.start(); });
      return;
    }
    this.compilerReady = true;
    void this.compileNow();
    this.startEngine();
  }

  startEngine(): void {
    this.note.textContent = TEXT.bootEngine;
    this.setProgress(0, 0);
    this.ensureWorker().postMessage({ type: 'preload' });
  }

  /* One worker serves every run: each `run` call builds a fresh interpreter
   * inside it, so nothing carries over, and the 11 MB engine is instantiated
   * once instead of once per press. */
  ensureWorker(): Worker {
    let worker = this.worker;
    if (!worker) {
      worker = new Worker('/assets/play-worker.js', { type: 'module' });
      worker.onmessage = (event: MessageEvent<unknown>) => this.onWorkerMessage(event.data);
      worker.onerror = (event: ErrorEvent) => {
        this.engineReady = false;
        this.hideProgress();
        this.showAlert(`${TEXT.engineLate} (${event.message || String(event)})`, () => {
          this.dropWorker();
          this.startEngine();
        });
        if (this.running) this.finish(TEXT.failed);
      };
      this.worker = worker;
    }
    return worker;
  }

  dropWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.engineReady = false;
  }

  /* A terminal control sequence is the only way one line of Python can clear a
   * screen or change a colour, so `clear the screen` emits one and so does any
   * program asking for colour. Here the "screen" is a <pre>: honour the clear,
   * draw the colours, and drop every other sequence rather than printing its
   * letters.
   *
   * The colour state lives between calls because a program may set a colour in
   * one `print` and write the text in the next. */
  print(text: string, className?: string): void {
    if (!text.includes('\u001b')) {
      this.write(text, className);
      this.terminal.scrollTop = this.terminal.scrollHeight;
      return;
    }
    if (/\u001b\[[23]J/.test(text)) {
      this.terminal.textContent = '';
      this.ink.clear();
    }
    let rest = text;
    for (let found = SGR.exec(rest); found !== null; found = SGR.exec(rest)) {
      const before = rest.slice(0, found.index).replace(CONTROL, '');
      if (before) this.write(before, className);
      this.applySgr(found[1] ?? '');
      rest = rest.slice(found.index + found[0].length);
    }
    const tail = rest.replace(CONTROL, '');
    if (tail) this.write(tail, className);
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  /* What each of the program's own names held when it stopped.
   *
   * A beginner's first real question about a running program is *what is in it
   * now*, and until this the playground could only answer with whatever the
   * program remembered to print. It is shown closed, because the answer is
   * usually "what I expected" and the terminal is the thing being read.
   *
   * It is shown after a failure too, and that is when it matters most: a
   * program that stopped half way is exactly when someone wants to know what
   * was in the names at the time. */
  showValues(values: readonly NameValue[]): void {
    const box = this.values;
    const list = this.valuesList;
    if (!box || !list) return;
    list.textContent = '';
    if (values.length === 0) {
      box.hidden = true;
      return;
    }
    for (const { name, shown } of values) {
      const term = document.createElement('dt');
      term.textContent = name;
      const said = document.createElement('dd');
      said.textContent = shown;
      list.append(term, said);
    }
    box.hidden = false;
  }

  /* Which line of the Python is the one the caret is on. Called on every
   * keystroke and every click, so it does no work beyond counting newlines. */
  markLine(): void {
    if (this.python.dataset.state !== 'ok') return;
    const upto = this.editor.value.slice(0, this.editor.selectionStart);
    let at = 0;
    for (let i = 0; i < upto.length; i += 1) if (upto[i] === '\n') at += 1;
    const focused = document.activeElement === this.editor;
    for (const node of this.python.children) {
      if (!(node instanceof HTMLElement)) continue;
      const here = focused && node.dataset.line === String(at);
      if (here) node.dataset.at = 'true';
      else node.removeAttribute('data-at');
    }
  }

  /* One `if` on the class list rather than two: the old shape built the node
   * first and asked again afterwards, which no longer proves to the compiler
   * that a node means there is a class name to put on it. */
  private write(text: string, className?: string): void {
    const classes = className ? [className, ...this.ink] : [...this.ink];
    if (classes.length === 0) {
      this.terminal.append(document.createTextNode(text));
      return;
    }
    const node = document.createElement('span');
    node.className = classes.join(' ');
    node.textContent = text;
    this.terminal.append(node);
  }

  /* `ESC [ 1 ; 31 m` is two instructions, so each number is read in turn. An
   * unknown number is ignored rather than refused: a terminal that does not
   * know a code simply does not do it, and a program should not break here for
   * having asked. */
  private applySgr(parameters: string): void {
    for (const piece of (parameters === '' ? '0' : parameters).split(';')) {
      const code = Number(piece);
      if (!Number.isInteger(code)) continue;
      const off = SGR_OFF[code];
      if (off === 'all') {
        this.ink.clear();
        continue;
      }
      if (off !== undefined) {
        for (const name of off) this.ink.delete(name);
        continue;
      }
      const on = SGR_CLASS[code];
      if (on === undefined) continue;
      // One ink and one paper at a time, so a second colour replaces the first
      // instead of leaving two class names fighting over the same property.
      const family = on.startsWith('sgr-fg-')
        ? 'sgr-fg-'
        : on.startsWith('sgr-bg-')
          ? 'sgr-bg-'
          : null;
      if (family !== null) {
        for (const name of [...this.ink]) {
          if (name.startsWith(family)) this.ink.delete(name);
        }
      }
      this.ink.add(on);
    }
  }

  async run(): Promise<void> {
    if (!this.compilerReady) {
      this.showAlert(TEXT.compilerLate, () => { void this.start(); });
      return;
    }
    // Pressing Run inside the wait after a keystroke used to run the Python
    // for the program as it was before that keystroke. The wait is longer now
    // — it follows what compiling really costs — so this asks first whether
    // the Python beside the editor is the Python for what is in the editor.
    if (this.editor.value !== this.compiledFrom) {
      clearTimeout(this.debounce);
      this.note.textContent = TEXT.compiling;
      await this.compileNow();
      this.writeFiles();
      this.drawFiles();
      this.note.textContent = '';
    }
    if (!this.compiled) {
      // Not an alert any more: the band under the editor already says which
      // line and why, so the press takes you there instead of adding a second
      // message that says less.
      this.flashProblem();
      const line = this.problemLine?.textContent?.match(/\d+/)?.[0];
      if (line) this.goToLine(Number(line));
      else this.showAlert(TEXT.fixFirst, null);
      return;
    }
    this.hideAlert();

    // The engine may still be on its way. Say so, keep the bar moving, and
    // run by itself the moment it lands — pressing Run should never look
    // like it did nothing.
    if (!this.engineReady) {
      this.pendingRun = true;
      this.note.textContent = TEXT.waitingToRun;
      this.runButton.disabled = true;
      this.stopButton.disabled = false;
      this.ensureWorker().postMessage({ type: 'preload' });
      return;
    }

    this.terminal.textContent = '';
    this.showValues([]);
    this.note.textContent = TEXT.running;
    this.setStatus('busy');
    this.running = true;
    this.terminal.dataset.running = 'true';
    this.runButton.disabled = true;
    this.stopButton.disabled = false;

    const request: RunRequest = {
      type: 'run',
      python: this.compiled,
      sab: this.sharedMemory ? this.sharedMemory.buffer : undefined,
      answers: this.sharedMemory ? undefined : this.collectAnswers(),
    };
    this.ensureWorker().postMessage(request);
    // On a phone the editor fills the screen and the output is below the fold,
    // so pressing Run would look like nothing happened. Bring the output up.
    if (matchMedia('(max-width: 819px)').matches) {
      this.terminal.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  collectAnswers(): string[] {
    const answers = this.answers;
    if (!answers) return [];
    return answers.value.split('\n').filter((line, index, all) =>
      index < all.length - 1 || line.length > 0);
  }

  onWorkerMessage(data: unknown): void {
    const message = readWorkerMessage(data);
    if (!message) return;
    switch (message.type) {
      case 'progress':
        if (!this.engineReady) this.setProgress(message.loaded, message.total);
        break;
      case 'ready':
        this.engineReady = true;
        this.hideProgress();
        this.hideAlert();
        this.setStatus('ready');
        if (this.pendingRun) {
          this.pendingRun = false;
          void this.run();
        } else if (!this.running) {
          this.note.textContent = TEXT.engineReady;
        }
        break;
      case 'out':
        this.print(message.text);
        break;
      case 'ask':
        this.askForInput();
        break;
      case 'done':
        if (message.error) {
          const plainly = whatWentWrong(message.error);
          // When the cause is understood, the last line of the traceback is the
          // only part worth showing; the explanation replaces the rest.
          const shown = plainly
            ? (withoutEngineFrames(message.error).trim().split('\n').pop() ?? '')
            : withoutEngineFrames(message.error);
          this.print('\n' + shown, 'term-error');
          if (plainly) this.print('\n' + plainly + '\n', 'term-meta');
        }
        this.showValues(message.values);
        this.finish(message.ok ? TEXT.finished : TEXT.failed);
        break;
      case 'fatal':
        if (!this.engineReady) {
          // It never started, so this is a download problem, not the
          // visitor's program failing.
          this.hideProgress();
          this.pendingRun = false;
          this.showAlert(`${TEXT.engineLate} (${message.error})`, () => {
            this.dropWorker();
            this.startEngine();
          });
          this.finish('');
          break;
        }
        const plainly = whatWentWrong(message.error);
        const shown = plainly
          ? (withoutEngineFrames(message.error).trim().split('\n').pop() ?? '')
          : withoutEngineFrames(message.error);
        this.print('\n' + shown + '\n', 'term-error');
        if (plainly) this.print(plainly + '\n', 'term-meta');
        this.finish(TEXT.failed);
        break;
      default:
        break;
    }
  }

  askForInput(): void {
    this.inputRow.hidden = false;
    this.note.textContent = TEXT.askHint;
    this.input.value = '';
    this.input.focus();
  }

  answer(): void {
    const shared = this.sharedMemory;
    if (this.inputRow.hidden || !shared) return;
    const text = this.input.value;
    this.print(text + '\n', 'term-echo');
    this.inputRow.hidden = true;
    this.note.textContent = TEXT.running;

    const encoded = new TextEncoder().encode(text);
    const length = Math.min(encoded.length, ANSWER_CAPACITY);
    shared.bytes.set(encoded.subarray(0, length));
    Atomics.store(shared.control, 1, length);
    Atomics.store(shared.control, 0, 1);
    Atomics.notify(shared.control, 0);
  }

  finish(note: string): void {
    this.terminal.dataset.running = 'false';
    this.note.textContent = note;
    this.setStatus(note === TEXT.failed ? 'bad' : (this.engineReady ? 'ready' : 'busy'));
    this.inputRow.hidden = true;
    this.running = false;
    this.runButton.disabled = !this.compiled;
    this.stopButton.disabled = true;
  }

  /* Stopping means killing the thread, which throws the loaded engine away
   * with it. A replacement starts fetching straight away, from cache, so the
   * next Run is not held up by this one. */
  stop(announce: boolean): void {
    this.pendingRun = false;
    this.dropWorker();
    if (announce) {
      this.print('\n' + TEXT.stoppedByYou + '\n', 'term-meta');
      this.finish(TEXT.stopped);
    }
    this.startEngine();
  }
}

/* One saved slot, as it comes back out of storage: everything in there was put
 * there by `writeSlots`, but nothing stops a visitor editing it by hand, so
 * each field is checked. An entry with no program text is dropped, which is
 * what the old one-line filter did; the other three fields fall back rather
 * than throwing the whole slot away. */
function readSlot(value: unknown): Slot | null {
  if (typeof value !== 'object' || value === null) return null;
  const source = 'source' in value ? value.source : undefined;
  if (typeof source !== 'string') return null;
  const id = 'id' in value ? value.id : undefined;
  const name = 'name' in value ? value.name : undefined;
  const updated = 'updated' in value ? value.updated : undefined;
  return {
    id: typeof id === 'string' ? id : '',
    name: typeof name === 'string' ? name : '',
    source,
    updated: typeof updated === 'number' ? updated : 0,
  };
}

/* --- boot ---------------------------------------------------------------- */

forwardKoreanSpeakersOnce();
rememberLanguageChoice();
wireTheme();
wireHeroLines();
wireHeaderEdge();
wireHeaderHeight();
wireReveal();
wireCopyButtons();
wireFileCopyButtons();
wireAiPrompts();
wireDocRail();
wireGuideFilter();

/* The footer names a version, and a version number is written by hand. On
 * 2026-08-22 it said 0.7.1 while the compiler on the page was three fixes
 * behind that, and nothing a reader could see would have told them. The build
 * is stamped from the pin at deploy time, so this cannot drift: the commit is
 * which source it came from, the hash is the file the browser downloaded. */
function showBuild(): void {
  const slot = queryMaybe(document, '#foot-build', HTMLElement);
  if (!slot) return;
  slot.textContent = ` (${COMPILER_COMMIT.slice(0, 7)})`;
  slot.title = LANG === 'ko'
    ? `빌드 커밋 ${COMPILER_COMMIT}\nwasm sha256 ${COMPILER_SHA256}`
    : `built from ${COMPILER_COMMIT}\nwasm sha256 ${COMPILER_SHA256}`;
}
showBuild();

const headerNav = queryMaybe(document, '.head-nav', HTMLElement);
if (headerNav) wireStrip(headerNav);

const playgroundRoot = queryMaybe(document, '#playground', HTMLElement);
if (playgroundRoot) {
  const playground = new Playground(playgroundRoot);
  void playground.start();
  window.addEventListener('hashchange', () => {
    if (playground.loadFromHash()) {
      playground.drawFiles();
      void playground.compileNow();
    }
  });
}
