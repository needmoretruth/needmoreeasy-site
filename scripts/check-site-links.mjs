/* Every internal link on the site must resolve, and none may go through a
 * redirect. Cloudflare Pages serves `learn/guides.html` at `/learn/guides` and
 * permanently redirects the `.html` form, so a link written with the extension
 * costs a redirect on every navigation — this catches those too.
 *
 *   node scripts/check-site-links.mjs [base-url]
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'site');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

const pages = [];
for await (const file of walk(SITE)) pages.push(file);

let failures = 0;
const seen = new Set();

for (const file of pages) {
  // Code samples are full of things that look like links — a guide about
  // extracting links from HTML contains `href="about.html"` as its subject
  // matter. Strip code before looking for real links.
  const html = (await readFile(file, 'utf8'))
    .replace(/<pre[\s\S]*?<\/pre>/g, '')
    .replace(/<code[\s\S]*?<\/code>/g, '');
  const here = '/' + file.slice(SITE.length + 1).replace(/\\/g, '/');
  for (const match of html.matchAll(/(?:href|src)="([^"#?]+)(?:[#?][^"]*)?"/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|data:|\/\/)/.test(target)) continue;
    const absolute = target.startsWith('/')
      ? target
      : resolve(dirname(here), target).replace(/\\/g, '/');
    const key = absolute;
    if (seen.has(key)) continue;
    seen.add(key);

    if (absolute.endsWith('.html')) {
      failures += 1;
      console.log(`FAIL ${here}: ${target} — 확장자가 붙어 있어 재지정을 한 번 더 탑니다`);
      continue;
    }

    // Resolve the way Cloudflare Pages does: the file wins over the directory.
    const onDisk = join(SITE, absolute.replace(/^\//, ''));
    const candidates = absolute.endsWith('/')
      ? [join(onDisk, 'index.html')]
      : [onDisk + '.html', onDisk, join(onDisk, 'index.html')];
    let found = false;
    for (const candidate of candidates) {
      try {
        await readFile(candidate);
        found = true;
        break;
      } catch { /* try the next shape */ }
    }
    if (!found) {
      failures += 1;
      console.log(`FAIL ${here}: ${target} — 가리키는 파일이 없습니다`);
    }
  }
}

console.log(failures
  ? `\n${failures}건 실패 (검사한 링크 ${seen.size}개, 페이지 ${pages.length}쪽)`
  : `\n내부 링크 ${seen.size}개 전부 살아 있고 재지정도 없습니다 (${pages.length}쪽)`);
process.exit(failures ? 1 : 0);
