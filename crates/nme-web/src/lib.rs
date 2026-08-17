//! # `nme-web` — the NME compiler, in the visitor's browser
//!
//! ## Intent
//! needmoreeasy.com is a **static** site: there is no server that could run a
//! compiler for a visitor. This crate therefore ships the real `nme-core`
//! compiler to the browser as WebAssembly, so the "try it" panel on the site
//! produces exactly the Python that an installed `nme build` would produce —
//! not a hand-written imitation of it.
//!
//! ## Contract
//! One entry point, [`compile`]. It takes NME source text and returns a JSON
//! string that JavaScript parses:
//!
//! ```json
//! {"ok": true,  "python": "print('hi')"}
//! {"ok": false, "diagnostic": "program.nme:2:1: error[E0102] ..."}
//! ```
//!
//! JSON (rather than a rich JS object) keeps the JavaScript side free of any
//! generated glue types, which keeps the site's script readable by hand.
//!
//! ## Side effects
//! None. `nme-core` is a pure text-to-text transformation: no file system, no
//! process spawning, no network. That is the whole reason it can run here.
//!
//! ## Failure modes
//! * Compile errors are **not** failures of this function — they come back as
//!   `ok: false` with the compiler's own rendered diagnostic (both languages,
//!   with the caret line), so the site can print it verbatim.
//! * The only way this returns malformed output is a `serde_json` failure,
//!   which cannot happen for these two plain-string shapes; the fallback
//!   literal below exists so the signature never has to be fallible.

use nme_core::diagnostics::render_all_bilingual;
use nme_core::transpile;
use serde::Serialize;
use wasm_bindgen::prelude::wasm_bindgen;

/// The file name shown in diagnostics. Visitors are editing an unsaved buffer,
/// so a neutral, obviously-fake name is friendlier than an empty string.
const VIRTUAL_PATH: &str = "program.nme";

#[derive(Serialize)]
struct Outcome<'a> {
    ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    python: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    diagnostic: Option<&'a str>,
}

/// Compiles NME source to Python source.
///
/// See the module docs for the JSON shape. Never panics on bad input: invalid
/// programs are a normal, expected result here.
#[wasm_bindgen]
#[must_use]
pub fn compile(source: &str) -> String {
    let outcome = match transpile(source) {
        Ok(python) => Outcome {
            ok: true,
            python: Some(python),
            diagnostic: None,
        },
        Err(problems) => {
            let rendered = render_all_bilingual(&problems, source, VIRTUAL_PATH);
            return serde_json::to_string(&Outcome {
                ok: false,
                python: None,
                diagnostic: Some(&rendered),
            })
            .unwrap_or_else(|_| r#"{"ok":false,"diagnostic":"internal error"}"#.to_string());
        }
    };
    serde_json::to_string(&outcome)
        .unwrap_or_else(|_| r#"{"ok":false,"diagnostic":"internal error"}"#.to_string())
}
