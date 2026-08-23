/* Compiles and runs every playground example with the same two WebAssembly
 * modules the site ships, and fails loudly if any of them stops working.
 *
 * The examples are the site's main promise — a visitor clicks a chip and
 * presses Run — so a broken one is a broken site, not a broken sample. Run
 * this after any change to `site/src/examples.ts` or to either crate:
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
 * The engine runs on this thread, so nothing can interrupt an example that
 * never stops. Two caps below turn that into a named failure instead of a hung
 * process; no example may contain an unbounded loop either way.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const SITE = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'site');

let output = '';
let answers = [];
let asked = 0;

/* An example that never stops used to take this process down with it.
 *
 * On 2026-08-19 a compiler change turned one line of `ko/password` from a
 * question into ordinary text, so the loop waiting for an answer never got one.
 * The engine runs on this thread, so there is nothing to interrupt it: output
 * piled up until V8 died of it, the deploy aborted with a core dump and no
 * word about which example was at fault. These two caps turn that into a
 * failure that names itself in under a second.
 */
const OUTPUT_CAP = 200_000;
const ASK_CAP = 200;

class Runaway extends Error {}

globalThis.nmeHost = {
  write(text) {
    output += text;
    if (output.length > OUTPUT_CAP) throw new Runaway(`printed more than ${OUTPUT_CAP} characters`);
  },
  sleep() { /* the site's worker really waits; the checker must not */ },
  readLine(prompt) {
    if (prompt) output += prompt;
    asked += 1;
    if (asked > ASK_CAP) throw new Runaway(`asked more than ${ASK_CAP} times`);
    const answer = answers.shift() ?? '';
    output += answer + '\n';
    return answer;
  },
};

const compiler = await import(join(SITE, 'assets/wasm/nme.js'));
await compiler.default({ module_or_path: readFileSync(join(SITE, 'assets/wasm/nme_bg.wasm')) });

const engine = await import(join(SITE, 'assets/wasm-run/nmerun.js'));
await engine.default({ module_or_path: readFileSync(join(SITE, 'assets/wasm-run/nmerun_bg.wasm')) });

const { EXAMPLES, GROUPS } = await import(join(SITE, 'assets/examples.js'));

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

    for (const field of ['id', 'label', 'source', 'expect', 'group']) {
      if (!example[field]) fail(`${language}/${example.id ?? '?'}`, `missing \`${field}\``);
    }
    if (example.group && !GROUPS.includes(example.group)) {
      fail(`${language}/${example.id}`, `is in the group ${example.group}, which is not one of the six`);
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
        ? /random|랜덤|무작위|골라|뽑아|따라|주사위|확률/.test(example.source)
        : /ask|물어|input|\?/.test(example.source);
      if (usesIt && !asksForIt) {
        fail(`${language}/${example.id}`, `compiles to ${hint} but never asks for it`, compiled.python);
      }
    }

    /* And the other way round, which is how `ko/password` broke: the program
     * plainly asks a question and the Python that came out never does. A loop
     * waiting on that answer never ends. An example that lists answers has, by
     * its own account, a question in it. */
    if ((example.answers ?? []).length > 0 && !compiled.python.includes('input(')) {
      fail(
        `${language}/${example.id}`,
        'lists answers but the Python never asks for any',
        compiled.python,
      );
      continue;
    }

    /* One example, six versions. The page offers the other language as a swap
     * between these two hand-written lists, and the other two levels as a
     * rewrite by the tidier the site already ships. A rewrite is only worth
     * offering if it is the same program, so that is what is checked here:
     * not that it looks right, but that it compiles to the very Python the
     * sentence version compiles to.
     *
     * The ones marked `fixed` are left out on purpose — how they are written
     * IS what they teach, and flattening them to one level would delete the
     * lesson. */
    if (!example.fixed) {
      for (const level of ['beginner', 'advanced']) {
        const rewritten = JSON.parse(compiler.tidy(example.source, level, language));
        if (!rewritten.ok) {
          fail(`${language}/${example.id}`, `cannot be rewritten as ${level}`, rewritten.diagnostic);
          continue;
        }
        const again = JSON.parse(compiler.compile(rewritten.nme));
        if (!again.ok) {
          fail(`${language}/${example.id}`, `the ${level} rewrite does not compile`, again.diagnostic);
          continue;
        }
        if (again.python !== compiled.python) {
          const wrote = compiled.python.split('\n');
          const now = again.python.split('\n');
          const at = wrote.findIndex((line, index) => line !== now[index]);
          fail(
            `${language}/${example.id}`,
            `the ${level} rewrite is a different program`,
            `line ${at + 1}\n  was: ${wrote[at] ?? '(nothing)'}\n  now: ${now[at] ?? '(nothing)'}`,
          );
        }
      }
    }

    /* A program that mines. `ko/bitcoin` does 2,828 modular exponentiations on
     * 2,048-bit numbers, which is 256 seconds in this engine and 153 in
     * CPython — the arithmetic is the point of it, so there is nothing to make
     * faster. Compiling it is checked on every run; running it is not, unless
     * asked. Said out loud rather than skipped quietly. */
    if (example.slow && !process.env.NME_SLOW) {
      console.log(`ok    ${language}/${example.id}  컴파일만 확인함 — 실행은 몇 분짜리다 (NME_SLOW=1이면 끝까지 돌린다)`);
      continue;
    }

    let outcome;
    try {
      outcome = JSON.parse(engine.run(compiled.python));
    } catch (problem) {
      if (problem instanceof Runaway) {
        fail(`${language}/${example.id}`, `never stops — ${problem.message}`, output.slice(0, 300));
        continue;
      }
      throw problem;
    }
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
