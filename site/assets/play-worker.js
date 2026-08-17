/* The playground's Python engine, kept off the main thread.
 *
 * Why a worker at all: `input()` is synchronous in Python, and a program with
 * an endless loop must stay killable. Both need a thread that is allowed to
 * block and to be terminated — that is a worker, not the page.
 *
 * Blocking input works through a SharedArrayBuffer: the worker parks on
 * `Atomics.wait` while the page collects a line, then reads the bytes the page
 * wrote. That requires the site to be cross-origin isolated (see `_headers`).
 * When it is not, the page instead hands over the answers up front and this
 * file serves them from a queue, so the playground still runs.
 *
 * Protocol
 *   in : {type:'run', python, sab?, answers?}
 *   out: {type:'ready'} | {type:'out', text} | {type:'ask'}
 *        | {type:'done', ok, error?} | {type:'fatal', error}
 *
 * The control block, when present, is an Int32Array over `sab`:
 *   [0] 0 = the page has not answered yet, 1 = an answer is waiting
 *   [1] byte length of that answer
 * followed by the UTF-8 bytes of the answer itself.
 */

import init, { run } from './wasm-run/nmerun.js';

const DECODER = new TextDecoder();
const CONTROL_SLOTS = 2;
const BYTES_OFFSET = CONTROL_SLOTS * 4;

let control = null;
let answerBytes = null;
let queuedAnswers = [];
let ready = null;

globalThis.nmeHost = {
  write(text) {
    postMessage({ type: 'out', text });
  },

  readLine(prompt) {
    if (prompt) postMessage({ type: 'out', text: prompt });

    if (!control) {
      // No shared memory: use the answers the page supplied before running.
      // Running out of them is reported rather than silently returning "".
      if (queuedAnswers.length === 0) {
        postMessage({ type: 'out', text: '\n' });
        return '';
      }
      const answer = queuedAnswers.shift();
      postMessage({ type: 'out', text: answer + '\n' });
      return answer;
    }

    Atomics.store(control, 0, 0);
    Atomics.store(control, 1, 0);
    postMessage({ type: 'ask' });
    Atomics.wait(control, 0, 0);

    const length = Atomics.load(control, 1);
    // TextDecoder refuses views backed by shared memory, so copy out first.
    return DECODER.decode(new Uint8Array(answerBytes.subarray(0, length)));
  },
};

async function ensureReady() {
  if (!ready) {
    ready = init().then(() => postMessage({ type: 'ready' }));
  }
  return ready;
}

self.onmessage = async (event) => {
  const message = event.data;
  if (message.type !== 'run') return;

  if (message.sab) {
    control = new Int32Array(message.sab, 0, CONTROL_SLOTS);
    answerBytes = new Uint8Array(message.sab, BYTES_OFFSET);
  } else {
    control = null;
    answerBytes = null;
    queuedAnswers = message.answers ? message.answers.slice() : [];
  }

  try {
    await ensureReady();
  } catch (error) {
    postMessage({ type: 'fatal', error: String(error) });
    return;
  }

  try {
    const outcome = JSON.parse(run(message.python));
    postMessage({ type: 'done', ok: outcome.ok, error: outcome.error });
  } catch (error) {
    // A trap inside the interpreter (out of memory, stack exhaustion) lands
    // here. Say so plainly instead of leaving the page waiting forever.
    postMessage({ type: 'fatal', error: String(error) });
  }
};

// Start fetching the engine as soon as the worker exists, so the first Run
// does not also pay for the download.
ensureReady().catch((error) => postMessage({ type: 'fatal', error: String(error) }));
