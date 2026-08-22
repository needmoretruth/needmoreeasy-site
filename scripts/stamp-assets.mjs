/* Writes `site/assets/engine-meta.js`: the exact byte size of the two
 * WebAssembly files, and which commit of the language the compiler was built
 * from.
 *
 * The sizes are for a truthful progress bar — the browser only sees the
 * compressed `content-length`, which would make the bar finish at about a
 * quarter of the download.
 *
 * The commit is so that the page can say what it is actually running. A
 * version number is written by hand and can say anything: on 2026-08-22 the
 * footer said 0.7.1 while the compiler on the page was three fixes behind it,
 * and nothing on the page could have told a reader that. The commit is taken
 * from the pin, so it cannot drift.
 *
 * Run this after building either wasm crate.
 */

import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const ENGINE = join(ROOT, 'site/assets/wasm-run/nmerun_bg.wasm');
const COMPILER = join(ROOT, 'site/assets/wasm/nme_bg.wasm');
const OUT = join(ROOT, 'site/assets/engine-meta.js');

const engine = statSync(ENGINE).size;
const compiler = statSync(COMPILER).size;

const pin = /rev = "([0-9a-f]{40})"/.exec(
  readFileSync(join(ROOT, 'crates/nme-web/Cargo.toml'), 'utf8'),
)?.[1];
if (!pin) throw new Error('crates/nme-web/Cargo.toml에서 고정한 커밋을 찾지 못했습니다');

/* The hash of what actually shipped, so that two people comparing what they
 * are running have something exact to compare. */
const digest = createHash('sha256').update(readFileSync(COMPILER)).digest('hex');

writeFileSync(OUT, `/* Written by scripts/stamp-assets.mjs — do not edit by hand. */

export const ENGINE_BYTES = ${engine};
export const COMPILER_BYTES = ${compiler};
export const COMPILER_COMMIT = '${pin}';
export const COMPILER_SHA256 = '${digest}';
`);

console.log(`stamp-assets: engine ${(engine / 1e6).toFixed(2)} MB, compiler ${(compiler / 1e6).toFixed(2)} MB, 커밋 ${pin.slice(0, 7)}`);
