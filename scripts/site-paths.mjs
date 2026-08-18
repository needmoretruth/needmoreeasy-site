/* Where things are on the built site, worked out from the built site.
 *
 * The checks used to name guide pages by hand — `/ko/learn/guides/05-repeat`.
 * When the guides were renumbered on 2026-08-18 every one of those addresses
 * became a 404, and the layout check reported 112 failures that were really
 * one mistake in the checker. A guide's number is not stable; its slug is.
 */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const SITE = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'site');

/** The path of the guide whose name ends in `slug`, in `lang` ('en' | 'ko'). */
export function guidePath(slug, lang = 'ko') {
  const prefix = lang === 'ko' ? '/ko' : '';
  const folder = join(SITE, lang === 'ko' ? 'ko/learn/guides' : 'learn/guides');
  const files = readdirSync(folder).filter((name) => name.endsWith('.html'));
  const match = files.find((name) => name.replace(/\.html$/, '').endsWith(`-${slug}`));
  if (!match) {
    throw new Error(
      `site-paths: no guide ending in "-${slug}" under ${folder}. ` +
      'Build the docs first (python3 scripts/build-docs.py), or name a slug that exists.',
    );
  }
  return `${prefix}/learn/guides/${match.replace(/\.html$/, '')}`;
}
