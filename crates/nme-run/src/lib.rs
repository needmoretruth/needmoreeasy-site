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

    #[wasm_bindgen(js_namespace = nmeHost, js_name = sleep)]
    fn host_sleep(seconds: f64);
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

    /// RustPython's `time.sleep` traps on this target, and NME's `wait 3
    /// seconds` lowers to it. The worker thread is allowed to block, so hand
    /// the wait over to the page instead of letting the program die.
    /// `ArgIntoFloat` is what makes `time.sleep(3)` work as well as
    /// `time.sleep(0.5)`: a bare `f64` argument would refuse the integer that
    /// `wait 3 seconds` produces.
    #[pyfunction]
    fn sleep(seconds: rustpython_vm::function::ArgIntoFloat) {
        let seconds = *seconds;
        if seconds.is_finite() && seconds > 0.0 {
            super::host_sleep(seconds);
        }
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

# `time.sleep` traps on this target, and NME's `wait 3 seconds` compiles to it.
# The worker thread this runs on is allowed to block, so the wait is handed to
# the page rather than killing the program.
import time
time.sleep = _nmehost.sleep

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
    /// What the program's own names held when it stopped, in the order they
    /// were made. Empty when it made none.
    #[serde(skip_serializing_if = "Vec::is_empty")]
    values: Vec<Value>,
}

/// One name the program made, and what was in it, as the writer would see it.
#[derive(Serialize)]
struct Value {
    name: String,
    shown: String,
}

/// How many names to hand back, and how long each may be. A program that fills
/// a list with ten thousand things should not send ten thousand characters
/// through the message channel to say so.
const VALUE_LIMIT: usize = 40;
const SHOWN_LIMIT: usize = 120;

fn finish(ok: bool, error: Option<String>) -> String {
    finish_with(ok, error, Vec::new())
}

fn finish_with(ok: bool, error: Option<String>, values: Vec<Value>) -> String {
    serde_json::to_string(&Outcome { ok, error, values })
        .unwrap_or_else(|_| r#"{"ok":false,"error":"internal error"}"#.to_string())
}

/// Every name a scope holds right now.
fn scope_names(
    vm: &rustpython_vm::VirtualMachine,
    scope: &rustpython_vm::scope::Scope,
) -> std::collections::HashSet<String> {
    let mut names = std::collections::HashSet::new();
    let Ok(keys) = scope.globals.as_object().to_owned().get_attr("keys", vm) else {
        return names;
    };
    let Ok(listed) = keys.call((), vm) else { return names };
    let Ok(items) = listed.try_to_value::<Vec<rustpython_vm::PyObjectRef>>(vm) else {
        return names;
    };
    for key in items {
        if let Ok(name) = key.str(vm) {
            names.insert(name.as_str().to_owned());
        }
    }
    names
}

/// The names the program itself made, with what they hold.
///
/// A beginner's first real question about a running program is *what is in it
/// now*, and until this the playground could only answer with whatever the
/// program remembered to print. The names are told apart from the prelude's and
/// the builtins' by taking a snapshot of the scope before the program runs and
/// keeping only what is new or changed.
///
/// Modules and functions are left out: `use date latest` binds eight helpers
/// that are the language's, not the writer's, and showing them would bury the
/// two names the writer actually made.
fn program_values(
    vm: &rustpython_vm::VirtualMachine,
    scope: &rustpython_vm::scope::Scope,
    before: &std::collections::HashSet<String>,
) -> Vec<Value> {
    let mut values = Vec::new();
    let Ok(names) = scope.globals.as_object().to_owned().get_attr("keys", vm) else {
        return values;
    };
    let Ok(keys) = names.call((), vm) else {
        return values;
    };
    let Ok(listed) = keys.try_to_value::<Vec<rustpython_vm::PyObjectRef>>(vm) else {
        return values;
    };
    for key in listed {
        let Ok(name) = key.str(vm) else { continue };
        let name = name.as_str().to_owned();
        if name.starts_with('_') || before.contains(&name) {
            continue;
        }
        let Ok(Some(held)) = scope.globals.get_item_opt(&*name, vm) else {
            continue;
        };
        // A function or a module is the language's furniture, not the writer's
        // value; `_nme_` names are this playground's own. Each bundled module
        // also binds its own version as a plain string (`date_version` and
        // `날짜버전`), and those are not callable, so they are named here.
        if held.is_callable()
            || held.class().name().to_string() == "module"
            || name.ends_with("_version")
            || name.ends_with("버전")
        {
            continue;
        }
        let Ok(shown) = held.repr(vm) else { continue };
        let mut shown = shown.as_str().to_owned();
        if shown.chars().count() > SHOWN_LIMIT {
            shown = shown.chars().take(SHOWN_LIMIT).collect::<String>() + "…";
        }
        values.push(Value { name, shown });
        if values.len() >= VALUE_LIMIT {
            break;
        }
    }
    values
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

        // Everything the scope holds before the program starts belongs to the
        // prelude or to Python itself. Whatever is there afterwards and is not
        // in here is the writer's.
        let before = scope_names(vm, &scope);

        match vm.run_code_obj(code, scope.clone()) {
            Ok(_) => finish_with(true, None, program_values(vm, &scope, &before)),
            Err(exception) => {
                // `raise SystemExit` / `sys.exit()` is how a Python program
                // ends on purpose; showing a traceback for it would be wrong.
                let values = program_values(vm, &scope, &before);
                if exception.class().is(vm.ctx.exceptions.system_exit) {
                    finish_with(true, None, values)
                } else {
                    // The values are handed back on a failure too, and that is
                    // the case they matter most in: a program that stopped
                    // half way is exactly when someone wants to know what was
                    // in the names at the time.
                    finish_with(false, Some(render(vm, &exception)), values)
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
