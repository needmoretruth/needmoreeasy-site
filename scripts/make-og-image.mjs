/* Renders the link-preview card and saves it as `site/assets/og.png`.
 *
 *   node scripts/make-og-image.mjs [base-url]
 *
 * The card lives in `scripts/og-card.html` rather than in `site/`, so it is
 * never published or crawled; it is copied in for the moment of the screenshot
 * and removed again. It shares the site's stylesheet, so the preview image can
 * never drift away from the design.
 */
import { chromium } from 'playwright';
import { copyFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = join(fileURLToPath(new URL('.', import.meta.url)));
const TEMP = join(HERE, '..', 'site', '_og.html');
await copyFile(join(HERE, 'og-card.html'), TEMP);
try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto((process.argv[2] || 'http://127.0.0.1:8931') + '/_og.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(HERE, '..', 'site', 'assets', 'og.png') });
  await browser.close();
  // The card is flat tones and text, so a 128-colour palette keeps it crisp at
  // a third of the file size. Anyone sharing a link pays for these bytes.
  const { execFileSync } = await import('node:child_process');
  execFileSync('python3', ['-c', [
    'from PIL import Image',
    "im = Image.open('site/assets/og.png').convert('RGB')",
    'q = im.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)',
    "q.save('site/assets/og.png', optimize=True)",
  ].join('\n')], { stdio: 'inherit' });
} finally {
  await rm(TEMP, { force: true });
}
console.log('og.png 생성');
