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
 *        | {type:'ask'} | {type:'done', ok, error?, values} | {type:'fatal', error}
 *
 * The control block, when present, is an Int32Array over `sab`:
 *   [0] 0 = the page has not answered yet, 1 = an answer is waiting
 *   [1] byte length of that answer
 * followed by the UTF-8 bytes of the answer itself.
 *
 * `nmeHost.sleep` is here for the same reason: NME's `wait 3 seconds` becomes
 * `time.sleep(3)`, which traps in this interpreter. A worker is allowed to
 * block, so the wait happens here.
 *
 * This is the source. `scripts/build-scripts.mjs` type-checks it against the
 * worker's own libraries — there is no `document` in here — and compiles it to
 * `site/assets/play-worker.js`, which is the module worker the page starts.
 */

import init, { run } from './wasm-run/nmerun.js';
import { ENGINE_BYTES } from './engine-meta.js';

/* What the WebAssembly module calls back into. The three names and their
 * signatures are fixed by `crates/nme-run/src/lib.rs`, which imports them with
 * `#[wasm_bindgen(js_namespace = nmeHost)]`; `read_line` is handed a string
 * there in every case, because the Python side does `str(prompt)` first. */
interface NmeHost {
  write(text: string): void;
  sleep(seconds: number): void;
  readLine(prompt: string): string;
}

declare global {
  var nmeHost: NmeHost;
}

const DECODER = new TextDecoder();
const CONTROL_SLOTS = 2;
const BYTES_OFFSET = CONTROL_SLOTS * 4;

let control: Int32Array | null = null;
let answerBytes: Uint8Array | null = null;
let queuedAnswers: string[] = [];
let ready: Promise<void> | null = null;

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

    const waiting = control;
    const bytes = answerBytes;
    if (!waiting || !bytes) {
      // No shared memory: use the answers the page supplied before running.
      // Running out of them is reported rather than silently returning "".
      const answer = queuedAnswers.shift();
      if (answer === undefined) {
        postMessage({ type: 'out', text: '\n' });
        return '';
      }
      postMessage({ type: 'out', text: answer + '\n' });
      return answer;
    }

    Atomics.store(waiting, 0, 0);
    Atomics.store(waiting, 1, 0);
    postMessage({ type: 'ask' });
    Atomics.wait(waiting, 0, 0);

    const length = Atomics.load(waiting, 1);
    // TextDecoder refuses views backed by shared memory, so copy out first.
    return DECODER.decode(new Uint8Array(bytes.subarray(0, length)));
  },
};

/* The engine is the one big download on the site, so it is fetched by hand
 * rather than by `init()` alone: reading the body in chunks is the only way to
 * tell the page how far along it is. Cloudflare compresses the transfer, so
 * `content-length` would be the compressed size — the real uncompressed size
 * is stamped into `engine-meta.js` at build time and used instead. */
async function loadEngine(): Promise<void> {
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

async function ensureReady(): Promise<void> {
  if (!ready) {
    ready = loadEngine().then(() => postMessage({ type: 'ready' }));
  }
  return ready;
}

/* What the page sends in. Reading it field by field is what keeps this file
 * free of type assertions: the message arrives as `unknown`, and a message
 * that is not one of these two is ignored, exactly as before. */
type HostMessage =
  | { readonly type: 'preload' }
  | { readonly type: 'run'; readonly python: string; readonly sab: SharedArrayBuffer | null; readonly answers: string[] | null };

function readHostMessage(data: unknown): HostMessage | null {
  if (typeof data !== 'object' || data === null || !('type' in data)) return null;
  if (data.type === 'preload') return { type: 'preload' };
  if (data.type !== 'run') return null;
  const python = 'python' in data ? data.python : undefined;
  if (typeof python !== 'string') return null;

  const offered = 'sab' in data ? data.sab : undefined;
  const sab = typeof SharedArrayBuffer !== 'undefined' && offered instanceof SharedArrayBuffer
    ? offered
    : null;

  const listed: unknown = 'answers' in data ? data.answers : undefined;
  const answers = Array.isArray(listed)
    ? listed.filter((one: unknown): one is string => typeof one === 'string')
    : null;

  return { type: 'run', python, sab, answers };
}

/* The engine answers in JSON, the same way the compiler does: `{ok}` on a
 * clean finish, `{ok, error}` when the program raised. */
interface NameValue {
  readonly name: string;
  readonly shown: string;
}

interface RunOutcome {
  readonly ok: boolean;
  readonly error: string | undefined;
  readonly values: NameValue[];
}

function readRunOutcome(json: string): RunOutcome {
  const raw: unknown = JSON.parse(json);
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: json, values: [] };
  const ok = 'ok' in raw && raw.ok === true;
  const error = 'error' in raw && typeof raw.error === 'string' ? raw.error : undefined;
  return { ok, error, values: readValues(raw) };
}

/* What the program's own names held when it stopped. The engine sends them as
 * `{name, shown}` pairs; anything else in that field is ignored rather than
 * trusted, because this crosses a language boundary. */
function readValues(raw: object): NameValue[] {
  if (!('values' in raw) || !Array.isArray(raw.values)) return [];
  const out: NameValue[] = [];
  for (const item of raw.values) {
    if (typeof item !== 'object' || item === null) continue;
    if (!('name' in item) || !('shown' in item)) continue;
    const { name, shown } = item;
    if (typeof name === 'string' && typeof shown === 'string') out.push({ name, shown });
  }
  return out;
}

self.onmessage = async (event: MessageEvent<unknown>) => {
  const message = readHostMessage(event.data);
  if (!message) return;
  if (message.type === 'preload') {
    ensureReady().catch((error: unknown) => postMessage({ type: 'fatal', error: String(error) }));
    return;
  }

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
    const outcome = readRunOutcome(run(message.python));
    postMessage({ type: 'done', ok: outcome.ok, error: outcome.error, values: outcome.values });
  } catch (error) {
    // A trap inside the interpreter (out of memory, stack exhaustion) lands
    // here. Say so plainly instead of leaving the page waiting forever.
    postMessage({ type: 'fatal', error: String(error) });
  }
};

// The page creates this worker while the visitor is still reading, so the
// engine download starts before Run is pressed rather than during it.
ensureReady().catch((error: unknown) => postMessage({ type: 'fatal', error: String(error) }));
