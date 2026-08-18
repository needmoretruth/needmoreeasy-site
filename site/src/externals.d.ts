/* The three JavaScript files the browser scripts import but the build never
 * compiles from TypeScript.
 *
 * `wasm/nme.js` and `wasm-run/nmerun.js` are wasm-bindgen glue, written into
 * `site/assets/` by `scripts/deploy.sh`; `engine-meta.js` is the four-line file
 * `scripts/stamp-assets.mjs` writes. All three are build output, so they are
 * marked external in `scripts/build-scripts.mjs` and their import specifiers
 * survive into the compiled files unchanged.
 *
 * The signatures below mirror the `.d.ts` wasm-bindgen emits next to each glue
 * file — which `deploy.sh` deletes right after the build, so they are copied
 * from the glue itself (`export function compile`, `export { initSync,
 * __wbg_init as default }`) rather than invented. `initSync` is left out
 * because nothing here calls it.
 *
 * A single star in an ambient module name is a pattern, and the longest match
 * wins, so the two glue declarations below never collide: only a specifier
 * ending in "/nme.js" reaches the first one.
 */

declare module '*/nme.js' {
  export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;
  export interface InitOutput {
    readonly memory: WebAssembly.Memory;
  }
  /** NME source in, one JSON string out: `{ok, python}` or `{ok, diagnostic}`. */
  export function compile(source: string): string;
  export default function init(
    module_or_path?: { module_or_path: InitInput } | InitInput,
  ): Promise<InitOutput>;
}

declare module '*/nmerun.js' {
  export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;
  export interface InitOutput {
    readonly memory: WebAssembly.Memory;
  }
  /** Python source in, one JSON string out: `{ok}` or `{ok, error}`. */
  export function run(python: string): string;
  export default function init(
    module_or_path?: { module_or_path: InitInput } | InitInput,
  ): Promise<InitOutput>;
}

declare module '*/engine-meta.js' {
  export const ENGINE_BYTES: number;
  export const COMPILER_BYTES: number;
}
