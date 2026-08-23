/* The NME compiler, kept off the main thread.
 *
 * Why this file exists: compiling is not fast. A 4,337-line program — the
 * largest example the site offers — takes about 3.9 seconds in this browser,
 * and it used to take that on the page's own thread. One keystroke froze the
 * whole tab: no caret, no scrolling, no repaint, and the next keystrokes piled
 * up behind it. On a phone it was worse. Moving the call in here does not make
 * it faster, but the page stays alive while it runs, which is the difference
 * between "slow" and "broken".
 *
 * Protocol
 *   in : {type:'start', module}                    the compiled WebAssembly
 *        {type:'compile', id, source}
 *        {type:'tidy', id, source, level, language}
 *   out: {type:'ready'}
 *        {type:'done', id, json}                   whatever the compiler said
 *        {type:'fatal', error}
 *
 * The page hands over an already-compiled `WebAssembly.Module` rather than a
 * URL or bytes. It downloads the 2 MB itself so it can draw a progress bar and
 * check the size, and compiling those bytes to a module costs about 5 ms —
 * which is what makes it cheap to throw this worker away and start another.
 * The page does exactly that when you type while a compile is still running:
 * there is no way to interrupt a call into WebAssembly, so the only way to
 * stop working on text nobody is waiting for any more is to end the thread it
 * is running on. Instantiating a module that is already compiled is under a
 * millisecond, so a superseded compile costs a worker, not a download.
 *
 * This is the source. `scripts/build-scripts.mjs` type-checks it against the
 * worker's own libraries — there is no `document` in here — and compiles it to
 * `site/assets/compile-worker.js`.
 */

import init, { compile, tidy } from './wasm/nme.js';

interface StartAsk {
  readonly type: 'start';
  readonly module: WebAssembly.Module;
}
interface WorkAsk {
  readonly type: 'compile' | 'tidy';
  readonly id: number;
  readonly source: string;
  readonly level: string;
  readonly language: string;
}

/* This crosses a thread boundary, so what arrives is `unknown` and is checked
 * rather than trusted — the same rule the Python engine's worker follows. */
function readAsk(raw: unknown): StartAsk | WorkAsk | null {
  if (typeof raw !== 'object' || raw === null || !('type' in raw)) return null;
  const { type } = raw;
  if (type === 'start') {
    if (!('module' in raw) || !(raw.module instanceof WebAssembly.Module)) return null;
    return { type: 'start', module: raw.module };
  }
  if (type !== 'compile' && type !== 'tidy') return null;
  if (!('id' in raw) || typeof raw.id !== 'number') return null;
  if (!('source' in raw) || typeof raw.source !== 'string') return null;
  const level = 'level' in raw && typeof raw.level === 'string' ? raw.level : '';
  const language = 'language' in raw && typeof raw.language === 'string' ? raw.language : '';
  return { type, id: raw.id, source: raw.source, level, language };
}

/* A message that arrives before `start` has finished waits here rather than
 * being answered with an error. The page sends `start` first, but the two can
 * cross when a worker is replaced in the middle of a keystroke. */
let ready: Promise<void> | null = null;
const waiting: WorkAsk[] = [];

function serve(ask: WorkAsk): void {
  const json = ask.type === 'compile'
    ? compile(ask.source)
    : tidy(ask.source, ask.level, ask.language);
  postMessage({ type: 'done', id: ask.id, json });
}

self.onmessage = (event: MessageEvent<unknown>): void => {
  const ask = readAsk(event.data);
  if (ask === null) return;
  if (ask.type === 'start') {
    if (ready !== null) return;
    ready = init({ module_or_path: ask.module })
      .then(() => {
        postMessage({ type: 'ready' });
        for (const held of waiting.splice(0)) serve(held);
      })
      .catch((error: unknown) => {
        postMessage({ type: 'fatal', error: String(error) });
      });
    return;
  }
  if (ready === null) {
    waiting.push(ask);
    return;
  }
  void ready.then(() => serve(ask));
};
