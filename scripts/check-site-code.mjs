/* Compiles every NME program printed on the two home pages, with the same
 * WebAssembly compiler the site ships.
 *
 * Why this exists: on 2026-08-18 the home page showed `ask for name What is
 * your name?`, which does not compile, and `say Nice to meet you name`, which
 * compiles but prints the word "name" instead of the visitor's name. Both were
 * written by hand and looked right. A page that teaches a language cannot
 * contain a program that does not work, and no amount of care catches this —
 * only the compiler does.
 *
 *   node scripts/check-site-code.mjs
 *
 * Which blocks are checked is stated in the HTML, not guessed here:
 *
 *   <pre class="code" data-nme>    an NME program — must compile
 *   <pre class="code" data-out>    what a program prints — never compiled
 *   <pre class="code" data-shell>  shell commands — never compiled
 *
 * A bare `<pre class="code">` with none of the three fails the check, so a new
 * block cannot slip in unclassified.
 *
 * Every `#code=` link on the page is checked too: those carry a program in the
 * address, and a broken one sends a beginner to a red error on their first
 * click.
 */

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const SITE = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'site');
const PAGES = ['index.html', 'ko/index.html'];

const compiler = await import(join(SITE, 'assets/wasm/nme.js'));
await compiler.default({ module_or_path: readFileSync(join(SITE, 'assets/wasm/nme_bg.wasm')) });

let failures = 0;
let checked = 0;

function fail(where, message, detail) {
  failures += 1;
  console.log(`FAIL  ${where}  ${message}`);
  if (detail) console.log(String(detail).split('\n').map((line) => `      ${line}`).join('\n'));
}

/* The two home pages are twins: the same sections, in the same order, with the
 * same cards, the same four file tabs and the same three AI messages. Only the
 * words differ. A section added to one and forgotten on the other is the most
 * likely way this page drifts, and nothing else would catch it.
 */
function shapeOf(html) {
  const marks = [];
  const pattern =
    /<section[^>]*id="([\w-]+)"|<h([12])[^>]*>|<div class="card"|<li class="step"|data-prompt="([\w-]+)"|data-file="(\w+)"|data-copy-to="(\d)"/g;
  for (const match of html.matchAll(pattern)) {
    if (match[1]) marks.push(`section#${match[1]}`);
    else if (match[2]) marks.push(`h${match[2]}`);
    else if (match[3]) marks.push(`prompt:${match[3]}`);
    else if (match[4]) marks.push(`file:${match[4]}`);
    else if (match[5]) marks.push(`copy-to:${match[5]}`);
    else marks.push('card-or-step');
  }
  return marks;
}

function checkHomePagesMatch() {
  const english = shapeOf(readFileSync(join(SITE, 'index.html'), 'utf8'));
  const korean = shapeOf(readFileSync(join(SITE, 'ko/index.html'), 'utf8'));
  const limit = Math.max(english.length, korean.length);
  for (let index = 0; index < limit; index += 1) {
    if (english[index] === korean[index]) continue;
    fail(
      'index.html vs ko/index.html',
      'the two home pages have drifted apart',
      `at position ${index}: English has ${english[index] ?? '(nothing)'}, ` +
      `Korean has ${korean[index] ?? '(nothing)'}`,
    );
    return;
  }
}

function unescapeHtml(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Turns the base64url in a `#code=` link back into program text. */
function decodeShared(fragment) {
  const padded = fragment.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64').toString('utf8');
}

/* Programs whose Python has to be parsed once everything is collected.
 * Checking `ok: true` is not enough. A compiler that does not recognise a line
 * may hand it back untouched and still report success — on 2026-08-18 the
 * shipped WebAssembly build returned `30% 확률로 말해줘 …` as its own "Python",
 * which is not Python at all and would fail only when the visitor pressed Run.
 * So every result is handed to a real Python parser below. */
const produced = [];

function compile(where, source) {
  checked += 1;
  const result = JSON.parse(compiler.compile(source));
  if (!result.ok) {
    fail(where, 'does not compile', `${source}\n---\n${result.diagnostic}`);
    return null;
  }
  produced.push({ where, source, python: result.python });
  return result.python;
}

function checkProducedPythonParses() {
  if (produced.length === 0) return;
  const verdicts = JSON.parse(execFileSync('python3', ['-c', `
import ast, json, sys
out = []
for item in json.load(sys.stdin):
    try:
        ast.parse(item["python"])
        out.append(None)
    except SyntaxError as problem:
        out.append(f"line {problem.lineno}: {problem.msg}")
print(json.dumps(out))
`], { input: JSON.stringify(produced), encoding: 'utf8' }));
  verdicts.forEach((problem, index) => {
    if (problem === null) return;
    const item = produced[index];
    fail(item.where, 'the compiler produced something that is not Python', `${item.python}\n---\n${problem}`);
  });
}

for (const page of PAGES) {
  const html = readFileSync(join(SITE, page), 'utf8');

  for (const match of html.matchAll(/<pre class="[^"]*\bcode\b[^"]*"([^>]*)>([\s\S]*?)<\/pre>/g)) {
    const attributes = match[1];
    const source = unescapeHtml(match[2]);
    const first = source.split('\n')[0].slice(0, 40);
    if (attributes.includes('data-out') || attributes.includes('data-shell')) continue;
    if (!attributes.includes('data-nme')) {
      fail(`${page}`, 'a code block says nothing about what it is', first);
      continue;
    }
    const python = compile(`${page}  “${first}”`, source);
    if (python === null) continue;
    // A program that quietly means something else is worse than one that fails
    // to compile: `say Hello name` printing the word "name" reads as correct.
    // Any name the page introduces with `ask`/`물어봐` must actually reach the
    // Python, so flag a line that mentions it and does not.
    const names = [...source.matchAll(/^(?:ask|물어봐\s+)?\s*(\S+?)(?:을|를)?\s*(?:물어봐|ask)/gm)]
      .map((m) => m[1]);
    for (const line of python.split('\n')) {
      for (const name of names) {
        if (!line.startsWith('print("')) continue;
        if (line.includes(`str(${name})`)) continue;
        if (line.includes(name)) {
          fail(`${page}  “${first}”`, `prints the word “${name}” instead of using it`, line);
        }
      }
    }
  }

  for (const match of html.matchAll(/href="#code=([A-Za-z0-9\-_]+)"/g)) {
    const source = decodeShared(match[1]);
    compile(`${page}  #code= “${source.split('\n')[0].slice(0, 40)}”`, source);
  }
}

checkProducedPythonParses();
checkHomePagesMatch();

console.log(failures === 0
  ? `홈 화면의 프로그램 ${checked}개가 전부 컴파일되고, 두 언어의 화면 구조가 같습니다`
  : `홈 화면 프로그램 ${failures}개가 잘못되었습니다`);
process.exit(failures === 0 ? 0 : 1);
