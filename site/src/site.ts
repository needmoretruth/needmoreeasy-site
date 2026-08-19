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

import init, { compile } from './wasm/nme.js';
import { EXAMPLES } from './examples.js';
import { COMPILER_BYTES } from './engine-meta.js';
import type { Example, ExampleLanguage } from './examples.js';

const LANG: ExampleLanguage = document.documentElement.lang === 'ko' ? 'ko' : 'en';
const STORE_KEY = 'nme-lang';

const TEXT = {
  en: {
    compiled: 'Python',
    compiledNote: 'what the compiler produced',
    errorLabel: 'what the compiler says',
    errorNote: 'fix this line and it will compile',
    bootCompiler: 'fetching the compiler…',
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
  },
  ko: {
    compiled: 'Python',
    compiledNote: '컴파일러가 만든 결과',
    errorLabel: '컴파일러가 알려주는 내용',
    errorNote: '이 줄을 고치면 됩니다',
    bootCompiler: '컴파일러를 내려받는 중입니다…',
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
  const sync = (): void => head.setAttribute('data-scrolled', String(window.scrollY > 8));
  sync();
  addEventListener('scroll', sync, { passive: true });
}

/* The grid behind the glass is almost invisible until light falls on it. The
 * pointer is that light: a soft circle where the structure shows through.
 * It is one element and one custom property, and phones never get it because
 * there is no pointer to follow. */
function wireBeam(): void {
  const stage = queryMaybe(document, '.stage', HTMLElement);
  if (!stage) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const beam = document.createElement('i');
  beam.className = 'beam';
  stage.append(beam);

  let x = 0;
  let y = 0;
  let queued = false;
  addEventListener('pointermove', (event) => {
    x = event.clientX;
    y = event.clientY;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      stage.style.setProperty('--px', `${x}px`);
      stage.style.setProperty('--py', `${y}px`);
    });
  }, { passive: true });
}

/* Glass has a highlight where the light hits it, and here the light is the
 * pointer. Touch screens have no pointer to follow, so they never pay for it. */
