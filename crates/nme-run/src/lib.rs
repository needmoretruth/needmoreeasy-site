//! # `nme-run` — the Python side of the browser playground
//!
//! ## Intent
//! `nme-web` turns NME into Python. Something then has to *run* that Python,
//! and on a static site the only place left is the visitor's own browser.
//! This crate embeds RustPython (a Python interpreter written in Rust) and
//! exposes one call that executes a program and reports what it printed.
//!
//! ## Contract
//! The host — the web worker in `site/assets/play-worker.js` — must define a
//! global object before calling [`run`]:
//!
//! ```js
//! globalThis.nmeHost = {
//!   write(text) { /* append to the terminal */ },
//!   readLine(prompt) { /* BLOCK, then return one line without its newline */ },
//! }
//! ```
//!
//! `readLine` really must block: Python's `input()` is synchronous, so the
//! worker blocks on `Atomics.wait` while the page collects a line. That is why
//! the playground runs in a worker and why the site sends the cross-origin
//! isolation headers `SharedArrayBuffer` requires.
//!
//! [`run`] returns a JSON string: `{"ok": true}` or `{"ok": false,
//! "error": "<rendered traceback>"}`. Program output is *not* in the return
//! value; it has already been streamed through `nmeHost.write`, so a program
//! that loops forever still shows everything it printed before being stopped.
//!
//! ## Side effects
//! Every write and every input request crosses into JavaScript. Nothing else
//! escapes: this target has no file system, no network, and no clock beyond
//! what the browser gives RustPython.
//!
//! ## Failure modes
//! * A Python exception is a normal outcome, returned as `ok: false` with the
//!   traceback text. It is never a panic.
//! * A program that never terminates cannot be interrupted from inside; the
//!   page kills the whole worker instead.
//! * `open()` and friends fail — WebAssembly in a browser has no file system.
//!   The site says so next to the file examples rather than pretending.

use rustpython_vm::{compiler::Mode, AsObject, Interpreter, Settings};
use serde::Serialize;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = nmeHost, js_name = write)]
    fn host_write(text: &str);

    #[wasm_bindgen(js_namespace = nmeHost, js_name = readLine)]
    fn host_read_line(prompt: &str) -> String;
}

/// The bridge module Python sees. Two functions, both of which hand straight
/// over to the host page; keeping it this small means the Python prelude below
/// is the only place that has to know about `sys.stdout` semantics.
#[rustpython_vm::pymodule]
mod _nmehost {
    #[pyfunction]
    fn write(text: String) {
        super::host_write(&text);
    }

    #[pyfunction]
    fn read_line(prompt: String) -> String {
        super::host_read_line(&prompt)
    }

    /// RustPython leaves `os.urandom` unimplemented on this target, which
    /// breaks `secrets` and therefore NME's zero-knowledge examples. The
    /// browser does have a cryptographic generator, so hand that one over
    /// rather than letting the program fall back to anything weaker.
    #[pyfunction]
    fn urandom(size: usize, vm: &VirtualMachine) -> PyResult<PyObjectRef> {
        let mut bytes = vec![0_u8; size];
        getrandom::getrandom(&mut bytes)
            .map_err(|_| vm.new_os_error("the browser refused to provide randomness".to_owned()))?;
        Ok(vm.ctx.new_bytes(bytes).into())
    }

    use rustpython_vm::{PyObjectRef, PyResult, VirtualMachine};
}

/// Runs before the visitor's program.
///
/// `sys.stdout`/`sys.stderr` are replaced so `print` reaches the terminal one
/// write at a time, and `input` is replaced so it asks the page. The classes
/// are deliberately minimal: they implement exactly what CPython code touches
/// on a text stream in these programs.
const PRELUDE: &str = r#"
import sys, builtins, _nmehost

