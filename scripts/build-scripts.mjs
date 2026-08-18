/* Type-checks the site's browser scripts and compiles them into `site/assets/`.
 *
 *   node scripts/build-scripts.mjs
 *
 * The sources are TypeScript, in `site/src/`. A static host cannot compile
 * anything, so the compiling happens here, before the files are published, and
 * what ships is the same plain JavaScript the browser always got. The four
 * outputs keep the exact names the pages already ask for, which is why no HTML
 * had to change when the sources moved:
 *
 *   site/src/theme.ts        -> site/assets/theme.js        classic script, in <head>
 *   site/src/site.ts         -> site/assets/site.js         module, end of <body>
 *   site/src/examples.ts     -> site/assets/examples.js     module, imported by site.js
 *   site/src/play-worker.ts  -> site/assets/play-worker.js  module worker
 *
 * Three imports are deliberately left alone rather than bundled in:
 * `./wasm/nme.js` and `./wasm-run/nmerun.js` are wasm-bindgen glue that
 * `deploy.sh` regenerates, and `./engine-meta.js` is written by
 * `scripts/stamp-assets.mjs` after the WebAssembly is built. Bundling any of
 * them would freeze a copy of a file that is meant to be replaced.
 *
 * Nothing is minified and no source map is written: these files are small, and
 * anyone who opens the developer tools on this site should be able to read
 * what the page is doing. The prose that explains it lives in `site/src/`,
 * because esbuild drops comments, so every output starts with a line saying
 * where its source is.
 */

import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { build } from 'esbuild';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SRC = join(ROOT, 'site/src');
const OUT = join(ROOT, 'site/assets');

/* The page and the worker are checked against different standard libraries —
 * the worker has no `document` — so there are two projects, not one loose one
 * that would accept either. */
const PROJECTS = ['tsconfig.json', 'tsconfig.worker.json'];

/* `format` is what each file is loaded as, and it is not a preference: the
 * page loads theme.js with a plain <script> tag, and the other three with
 * `type="module"`. */
const ENTRIES = [
  {
    entry: 'theme.ts',
    out: 'theme.js',
    format: 'iife',
    external: [],
    banner: 'Compiled from site/src/theme.ts.',
  },
  {
    entry: 'examples.ts',
    out: 'examples.js',
    format: 'esm',
    external: [],
    banner: 'Compiled from site/src/examples.ts.',
  },
  {
    entry: 'site.ts',
    out: 'site.js',
    format: 'esm',
    external: ['./wasm/nme.js', './examples.js', './engine-meta.js'],
    banner: 'Compiled from site/src/site.ts.',
  },
  {
    entry: 'play-worker.ts',
    out: 'play-worker.js',
    format: 'esm',
    external: ['./wasm-run/nmerun.js', './engine-meta.js'],
    banner: 'Compiled from site/src/play-worker.ts.',
  },
];

const TSC = join(ROOT, 'node_modules/.bin/tsc');

for (const project of PROJECTS) {
  console.log(`== 타입 검사 ${project} ==`);
  const checked = spawnSync(TSC, ['--noEmit', '-p', join(ROOT, project)], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (checked.status !== 0) {
    console.error(`타입 검사 실패: ${project}`);
    process.exit(1);
  }
}

console.log('== 브라우저 스크립트 컴파일 ==');
for (const one of ENTRIES) {
  await build({
    entryPoints: [join(SRC, one.entry)],
    outfile: join(OUT, one.out),
    bundle: true,
    format: one.format,
    target: 'es2022',
    platform: 'browser',
    // Korean is half of this site. Without this esbuild would escape every
    // non-ASCII character, which triples the size of the example programs and
    // makes the shipped file unreadable.
    charset: 'utf8',
    minify: false,
    sourcemap: false,
    legalComments: 'none',
    external: one.external,
    banner: {
      js: `/* ${one.banner} Do not edit: node scripts/build-scripts.mjs overwrites it. */`,
    },
    logLevel: 'warning',
  });
  const { size } = statSync(join(OUT, one.out));
  console.log(`  site/assets/${one.out.padEnd(16)} ${String(size).padStart(7)} bytes`);
}

console.log('브라우저 스크립트 준비 완료.');
