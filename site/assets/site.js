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
 */

import init, { compile } from './wasm/nme.js';
import { EXAMPLES } from './examples.js';
import { COMPILER_BYTES } from './engine-meta.js';

const LANG = document.documentElement.lang === 'ko' ? 'ko' : 'en';
const STORE_KEY = 'nme-lang';

const TEXT = {
  en: {
    compiled: 'Python',
    errorLabel: 'what the compiler says',
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
    slotSaved: 'saved',
    slotName: 'Name for this slot',
    slotFirst: 'My program',
    slotDelete: 'delete for good?',
    slotSave: 'Save',
    slotCancel: 'Cancel',
    rename: 'rename',
    remove: 'delete',
    untitled: 'untitled',
  },
  ko: {
    compiled: 'Python',
    errorLabel: '컴파일러가 알려주는 내용',
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
    slotSaved: '저장했습니다',
    slotName: '이 슬롯의 이름',
    slotFirst: '내 프로그램',
    slotDelete: '정말 지울까요?',
    slotSave: '저장',
    slotCancel: '취소',
    rename: '이름 바꾸기',
    remove: '지우기',
    untitled: '이름 없음',
  },
}[LANG];

/* --- language routing ---------------------------------------------------- */

function rememberLanguageChoice() {
  document.querySelectorAll('[data-lang-choice]').forEach((link) => {
    link.addEventListener('click', () => {
      try {
        localStorage.setItem(STORE_KEY, link.dataset.langChoice);
      } catch {
        /* private mode: the choice simply is not remembered */
      }
    });
  });
}

/* The English page is the site's front door, so it is the only page that ever
 * forwards. It forwards once, only for a visitor whose browser asks for Korean
 * and who has never chosen a language here. Anyone who clicks "EN" stays. */
function forwardKoreanSpeakersOnce() {
  if (LANG !== 'en') return;
  let stored = null;
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
function wireTheme() {
  const buttons = [...document.querySelectorAll('[data-theme-choice]')];
  if (!buttons.length) return;

  const current = () => {
    const attribute = document.documentElement.getAttribute('data-theme');
    return attribute === 'dark' || attribute === 'light' ? attribute : 'system';
  };
  const paint = () => {
    const now = current();
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === now));
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const choice = button.dataset.themeChoice;
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
function wireReveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.hero-text, .hero-figure, .play-head, .card, .split > div, .links li, .prompt-card, .notice');
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
}

/* The header is part of the page until the page moves under it. */
function wireHeaderEdge() {
  const head = document.querySelector('.site-head');
  if (!head) return;
  const sync = () => head.setAttribute('data-scrolled', String(window.scrollY > 8));
  sync();
  addEventListener('scroll', sync, { passive: true });
}

/* The grid behind the glass is almost invisible until light falls on it. The
 * pointer is that light: a soft circle where the structure shows through.
 * It is one element and one custom property, and phones never get it because
 * there is no pointer to follow. */
