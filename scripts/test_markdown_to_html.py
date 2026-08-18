#!/usr/bin/env python3
"""Checks `markdown_to_html` against one case per construct and the real docs.

    python3 scripts/test_markdown_to_html.py

The focused tests pin down the constructs the site depends on. The corpus pass
is the one that matters in practice: it renders every file the build will ever
see and fails on any line that still looks like Markdown outside a code region,
which is how an unsupported construct announces itself.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from markdown_to_html import headings, render, title  # noqa: E402

DOCS = Path(__file__).resolve().parents[2] / "needmoreeasy/docs"

# Regions the corpus check must not look inside: their content is source text
# on purpose.
CODE = re.compile(r"<pre class=\"code\">.*?</pre>|<code[^>]*>.*?</code>", re.S)
LEFTOVERS = (
    ("heading", re.compile(r"^#")),
    ("bullet", re.compile(r"^- ")),
    ("table row", re.compile(r"^\|")),
    ("blockquote", re.compile(r"^> ")),
    ("bold marker", re.compile(r"\*\*")),
    ("link", re.compile(r"\]\(")),
    ("comment", re.compile(r"<!--")),
)


def test_headings():
    out = render("# Title\n\n## Second\n")
    assert '<h1 id="title">Title</h1>' in out, out
    assert '<h2 id="second">Second</h2>' in out, out
    assert render("###### Deep\n").startswith("<h6 "), render("###### Deep\n")


def test_korean_heading_id():
    out = render("## 값 저장\n")
    assert '<h2 id="값-저장">값 저장</h2>' in out, out
    assert "%" not in out, out


def test_duplicate_heading_ids():
    identifiers = [item[1] for item in headings("# A\n\n# A\n\n# A\n")]
    assert identifiers == ["a", "a-2", "a-3"], identifiers


def test_headings_match_render():
    source = "# One\n\n## 한글 제목\n\n## 한글 제목\n"
    for _level, identifier, _plain in headings(source):
        assert f'id="{identifier}"' in render(source), identifier
    assert title(source) == "One", title(source)
    assert title("no heading here\n") is None


def test_heading_plain_text_drops_markers():
    found = headings("## Modules: importing `.nme` files\n")
    assert found == [(2, "modules-importing-nme-files",
                      "Modules: importing .nme files")], found


def test_paragraphs():
    out = render("One line\nwrapped.\n\nSecond.\n")
    assert out == "<p>One line\nwrapped.</p>\n<p>Second.</p>\n", out


def test_hard_break():
    out = render("left  \nright\n")
    assert out == "<p>left<br>\nright</p>\n", out


def test_fenced_code():
    out = render("```python\nprint(1 < 2)\n```\n")
    assert out == ('<pre class="code"><code class="language-python">'
                   "print(1 &lt; 2)\n</code></pre>\n"), out


def test_fence_without_info_string():
    out = render("```\nplain\n```\n")
    assert out == '<pre class="code"><code>plain\n</code></pre>\n', out


def test_code_is_never_markdown():
    out = render("```text\n# not a heading **not bold** [a](b)\n```\n")
    assert "<h1" not in out and "<strong>" not in out and "<a " not in out, out


def test_table_with_alignment():
    out = render("| a | b | c |\n| :-- | :-: | --: |\n| 1 | 2 | 3 |\n")
    assert "<thead>" in out and "<tbody>" in out, out
    assert '<th style="text-align:left">a</th>' in out, out
    assert '<th style="text-align:center">b</th>' in out, out
    assert '<td style="text-align:right">3</td>' in out, out


def test_table_without_alignment_has_no_style():
    out = render("| a |\n| --- |\n| 1 |\n")
    assert "<th>a</th>" in out and "style=" not in out, out


def test_table_escaped_pipe():
    out = render("| a | b |\n| --- | --- |\n| x \\| y | z |\n")
    assert "<td>x | y</td>" in out, out
    assert out.count("<td>") == 2, out


def test_table_cells_take_inline_markdown():
    out = render("| a |\n| --- |\n| `x` and **y** |\n")
    assert "<td><code>x</code> and <strong>y</strong></td>" in out, out


def test_unordered_list():
    out = render("- one\n- two\n")
    assert out == "<ul>\n<li>one</li>\n<li>two</li>\n</ul>\n", out
    assert render("* one\n").startswith("<ul>")
    assert render("+ one\n").startswith("<ul>")


def test_ordered_list():
    out = render("1. one\n2. two\n")
    assert out == "<ol>\n<li>one</li>\n<li>two</li>\n</ol>\n", out


def test_nested_list():
    out = render("- outer\n  - inner\n- second\n")
    assert "<li>outer<ul>\n<li>inner</li>\n</ul>\n</li>" in out, out
    assert out.count("<ul>") == 2, out


def test_list_item_continuation_lines():
    out = render("- first line\n  second line\n")
    assert out == "<ul>\n<li>first line\nsecond line</li>\n</ul>\n", out


def test_fenced_code_inside_list_item():
    source = "1. Write this:\n\n   ```text\n   show Hello\n   ```\n\n2. Done.\n"
    out = render(source)
    assert '<pre class="code"><code class="language-text">show Hello\n' in out, out
    assert "<li><p>Write this:</p>\n<pre" in out, out


def test_list_does_not_swallow_wrapped_number():
    out = render("A sentence that wraps onto\n6. Two values remain.\n")
    assert "<ol" not in out, out


def test_blockquote_with_blocks():
    out = render("> **Note.** text\n>\n> - a\n")
    assert out.startswith("<blockquote>\n"), out
    assert "<strong>Note.</strong>" in out and "<li>a</li>" in out, out


def test_thematic_break():
    assert render("a\n\n---\n\nb\n").count("<hr>") == 1
    assert render("a\n\n***\n\nb\n").count("<hr>") == 1


def test_inline_code_wins():
    out = render("`**not bold** [a](b) <i>` and **bold**\n")
    assert "<code>**not bold** [a](b) &lt;i&gt;</code>" in out, out
    assert "<strong>bold</strong>" in out, out


def test_inline_code_spans_lines():
    out = render("a `Result<String,\nVec<Diagnostic>>` b\n")
    assert "<code>Result&lt;String, Vec&lt;Diagnostic&gt;&gt;</code>" in out, out


def test_emphasis():
    assert "<em>i</em>" in render("*i*\n")
    assert "<em>i</em>" in render("_i_\n")
    assert "<strong>b</strong>" in render("**b**\n")
    assert "<del>s</del>" in render("~~s~~\n")


def test_underscores_inside_words_stay_literal():
    out = render("___ and ___ stay blank\n")
    assert "<em>" not in out and "<strong>" not in out, out


def test_link_and_rewriter():
    out = render("see [the guide](01-hello.md)\n")
    assert '<a href="01-hello.md">the guide</a>' in out, out
    rewritten = render("see [x](01-hello.md)\n", lambda t: t.replace(".md", ".html"))
    assert '<a href="01-hello.html">x</a>' in rewritten, rewritten


def test_autolink():
    out = render("<https://example.com/a?b=1>\n")
    assert '<a href="https://example.com/a?b=1">https://example.com/a?b=1</a>' in out


def test_html_comment_removed():
    out = render("before\n\n<!-- nme-check: skip -->\n```text\nx\n```\n")
    assert "<!--" not in out and "nme-check" not in out, out
    assert "<pre" in out, out


def test_html_comment_inside_list_item():
    source = "1. text:\n\n   <!-- nme-check: skip -->\n   ```text\n   x\n   ```\n"
    out = render(source)
    assert "nme-check" not in out, out
    assert '<code class="language-text">x\n' in out, out


def test_raw_html_is_escaped():
    payload = "<script>alert(1)</script>"
    for source in (payload, f"# {payload}", f"| a |\n| --- |\n| {payload} |",
                   f"- {payload}", f"> {payload}", f"[x]({payload})"):
        out = render(source + "\n")
        assert "<script>" not in out, (source, out)
        assert "</script>" not in out, (source, out)
        assert "alert(1)" in out or "alert%281%29" in out, (source, out)
    assert "&lt;script&gt;" in render(payload + "\n")


def test_ampersand_is_escaped():
    assert render("a & b\n") == "<p>a &amp; b</p>\n"


def corpus_files():
    if not DOCS.is_dir():
        return []
    return sorted(DOCS.rglob("*.md"))


def test_corpus():
    files = corpus_files()
    for path in files:
        out = render(path.read_text(encoding="utf-8"))
        stripped = CODE.sub(lambda match: "\n" * match.group(0).count("\n"), out)
        for number, line in enumerate(stripped.split("\n"), 1):
            for name, pattern in LEFTOVERS:
                if pattern.search(line):
                    raise AssertionError(
                        f"{path}: rendered line {number} still has a {name} "
                        f"marker: {line[:120]!r}"
                    )
    return len(files)


def main():
    tests = [value for name, value in sorted(globals().items())
             if name.startswith("test_") and name != "test_corpus"]
    for test in tests:
        test()
    rendered = test_corpus()
    if not rendered:
        print(f"test_markdown_to_html: {len(tests)} tests ok, corpus skipped "
              f"(no {DOCS})")
        return
    print(f"test_markdown_to_html: {len(tests)} tests ok, "
          f"{rendered} corpus files rendered")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as failure:
        print(f"test_markdown_to_html: FAIL {failure}", file=sys.stderr)
        raise SystemExit(1)
