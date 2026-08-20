/* The footer names the compiler version the site is built against. It is
 * written into the two front pages by hand, so it can fall behind the pinned
 * commit without anything else noticing — which is exactly what happened
 * between 0.0.1-beta.160 and 0.2.0. This check makes that a red light.
 *
 *   node scripts/check-site-version.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const version = /^version = "([^"]+)"/m.exec(readFileSync(join(root, 'Cargo.toml'), 'utf8'))?.[1];
let bad = 0;
if (!version) {
  console.log('FAIL Cargo.toml에서 판번호를 찾지 못함');
  bad += 1;
}
for (const [path, label] of [['site/index.html', 'compiler'], ['site/ko/index.html', '컴파일러']]) {
  const html = readFileSync(join(root, path), 'utf8');
  const shown = new RegExp(`${label} <code>([^<]+)</code>`).exec(html)?.[1];
  if (shown === version) {
    console.log(`${path.padEnd(20)} ok   ${shown}`);
  } else {
    console.log(`${path.padEnd(20)} FAIL 바닥글은 ${shown ?? '없음'}, Cargo.toml은 ${version}`);
    bad += 1;
  }
}
if (bad) {
  console.log('\n바닥글 판번호가 어긋납니다.');
  process.exit(1);
}
console.log('\n바닥글 판번호가 맞습니다.');
