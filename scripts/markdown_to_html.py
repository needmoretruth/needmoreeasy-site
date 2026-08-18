#!/usr/bin/env python3
"""Renders the Markdown under `needmoreeasy/docs/` into HTML fragments.

The site build runs from a stock Python 3 and must produce the same bytes
today and next year, so this is a hand-written subset of GFM rather than a
general Markdown engine. It covers exactly the constructs the docs use, and
escapes anything else instead of passing it through: a docs page must never be
able to inject markup.

    from markdown_to_html import render, headings, title

Two invariants are easy to break later. Every branch that emits source text
goes through `_text` or `_attribute`; one that does not is a hole. And
`headings` runs the same walk as `render`, so the ids it reports cannot drift
from the ids on the rendered heading elements.
"""

from __future__ import annotations

import html
import re

__all__ = ["render", "headings", "title"]

# Blocks. Fences match at any indent: one inside a list item is dedented by the
# item, and a stray indent elsewhere should still open a code block.
FENCE = re.compile(r"^([ \t]*)(`{3,})[ \t]*([^`\s]*)[ \t]*$")
HEADING = re.compile(r"^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*$")
THEMATIC = re.compile(r"^ {0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$")
QUOTE = re.compile(r"^ {0,3}>[ \t]?")
BULLET = re.compile(r"^( *)([-*+])( +)(.+)$")
ORDERED = re.compile(r"^( *)(\d{1,9})\.( +)(.+)$")
CLOSING_HASHES = re.compile(r"[ \t]+#+$")
ALIGNMENT = re.compile(r":?-+:?")

# Inline.
AUTOLINK = re.compile(r"<([a-zA-Z][a-zA-Z0-9+.\-]*:[^<>\s]+)>")
HARD_BREAK = re.compile(r" {2,}\n")
PUNCTUATION = set("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~")
EMPHASIS = {1: ("<em>", "</em>"), 2: ("<strong>", "</strong>"),
            3: ("<strong><em>", "</em></strong>")}


class _Context:
    """State shared by every block and inline call within one document."""

    def __init__(self, link_rewriter, collected):
        self.rewrite = link_rewriter
        self.collected = collected
        self.taken = set()


def render(text: str, link_rewriter=None) -> str:
    """The document as an HTML fragment, with no <html>/<body> wrapper."""
    return _document(text, link_rewriter, [])


def headings(text: str) -> list[tuple[int, str, str]]:
    """(level, id, plain text) for every heading, in document order."""
    collected: list[tuple[int, str, str]] = []
    _document(text, None, collected)
    return collected


def title(text: str) -> str | None:
    """The text of the first level-1 heading, or None if there is none."""
    return next((plain for level, _, plain in headings(text) if level == 1), None)


def _document(text, link_rewriter, collected):
    lines = _strip_comments(text.expandtabs(4).replace("\r\n", "\n").split("\n"))
    return _blocks(lines, _Context(link_rewriter, collected))

def _text(value):
    return html.escape(value, quote=False)


def _attribute(value):
    return html.escape(value, quote=True)


def _indent(line):
    return len(line) - len(line.lstrip())


def _dedent(line, width):
    spaces = len(line) - len(line.lstrip(" "))
    return line[min(width, spaces):]


def _closes(line, ticks):
    """True when `line` is the closing fence for one opened with `ticks`."""
    stripped = line.strip()
    return len(stripped) >= len(ticks) and set(stripped) == {"`"}


def _strip_comments(lines):
    """Drops HTML comments. Fenced code keeps whatever it contains."""
    result, ticks, inside = [], None, False
    for line in lines:
        if ticks is not None:
            result.append(line)
            ticks = None if _closes(line, ticks) else ticks
            continue
        opening = None if inside else FENCE.match(line)
        if opening:
            ticks = opening.group(2)
            result.append(line)
            continue
        text = line
        if inside:
            end = text.find("-->")
            if end < 0:
                continue
            text, inside = text[end + 3:], False
        while "<!--" in text:
            start = text.find("<!--")
            end = text.find("-->", start + 4)
            if end < 0:
                text, inside = text[:start], True
                break
            text = text[:start] + text[end + 3:]
        # A line that held only a comment disappears rather than turning into a
        # blank line, which would otherwise split the list item it sat in.
        if text.strip() or not line.strip():
            result.append(text)
    return result


