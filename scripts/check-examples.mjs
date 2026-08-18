/* Compiles and runs every playground example with the same two WebAssembly
 * modules the site ships, and fails loudly if any of them stops working.
 *
 * The examples are the site's main promise — a visitor clicks a chip and
 * presses Run — so a broken one is a broken site, not a broken sample. Run
 * this after any change to `site/assets/examples.js` or to either crate:
 *
 *   node scripts/check-examples.mjs
 *
 * Each example carries what it needs to be checked without guessing:
 *
 *   answers  the lines fed to input(), in order
 *   expect   text that must appear in the output
 *   fails    true when the program is meant NOT to compile (the error demo),
 *            in which case `expect` is matched against the diagnostic
 *
 * There is no per-example timeout: the engine runs on this thread, so a
 * runaway example would hang the process rather than fail it. That is what the
 * job timeout in CI is for, and it is why no example may contain an unbounded
 * loop.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const SITE = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'site');

let output = '';
let answers = [];
let asked = 0;

globalThis.nmeHost = {
  write(text) { output += text; },
  sleep() { /* the site's worker really waits; the checker must not */ },
  readLine(prompt) {
    if (prompt) output += prompt;
    asked += 1;
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

function fail(where, message, detail) {
  failures += 1;
  console.log(`FAIL  ${where}  ${message}`);
  if (detail) console.log(String(detail).split('\n').map((line) => `      ${line}`).join('\n'));
}

/* The two language lists are meant to be the same tour, so a chip that exists
 * in one language and not the other is a bug in the site, not a translation
 * choice. */
const ids = Object.fromEntries(
  Object.entries(EXAMPLES).map(([language, list]) => [language, list.map((one) => one.id)]),
);
if (ids.en.join(',') !== ids.ko.join(',')) {
  fail('examples.js', 'the English and Korean lists do not match',
    `en: ${ids.en.join(', ')}\nko: ${ids.ko.join(', ')}`);
}

for (const [language, list] of Object.entries(EXAMPLES)) {
  for (const example of list) {
    output = '';
    asked = 0;
    answers = (example.answers ?? []).slice();

    for (const field of ['id', 'label', 'source', 'expect']) {
      if (!example[field]) fail(`${language}/${example.id ?? '?'}`, `missing \`${field}\``);
    }

    const compiled = JSON.parse(compiler.compile(example.source));

    if (example.fails) {
      if (compiled.ok) {
        fail(`${language}/${example.id}`, 'was supposed to fail, but compiled');
      } else if (!compiled.diagnostic.includes(example.expect)) {
        fail(`${language}/${example.id}`, `the error does not mention ${example.expect}`, compiled.diagnostic);
      } else {
        console.log(`ok    ${language}/${example.id}  fails with ${example.expect}`);
      }
      continue;
    }

    if (!compiled.ok) {
      fail(`${language}/${example.id}`, 'did not compile', compiled.diagnostic);
      continue;
    }

    /* A word inside an ordinary message must never turn into a language
     * feature. `따라` means "along" far more often than it means "pick one",
     * and it silently turned a story line into a random choice once. */
    for (const [marker, hint] of [['__import__("random")', 'random'], ['input(', 'a question']]) {
      const usesIt = compiled.python.includes(marker);
      const asksForIt = marker.includes('random')
        ? /random|랜덤|골라|뽑아|따라|주사위/.test(example.source)
        : /ask|물어|input|\?/.test(example.source);
      if (usesIt && !asksForIt) {
        fail(`${language}/${example.id}`, `compiles to ${hint} but never asks for it`, compiled.python);
      }
    }

    const outcome = JSON.parse(engine.run(compiled.python));
    if (!outcome.ok) {
      fail(`${language}/${example.id}`, 'ran with an error', outcome.error);
      continue;
    }
    if (!output.includes(example.expect)) {
      fail(`${language}/${example.id}`, `the output never contains ${JSON.stringify(example.expect)}`, output);
      continue;
    }
    if (asked > answers.length + (example.answers ?? []).length) {
      fail(`${language}/${example.id}`, `asked ${asked} questions but only ${(example.answers ?? []).length} answers are listed`);
      continue;
    }

    const firstLine = output.trim().split('\n')[0] ?? '(no output)';
    console.log(`ok    ${language}/${example.id}  ${firstLine.slice(0, 56)}`);
  }
}

if (failures > 0) {
  console.log(`\n${failures} example(s) broken`);
  process.exit(1);
}
console.log('\nevery example compiles, runs, and says what it should');
