/* Compiles and runs every playground example with the same two WebAssembly
 * modules the site ships, and fails loudly if any of them stops working.
 *
 * The examples are the site's main promise — a visitor clicks a chip and
 * presses Run — so a broken one is a broken site, not a broken sample. Run
 * this after any change to `site/assets/examples.js` or to either crate:
 *
 *   node scripts/check-examples.mjs
 *
 * Interactive examples are fed the canned answers below, in order.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const SITE = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'site');
const ANSWERS = ['7', '3', 'Minsu', '5', '1', '2'];

let output = '';
let answers = [];

globalThis.nmeHost = {
  write(text) { output += text; },
  readLine(prompt) {
    if (prompt) output += prompt;
    const answer = answers.shift() ?? '';
    output += answer + '\n';
    return answer;
  },
};

const compiler = await import(join(SITE, 'assets/wasm/nme.js'));
await compiler.default({ module_or_path: readFileSync(join(SITE, 'assets/wasm/nme_bg.wasm')) });

const engine = await import(join(SITE, 'assets/wasm-run/nmerun.js'));
await engine.default({ module_or_path: readFileSync(join(SITE, 'assets/wasm-run/nmerun_bg.wasm')) });

const { EXAMPLES } = await import(join(SITE, 'assets/examples.js'));

let failures = 0;
for (const [language, list] of Object.entries(EXAMPLES)) {
  for (const example of list) {
    output = '';
    answers = ANSWERS.slice();

    const compiled = JSON.parse(compiler.compile(example.source));
    if (!compiled.ok) {
      failures += 1;
      console.log(`FAIL  ${language}/${example.id}  did not compile`);
      console.log(compiled.diagnostic);
      continue;
    }

    const outcome = JSON.parse(engine.run(compiled.python));
    if (!outcome.ok) {
      failures += 1;
      console.log(`FAIL  ${language}/${example.id}  ran with an error`);
      console.log(outcome.error);
      continue;
    }

    const firstLine = output.trim().split('\n')[0] ?? '(no output)';
    console.log(`ok    ${language}/${example.id}  ${firstLine.slice(0, 60)}`);
  }
}

if (failures > 0) {
  console.log(`\n${failures} example(s) broken`);
  process.exit(1);
}
console.log('\nevery example compiles and runs');