def _starts_block(line):
    """True when `line` begins a block, so a paragraph above it has to end."""
    if THEMATIC.match(line) or HEADING.match(line) or FENCE.match(line):
        return True
    if QUOTE.match(line):
        return True
    bullet = BULLET.match(line)
    if bullet and len(bullet.group(1)) <= 3:
        return True
    # An ordered list interrupts a paragraph only when it starts at 1. Guides
    # wrap prose onto lines such as "6. Two values remain." and that is prose.
    ordered = ORDERED.match(line)
    return bool(ordered and len(ordered.group(1)) <= 3 and ordered.group(2) == "1")


# -------------------------------------------------------------------- blocks

def _blocks(lines, context):
    out, index = [], 0
    while index < len(lines):
        line = lines[index]
        heading = HEADING.match(line)
        fence = FENCE.match(line)
        if not line.strip():
            index += 1
        elif fence:
            index = _code(lines, index, fence, out)
        elif THEMATIC.match(line):
            out.append("<hr>\n")
            index += 1
        elif heading:
            _heading(heading, context, out)
            index += 1
        elif QUOTE.match(line):
            index = _quote(lines, index, context, out)
        elif _is_table(lines, index):
            index = _table(lines, index, context, out)
        elif (BULLET.match(line) or ORDERED.match(line)) and _indent(line) <= 3:
            index = _list(lines, index, context, out)
        else:
            index = _paragraph(lines, index, context, out)
    return "".join(out)


def _code(lines, index, match, out):
    width, ticks, info = len(match.group(1)), match.group(2), match.group(3)
    body, index = [], index + 1
    while index < len(lines) and not _closes(lines[index], ticks):
        body.append(_dedent(lines[index], width))
        index += 1
    language = f' class="language-{_attribute(info)}"' if info else ""
    content = "".join(line + "\n" for line in body)
    out.append(f'<pre class="code"><code{language}>{_text(content)}</code></pre>\n')
    return min(index + 1, len(lines))


def _heading(match, context, out):
    level = len(match.group(1))
    raw = CLOSING_HASHES.sub("", (match.group(2) or "").strip()).strip()
    plain = _plain(raw)
    identifier = _slug(plain, context.taken)
    context.collected.append((level, identifier, plain))
    body = _inline(raw, context)
    out.append(f'<h{level} id="{_attribute(identifier)}">{body}</h{level}>\n')


def _quote(lines, index, context, out):
    body = []
    while index < len(lines):
        line = lines[index]
        if QUOTE.match(line):
            body.append(QUOTE.sub("", line, count=1))
        elif line.strip() and body and not _starts_block(line):
            body.append(line)  # lazy continuation of the quoted paragraph
        else:
            break
        index += 1
    out.append("<blockquote>\n" + _blocks(body, context) + "</blockquote>\n")
    return index


def _paragraph(lines, index, context, out):
    start, index = index, index + 1
    while index < len(lines) and lines[index].strip():
        if _starts_block(lines[index]) or _is_table(lines, index):
            break
        index += 1
    body = "\n".join(line.lstrip() for line in lines[start:index]).rstrip()
    out.append("<p>" + _inline(body, context) + "</p>\n")
    return index

