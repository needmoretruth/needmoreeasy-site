/* The site does not contain the compiler. It pins one commit of the language
 * repository and builds the browser compiler from that, so what a visitor
 * actually runs is decided by a forty-character string in
 * `crates/nme-web/Cargo.toml`.
 *
 * On 2026-08-22 the site said `0.7.1` and ran a compiler that was three fixes
 * behind it. Nothing was wrong with the pin: the fixes had been made, tested
 * and left sitting in the language repository's working tree, never committed
 * and never pushed. `cargo` fetches from GitHub, so a fix that is not pushed
 * cannot reach the site however many times it is deployed — and the version
 * number, which is written by hand, went on saying the same thing.
 *
 * The footer version check catches a stale number. This catches a stale
 * compiler:
 *
 *   node scripts/check-compiler-pin.mjs
 *
 * It reads the pin, then asks the language repository three questions the
 * version number cannot answer — does that commit exist, has it been pushed,
 * and does its own version match the number this site prints.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// The language repository, checked out next to this one unless NME_REPO says otherwise.
const repo = process.env.NME_REPO || join(root, '..', 'needmoreeasy');

let bad = 0;
const fail = (message) => { bad += 1; console.log('FAIL ' + message); };
const ok = (message) => console.log('ok   ' + message);
const note = (message) => console.log('  ·  ' + message);

const git = (...args) => {
  try {
    return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
};

/* 1. the pin itself, and the lock file that has to agree with it */
const webToml = readFileSync(join(root, 'crates/nme-web/Cargo.toml'), 'utf8');
const pin = /rev = "([0-9a-f]{40})"/.exec(webToml)?.[1];
if (!pin) {
  fail('crates/nme-web/Cargo.toml에서 고정한 커밋을 찾지 못했습니다');
  process.exit(1);
}
ok(`고정한 커밋 ${pin.slice(0, 7)}`);

const lock = readFileSync(join(root, 'Cargo.lock'), 'utf8');
const locked = new RegExp(`nme-core[\\s\\S]{0,200}?rev=([0-9a-f]{40})`).exec(lock)?.[1];
if (locked !== pin) {
  fail(`Cargo.lock은 ${locked?.slice(0, 7) ?? '없음'}을 붙잡고 있습니다 — \`cargo update -p nme-core\`가 필요합니다`);
} else {
  ok('Cargo.lock도 같은 커밋을 붙잡고 있습니다');
}

/* 2. the language repository has to be there, and the commit has to exist */
if (git('rev-parse', '--git-dir') === null) {
  fail(`언어 저장소를 찾지 못했습니다: ${repo} (NME_REPO로 지정할 수 있습니다)`);
  process.exit(1);
}
if (git('cat-file', '-e', `${pin}^{commit}`) === null) {
  fail(`언어 저장소에 그 커밋이 없습니다: ${pin.slice(0, 7)}`);
  process.exit(1);
}
ok(`언어 저장소에 그 커밋이 있습니다 — ${git('log', '-1', '--format=%s', pin)}`);

/* 3. the question that matters. cargo fetches from GitHub, so a commit that
 *    only exists on this machine builds here and cannot build anywhere else —
 *    including the deploy that reaches the web. */
git('fetch', '--quiet', 'origin');
const onRemote = git('branch', '-r', '--contains', pin);
if (!onRemote) {
  fail(`그 커밋이 아직 밀어넣어지지 않았습니다. 배포는 GitHub에서 받아 오므로,
     밀어넣기 전에는 사이트에 반영되지 않습니다: git -C ${repo} push`);
} else {
  ok(`밀어넣어져 있습니다 — ${onRemote.split('\n').map((line) => line.trim()).join(', ')}`);
}

/* 4. the version the site prints has to be the version that commit calls
 *    itself. A hand-written number can say anything. */
const siteVersion = /^version = "([^"]+)"/m.exec(readFileSync(join(root, 'Cargo.toml'), 'utf8'))?.[1];
const pinnedToml = git('show', `${pin}:Cargo.toml`);
const pinnedVersion = pinnedToml && /^version = "([^"]+)"/m.exec(pinnedToml)?.[1];
if (pinnedVersion !== siteVersion) {
  fail(`판번호가 어긋납니다 — 사이트는 ${siteVersion}, 고정한 커밋은 스스로를 ${pinnedVersion ?? '알 수 없음'}이라고 부릅니다`);
} else {
  ok(`판번호가 맞습니다 — 양쪽 다 ${siteVersion}`);
}

/* 5. not a failure, but the thing to know before deploying: work that exists
 *    and is not in the pin will not be on the site. */
const dirty = git('status', '--porcelain');
if (dirty) {
  note(`언어 저장소에 커밋되지 않은 변경이 ${dirty.split('\n').length}개 있습니다 — 이번 배포에는 들어가지 않습니다`);
}
const head = git('rev-parse', 'origin/main');
if (head && head !== pin) {
  const behind = git('rev-list', '--count', `${pin}..origin/main`);
  note(`origin/main보다 커밋 ${behind}개 뒤에 고정되어 있습니다 (${head.slice(0, 7)}가 최신) — 일부러 그런 것이면 그대로 두십시오`);
}

console.log(bad
  ? '\n고정한 컴파일러가 사이트와 맞지 않습니다.'
  : '\n사이트가 싣고 나갈 컴파일러가 저장소의 그 커밋과 정확히 같습니다.');
process.exit(bad ? 1 : 0);
