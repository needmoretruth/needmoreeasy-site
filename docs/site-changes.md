# What changed on the site

English | [한국어](site-changes.ko.md)

This is the record of how needmoreeasy.com itself has changed. What changed in the
language and in the compiler that runs in your browser is kept separately, in the
[changelog](changes) — they are two different things, and a reader should not have
to work out which of them moved.

## 2026-09-29

- **Installing NME on your own computer is one line.** The bottom of the home page
  now gives one command for macOS and Linux and one for Windows PowerShell, each with
  its own copy button. It downloads a ready-made `nme` for your computer, refuses it
  unless it matches the checksum published with the release, and puts it where a new
  terminal finds it. Installing Rust and Git and compiling from source are no longer part of it.
- **The installer tells you whether you still need Python**, and where to get it.
- **The page no longer scrolls sideways on a narrow phone with large text.** At 320
  pixels wide with text at 150%, the example shelf and the label under it made the
  whole page wider than the screen.

## 2026-08-23

- **Undo and redo.** Ctrl+Z and Ctrl+Shift+Z (Ctrl+Y as well on Windows), and two
  buttons above the editor. The three files and the example each keep their own
  history, so moving between them does not take away what you were doing in one of
  them. One Korean letter is one step, and so is a rename that touches four hundred
  lines at once.
- **Typing no longer freezes the page.** In the 4,337-line example, the longest the
  screen stopped for one keystroke went from 3,966 milliseconds to none at all.
  Compiling happens on another thread, the Python pane repaints the lines that
  changed instead of all of them, and nothing is compiled in the middle of building
  a Korean letter.
- **One wrong letter no longer throws the page upward.** While a program is briefly
  broken the Python from a moment ago stays where it was, faded, and the band under
  the editor says what is wrong.
- **Renaming finds the names of values, not only of jobs.** It used to collect `def`
  lines and nothing else, which is why a large program offered six things to rename.
  It now finds 404 in the largest example, and says how many places the name you
  picked is in. A word that only looks the same inside a sentence is left alone.
- **The find box no longer steals the caret after one letter.**
- **When the engine's two files are from different builds, the page repairs itself.**
  A browser holding an old copy of one of them used to mean that nothing ran, however
  many times you reloaded. It now fetches both again, once and quietly, and says
  plainly what to do if that does not work.
- **Two examples added** — RSA public-key cryptography written entirely in sentences,
  and a reproduction of Bitcoin as it was in January 2009. The second one really
  mines, so it takes about four minutes in a browser.
- The design was pared back further, the examples moved to sit directly above the
  code, and find and rename were added. Every colour and border on the page was
  measured against what is behind it, and the skip link now really moves the caret
  into the editor.

## 2026-08-22

- The design became minimalist.
- The Run button stays within reach in a long program.
- A compiler older than the language repository can no longer be deployed.

## 2026-08-20 – 08-21

- The examples were sorted into six groups, and any one of them can be shown in six
  ways: sentence, beginner and advanced, in Korean and English.
- Several large programs were added — The Sunken Castle, number baseball, the word
  guess, the memory game, the corner shop, the score sheet.
- Fixed a phone header that covered the first screen.

## 2026-08-19

- **A coding screen**, which gives the whole window to the editor.
- **Each line of the editor is paired with its line of Python**, so that one sentence
  being one line is something you can see rather than something you are told.
- **Tidying**: a program written any old way is rewritten in one spelling.
- When a program ends, what each name holds is shown.
- A failed compile says which line and why, with "what does this mean?" beside it.
- Colours a program prints are drawn by the output pane.
- The file tabs and the pane tabs can be walked with the keyboard.
- A checker that drives the site by real touches, and every target grown to 44 pixels.

## 2026-08-18

- **Every guide, the syntax list and the AI prompts can be read and run inside the
  site.** No GitHub account, nothing to download.
- **Three files in the playground**, plus a pane for the example, so that pressing an
  example does not take away what you were writing.
- A button that puts your program into a link.
- An address that does not exist returned the home page with a 200; it now returns a
  404 page.
- 116 dead prerequisite links in the guides were fixed.
- Arriving from a guide link used to wipe all three files. Fixed.
- Every deploy now checks five widths in both themes, and what a visitor sees when a
  download never arrives or the engine is slow.

## 2026-08-17

- needmoreeasy.com opened: a compiler and a Python engine that run inside the browser,
  in English and Korean.