def _list(lines, index, context, out):
    ordered = bool(ORDERED.match(lines[index]))
    matcher = ORDERED if ordered else BULLET
    first = matcher.match(lines[index])
    base, marker, items, loose = len(first.group(1)), first.group(2), [], False
    while index < len(lines):
        match = matcher.match(lines[index])
        if not match or len(match.group(1)) != base:
            break
        if not ordered and match.group(2) != marker:
            break  # a different bullet character starts a different list
        pad = len(match.group(1)) + len(match.group(2)) + len(match.group(3))
        if ordered:
            pad += 1  # the "." after the number
        body = [match.group(4)]
        index, gap, split = _item_body(lines, index + 1, pad, body)
        # A blank line inside an item, or between two items, makes the whole
        # list loose: every item then keeps its paragraph wrapper.
        if split or (gap and index < len(lines) and matcher.match(lines[index])):
            loose = True
        items.append(_blocks(body, context))
    if not loose:
        items = [_tighten(item) for item in items]
    tag = "ol" if ordered else "ul"
    start = ""
    if ordered and first.group(2) != "1":
        start = f' start="{_attribute(first.group(2))}"'
    out.append(f"<{tag}{start}>\n")
    out.extend(f"<li>{item}</li>\n" for item in items)
    out.append(f"</{tag}>\n")
    return index


def _item_body(lines, index, pad, body):
    """Collects one item's continuation lines. Returns (index, gap, split)."""
    blanks, split, ticks = 0, False, None
    while index < len(lines):
        line = lines[index]
        if ticks is not None:  # inside a fence the item takes every line
            body.append(_dedent(line, pad))
            ticks = None if _closes(line, ticks) else ticks
        elif not line.strip():
            blanks += 1
        elif _indent(line) < pad:
            break
        else:
            if blanks:
                body.append("")
                blanks, split = 0, True
            opening = FENCE.match(line)
            ticks = opening.group(2) if opening else None
            body.append(_dedent(line, pad))
        index += 1
    return index, blanks > 0, split


def _tighten(item):
    """A tight item shows its leading paragraph without the <p> wrapper."""
    if item.startswith("<p>"):
        end = item.find("</p>\n")
        if end > 0 and "<p>" not in item[3:end]:
            return item[3:end] + item[end + 5:]
    return item


# -------------------------------------------------------------------- tables

def _cells(line):
    """A table row split on unescaped pipes; `\\|` stays inside its cell."""
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|") and not line.endswith("\\|"):
        line = line[:-1]
    return [cell.strip() for cell in re.split(r"(?<!\\)\|", line)]


def _is_table(lines, index):
    """A header row followed by a matching alignment row opens a table."""
    if "|" not in lines[index] or _indent(lines[index]) > 3:
        return False
    if index + 1 >= len(lines) or "|" not in lines[index + 1]:
        return False
    alignment = _cells(lines[index + 1])
    return (all(ALIGNMENT.fullmatch(cell) for cell in alignment)
            and len(_cells(lines[index])) == len(alignment))


def _table(lines, index, context, out):
    header, aligns = _cells(lines[index]), []
    for cell in _cells(lines[index + 1]):
        left, right = cell.startswith(":"), cell.endswith(":")
        aligns.append("center" if left and right else "right" if right
                      else "left" if left else None)
    index += 2
    out.append("<table>\n<thead>\n" + _row(header, aligns, "th", context))
    out.append("</thead>\n<tbody>\n")
    while index < len(lines) and lines[index].strip():
        if "|" not in lines[index] or _starts_block(lines[index]):
            break
        row = (_cells(lines[index]) + [""] * len(header))[:len(header)]
        out.append(_row(row, aligns, "td", context))
        index += 1
    out.append("</tbody>\n</table>\n")
    return index


def _row(cells, aligns, tag, context):
    parts = []
    for position, cell in enumerate(cells):
        align = aligns[position] if position < len(aligns) else None
        style = f' style="text-align:{align}"' if align else ""
        parts.append(f"<{tag}{style}>{_inline(cell, context)}</{tag}>")
    return "<tr>" + "".join(parts) + "</tr>\n"

