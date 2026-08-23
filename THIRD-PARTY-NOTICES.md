# Third-party notices

This site is Apache-2.0 (see `LICENSE`), but the two WebAssembly files it serves
are compiled from other people's code as well as ours. This file is the notice
that has to travel with those binaries.

Two `.wasm` files reach the visitor's browser:

| File | Built from | What it does |
| --- | --- | --- |
| `site/assets/wasm/nme_bg.wasm` | `crates/nme-web` + [`nme-core`](https://github.com/needmoretruth/needmoreeasy) | Compiles NME to Python |
| `site/assets/wasm-run/nmerun_bg.wasm` | `crates/nme-run` + [RustPython](https://github.com/RustPython/RustPython) | Runs that Python |

Nothing else is fetched at run time. There is no CDN, no analytics, and no
third-party JavaScript: every byte the page loads comes from this repository.

## The parts that ask for more than attribution

### malachite — LGPL-3.0-only

RustPython uses the [malachite](https://www.malachite.rs/) crates for Python's
arbitrary-precision integers, so `nmerun_bg.wasm` statically links five
LGPL-3.0-only crates: `malachite`, `malachite-base`, `malachite-bigint`,
`malachite-nz`, `malachite-q`.

The LGPL asks that anyone who receives the combined work be able to replace the
library with their own version and relink. That is satisfied here by this
repository:

* `crates/nme-run` is the complete source of our half of the binary, under Apache-2.0.
* `Cargo.lock` pins every dependency to an exact version, so the build is reproducible.
* `wasm-pack build --release --target web --out-dir ../../site/assets/wasm-run --out-name nmerun`,
  run inside `crates/nme-run`, rebuilds the exact file the site serves. Point Cargo at
  a modified malachite with a `[patch.crates-io]` entry and the relinked binary is yours.

Full text: `licenses/LGPL-3.0.txt` and `licenses/GPL-3.0.txt`.

### The Python standard library — PSF-2.0

`rustpython-pylib` freezes the pure-Python half of the CPython standard library
(`random`, `json`, `datetime`, `hashlib`, `secrets`, and the rest) into the
binary, which is how `import random` works with no file system to read from.
That code is Python Software Foundation copyright, under the PSF licence.

Full text: `licenses/PSF-2.0.txt`.

### RustPython — MIT

The interpreter itself. Full text: `licenses/MIT-rustpython.txt`.

## Everything compiled into the two binaries

171 crates, resolved for `wasm32-unknown-unknown` with normal (non-dev)
dependency edges only. Licence identifiers are the crates' own declarations.

| Crate | Version | Licence |
| --- | --- | --- |
| `adler2` | 2.0.1 | 0BSD OR MIT OR Apache-2.0 |
| `adler32` | 1.2.0 | Zlib |
| `ahash` | 0.8.12 | MIT OR Apache-2.0 |
| `ascii` | 1.1.0 | Apache-2.0 OR MIT |
| `atty` | 0.2.14 | MIT |
| `base64` | 0.13.1 | MIT/Apache-2.0 |
| `bitflags` | 2.13.1 | MIT OR Apache-2.0 |
| `blake2` | 0.10.6 | MIT OR Apache-2.0 |
| `block-buffer` | 0.10.4 | MIT OR Apache-2.0 |
| `bstr` | 0.2.17 | MIT OR Apache-2.0 |
| `bumpalo` | 3.20.3 | MIT OR Apache-2.0 |
| `caseless` | 0.2.2 | MIT |
| `cfg-if` | 1.0.4 | MIT OR Apache-2.0 |
| `chrono` | 0.4.45 | MIT OR Apache-2.0 |
| `crc32fast` | 1.5.0 | MIT OR Apache-2.0 |
| `crossbeam-utils` | 0.8.22 | MIT OR Apache-2.0 |
| `crypto-common` | 0.1.7 | MIT OR Apache-2.0 |
| `csv-core` | 0.1.13 | Unlicense/MIT |
| `derive_more` | 1.0.0 | MIT |
| `derive_more-impl` | 1.0.0 | MIT |
| `digest` | 0.10.7 | MIT OR Apache-2.0 |
| `dyn-clone` | 1.0.20 | MIT OR Apache-2.0 |
| `either` | 1.17.0 | MIT OR Apache-2.0 |
| `equivalent` | 1.0.2 | Apache-2.0 OR MIT |
| `flate2` | 1.1.9 | MIT OR Apache-2.0 |
| `futures-core` | 0.3.34 | MIT OR Apache-2.0 |
| `futures-task` | 0.3.34 | MIT OR Apache-2.0 |
| `futures-util` | 0.3.34 | MIT OR Apache-2.0 |
| `generic-array` | 0.14.7 | MIT |
| `getrandom` | 0.2.17 | MIT OR Apache-2.0 |
| `getrandom` | 0.3.4 | MIT OR Apache-2.0 |
| `half` | 1.8.3 | MIT OR Apache-2.0 |
| `hashbrown` | 0.14.5 | MIT OR Apache-2.0 |
| `hashbrown` | 0.17.1 | MIT OR Apache-2.0 |
| `heck` | 0.5.0 | MIT OR Apache-2.0 |
| `hex` | 0.4.3 | MIT OR Apache-2.0 |
| `hexf-parse` | 0.2.1 | CC0-1.0 |
| `indexmap` | 2.14.0 | Apache-2.0 OR MIT |
| `is-macro` | 0.3.7 | Apache-2.0 |
| `itertools` | 0.11.0 | MIT OR Apache-2.0 |
| `itoa` | 1.0.18 | MIT OR Apache-2.0 |
| `js-sys` | 0.3.104 | MIT OR Apache-2.0 |
| `keccak` | 0.1.6 | Apache-2.0 OR MIT |
| `lalrpop-util` | 0.20.2 | Apache-2.0 OR MIT |
| `lazy_static` | 1.5.0 | MIT OR Apache-2.0 |
| `lexical-parse-float` | 0.8.5 | MIT/Apache-2.0 |
| `lexical-parse-integer` | 0.8.6 | MIT/Apache-2.0 |
| `lexical-util` | 0.8.5 | MIT/Apache-2.0 |
| `libc` | 0.2.189 | MIT OR Apache-2.0 |
| `libm` | 0.2.16 | MIT |
| `lock_api` | 0.4.14 | MIT OR Apache-2.0 |
| `log` | 0.4.33 | MIT OR Apache-2.0 |
| `lz4_flex` | 0.11.6 | MIT |
| `malachite` | 0.4.22 | LGPL-3.0-only |
| `malachite-base` | 0.4.22 | LGPL-3.0-only |
| `malachite-bigint` | 0.2.3 | LGPL-3.0-only |
| `malachite-nz` | 0.4.22 | LGPL-3.0-only |
| `malachite-q` | 0.4.22 | LGPL-3.0-only |
| `maplit` | 1.0.2 | MIT/Apache-2.0 |
| `matches` | 0.1.10 | MIT |
| `md-5` | 0.10.6 | MIT OR Apache-2.0 |
| `memchr` | 2.8.3 | Unlicense OR MIT |
| `memoffset` | 0.9.1 | MIT |
| `miniz_oxide` | 0.8.9 | MIT OR Zlib OR Apache-2.0 |
| `mt19937` | 2.0.1 | see LICENSE |
| `nix` | 0.27.1 | MIT |
| `num-complex` | 0.4.6 | MIT OR Apache-2.0 |
| `num-integer` | 0.1.47 | MIT OR Apache-2.0 |
| `num-traits` | 0.2.19 | MIT OR Apache-2.0 |
| `num_enum` | 0.7.6 | BSD-3-Clause OR MIT OR Apache-2.0 |
| `num_enum_derive` | 0.7.6 | BSD-3-Clause OR MIT OR Apache-2.0 |
| `once_cell` | 1.21.4 | MIT OR Apache-2.0 |
| `optional` | 0.5.0 | MIT OR Apache-2.0 |
| `parking_lot` | 0.12.5 | MIT OR Apache-2.0 |
| `parking_lot_core` | 0.9.12 | MIT OR Apache-2.0 |
| `paste` | 1.0.15 | MIT OR Apache-2.0 |
| `phf` | 0.11.3 | MIT |
| `phf_shared` | 0.11.3 | MIT |
| `pin-project-lite` | 0.2.17 | Apache-2.0 OR MIT |
| `pmutil` | 0.5.3 | Apache-2.0/MIT |
| `ppv-lite86` | 0.2.21 | MIT OR Apache-2.0 |
| `proc-macro-crate` | 3.5.0 | MIT OR Apache-2.0 |
| `proc-macro2` | 1.0.107 | MIT OR Apache-2.0 |
| `puruspe` | 0.2.5 | MIT OR Apache-2.0 |
| `quote` | 1.0.47 | MIT OR Apache-2.0 |
| `radium` | 0.7.0 | MIT |
| `rand` | 0.8.7 | MIT OR Apache-2.0 |
| `rand_chacha` | 0.3.1 | MIT OR Apache-2.0 |
| `rand_core` | 0.6.4 | MIT OR Apache-2.0 |
| `regex-automata` | 0.1.10 | Unlicense/MIT |
| `result-like` | 0.4.6 | BSD-2-Clause |
| `result-like-derive` | 0.4.6 | BSD-2-Clause |
| `rustc-hash` | 1.1.0 | Apache-2.0/MIT |
| `rustpython-ast` | 0.4.0 | MIT |
| `rustpython-codegen` | 0.4.0 | MIT |
| `rustpython-common` | 0.4.0 | MIT |
| `rustpython-compiler` | 0.4.0 | MIT |
| `rustpython-compiler-core` | 0.4.0 | MIT |
| `rustpython-derive` | 0.4.0 | MIT |
| `rustpython-derive-impl` | 0.4.0 | MIT |
| `rustpython-doc` | 0.3.0 | see LICENSE |
| `rustpython-format` | 0.4.0 | MIT |
| `rustpython-literal` | 0.4.0 | MIT |
| `rustpython-parser` | 0.4.0 | MIT |
| `rustpython-parser-core` | 0.4.0 | MIT |
| `rustpython-parser-vendored` | 0.4.0 | MIT |
| `rustpython-pylib` | 0.4.0 | see Lib/PSF-LICENSE |
| `rustpython-sre_engine` | 0.4.0 | MIT |
| `rustpython-stdlib` | 0.4.0 | MIT |
| `rustpython-vm` | 0.4.0 | MIT |
| `rustversion` | 1.0.23 | MIT OR Apache-2.0 |
| `ryu` | 1.0.23 | Apache-2.0 OR BSL-1.0 |
| `scopeguard` | 1.2.0 | MIT OR Apache-2.0 |
| `serde` | 1.0.229 | MIT OR Apache-2.0 |
| `serde_core` | 1.0.229 | MIT OR Apache-2.0 |
| `serde_derive` | 1.0.229 | MIT OR Apache-2.0 |
| `serde_json` | 1.0.151 | MIT OR Apache-2.0 |
| `sha-1` | 0.10.1 | MIT OR Apache-2.0 |
| `sha2` | 0.10.9 | MIT OR Apache-2.0 |
| `sha3` | 0.10.9 | MIT OR Apache-2.0 |
| `simd-adler32` | 0.3.10 | MIT |
| `siphasher` | 0.3.11 | MIT/Apache-2.0 |
| `siphasher` | 1.0.3 | MIT/Apache-2.0 |
| `slab` | 0.4.12 | MIT |
| `smallvec` | 1.15.2 | MIT OR Apache-2.0 |
| `static_assertions` | 1.1.0 | MIT OR Apache-2.0 |
| `subtle` | 2.6.1 | BSD-3-Clause |
| `syn` | 1.0.109 | MIT OR Apache-2.0 |
| `syn` | 2.0.119 | MIT OR Apache-2.0 |
| `syn` | 3.0.3 | MIT OR Apache-2.0 |
| `syn-ext` | 0.4.0 | see LICENSE |
| `textwrap` | 0.15.2 | MIT |
| `thiserror` | 1.0.69 | MIT OR Apache-2.0 |
| `thiserror-impl` | 1.0.69 | MIT OR Apache-2.0 |
| `thread_local` | 1.1.10 | MIT OR Apache-2.0 |
| `timsort` | 0.1.3 | MIT/Apache-2.0 |
| `tinyvec` | 1.12.0 | Zlib OR Apache-2.0 OR MIT |
| `tinyvec_macros` | 0.1.1 | MIT OR Apache-2.0 OR Zlib |
| `toml_datetime` | 1.1.1+spec-1.1.0 | MIT OR Apache-2.0 |
| `toml_edit` | 0.25.13+spec-1.1.0 | MIT OR Apache-2.0 |
| `toml_parser` | 1.1.3+spec-1.1.0 | MIT OR Apache-2.0 |
| `twox-hash` | 2.1.3 | MIT |
| `typenum` | 1.20.1 | MIT OR Apache-2.0 |
| `ucd` | 0.1.1 | MIT |
| `unic-char-property` | 0.9.0 | MIT/Apache-2.0 |
| `unic-char-range` | 0.9.0 | MIT/Apache-2.0 |
| `unic-common` | 0.9.0 | MIT/Apache-2.0 |
| `unic-emoji-char` | 0.9.0 | MIT/Apache-2.0 |
| `unic-normal` | 0.9.0 | MIT/Apache-2.0 |
| `unic-ucd-age` | 0.9.0 | MIT/Apache-2.0 |
| `unic-ucd-bidi` | 0.9.0 | MIT/Apache-2.0 |
| `unic-ucd-category` | 0.9.0 | MIT/Apache-2.0 |
| `unic-ucd-hangul` | 0.9.0 | MIT/Apache-2.0 |
| `unic-ucd-ident` | 0.9.0 | MIT/Apache-2.0 |
| `unic-ucd-normal` | 0.9.0 | MIT/Apache-2.0 |
| `unic-ucd-version` | 0.9.0 | MIT/Apache-2.0 |
| `unicode-casing` | 0.1.1 | MIT |
| `unicode-ident` | 1.0.24 | (MIT OR Apache-2.0) AND Unicode-3.0 |
| `unicode-normalization` | 0.1.25 | MIT OR Apache-2.0 |
| `unicode-width` | 0.2.2 | MIT OR Apache-2.0 |
| `unicode-xid` | 0.2.6 | MIT OR Apache-2.0 |
| `unicode_names2` | 1.3.0 | (MIT OR Apache-2.0) AND Unicode-DFS-2016 |
| `volatile` | 0.3.0 | MIT OR Apache-2.0 |
| `wasm-bindgen` | 0.2.127 | MIT OR Apache-2.0 |
| `wasm-bindgen-macro` | 0.2.127 | MIT OR Apache-2.0 |
| `wasm-bindgen-macro-support` | 0.2.127 | MIT OR Apache-2.0 |
| `wasm-bindgen-shared` | 0.2.127 | MIT OR Apache-2.0 |
| `winnow` | 1.0.4 | MIT |
| `xml-rs` | 0.8.29 | MIT |
| `zerocopy` | 0.8.56 | BSD-2-Clause OR Apache-2.0 OR MIT |
| `zmij` | 1.0.23 | MIT |

Three crates declare no SPDX identifier in their manifests and carry a `LICENSE`
file instead:

* `mt19937` — the original Mersenne Twister notice by Makoto Matsumoto and
  Takuji Nishimura, a 3-clause BSD licence. Text: `licenses/BSD-3-Clause-mt19937.txt`.
* `syn-ext` — 2-clause BSD. Text: `licenses/BSD-2-Clause-syn-ext.txt`.
* `rustpython-doc` — CPython's docstrings, so the PSF licence again.
  Text: `licenses/PSF-2.0.txt`.

## Build-time only

`package.json` pulls in esbuild, TypeScript, Playwright and a Markdown
converter. None of them ship to a visitor — they compile `site/src/*.ts` and
drive the browser checks. Their licences are in `node_modules`, which this
repository does not track.
