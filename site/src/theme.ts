/* Runs before the page paints, so the chosen theme never flashes.
 *
 * It is a separate classic script rather than a line inside the page because
 * the site's Content-Security-Policy has no `unsafe-inline`: an inline script
 * would simply be blocked. Keep it tiny — it is on the critical path.
 *
 * Three states, and "system" is the default: the choice is only ever written
 * to the document when the visitor made one, so `prefers-color-scheme` stays
 * in charge for everyone else.
 *
 * The build compiles this file on its own with esbuild's `iife` format, which
 * wraps the body in the same function this file used to write by hand. The
 * empty `export {}` is what makes TypeScript read the file as a module rather
 * than as a pile of globals; nothing is exported and nothing is imported, so
 * the emitted file is still a plain classic script.
 */

export {};

const root = document.documentElement;
root.classList.add('js');
try {
  const choice = localStorage.getItem('nme-theme');
  if (choice === 'dark' || choice === 'light') root.setAttribute('data-theme', choice);
} catch {
  /* private mode: the system setting decides, which is the default anyway */
}
