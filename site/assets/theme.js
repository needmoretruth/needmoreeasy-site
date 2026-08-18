/* Runs before the page paints, so the chosen theme never flashes.
 *
 * It is a separate classic script rather than a line inside the page because
 * the site's Content-Security-Policy has no `unsafe-inline`: an inline script
 * would simply be blocked. Keep it tiny — it is on the critical path.
 *
 * Three states, and "system" is the default: the choice is only ever written
 * to the document when the visitor made one, so `prefers-color-scheme` stays
 * in charge for everyone else.
 */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  try {
    var choice = localStorage.getItem('nme-theme');
    if (choice === 'dark' || choice === 'light') root.setAttribute('data-theme', choice);
  } catch (error) {
    /* private mode: the system setting decides, which is the default anyway */
  }
})();
