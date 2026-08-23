/* Local preview server for `site/`.
 *
 * It exists because the playground needs the same two cross-origin headers
 * Cloudflare Pages will send in production; without them SharedArrayBuffer is
 * absent and the interactive input path cannot be tested at all. Keep the
 * header list here in step with `site/_headers`.
 *
 *   node scripts/serve.mjs [port]
 */

import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { readdirSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const ROOT = join(REPO, 'site');
const PORT = Number(process.argv[2] || 8787);

/* The four scripts the pages load are compiled from `site/src/*.ts`, so a
 * fresh checkout has none of them and previewing would serve four 404s. They
 * are rebuilt here when they are missing or older than anything they are built
 * from, and left alone otherwise — `scripts/deploy.sh` has already built them
 * by the time it starts this server, and it expects the port to be listening
 * about a second later. */
const BUILT = ['theme.js', 'site.js', 'examples.js', 'play-worker.js', 'compile-worker.js']
  .map((name) => join(ROOT, 'assets', name));

const SOURCES = [
  ...readdirSync(join(ROOT, 'src')).map((name) => join(ROOT, 'src', name)),
  join(REPO, 'tsconfig.json'),
  join(REPO, 'tsconfig.worker.json'),
  join(REPO, 'scripts/build-scripts.mjs'),
];

const modified = (path) => {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return null;
  }
};

const newestSource = Math.max(...SOURCES.map((path) => modified(path) ?? 0));
const stale = BUILT.some((path) => {
  const built = modified(path);
  return built === null || built < newestSource;
});

if (stale) {
  const built = spawnSync(process.execPath, [join(REPO, 'scripts/build-scripts.mjs')], {
    cwd: REPO,
    stdio: 'inherit',
  });
  if (built.status !== 0) process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, path);

  // Cloudflare Pages serves `/learn/guides` from `learn/guides.html` and
  // redirects the `.html` form to the clean one, so every link on this site
  // is written without the extension. Resolve the same way here, including
  // the tie: `learn/guides.html` and the `learn/guides/` directory both exist,
  // and Pages serves the file. Getting this order wrong makes preview 404 on
  // pages that work in production.
  const exists = async (candidate) => {
    try {
      return await stat(candidate);
    } catch {
      return null;
    }
  };

  const asFile = await exists(file + '.html');
  if (asFile && asFile.isFile()) {
    file += '.html';
  } else {
    const direct = await exists(file);
    if (direct && direct.isDirectory()) {
      file = join(file, 'index.html');
    } else if (!direct) {
      response.writeHead(404, { 'content-type': 'text/plain' });
      response.end('not found');
      return;
    }
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, {
      'content-type': TYPES[extname(file)] || 'application/octet-stream',
      'cross-origin-opener-policy': 'same-origin',
      'cross-origin-embedder-policy': 'require-corp',
      'cache-control': 'no-store',
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
  }
}).listen(PORT, () => console.log(`site preview on http://localhost:${PORT}`));