function wireBeam() {
  const stage = document.querySelector('.stage');
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
function wirePointerSheen() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  for (const panel of document.querySelectorAll('.hero-figure, .card, .prompt-card')) {
    panel.addEventListener('pointermove', (event) => {
      const box = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${event.clientX - box.left}px`);
      panel.style.setProperty('--my', `${event.clientY - box.top}px`);
    });
  }
}

/* The hero says "you write this, it becomes that". Revealing the second block
 * a beat after the first makes the page say it too, once, on arrival. */
function wireHeroLines() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const blocks = document.querySelectorAll('.hero-figure pre.code');
  if (blocks.length !== 2) return;

  blocks.forEach((block, blockIndex) => {
    const lines = block.textContent.replace(/\n$/, '').split('\n');
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
function downloadText(filename, text) {
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

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* --- copy buttons -------------------------------------------------------- */

function wireCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copy);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.innerText);
        const original = button.textContent;
        button.textContent = TEXT.copied;
        setTimeout(() => { button.textContent = original; }, 1400);
      } catch {
        /* clipboard blocked — the text is on screen and selectable anyway */
      }
    });
  });
}

/* A prompt is thousands of words long, so it is copied from the file rather
 * than from anything on screen: one press, whole document, no scrolling. */
function wireFileCopyButtons() {
  const label = LANG === 'ko' ? '복사했습니다' : 'copied';
  const failed = LANG === 'ko' ? '복사하지 못했습니다' : 'copy failed';
  document.querySelectorAll('[data-copy-file]').forEach((button) => {
    button.addEventListener('click', async () => {
      const original = button.textContent;
      try {
        const response = await fetch(button.dataset.copyFile);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await navigator.clipboard.writeText(await response.text());
        button.textContent = label;
      } catch {
        button.textContent = failed;
      }
      setTimeout(() => { button.textContent = original; }, 1600);
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

function escapeHtml(text) {
  return text.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
}

/* Deliberately small: strings, comments, numbers, keywords. Anything cleverer
 * would need a real Python lexer, and this pane is for reading, not editing. */
function highlightPython(source) {
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
function wireDocRail() {
  const rail = document.querySelector('.doc-rail');
  if (!rail) return;
  const wide = matchMedia('(min-width: 900px)');
  const sync = () => { rail.open = wide.matches; };
  sync();
  wide.addEventListener('change', sync);

  // Bring the current guide into view inside the rail only. `scrollIntoView`
  // would move the page itself, dropping the reader below the title.
  const current = rail.querySelector('[aria-current="page"]');
  if (current && rail.scrollHeight > rail.clientHeight) {
    rail.scrollTop = current.offsetTop - rail.clientHeight / 2;
  }
}

/* Eighty-five guides is too many to scroll through on a phone, so the list
 * filters as you type. Filtering happens over text the page already carries;
 * nothing is fetched. */
function wireGuideFilter() {
  const input = document.querySelector('#guide-filter');
  const list = document.querySelector('#guide-list');
  const count = document.querySelector('#guide-count');
  if (!input || !list) return;
  const items = [...list.children];
  const template = count ? count.textContent.replace(/\d+/, '%d') : '';

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

/* `init()` would happily fetch the WebAssembly itself, but then nobody can say
 * how far along it is. Reading the body in chunks costs nothing and turns a
 * blank wait into a progress bar. `expected` is the uncompressed size stamped
 * in at build time, because `content-length` describes the compressed bytes. */
async function fetchWithProgress(url, expected, onProgress) {
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

/* --- the playground ------------------------------------------------------ */

const ANSWER_CAPACITY = 4096;
const SLOT_KEY = 'nme-slots-v1';
const DRAFT_KEY = 'nme-draft-v1';

class Playground {
  constructor(root) {
    this.editor = root.querySelector('#editor');
    this.python = root.querySelector('#python');
    this.pythonState = root.querySelector('#python-state');
    this.terminal = root.querySelector('#terminal');
    this.runButton = root.querySelector('#run');
    this.stopButton = root.querySelector('#stop');
    this.chips = root.querySelector('#examples');
    this.inputRow = root.querySelector('#input-row');
    this.input = root.querySelector('#term-input');
    this.sendButton = root.querySelector('#send');
    this.note = root.querySelector('#engine-note');
    this.answersWrap = root.querySelector('#answers-wrap');
    this.answers = root.querySelector('#answers');
    this.dot = root.querySelector('#engine-dot');
    this.panes = root.querySelector('.panes');
    this.tabs = [...root.querySelectorAll('.play-tabs [data-view]')];
    this.slotList = root.querySelector('#slot-list');
    this.slotFlash = root.querySelector('#slot-flash');
    this.progress = root.querySelector('#boot-progress');
    this.progressFill = this.progress.querySelector('i');
    this.alert = root.querySelector('#boot-alert');
    this.alertText = this.alert.querySelector('p');
    this.retryButton = root.querySelector('#boot-retry');

    this.worker = null;
    this.compiled = '';
    this.debounce = 0;
    this.compilerReady = false;
    this.engineReady = false;
    this.pendingRun = false;
    this.running = false;
    this.sharedMemory = this.makeSharedMemory();

    this.slots = this.readSlots();

    this.buildChips();
    this.wire();
    this.drawSlots();
    this.runButton.disabled = true;
    this.setStatus('busy');
    // What the visitor last had on screen outranks the tour, and a link that
    // carries a program outranks both.
    if (!this.loadFromHash() && !this.restoreDraft()) this.load(EXAMPLES[LANG][0]);
  }

  /* A guide links here with the program it is teaching in the URL, so a
   * reader on a phone can run the example without retyping it. */
  loadFromHash() {
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
    if (!carried) return false;
    try {
      const base64 = carried[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
      this.editor.value = new TextDecoder().decode(bytes);
      this.terminal.textContent = '';
      return true;
    } catch {
      return false;
    }
  }

  /* One dot, three states, and they are the only colours the page spends:
   * green it can run, yellow something is still arriving, red it failed. */
  setStatus(state) {
    if (this.dot) this.dot.dataset.state = state;
  }

  setProgress(loaded, total) {
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

  hideProgress() {
    this.progress.hidden = true;
    this.progress.removeAttribute('aria-valuenow');
  }

  /* Every failure a visitor can hit here is a failed download, so the notice
   * always carries the one action that can fix it. */
  showAlert(text, retry) {
    this.setStatus('bad');
    this.alertText.textContent = text;
    this.alert.hidden = false;
    this.retryButton.hidden = !retry;
    this.retryAction = retry || null;
  }

  hideAlert() {
    this.alert.hidden = true;
    this.retryAction = null;
  }

  /* SharedArrayBuffer exists only on a cross-origin-isolated page. When it is
   * missing the playground degrades to answers-in-advance rather than
   * pretending the Run button is broken. */
  makeSharedMemory() {
    if (typeof SharedArrayBuffer === 'undefined' || !self.crossOriginIsolated) {
      if (this.answersWrap) {
        this.answersWrap.hidden = false;
        const message = this.answersWrap.querySelector('[data-no-shared-memory]');
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

  buildChips() {
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

  wire() {
    this.editor.addEventListener('input', () => {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.compileNow();
        this.saveDraft();
      }, 180);
    });

    // On a phone the two code panes become two tabs over one panel.
    for (const tab of this.tabs) {
      tab.addEventListener('click', () => {
        this.panes.dataset.view = tab.dataset.view;
        this.tabs.forEach((other) => {
          other.setAttribute('aria-selected', String(other === tab));
        });
      });
    }

    this.wireTools();
    this.wireSlots();
    this.runButton.addEventListener('click', () => this.run());
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

  /* --- taking the code away --------------------------------------------- */

  wireTools() {
    const flash = async (button, ok) => {
      const original = button.textContent;
      button.textContent = ok ? TEXT.copied : original;
      setTimeout(() => { button.textContent = original; }, 1400);
    };
    const on = (selector, act) => {
      const button = document.querySelector(selector);
      if (button) button.addEventListener('click', () => act(button));
    };

    on('[data-copy-editor]', async (button) => flash(button, await copyText(this.editor.value)));
    on('[data-copy-python]', async (button) => flash(button, await copyText(this.compiled || this.python.textContent)));
    on('[data-download-editor]', () => downloadText(`${this.fileStem()}.nme`, this.editor.value));
    on('[data-download-python]', () => {
      if (this.compiled) downloadText(`${this.fileStem()}.py`, this.compiled);
    });
  }

  /* Named after the slot when there is one, so a folder of downloads still
   * says which program is which. */
  fileStem() {
    const slot = this.slots.list.find((one) => one.id === this.slots.current);
    const name = (slot ? slot.name : 'program').trim().replace(/[\\/:*?"<>|\s]+/g, '-');
    return name.slice(0, 48) || 'program';
  }

  /* --- save slots -------------------------------------------------------- */

  readSlots() {
    try {
      const raw = JSON.parse(localStorage.getItem(SLOT_KEY) || 'null');
      if (raw && Array.isArray(raw.list)) {
        return { list: raw.list.filter((one) => one && typeof one.source === 'string'), current: raw.current ?? null };
      }
    } catch {
      /* unreadable or blocked storage behaves like an empty shelf */
    }
    return { list: [], current: null };
  }

  writeSlots() {
    try {
      localStorage.setItem(SLOT_KEY, JSON.stringify(this.slots));
    } catch {
      /* full or private storage: the slots live for this page only */
    }
  }

  saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, this.editor.value);
    } catch {
      /* nothing to do: the text is still on screen */
    }
  }

  restoreDraft() {
    let draft = null;
    try {
      draft = localStorage.getItem(DRAFT_KEY);
    } catch {
      return false;
    }
    if (!draft) return false;
    this.editor.value = draft;
    this.compileNow();
    return true;
  }

  drawSlots() {
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

  wireSlots() {
    const save = document.querySelector('#slot-save');
    const fresh = document.querySelector('#slot-new');
    if (save) save.addEventListener('click', () => this.saveIntoSlot());
    if (fresh) fresh.addEventListener('click', () => this.saveIntoSlot(true));
    this.buildNameRow();
  }

  /* The name is asked for inside the page rather than in a browser dialog:
   * one look, one place, and it can be styled like everything else here. */
  buildNameRow() {
    const box = document.querySelector('.slots');
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

  askName(suggested, done) {
    if (!this.nameRow) { done(suggested); return; }
    this.naming = done;
    this.nameField.value = suggested;
    this.nameRow.hidden = false;
    this.nameField.focus();
    this.nameField.select();
  }

  saveIntoSlot(forceNew) {
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
      const slot = { id: `s${Date.now().toString(36)}`, name, source: this.editor.value, updated: Date.now() };
      this.slots.list.push(slot);
      this.slots.current = slot.id;
      this.writeSlots();
      this.drawSlots();
      this.flashSaved();
    });
  }

  openSlot(id) {
    const slot = this.slots.list.find((one) => one.id === id);
    if (!slot) return;
    this.slots.current = id;
    this.editor.value = slot.source;
    this.terminal.textContent = '';
    this.chips.querySelectorAll('.chip').forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
    this.writeSlots();
    this.drawSlots();
    this.compileNow();
    this.saveDraft();
  }

  renameSlot(id) {
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
  deleteSlot(id, button) {
    if (button.dataset.sure !== 'true') {
      button.dataset.sure = 'true';
      button.textContent = TEXT.slotDelete;
      clearTimeout(button.timer);
      button.timer = setTimeout(() => {
        button.dataset.sure = 'false';
        button.textContent = '×';
      }, 4000);
      return;
    }
    this.slots.list = this.slots.list.filter((one) => one.id !== id);
    if (this.slots.current === id) this.slots.current = null;
    this.writeSlots();
    this.drawSlots();
  }

  flashSaved() {
    if (!this.slotFlash) return;
    this.slotFlash.textContent = TEXT.slotSaved;
    this.slotFlash.dataset.on = 'true';
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => { this.slotFlash.dataset.on = 'false'; }, 1600);
  }

  load(example) {
    this.slots.current = null;
    this.editor.value = example.source;
    this.chips.querySelectorAll('.chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.textContent === example.label));
    });
    this.terminal.textContent = '';
    this.drawSlots();
    this.compileNow();
    this.saveDraft();
  }

  compileNow() {
    if (!this.compilerReady) {
      this.pythonState.textContent = TEXT.bootCompiler;
      return;
    }
    const outcome = JSON.parse(compile(this.editor.value));
    if (outcome.ok) {
      this.compiled = outcome.python;
      this.python.dataset.state = 'ok';
      this.python.innerHTML = highlightPython(outcome.python);
      this.pythonState.textContent = TEXT.compiled;
      this.runButton.disabled = this.running;
      if (this.alertText.textContent === TEXT.fixFirst) this.hideAlert();
    } else {
      this.compiled = '';
      this.python.dataset.state = 'error';
      this.python.textContent = outcome.diagnostic;
      this.pythonState.textContent = TEXT.errorLabel;
      this.runButton.disabled = true;
    }
  }

  /* Boot happens in two visible stages: the compiler (small, needed to show
   * any Python at all) and then the engine (large, needed only to press Run).
   * Neither is allowed to fail quietly. */
  async start() {
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
      this.showAlert(`${TEXT.compilerLate} (${error})`, () => this.start());
      return;
    }
    this.compilerReady = true;
    this.compileNow();
    this.startEngine();
  }

  startEngine() {
    this.note.textContent = TEXT.bootEngine;
    this.setProgress(0, 0);
    this.ensureWorker().postMessage({ type: 'preload' });
  }

  /* One worker serves every run: each `run` call builds a fresh interpreter
   * inside it, so nothing carries over, and the 11 MB engine is instantiated
   * once instead of once per press. */
  ensureWorker() {
    if (!this.worker) {
      this.worker = new Worker('/assets/play-worker.js', { type: 'module' });
      this.worker.onmessage = (event) => this.onWorkerMessage(event.data);
      this.worker.onerror = (event) => {
        this.engineReady = false;
        this.hideProgress();
        this.showAlert(`${TEXT.engineLate} (${event.message || event})`, () => {
          this.dropWorker();
          this.startEngine();
        });
        if (this.running) this.finish(TEXT.failed);
      };
    }
    return this.worker;
  }

  dropWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.engineReady = false;
  }

  print(text, className) {
    const node = className ? document.createElement('span') : null;
    if (node) {
      node.className = className;
      node.textContent = text;
      this.terminal.append(node);
    } else {
      this.terminal.append(document.createTextNode(text));
    }
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  run() {
    if (!this.compilerReady) {
      this.showAlert(TEXT.compilerLate, () => this.start());
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
    this.runButton.disabled = true;
    this.stopButton.disabled = false;

    this.ensureWorker().postMessage({
      type: 'run',
      python: this.compiled,
      sab: this.sharedMemory ? this.sharedMemory.buffer : undefined,
      answers: this.sharedMemory ? undefined : this.collectAnswers(),
    });
  }

  collectAnswers() {
    if (!this.answers) return [];
    return this.answers.value.split('\n').filter((line, index, all) =>
      index < all.length - 1 || line.length > 0);
  }

  onWorkerMessage(message) {
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
        if (message.error) this.print('\n' + message.error, 'term-error');
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
        this.print('\n' + message.error + '\n', 'term-error');
        this.finish(TEXT.failed);
        break;
      default:
        break;
    }
  }

  askForInput() {
    this.inputRow.hidden = false;
    this.note.textContent = TEXT.askHint;
    this.input.value = '';
    this.input.focus();
  }

  answer() {
    if (this.inputRow.hidden || !this.sharedMemory) return;
    const text = this.input.value;
    this.print(text + '\n', 'term-echo');
    this.inputRow.hidden = true;
    this.note.textContent = TEXT.running;

    const encoded = new TextEncoder().encode(text);
    const length = Math.min(encoded.length, ANSWER_CAPACITY);
    this.sharedMemory.bytes.set(encoded.subarray(0, length));
    Atomics.store(this.sharedMemory.control, 1, length);
    Atomics.store(this.sharedMemory.control, 0, 1);
    Atomics.notify(this.sharedMemory.control, 0);
  }

  finish(note) {
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
  stop(announce) {
    this.pendingRun = false;
    this.dropWorker();
    if (announce) {
      this.print('\n' + TEXT.stoppedByYou + '\n', 'term-meta');
      this.finish(TEXT.stopped);
    }
    this.startEngine();
  }
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
wireDocRail();
wireGuideFilter();

const playgroundRoot = document.querySelector('#playground');
if (playgroundRoot) {
  const playground = new Playground(playgroundRoot);
  playground.start();
  window.addEventListener('hashchange', () => playground.loadFromHash());
}