def _plain(text):
    """Heading text with the inline markers dropped, for ids and the ToC."""
    text = re.sub(r"`+([^`]*)`+", r"\1", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = AUTOLINK.sub(r"\1", text)
    text = text.replace("~~", "").replace("*", "")
    return re.sub(r"\\([!-/:-@\[-`{-~])", r"\1", text).strip()


def _slug(plain, taken):
    """A URL-safe unique id. Hangul stays as it is: it is legal in an id, and
    percent-encoding would leave the attribute unreadable."""
    kept = "".join(c if c.isalnum() else "-" for c in plain.lower())
    base = re.sub(r"-+", "-", kept).strip("-") or "section"
    identifier, suffix = base, 1
    while identifier in taken:
        suffix += 1
        identifier = f"{base}-{suffix}"
    taken.add(identifier)
    return identifier


# -------------------------------------------------------------------- inline

def _flush(literal):
    """One run of plain text: escaped, with two trailing spaces made a break."""
    return HARD_BREAK.sub("<br>\n", _text("".join(literal)))


def _inline(text, context):
    """Inline markup. Code spans are tried first because they win over every
    other rule, and their content is text rather than markup."""
    out, literal, index = [], [], 0
    while index < len(text):
        character = text[index]
        if character == "\\" and text[index + 1:index + 2] in PUNCTUATION:
            literal.append(text[index + 1])
            index += 2
            continue
        found = None
        if character == "`":
            found = _code_span(text, index)
        elif character == "<":
            found = _autolink(text, index, context)
        elif character == "[":
            found = _link(text, index, context)
        elif character in "*_~":
            found = _emphasis(text, index, context)
        if found is None:
            literal.append(character)
            index += 1
            continue
        out.append(_flush(literal))
        literal.clear()
        out.append(found[0])
        index = found[1]
    out.append(_flush(literal))
    return "".join(out)


def _code_span(text, index):
    run = 1
    while index + run < len(text) and text[index + run] == "`":
        run += 1
    match = re.compile(r"(?<!`)`{%d}(?!`)" % run).search(text, index + run)
    if not match:
        return None
    content = text[index + run:match.start()].replace("\n", " ")
    if len(content) > 2 and content.strip() and content[0] == content[-1] == " ":
        content = content[1:-1]
    return "<code>" + _text(content) + "</code>", match.end()


def _autolink(text, index, context):
    match = AUTOLINK.match(text, index)
    if not match:
        return None
    target = match.group(1)
    href = context.rewrite(target) if context.rewrite else target
    return f'<a href="{_attribute(href)}">{_text(target)}</a>', match.end()


def _link(text, index, context):
    label_end = _matching(text, index, "[", "]")
    if label_end is None or text[label_end + 1:label_end + 2] != "(":
        return None
    target_end = _matching(text, label_end + 1, "(", ")")
    if target_end is None:
        return None
    target = text[label_end + 2:target_end].strip()
    href = context.rewrite(target) if context.rewrite else target
    label = _inline(text[index + 1:label_end], context)
    return f'<a href="{_attribute(href)}">{label}</a>', target_end + 1


def _matching(text, start, opening, closing):
    """Index of the bracket that closes the one at `start`, or None."""
    depth, index = 0, start
    while index < len(text):
        character = text[index]
        if character == "\\":
            index += 1
        elif character == opening:
            depth += 1
        elif character == closing:
            depth -= 1
            if depth == 0:
                return index
        index += 1
    return None


def _emphasis(text, index, context):
    marker = text[index]
    run = 1
    while index + run < len(text) and text[index + run] == marker:
        run += 1
    if marker == "~":
        if run != 2:
            return None
        tags = ("<del>", "</del>")
    elif run > 3:
        return None
    else:
        tags = EMPHASIS[run]
    # Underscores neither open nor close emphasis inside a word, which is what
    # keeps names such as __import__ and fill-in blanks such as ___ literal.
    if marker == "_" and index > 0 and text[index - 1].isalnum():
        return None
    quoted = re.escape(marker)
    closer = re.compile(r"(?<!%s)%s{%d}(?!%s)" % (quoted, quoted, run, quoted))
    match = closer.search(text, index + run)
    while match:
        content = text[index + run:match.start()]
        after = text[match.end():match.end() + 1]
        if (content and not content[0].isspace() and not content[-1].isspace()
                and not (marker == "_" and after.isalnum())):
            return tags[0] + _inline(content, context) + tags[1], match.end()
        match = closer.search(text, match.end())
    return None