function wirePointerSheen(): void {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  for (const panel of queryAll(document, '.card, .prompt-card', HTMLElement)) {
    panel.addEventListener('pointermove', (event) => {
      const box = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${event.clientX - box.left}px`);
      panel.style.setProperty('--my', `${event.clientY - box.top}px`);
    });
  }
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

/* --- documentation pages -------------------------------------------------- */

/* The index rail is a <details> so that it collapses on a phone. On a wide
 * screen it is a permanent column, and a reader with JavaScript off still gets
 * a working disclosure rather than an empty box. */
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
}

function readCompileOutcome(json: string): CompileOutcome {
  const raw: unknown = JSON.parse(json);
  if (typeof raw !== 'object' || raw === null) return { ok: false, python: '', diagnostic: json };
  const ok = 'ok' in raw && raw.ok === true;
  const python = 'python' in raw && typeof raw.python === 'string' ? raw.python : '';
  const diagnostic = 'diagnostic' in raw && typeof raw.diagnostic === 'string' ? raw.diagnostic : '';
  return { ok, python, diagnostic };
}

/* What the worker sends back. Both ends of this are in this repository, so the
 * union below is the whole protocol; `readWorkerMessage` turns the `unknown`
 * that arrives on the wire into one of these, or into nothing at all, which
 * the switch ignores exactly as the old `default: break` did. */
type WorkerMessage =
  | { readonly type: 'progress'; readonly loaded: number; readonly total: number }
  | { readonly type: 'ready' }
  | { readonly type: 'out'; readonly text: string }
  | { readonly type: 'ask' }
  | { readonly type: 'done'; readonly ok: boolean; readonly error: string | null }
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
    return { type: 'done', ok, error: typeof error === 'string' ? error : null };
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

class Playground {
  readonly editor: HTMLTextAreaElement;
  readonly python: HTMLElement;
  readonly pythonState: HTMLElement;
  readonly pythonNote: HTMLElement | null;
  readonly terminal: HTMLElement;
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

  worker: Worker | null;
  compiled: string;
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
  flashTimer: number | undefined = undefined;

  constructor(root: ParentNode) {
    // `root` is the playground element itself, so it has to be looked up from
    // the document rather than searched inside.
    this.root = queryOne(document, '#playground', HTMLElement);
    this.editor = queryOne(root, '#editor', HTMLTextAreaElement);
    this.python = queryOne(root, '#python', HTMLElement);
    this.pythonState = queryOne(root, '#python-state', HTMLElement);
    this.pythonNote = queryMaybe(root, '#python-note', HTMLElement);
    this.terminal = queryOne(root, '#terminal', HTMLElement);
    this.runButton = queryOne(root, '#run', HTMLButtonElement);
    this.stopButton = queryOne(root, '#stop', HTMLButtonElement);
    this.chips = queryOne(root, '#examples', HTMLElement);
    this.inputRow = queryOne(root, '#input-row', HTMLElement);
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

    this.worker = null;
    this.compiled = '';
    this.debounce = 0;
    this.compilerReady = false;
    this.engineReady = false;
    this.pendingRun = false;
    this.running = false;
    this.sharedMemory = this.makeSharedMemory();

    this.slots = this.readSlots();
    this.files = emptyShelf();
    this.activeFile = 'example';

    this.buildChips();
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
    if (!this.loadFromHash() && !this.showActiveFile() && first) this.load(first);
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
        this.load(found);
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
      this.editor.value = this.files.example;
      this.terminal.textContent = '';
      return true;
    } catch {
      return false;
    }
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

  buildChips(): void {
    for (const example of EXAMPLES[LANG]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.textContent = example.label;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => this.load(example));
      this.chips.append(button);
    }
  }

  wire(): void {
    this.editor.addEventListener('input', () => {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.compileNow();
        this.writeFiles();
        this.drawFiles();
      }, 180);
    });

    // On a phone the two code panes become two tabs over one panel.
    for (const tab of this.tabs) {
      tab.addEventListener('click', () => {
        const view = tab.dataset.view;
        if (this.panes && view !== undefined) this.panes.dataset.view = view;
        this.tabs.forEach((other) => {
          other.setAttribute('aria-selected', String(other === tab));
        });
      });
    }

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
    this.wireChipStrip();
    this.runButton.addEventListener('click', () => this.run());
    // Ctrl/Cmd + Enter runs, the way every editor a programmer will meet next
    // already does. The button carries the same shortcut in its tooltip.
    this.editor.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (!this.runButton.disabled) this.run();
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

  /* Thirty examples do not fit a phone, so they become one strip you swipe.
   * A strip with no edge fade looks like a list that simply ends, so the ends
   * are marked — and only the ends that actually have more beyond them. */
  wireChipStrip(): void {
    const strip = this.chips;
    const mark = (): void => {
      const more = strip.scrollWidth - strip.clientWidth;
      strip.dataset.more = more > 4 ? 'true' : 'false';
      // The strip carries the page's side padding inside itself, and scroll
      // snapping parks the first chip after it — so "at the start" is that
      // padding, not zero.
      const inset = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
      strip.dataset.atStart = String(strip.scrollLeft <= inset + 2);
      strip.dataset.atEnd = String(strip.scrollLeft >= more - 2);
    };
    strip.addEventListener('scroll', mark, { passive: true });
    addEventListener('resize', mark);
    mark();
  }

  /* On a phone the editor is the whole screen's worth of space there is, so
   * it grows with the program instead of making the writer scroll inside a
   * box eight lines tall. On a wide screen the two panes stay level. */
  wireEditorHeight(): void {
    const narrow = matchMedia('(max-width: 819px)');
    const grow = (): void => {
      if (!narrow.matches) {
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
    this.editor.value = carried;
    this.compileNow();
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
    this.editor.value = this.files[id];
    this.terminal.textContent = '';
    this.slots.current = null;
    this.drawFiles();
    this.drawSlots();
    this.compileNow();
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
    this.editor.value = source;
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
    this.editor.value = slot.source;
    this.terminal.textContent = '';
    this.chips.querySelectorAll('.chip').forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
    this.writeSlots();
    this.drawSlots();
    this.compileNow();
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
  load(example: Example): void {
    clearTimeout(this.debounce);
    this.disarmOverwrites();
    if (this.activeFile !== 'example') {
      this.writeFiles();
      this.activeFile = 'example';
    }
    this.slots.current = null;
    this.editor.value = example.source;
    this.chips.querySelectorAll('.chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.textContent === example.label));
    });
    this.terminal.textContent = '';
    this.drawSlots();
    this.drawFiles();
    this.compileNow();
    this.writeFiles();
    if (this.grow) this.grow();
  }

  compileNow(): void {
    if (!this.compilerReady) {
      this.pythonState.textContent = TEXT.bootCompiler;
      return;
    }
    const outcome = readCompileOutcome(compile(this.editor.value));
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
      this.python.innerHTML = highlightPython(outcome.python);
      this.pythonState.textContent = TEXT.compiled;
      if (this.pythonNote) this.pythonNote.textContent = TEXT.compiledNote;
      this.runButton.disabled = this.running;
      if (this.alertText.textContent === TEXT.fixFirst) this.hideAlert();
    } else {
      this.compiled = '';
      this.python.dataset.state = 'error';
      this.python.textContent = outcome.diagnostic;
      this.pythonState.textContent = TEXT.errorLabel;
      // The subtitle said "what the compiler produced" next to a message that
      // says the opposite. One of them has to change with the state.
      if (this.pythonNote) this.pythonNote.textContent = TEXT.errorNote;
      this.runButton.disabled = true;
    }
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
      await init({ module_or_path: source });
    } catch (error) {
      this.hideProgress();
      this.note.textContent = '';
      this.showAlert(`${TEXT.compilerLate} (${String(error)})`, () => { void this.start(); });
      return;
    }
    this.compilerReady = true;
    this.compileNow();
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
   * screen, so `clear the screen` emits one. Here the "screen" is a <pre>:
   * honour the clear, and drop the rest rather than printing their letters. */
  print(text: string, className?: string): void {
    if (text.includes('\u001b')) {
      if (/\u001b\[[23]J/.test(text)) this.terminal.textContent = '';
      text = text.replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '');
      if (!text) return;
    }
    // One `if` on `className` rather than two: the old shape built the node
    // first and asked again afterwards, which no longer proves to the compiler
    // that a node means there is a class name to put on it.
    if (className) {
      const node = document.createElement('span');
      node.className = className;
      node.textContent = text;
      this.terminal.append(node);
    } else {
      this.terminal.append(document.createTextNode(text));
    }
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  run(): void {
    if (!this.compilerReady) {
      this.showAlert(TEXT.compilerLate, () => { void this.start(); });
      return;
    }
    if (!this.compiled) {
      this.showAlert(TEXT.fixFirst, null);
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
          this.run();
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
wireReveal();
wirePointerSheen();
wireBeam();
wireCopyButtons();
wireFileCopyButtons();
wireAiPrompts();
wireDocRail();
wireGuideFilter();

const playgroundRoot = queryMaybe(document, '#playground', HTMLElement);
if (playgroundRoot) {
  const playground = new Playground(playgroundRoot);
  void playground.start();
  window.addEventListener('hashchange', () => {
    if (playground.loadFromHash()) {
      playground.drawFiles();
      playground.compileNow();
    }
  });
}