# There is no operating system behind this interpreter, so `import os` fails
# and the standard library's entropy source degrades to a stub that raises.
# `secrets` (and therefore NME's zero-knowledge examples) reaches it through
# `random._urandom`, so that one name is redirected to the browser's own
# cryptographic generator. If this ever stops matching the standard library,
# `secrets` fails loudly on its own rather than quietly weakening.
import random
random._urandom = _nmehost.urandom

class _NmeStream:
    encoding = "utf-8"
    errors = "strict"

    def write(self, text):
        text = str(text)
        _nmehost.write(text)
        return len(text)

    def writelines(self, lines):
        for line in lines:
            self.write(line)

    def flush(self):
        return None

    def isatty(self):
        return False

    def readable(self):
        return False

    def writable(self):
        return True

    def seekable(self):
        return False

    def fileno(self):
        raise OSError("the browser playground has no file descriptors")

sys.stdout = _NmeStream()
sys.stderr = _NmeStream()

def _nme_input(prompt=""):
    return _nmehost.read_line(str(prompt))

builtins.input = _nme_input
"#;

#[derive(Serialize)]
struct Outcome {
    ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

fn finish(ok: bool, error: Option<String>) -> String {
    serde_json::to_string(&Outcome { ok, error })
        .unwrap_or_else(|_| r#"{"ok":false,"error":"internal error"}"#.to_string())
}

/// Executes Python source. See the module docs for the JSON shape.
#[wasm_bindgen]
#[must_use]
pub fn run(python: &str) -> String {
    let mut settings = Settings::default();
    // There are no OS signals here, and the interpreter should not try to
    // write `.pyc` files to a file system that does not exist.
    settings.install_signal_handlers = false;
    settings.write_bytecode = false;
    settings.import_site = false;

    let interpreter = Interpreter::with_init(settings, |vm| {
        vm.add_native_modules(rustpython_stdlib::get_module_inits());
        // The pure-Python modules are frozen into this binary; without this
        // line `import random` fails, since there is no file system to search.
        vm.add_frozen(rustpython_pylib::FROZEN_STDLIB);
        vm.add_native_module("_nmehost".to_owned(), Box::new(_nmehost::make_module));
    });

    interpreter.enter(|vm| {
        let scope = vm.new_scope_with_builtins();

        // A failure here is a bug in the prelude, not in the visitor's code.
        // It is still shown in full: a silent swallow would leave a broken
        // playground looking like a broken program.
        match vm.compile(PRELUDE, Mode::Exec, "<nme-prelude>".to_owned()) {
            Ok(code) => {
                if let Err(exception) = vm.run_code_obj(code, scope.clone()) {
                    return finish(
                        false,
                        Some(format!("playground prelude failed\n{}", render(vm, &exception))),
                    );
                }
            }
            Err(error) => {
                return finish(false, Some(format!("playground prelude failed\n{error}")))
            }
        }

        let code = match vm.compile(python, Mode::Exec, "program.py".to_owned()) {
            Ok(code) => code,
            Err(error) => {
                let exception = vm.new_syntax_error(&error, Some(python));
                return finish(false, Some(render(vm, &exception)));
            }
        };

        match vm.run_code_obj(code, scope) {
            Ok(_) => finish(true, None),
            Err(exception) => {
                // `raise SystemExit` / `sys.exit()` is how a Python program
                // ends on purpose; showing a traceback for it would be wrong.
                if exception.class().is(vm.ctx.exceptions.system_exit) {
                    finish(true, None)
                } else {
                    finish(false, Some(render(vm, &exception)))
                }
            }
        }
    })
}

/// Renders a Python exception the way the `python` command would, into text
/// the page can print verbatim.
fn render(
    vm: &rustpython_vm::VirtualMachine,
    exception: &rustpython_vm::builtins::PyBaseExceptionRef,
) -> String {
    let mut text = String::new();
    if vm.write_exception(&mut text, exception).is_err() {
        return "could not render the error".to_string();
    }
    text
}
