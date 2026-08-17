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

const LANG = document.documentElement.lang === 'ko' ? 'ko' : 'en';
const STORE_KEY = 'nme-lang';

const TEXT = {
  en: {
    compiling: 'compiling…',
    compiled: 'Python',
    errorLabel: 'what the compiler says',
    engineLoading: 'loading the Python engine (about 6 MB, once)…',
    engineReady: 'Python engine ready',
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
  },
  ko: {
    compiling: '변환 중…',
    compiled: 'Python',
    errorLabel: '컴파일러가 알려주는 내용',
    engineLoading: '파이썬 실행기를 내려받는 중입니다(약 6MB, 처음 한 번)…',
    engineReady: '파이썬 실행기 준비 완료',
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

/* --- the playground ------------------------------------------------------ */

const ANSWER_CAPACITY = 4096;

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

    this.worker = null;
    this.compiled = '';
    this.debounce = 0;
    this.sharedMemory = this.makeSharedMemory();

    this.buildChips();
    this.wire();
    this.load(EXAMPLES[LANG][0]);
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
      this.debounce = setTimeout(() => this.compileNow(), 180);
    });
    this.runButton.addEventListener('click', () => this.run());
    this.stopButton.addEventListener('click', () => this.stop(true));
    this.sendButton.addEventListener('click', () => this.answer());
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.answer();
      }
    });
  }

  load(example) {
    this.editor.value = example.source;
    this.chips.querySelectorAll('.chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.textContent === example.label));
    });
    this.terminal.textContent = '';
    this.compileNow();
  }

  compileNow() {
    if (!this.ready) return;
    const outcome = JSON.parse(compile(this.editor.value));
    if (outcome.ok) {
      this.compiled = outcome.python;
      this.python.dataset.state = 'ok';
      this.python.innerHTML = highlightPython(outcome.python);
      this.pythonState.textContent = TEXT.compiled;
      this.runButton.disabled = false;
    } else {
      this.compiled = '';
      this.python.dataset.state = 'error';
      this.python.textContent = outcome.diagnostic;
      this.pythonState.textContent = TEXT.errorLabel;
      this.runButton.disabled = true;
    }
  }

  async start() {
    await init();
    this.ready = true;
    this.compileNow();
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
    if (!this.compiled) {
      this.print(TEXT.fixFirst + '\n', 'term-error');
      return;
    }
    this.stop(false);
    this.terminal.textContent = '';
    this.note.textContent = TEXT.running;
    this.runButton.disabled = true;
    this.stopButton.disabled = false;

    this.worker = new Worker('/assets/play-worker.js', { type: 'module' });
    this.worker.onmessage = (event) => this.onWorkerMessage(event.data);
    this.worker.onerror = (event) => {
      this.print('\n' + String(event.message || event) + '\n', 'term-error');
      this.finish(TEXT.failed);
    };
    this.worker.postMessage({
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
      case 'ready':
        if (this.note.textContent === TEXT.engineLoading) this.note.textContent = TEXT.running;
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
    this.inputRow.hidden = true;
    this.runButton.disabled = false;
    this.stopButton.disabled = true;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  stop(announce) {
    if (!this.worker) return;
    this.worker.terminate();
    this.worker = null;
    if (announce) {
      this.print('\n' + TEXT.stoppedByYou + '\n', 'term-meta');
      this.finish(TEXT.stopped);
    }
  }
}

/* --- boot ---------------------------------------------------------------- */

forwardKoreanSpeakersOnce();
rememberLanguageChoice();
wireCopyButtons();

const playgroundRoot = document.querySelector('#playground');
if (playgroundRoot) {
  const playground = new Playground(playgroundRoot);
  playground.note.textContent = TEXT.compiling;
  playground.start().then(
    () => { playground.note.textContent = ''; },
    (error) => { playground.note.textContent = String(error); },
  );
}
