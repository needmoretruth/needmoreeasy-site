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
 *   in : {type:'run', python, sab?, answers?} | {type:'preload'}
 *   out: {type:'progress', loaded, total} | {type:'ready'} | {type:'out', text}
 *        | {type:'ask'} | {type:'done', ok, error?} | {type:'fatal', error}
 *
 * The control block, when present, is an Int32Array over `sab`:
 *   [0] 0 = the page has not answered yet, 1 = an answer is waiting
 *   [1] byte length of that answer
 * followed by the UTF-8 bytes of the answer itself.
 *
 * `nmeHost.sleep` is here for the same reason: NME's `wait 3 seconds` becomes
 * `time.sleep(3)`, which traps in this interpreter. A worker is allowed to
 * block, so the wait happens here.
 */

import init, { run } from './wasm-run/nmerun.js';
import { ENGINE_BYTES } from './engine-meta.js';

const DECODER = new TextDecoder();
const CONTROL_SLOTS = 2;
const BYTES_OFFSET = CONTROL_SLOTS * 4;

let control = null;
let answerBytes = null;
let queuedAnswers = [];
let ready = null;

// A private buffer to park on. `Atomics.wait` is the only way to block for a
// known length of time without spinning the CPU; when the page cannot give us
// shared memory we spin instead, which still only blocks this worker.
const SLEEP_LOCK = typeof SharedArrayBuffer === 'undefined'
  ? null
  : new Int32Array(new SharedArrayBuffer(4));

globalThis.nmeHost = {
  write(text) {
    postMessage({ type: 'out', text });
  },

  sleep(seconds) {
    const milliseconds = Math.min(Math.max(seconds * 1000, 0), 60_000);
    if (SLEEP_LOCK) {
      Atomics.wait(SLEEP_LOCK, 0, 0, milliseconds);
      return;
    }
    const until = Date.now() + milliseconds;
    while (Date.now() < until) { /* the worker is the only thread blocked */ }
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

/* The engine is the one big download on the site, so it is fetched by hand
 * rather than by `init()` alone: reading the body in chunks is the only way to
 * tell the page how far along it is. Cloudflare compresses the transfer, so
 * `content-length` would be the compressed size — the real uncompressed size
 * is stamped into `engine-meta.js` at build time and used instead. */
async function loadEngine() {
  const url = new URL('./wasm-run/nmerun_bg.wasm', import.meta.url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url.pathname}`);

  const total = ENGINE_BYTES || Number(response.headers.get('content-length')) || 0;
  let loaded = 0;
  postMessage({ type: 'progress', loaded: 0, total });

  const counted = response.body
    ? response.body.pipeThrough(new TransformStream({
        transform(chunk, controller) {
          loaded += chunk.byteLength;
          postMessage({ type: 'progress', loaded, total });
          controller.enqueue(chunk);
        },
      }))
    : null;

  const source = counted
    ? new Response(counted, { headers: { 'content-type': 'application/wasm' } })
    : response;
  await init({ module_or_path: source });
  postMessage({ type: 'progress', loaded: total, total });
}

async function ensureReady() {
  if (!ready) {
    ready = loadEngine().then(() => postMessage({ type: 'ready' }));
  }
  return ready;
}

self.onmessage = async (event) => {
  const message = event.data;
  if (message.type === 'preload') {
    ensureReady().catch((error) => postMessage({ type: 'fatal', error: String(error) }));
    return;
  }
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

// The page creates this worker while the visitor is still reading, so the
// engine download starts before Run is pressed rather than during it.
ensureReady().catch((error) => postMessage({ type: 'fatal', error: String(error) }));
