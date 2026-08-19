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
//! {"ok": false, "diagnostic": "program.nme:2:1: error[E0102] ...",
//!  "problems": [{"code": "E0102", "line": 2, "column": 1, "titleKo": "...",
//!                "messageKo": "...", "hintKo": "...", "detailKo": "..."}]}
//! ```
//!
//! `diagnostic` is the compiler's own rendered text, kept because it is the
//! most complete thing there is. `problems` is the same information taken
//! apart, so the page can say *which line* next to the editor instead of
//! leaving a visitor to notice that the Run button went quiet.
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

use nme_core::diagnostics::{render_all_bilingual, Diagnostic};
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
    #[serde(skip_serializing_if = "Vec::is_empty")]
    problems: Vec<Problem>,
}

/// One problem, taken apart so the page can point at the line it is on.
///
/// Both languages travel together: the site picks one, and which one is a
/// property of the page the visitor is reading, not of the compiler.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Problem {
    code: String,
    /// 1-based, counting physical lines, exactly like the editor's gutter.
    line: usize,
    /// 1-based, counting characters.
    column: usize,
    title_en: &'static str,
    title_ko: &'static str,
    message_en: String,
    message_ko: String,
    hint_en: Option<String>,
    hint_ko: Option<String>,
    detail_en: &'static str,
    detail_ko: &'static str,
}

fn problem_of(diagnostic: &Diagnostic, source: &str) -> Problem {
    let (line, column) = diagnostic.line_col(source);
    let explanation = diagnostic.code.explanation();
    Problem {
        code: explanation.code.to_string(),
        line,
        column,
        title_en: explanation.title_en,
        title_ko: explanation.title_ko,
        message_en: diagnostic.message.clone(),
        // Not every diagnostic carries a Korean twin; the English one is
        // better than an empty box, and the title beside it is Korean.
        message_ko: diagnostic
            .message_ko
            .clone()
            .unwrap_or_else(|| diagnostic.message.clone()),
        hint_en: diagnostic.hint.clone(),
        hint_ko: diagnostic.hint_ko.clone().or_else(|| diagnostic.hint.clone()),
        detail_en: explanation.detail_en,
        detail_ko: explanation.detail_ko,
    }
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
            problems: Vec::new(),
        },
        Err(found) => {
            let rendered = render_all_bilingual(&found, source, VIRTUAL_PATH);
            let problems = found
                .iter()
                .map(|diagnostic| problem_of(diagnostic, source))
                .collect();
            return serde_json::to_string(&Outcome {
                ok: false,
                python: None,
                diagnostic: Some(&rendered),
                problems,
            })
            .unwrap_or_else(|_| r#"{"ok":false,"diagnostic":"internal error"}"#.to_string());
        }
    };
    serde_json::to_string(&outcome)
        .unwrap_or_else(|_| r#"{"ok":false,"diagnostic":"internal error"}"#.to_string())
}
