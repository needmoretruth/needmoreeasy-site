/* Writes `site/assets/engine-meta.js`, the exact byte size of the Python
 * engine's WebAssembly file.
 *
 * The worker needs it to show a truthful progress bar: the browser only sees
 * the compressed `content-length`, which would make the bar finish at about a
 * quarter of the download. Run this after building either wasm crate.
 */

import { statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const ENGINE = join(ROOT, 'site/assets/wasm-run/nmerun_bg.wasm');
const COMPILER = join(ROOT, 'site/assets/wasm/nme_bg.wasm');
const OUT = join(ROOT, 'site/assets/engine-meta.js');

const engine = statSync(ENGINE).size;
const compiler = statSync(COMPILER).size;

writeFileSync(OUT, `/* Written by scripts/stamp-assets.mjs — do not edit by hand. */

export const ENGINE_BYTES = ${engine};
export const COMPILER_BYTES = ${compiler};
`);

console.log(`stamp-assets: engine ${(engine / 1e6).toFixed(2)} MB, compiler ${(compiler / 1e6).toFixed(2)} MB`);
