#!/usr/bin/env python3
"""Renders the language repository's documentation into the site.

Everything a beginner needs — the five-minute start, the syntax list, all 88
guides and the AI prompts — is published here so that reading and writing NME
never requires a GitHub account or a desktop. Each page is the same Markdown
that ships in the repository, so there is one source of truth and no second
copy to drift.

    python scripts/build-docs.py [--repo PATH]

English pages land in `site/learn/`, Korean pages in `site/ko/learn/`, and the
two trees use identical slugs so the language toggle always has somewhere to
go. Code blocks that the real compiler accepts get an "open in the playground"
link, which carries the program in the URL.
"""

from __future__ import annotations

import argparse
import base64
import html
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import markdown_to_html as md  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
GITHUB = "https://github.com/needmoretruth/needmoreeasy/blob/main/"

# Pages outside `guides/`, in reading order. The third field is the rail group.
CORE_PAGES: list[tuple[str, str, str]] = [
    ("getting-started", "start", "first"),
    ("install", "install", "first"),
    ("syntax", "syntax", "first"),
    ("language", "reference", "deeper"),
    ("tutorial", "tutorial", "deeper"),
    ("converting-python", "converting-python", "deeper"),
    ("editors", "editors", "deeper"),
    ("ai-assistants", "ai-assistants", "deeper"),
    ("versioning", "versioning", "deeper"),
    ("native-backend", "native-backend", "deeper"),
    ("native-reference", "native-reference", "deeper"),
    ("zero-knowledge-nizk", "zero-knowledge", "deeper"),
]

PROMPT_PAGES: list[tuple[str, str]] = [
    ("prompts/README", "prompts"),
    ("prompts/nme-sentence", "prompts/sentence"),
    ("prompts/nme-all-levels", "prompts/all-levels"),
    ("prompts/nme-complete", "prompts/complete"),
]

# Guide files that are not guides.
GUIDE_SKIP = {"README", "index"}

STRINGS = {
    "en": {
        "lang": "en",
        "home": "/",
        "learn": "/learn/",
        "site_title": "NeedMoreEasy",
        "docs": "Learn",
        "try": "Try it",
        "install": "Install",
        "guides": "Guides",
        "syntax": "Syntax list",
        "prompts": "AI prompts",
        "skip": "Skip to the page",
        "theme": "Theme",
        "light": "Light",
        "system": "Match the system",
        "dark": "Dark",
        "contents": "On this page",
        "previous": "Previous",
        "next": "Next",
        "rail_first": "Start here",
        "rail_guides": "Guides",
        "rail_deeper": "Going further",
        "rail_prompts": "AI prompts",
        "open": "run it",
        "copy": "copy",
        "source": "This page on GitHub",
        "hub_title": "Learn NeedMoreEasy",
        "hub_lede": "Everything NME teaches, readable here — on a phone, with "
                    "nothing installed. Any example can be opened in the "
                    "playground and run in the same tab.",
        "filter": "Filter the guides",
        "filter_count": "%d guides",
        "difficulty": "Difficulty",
        "topic": "Topic",
        "toggle": "한국어",
        "toggle_url": "/ko/learn/",
        "guides_heading": "All 88 guides",
        "back": "Learn",
    },
    "ko": {
        "lang": "ko",
        "home": "/ko/",
        "learn": "/ko/learn/",
        "site_title": "NeedMoreEasy",
        "docs": "배우기",
        "try": "써 보기",
        "install": "설치",
        "guides": "가이드",
        "syntax": "문법 목록",
        "prompts": "AI 프롬프트",
        "skip": "본문으로 건너뛰기",
        "theme": "화면 테마",
        "light": "밝게",
        "system": "기기 설정 따르기",
        "dark": "어둡게",
        "contents": "이 문서 안에서",
        "previous": "이전",
        "next": "다음",
        "rail_first": "여기서 시작",
        "rail_guides": "가이드",
        "rail_deeper": "더 알아보기",
        "rail_prompts": "AI 프롬프트",
        "open": "실행해 보기",
        "copy": "복사",
        "source": "GitHub에서 이 문서 보기",
        "hub_title": "NeedMoreEasy 배우기",
        "hub_lede": "NME가 가르치는 내용을 전부 여기서 읽을 수 있습니다. "
                    "설치 없이 휴대폰에서도 됩니다. 예제는 어느 것이든 "
                    "연습장에서 바로 실행해 볼 수 있습니다.",
        "filter": "가이드 찾기",
        "filter_count": "가이드 %d편",
        "difficulty": "난이도",
        "topic": "주제",
        "toggle": "English",
        "toggle_url": "/learn/",
        "guides_heading": "가이드 88편 전체",
        "back": "배우기",
    },
}

META_KEYS = {
    "난이도": "difficulty",
    "Difficulty": "difficulty",
    "주제": "topic",
    "Topic": "topic",
    "선수 지식": "prerequisites",
    "Prerequisites": "prerequisites",
    "결과물": "result",
    "Result": "result",
}


@dataclass
class Page:
    key: str            # `guides/01-hello`, `getting-started`, `prompts/README`
    lang: str
    slug: str           # path under /learn/, without an extension
    source: Path
    text: str
    title: str
    group: str
    meta: dict[str, str] = field(default_factory=dict)

    @property
    def url(self) -> str:
        """The address to link to.

        Deliberately without `.html`: Cloudflare Pages serves `learn/start.html`
        at `/learn/start` and permanently redirects the `.html` form to it, so
        linking with the extension costs a redirect on every navigation. The
        file on disk keeps the extension — see `out`.
        """
        prefix = "/learn/" if self.lang == "en" else "/ko/learn/"
        return f"{prefix}{self.slug}"

    @property
    def out(self) -> Path:
        base = SITE / "learn" if self.lang == "en" else SITE / "ko" / "learn"
        return base / f"{self.slug}.html"


# ----------------------------------------------------------------- reading


def source_for(docs: Path, key: str, lang: str) -> Path | None:
    """`key` names the English file; Korean adds `.ko` before `.md`."""
    name = f"{key}.md" if lang == "en" else f"{key}.ko.md"
    path = docs / name
    return path if path.is_file() else None


def strip_repo_navigation(text: str) -> str:
    """Drops the two link rows under the title.

    Those rows exist so the files can be browsed on GitHub. Here the header
    and the index rail do that job, and repeating them would push the first
    real sentence off a phone screen.
    """
    lines = text.split("\n")
    kept: list[str] = []
    seen_title = False
    for line in lines:
        stripped = line.strip()
        if not seen_title:
            kept.append(line)
            if stripped.startswith("# "):
                seen_title = True
            continue
        if kept and kept[-1].strip() == "" and is_navigation_row(stripped):
            continue
        kept.append(line)
    return "\n".join(kept)


def is_navigation_row(line: str) -> bool:
    """True for a line that is only links (and language names) split by `|`."""
    if "|" not in line or line.startswith("|"):
        return False
    parts = [part.strip() for part in line.split("|")]
    if len(parts) < 2:
        return False
    for part in parts:
        if re.fullmatch(r"\[[^\]]+\]\([^)]+\)", part):
            continue
        if part in {"English", "한국어"}:
            continue
        return False
    return True


def strip_meta_lines(text: str) -> str:
    """Removes the four metadata bullets; they are shown as a strip instead."""
    kept = []
    for line in text.split("\n"):
        match = re.match(r"^- ([^:：]+)[:：]\s*(.+)$", line.strip())
        if match and META_KEYS.get(match.group(1).strip()):
            continue
        kept.append(line)
    return "\n".join(kept)


def read_meta(text: str) -> dict[str, str]:
    meta: dict[str, str] = {}
    for line in text.split("\n")[:24]:
        match = re.match(r"^- ([^:：]+)[:：]\s*(.+)$", line.strip())
        if not match:
            continue
        key = META_KEYS.get(match.group(1).strip())
        if key:
            meta[key] = match.group(2).strip()
    return meta


def collect(docs: Path) -> list[Page]:
    pages: list[Page] = []
    for lang in ("en", "ko"):
        for key, slug, group in CORE_PAGES:
            path = source_for(docs, key, lang)
            if path is None:
                continue
            pages.append(make_page(key, lang, slug, path, group))
        for key, slug in PROMPT_PAGES:
            path = source_for(docs, key, lang)
            if path is None:
                continue
            pages.append(make_page(key, lang, slug, path, "prompts"))
        for path in sorted((docs / "guides").glob("*.md")):
            name = path.name.removesuffix(".ko.md").removesuffix(".md")
            if name in GUIDE_SKIP:
                continue
            if (path.name.endswith(".ko.md")) != (lang == "ko"):
                continue
            # Only the numbered guides form the ordered course; the three
            # unnumbered files are about writing examples, not about the
            # language, so they sit with the reference material.
            group = "guides" if re.match(r"^\d\d-", name) else "deeper"
            pages.append(
                make_page(f"guides/{name}", lang, f"guides/{name}", path, group)
            )
    return pages


def make_page(key: str, lang: str, slug: str, path: Path, group: str) -> Page:
    raw = path.read_text(encoding="utf-8")
    text = strip_meta_lines(strip_repo_navigation(raw))
    return Page(
        key=key,
        lang=lang,
        slug=slug,
        source=path,
        text=text,
        title=md.title(text) or slug,
        group=group,
        meta=read_meta(raw),
    )


# ----------------------------------------------------------------- linking


def make_link_rewriter(page: Page, by_key: dict[tuple[str, str], Page], docs: Path):
    """Turns a repository-relative Markdown link into a site link.

    Anything the site does not publish (the changelog, the crates, an image)
    keeps working by pointing at GitHub, so no link in the corpus can die on
    the way here.
    """

    def rewrite(target: str) -> str:
        if not target or target.startswith(("http://", "https://", "#", "mailto:")):
            return target
        path, _, anchor = target.partition("#")
        anchor = f"#{anchor}" if anchor else ""
        if not path:
            return target
        resolved = (page.source.parent / path).resolve()
        try:
            relative = resolved.relative_to(docs.resolve())
        except ValueError:
            # Outside docs/ — the README, the examples folder, a crate.
            try:
                inside = resolved.relative_to(docs.resolve().parent)
            except ValueError:
                return target
            return GITHUB + str(inside).replace(os.sep, "/") + anchor
        key = str(relative).replace(os.sep, "/")
        key = key.removesuffix(".ko.md").removesuffix(".md")
        twin = by_key.get((key, page.lang))
        if twin is not None:
            return twin.url + anchor
        return GITHUB + "docs/" + str(relative).replace(os.sep, "/") + anchor

    return rewrite


# --------------------------------------------------------------- snippets


class Compiler:
    """Asks the real compiler whether a documented program actually runs.

    Only blocks that pass get a playground link: an "open in the playground"
    button that lands on an error would teach the wrong lesson.
    """

    def __init__(self, binary: Path | None):
        self.binary = binary
        self.cache: dict[str, bool] = {}
        self.folder = Path(tempfile.mkdtemp(prefix="nme-docs-"))

    def accepts(self, source: str) -> bool:
        if self.binary is None:
            return False
        if source in self.cache:
            return self.cache[source]
        path = self.folder / "block.nme"
        path.write_text(source + "\n", encoding="utf-8")
        result = subprocess.run(
            [str(self.binary), "check", str(path)],
            capture_output=True,
            text=True,
        )
        self.cache[source] = result.returncode == 0
        return self.cache[source]

    def close(self) -> None:
        shutil.rmtree(self.folder, ignore_errors=True)


BLOCK = re.compile(
    r'<pre class="code"><code(?: class="language-([\w-]+)")?>(.*?)</code></pre>',
    re.S,
)


def decorate_snippets(body: str, page: Page, compiler: Compiler) -> str:
    """Wraps every code block in a copy button, and NME blocks in a run link."""
    counter = 0
    words = STRINGS[page.lang]
    playground = "/" if page.lang == "en" else "/ko/"

    def replace(match: re.Match[str]) -> str:
        nonlocal counter
        counter += 1
        language = match.group(1) or ""
        source = html.unescape(match.group(2))
        block_id = f"{page.slug.replace('/', '-')}-code-{counter}"
        tools = [
            f'<button type="button" data-copy="{block_id}">{words["copy"]}</button>'
        ]
        # Only a block fenced as ```nme is a program. A ```text block is what
        # the program prints, or a data file, and offering to run it would
        # teach the wrong thing even when it happens to compile.
        if language == "nme" and compiler.accepts(source):
            carried = base64.urlsafe_b64encode(source.encode("utf-8")).decode("ascii")
            carried = carried.rstrip("=")
            tools.append(
                f'<a href="{playground}#code={carried}">{words["open"]} →</a>'
            )
        classes = f' class="language-{language}"' if language else ""
        return (
            '<div class="snippet">'
            f'<pre class="code" id="{block_id}"><code{classes}>'
            f"{match.group(2)}</code></pre>"
            f'<span class="snippet-tools">{"".join(tools)}</span>'
            "</div>"
        )

    return BLOCK.sub(replace, body)


def wrap_tables(body: str) -> str:
    """A wide table must scroll inside its own box, never the whole page."""
    return body.replace("<table>", '<div class="table-scroll"><table>').replace(
        "</table>", "</table></div>"
    )


def add_anchors(body: str) -> str:
    def replace(match: re.Match[str]) -> str:
        level, ident, rest = match.group(1), match.group(2), match.group(3)
        return (
            f'<h{level} id="{ident}">'
            f'<a class="anchor" href="#{ident}" aria-hidden="true">#</a>{rest}'
        )

    return re.sub(r'<h([234]) id="([^"]+)">(.*?)(?=</h[234]>)', replace, body, flags=re.S)


# ----------------------------------------------------------------- layout


def escape(text: str) -> str:
    return html.escape(text, quote=True)


def stars_of(page: Page) -> str:
    """The `★★☆☆☆` part of a guide's difficulty line, or nothing."""
    words = page.meta.get("difficulty", "").split()
    return words[0] if words else ""


def rail(page: Page, pages: list[Page], guides: list[Page]) -> str:
    words = STRINGS[page.lang]
    mine = [candidate for candidate in pages if candidate.lang == page.lang]

    def group_links(group: str) -> str:
        items = []
        for candidate in mine:
            if candidate.group != group:
                continue
            current = ' aria-current="page"' if candidate.url == page.url else ""
            items.append(
                f'<li><a href="{candidate.url}"{current}>{escape(candidate.title)}</a></li>'
            )
        return "".join(items)

    bands = [(1, "★☆☆☆☆"), (2, "★★☆☆☆"), (3, "★★★☆☆"), (4, "★★★★☆"), (5, "★★★★★")]
    guide_groups = []
    for level, stars in bands:
        items = []
        for guide in guides:
            if guide.lang != page.lang:
                continue
            if stars_of(guide) != stars:
                continue
            current = ' aria-current="page"' if guide.url == page.url else ""
            items.append(
                f'<li><a href="{guide.url}"{current}>{escape(guide.title)}</a></li>'
            )
        if items:
            guide_groups.append(
                f'<div class="rail-group"><h3>{stars}</h3><ul>{"".join(items)}</ul></div>'
            )

    hub = f'{words["learn"]}'
    hub_current = ' aria-current="page"' if page.slug == "index" else ""
    return f"""<details class="doc-rail">
<summary>{escape(words["docs"])}</summary>
<div class="rail-group"><h3>{escape(words["rail_first"])}</h3><ul>
<li><a href="{hub}"{hub_current}>{escape(words["hub_title"])}</a></li>
{group_links("first")}
</ul></div>
<div class="rail-group"><h3>{escape(words["rail_prompts"])}</h3><ul>{group_links("prompts")}</ul></div>
<div class="rail-group"><h3>{escape(words["rail_deeper"])}</h3><ul>{group_links("deeper")}</ul></div>
<div class="rail-group"><h3>{escape(words["rail_guides"])}</h3><ul>
<li><a href="{hub}guides">{escape(words["guides_heading"])}</a></li>
</ul></div>
{"".join(guide_groups)}
</details>"""


def contents(text: str) -> str:
    entries = [entry for entry in md.headings(text) if entry[0] in (2, 3)]
    if len(entries) < 3:
        return ""
    items = "".join(
        f'<li class="lvl-{level}"><a href="#{ident}">{escape(label)}</a></li>'
        for level, ident, label in entries
    )
    return items


THEME_ICONS = {
    "light": (
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"'
        ' stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/>'
        '<path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6'
        'M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/></svg>'
    ),
    "system": (
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"'
        ' aria-hidden="true"><circle cx="12" cy="12" r="8.4"/>'
        '<path d="M12 3.6a8.4 8.4 0 0 1 0 16.8z" fill="currentColor" stroke="none"/></svg>'
    ),
    "dark": (
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"'
        ' stroke-linejoin="round" aria-hidden="true">'
        '<path d="M20 14.4A8.6 8.6 0 0 1 9.6 4a8.6 8.6 0 1 0 10.4 10.4z"/></svg>'
    ),
}


def page_shell(
    page_lang: str,
    title: str,
    description: str,
    body: str,
    rail_html: str,
    toc_html: str,
    canonical: str,
    twin: str,
) -> str:
    words = STRINGS[page_lang]
    other = STRINGS["ko" if page_lang == "en" else "en"]
    toc_block = (
        f'<nav class="doc-toc" aria-label="{escape(words["contents"])}">'
        f'<h3>{escape(words["contents"])}</h3><ul>{toc_html}</ul></nav>'
        if toc_html
        else ""
    )
    shell_class = "doc-shell has-toc" if toc_html else "doc-shell"
    return f"""<!doctype html>
<html lang="{page_lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)} · NeedMoreEasy</title>
<meta name="description" content="{escape(description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="https://needmoreeasy.com{canonical}">
<link rel="alternate" hreflang="{other["lang"]}" href="https://needmoreeasy.com{twin}">
<link rel="alternate" hreflang="{page_lang}" href="https://needmoreeasy.com{canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="{escape(title)} · NeedMoreEasy">
<meta property="og:description" content="{escape(description)}">
<meta property="og:url" content="https://needmoreeasy.com{canonical}">
<meta property="og:image" content="https://needmoreeasy.com/assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script src="/assets/theme.js"></script>
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>

<div class="stage" aria-hidden="true">
  <i class="orb"></i><i class="orb"></i><i class="orb"></i><i class="orb"></i>
</div>

<a class="skip-link" href="#doc">{escape(words["skip"])}</a>

<header class="site-head">
  <div class="wrap">
    <a class="brand" href="{words["home"]}">need<span>more</span>easy</a>
    <nav class="head-nav" aria-label="{escape(words["docs"])}">
      <a href="{words["home"]}#playground">{escape(words["try"])}</a>
      <a href="{words["learn"]}">{escape(words["docs"])}</a>
      <a class="nav-hide-sm" href="{words["learn"]}guides">{escape(words["guides"])}</a>
      <a href="https://github.com/needmoretruth/needmoreeasy">GitHub</a>
    </nav>
      <span class="theme-toggle" role="group" aria-label="{escape(words["theme"])}">
        <button type="button" data-theme-choice="light" aria-pressed="false" title="{escape(words["light"])}" aria-label="{escape(words["light"])}">{THEME_ICONS["light"]}</button>
        <button type="button" data-theme-choice="system" aria-pressed="true" title="{escape(words["system"])}" aria-label="{escape(words["system"])}">{THEME_ICONS["system"]}</button>
        <button type="button" data-theme-choice="dark" aria-pressed="false" title="{escape(words["dark"])}" aria-label="{escape(words["dark"])}">{THEME_ICONS["dark"]}</button>
      </span>
      <span class="lang-toggle">
        <a href="{canonical if page_lang == 'en' else twin}" {'aria-current="true" ' if page_lang == 'en' else ''}data-lang-choice="en">EN</a>
        <a href="{twin if page_lang == 'en' else canonical}" {'aria-current="true" ' if page_lang == 'ko' else ''}data-lang-choice="ko">한국어</a>
      </span>
  </div>
</header>

<main id="doc">
<section class="{shell_class}">
  <div class="wrap">
{rail_html}
{body}
{toc_block}
  </div>
</section>
</main>

<footer class="site-foot">
  <div class="wrap">
    <span>NeedMoreEasy · Apache-2.0</span>
    <span class="foot-spacer"></span>
    <a href="{words["home"]}">{escape(words["site_title"])}</a>
    <a href="{words["learn"]}">{escape(words["docs"])}</a>
    <a href="{twin}" data-lang-choice="{other["lang"]}">{escape(words["toggle"])}</a>
  </div>
</footer>

<script type="module" src="/assets/site.js"></script>
</body>
</html>
"""


def turners(page: Page, order: list[Page]) -> str:
    words = STRINGS[page.lang]
    same = [candidate for candidate in order if candidate.lang == page.lang]
    if page not in same:
        return ""
    index = same.index(page)
    previous = same[index - 1] if index > 0 else None
    following = same[index + 1] if index + 1 < len(same) else None
    parts = []
    if previous:
        parts.append(
            f'<a class="turn-prev" href="{previous.url}">'
            f'<span>{escape(words["previous"])}</span>{escape(previous.title)}</a>'
        )
    else:
        parts.append("<span></span>")
    if following:
        parts.append(
            f'<a class="turn-next" href="{following.url}">'
            f'<span>{escape(words["next"])}</span>{escape(following.title)}</a>'
        )
    return f'<nav class="doc-turn">{"".join(parts)}</nav>'


def crumbs(page: Page) -> str:
    words = STRINGS[page.lang]
    trail = [f'<a href="{words["learn"]}">{escape(words["back"])}</a>']
    if page.group == "guides":
        trail.append(
            f'<span>/</span><a href="{words["learn"]}guides">{escape(words["guides"])}</a>'
        )
    elif page.group == "prompts":
        trail.append(
            f'<span>/</span><a href="{words["learn"]}prompts">{escape(words["prompts"])}</a>'
        )
    return f'<nav class="doc-crumbs">{"".join(trail)}</nav>'


PREREQ_LABEL = {"en": "Prerequisites", "ko": "선수 지식"}
RESULT_LABEL = {"en": "You will end up with", "ko": "결과물"}


def meta_strip(page: Page, rewrite) -> str:
    """Difficulty and topic as badges; the rest as two quiet lines.

    `rewrite` is the same link rewriter the body uses. Without it the
    prerequisite link keeps pointing at a `.md` file that the site does not
    publish — 116 dead links across the guides, all of them the one line a
    reader is most likely to follow.
    """
    if not page.meta:
        return ""
    words = STRINGS[page.lang]
    badges = []
    if "difficulty" in page.meta:
        badges.append(f'<span class="badge">{escape(page.meta["difficulty"])}</span>')
    if "topic" in page.meta:
        badges.append(f'<span class="badge">{escape(page.meta["topic"])}</span>')

    rows = []
    for key, labels in (("prerequisites", PREREQ_LABEL), ("result", RESULT_LABEL)):
        if key in page.meta:
            rows.append(
                f"<dt>{escape(labels[page.lang])}</dt>"
                f"<dd>{md.render_inline(page.meta[key], rewrite)}</dd>"
            )
    if not badges and not rows:
        return ""
    badge_html = f'<div class="badges">{"".join(badges)}</div>' if badges else ""
    row_html = f"<dl>{''.join(rows)}</dl>" if rows else ""
    return f'<div class="doc-meta">{badge_html}{row_html}</div>'


# ------------------------------------------------------------------ hubs


def guides_hub(lang: str, guides: list[Page], index_text: str | None) -> str:
    words = STRINGS[lang]
    mine = [guide for guide in guides if guide.lang == lang]
    items = []
    for guide in mine:
        stars = stars_of(guide)
        topic = guide.meta.get("topic", "")
        haystack = f"{guide.title} {topic}".lower()
        items.append(
            f'<li data-find="{escape(haystack)}"><a href="{guide.url}">'
            f"<strong>{escape(guide.title)}</strong>"
            f'<span>{escape(topic)}</span>'
            f'<span class="stars">{escape(stars)}</span></a></li>'
        )
    intro = index_text or ""
    return f"""{intro}
<h2 id="all">{escape(words["guides_heading"])}</h2>
<div class="filter-row">
  <input class="filter-input" id="guide-filter" type="search"
         placeholder="{escape(words["filter"])}" aria-label="{escape(words["filter"])}">
  <span class="filter-count" id="guide-count">{words["filter_count"] % len(mine)}</span>
</div>
<ul class="guide-list" id="guide-list">{"".join(items)}</ul>
"""


def learn_hub(lang: str, pages: list[Page]) -> str:
    words = STRINGS[lang]
    mine = {page.slug: page for page in pages if page.lang == lang}
    cards = []
    for slug, blurb_en, blurb_ko in [
        ("start", "Start here if you have never written a program.",
         "프로그램을 한 번도 짜 본 적 없다면 여기서 시작하세요."),
        ("syntax", "Every spelling the compiler accepts, in one list.",
         "컴파일러가 받아들이는 모든 표기를 한 곳에 모았습니다."),
        ("install", "Put NME on your own computer when you are ready.",
         "준비되면 내 컴퓨터에 설치합니다."),
        ("prompts", "Hand one file to an AI and it can write NME.",
         "이 파일 하나를 AI에게 주면 NME를 써 줍니다."),
    ]:
        page = mine.get(slug)
        if page is None:
            continue
        blurb = blurb_en if lang == "en" else blurb_ko
        cards.append(
            f'<li><a href="{page.url}">{escape(page.title)}</a>'
            f"<span>{escape(blurb)}</span></li>"
        )
    guides_line = (
        f'<li><a href="{words["learn"]}guides">{escape(words["guides_heading"])}</a>'
        f'<span>{"One short guide per idea, in order." if lang == "en" else "한 편에 한 가지씩, 순서대로 읽는 가이드입니다."}</span></li>'
    )
    deeper = "".join(
        f'<li><a href="{page.url}">{escape(page.title)}</a></li>'
        for page in pages
        if page.lang == lang and page.group == "deeper"
    )
    heading = "Going further" if lang == "en" else "더 알아보기"
    return f"""<h1>{escape(words["hub_title"])}</h1>
<p class="lede">{escape(words["hub_lede"])}</p>
<ul class="links">{"".join(cards)}{guides_line}</ul>
<h2 id="deeper">{escape(heading)}</h2>
<ul class="links">{deeper}</ul>
"""


PROMPT_CARDS = [
    (
        "prompts/sentence",
        True,
        "100% of the sentence syntax, plus short examples. Start here if you "
        "are new to programming — this is usually all you need.",
        "문장형 문법 100%와 짧은 예제. 코딩을 처음 한다면 이것 하나면 됩니다.",
    ),
    (
        "prompts/all-levels",
        False,
        "The same, plus the beginner and advanced levels, the bundled modules "
        "and the error codes.",
        "위에 초급·고급 문법과 딸려 오는 도구, 오류 코드까지 더했습니다.",
    ),
    (
        "prompts/complete",
        False,
        "Everything above and twelve complete programs. The most accurate "
        "answers, if it fits in the chat window.",
        "위 전부에 완성된 예제 프로그램 12개까지. 대화창에 들어간다면 가장 정확합니다.",
    ),
]


def prompt_hub_extra(lang: str, pages: list[Page], docs: Path) -> str:
    """Three cards, each able to put the whole prompt on the clipboard."""
    by_slug = {page.slug: page for page in pages if page.lang == lang}
    copy_label = "copy the whole prompt" if lang == "en" else "전체 복사"
    read_label = "read it" if lang == "en" else "읽기"
    save_label = "save the file" if lang == "en" else "파일로 저장"
    cards = []
    for slug, recommended, blurb_en, blurb_ko in PROMPT_CARDS:
        page = by_slug.get(slug)
        if page is None:
            continue
        raw = raw_url(page)
        size = len(page.source.read_text(encoding="utf-8"))
        classes = "prompt-card is-pick" if recommended else "prompt-card"
        cards.append(
            f'<div class="{classes}">'
            f"<h2>{escape(page.title)}</h2>"
            f"<p>{escape(blurb_en if lang == 'en' else blurb_ko)}</p>"
            f'<p class="prompt-size">{size // 1000}k</p>'
            f'<p class="prompt-actions">'
            f'<button class="btn btn-primary" type="button" data-copy-file="{raw}">'
            f"{copy_label}</button>"
            f'<a class="btn btn-ghost" href="{page.url}">{read_label} →</a>'
            f'<a class="btn btn-ghost" href="{raw}" download>{save_label}</a></p>'
            "</div>"
        )
    return f'<div class="prompt-grid">{"".join(cards)}</div>'


def raw_url(page: Page) -> str:
    """Where the untouched Markdown is published, for copying and saving."""
    prefix = "/learn/" if page.lang == "en" else "/ko/learn/"
    return f"{prefix}{page.slug}.md"


def copy_bar(page: Page) -> str:
    """The button that puts a whole prompt on the clipboard, in one press."""
    if not page.slug.startswith("prompts/"):
        return ""
    copy_label = "copy the whole prompt" if page.lang == "en" else "프롬프트 전체 복사"
    save_label = "save the file" if page.lang == "en" else "파일로 저장"
    note = (
        "Paste it at the start of a chat with any AI."
        if page.lang == "en"
        else "AI와의 대화 맨 앞에 붙여넣으면 됩니다."
    )
    raw = raw_url(page)
    return (
        '<div class="copy-bar">'
        f'<button class="btn btn-primary" type="button" data-copy-file="{raw}">'
        f"{copy_label}</button>"
        f'<a class="btn btn-ghost" href="{raw}" download>{save_label}</a>'
        f'<span class="run-note">{escape(note)}</span>'
        "</div>"
    )


def split_prompt_readme(text: str) -> tuple[str, str]:
    """Splits at the comparison section, which the cards replace."""
    lines = text.split("\n")
    starts = [
        index
        for index, line in enumerate(lines)
        if line.startswith("## ") and ("어느 것을" in line or "Which one" in line)
    ]
    if not starts:
        return text, ""
    start = starts[0]
    after = next(
        (index for index in range(start + 1, len(lines)) if lines[index].startswith("## ")),
        len(lines),
    )
    return "\n".join(lines[:start]), "\n".join(lines[after:])


def split_index(text: str) -> str:
    """Keeps the hand-written part of the guide index, drops the long table."""
    lines = text.split("\n")
    positions = [i for i, line in enumerate(lines) if line.startswith("## ")]
    if not positions:
        return text
    last = positions[-1]
    tail = "\n".join(lines[last:])
    if tail.count("\n|") > 40:
        return "\n".join(lines[:last])
    return text


# ------------------------------------------------------------------ build


def render_page(
    page: Page,
    pages: list[Page],
    guides: list[Page],
    order: list[Page],
    docs: Path,
    compiler: Compiler,
    by_key: dict[tuple[str, str], Page],
) -> str:
    words = STRINGS[page.lang]
    rewrite = make_link_rewriter(page, by_key, docs)
    body = md.render(page.text, rewrite)
    body = wrap_tables(body)
    body = add_anchors(body)
    body = decorate_snippets(body, page, compiler)
    strip = meta_strip(page, rewrite) + copy_bar(page)
    if strip and "</h1>" in body:
        body = body.replace("</h1>", "</h1>\n" + strip, 1)

    twin = by_key.get((page.key, "ko" if page.lang == "en" else "en"))
    twin_url = twin.url if twin else STRINGS["ko" if page.lang == "en" else "en"]["learn"]
    description = first_sentence(page.text) or page.title
    source_link = GITHUB + str(page.source.relative_to(docs.parent)).replace(os.sep, "/")

    article = f"""    <article class="doc-main">
{crumbs(page)}
<div class="prose">
{body}
</div>
<p class="fineprint"><a href="{source_link}">{escape(words["source"])}</a></p>
{turners(page, order)}
    </article>"""

    return page_shell(
        page.lang,
        page.title,
        description,
        article,
        rail(page, pages, guides),
        contents(page.text),
        page.url,
        twin_url,
    )


def first_sentence(text: str) -> str:
    for block in text.split("\n\n"):
        block = block.strip()
        if not block or block.startswith(("#", "-", "|", ">", "```", "[")):
            continue
        flat = re.sub(r"[`*\[\]]", "", block.replace("\n", " "))
        return flat[:180]
    return ""


# The three prompts, as plain text, for the copy buttons at the top of the home
# page. The rendered pages keep their headings and their "how to use this"
# note; what a visitor pastes into a chat window must be the prompt alone, so
# the wrapper above the first `---` rule is dropped here.
PROMPT_TEXTS: list[tuple[str, str]] = [
    ("prompts/nme-sentence", "sentence"),
    ("prompts/nme-all-levels", "all-levels"),
    ("prompts/nme-complete", "complete"),
]


def write_prompt_texts(docs: Path) -> int:
    out_dir = SITE / "assets" / "prompts"
    out_dir.mkdir(parents=True, exist_ok=True)
    written = 0
    for key, name in PROMPT_TEXTS:
        for lang in ("en", "ko"):
            source = source_for(docs, key, lang)
            if source is None:
                raise SystemExit(f"build-docs: no prompt at {key} ({lang})")
            text = source.read_text(encoding="utf-8")
            parts = text.split("\n---\n", 1)
            if len(parts) != 2:
                raise SystemExit(
                    f"build-docs: {source} has no `---` rule, so the prompt "
                    "itself cannot be told apart from the note above it"
                )
            (out_dir / f"{name}.{lang}.txt").write_text(
                parts[1].lstrip("\n"), encoding="utf-8"
            )
            written += 1
    return written


def build(docs: Path, binary: Path | None) -> None:
    pages = collect(docs)
    by_key = {(page.key, page.lang): page for page in pages}
    guides = [page for page in pages if page.group == "guides"]
    compiler = Compiler(binary)

    written = write_prompt_texts(docs)
    for page in pages:
        order = guides if page.group == "guides" else []
        page.out.parent.mkdir(parents=True, exist_ok=True)
        page.out.write_text(
            render_page(page, pages, guides, order, docs, compiler, by_key),
            encoding="utf-8",
        )
        written += 1
        # A prompt is meant to be copied whole, so the Markdown itself is
        # published beside the page rather than only rendered into it.
        if page.slug.startswith("prompts/"):
            page.out.with_suffix(".md").write_text(
                page.source.read_text(encoding="utf-8"), encoding="utf-8"
            )

    # The two hub pages are ours, not the repository's.
    for lang in ("en", "ko"):
        words = STRINGS[lang]
        index_source = source_for(docs, "guides/index", lang)
        index_body = ""
        if index_source is not None:
            index_text = split_index(strip_repo_navigation(index_source.read_text(encoding="utf-8")))
            index_page = make_page("guides/index", lang, "guides", index_source, "guides")
            index_page.text = index_text
            index_body = decorate_snippets(
                add_anchors(wrap_tables(md.render(index_text, make_link_rewriter(index_page, by_key, docs)))),
                index_page,
                compiler,
            )
        hub = guides_hub(lang, guides, index_body)
        written += write_hub(lang, "guides", words["guides_heading"], hub, pages, guides)

        prompts_page = by_key.get(("prompts/README", lang))
        if prompts_page is not None:
            rewrite = make_link_rewriter(prompts_page, by_key, docs)
            intro, rest = split_prompt_readme(prompts_page.text)
            pieces = [
                md.render(intro, rewrite),
                prompt_hub_extra(lang, pages, docs),
                md.render(rest, rewrite) if rest else "",
            ]
            body = decorate_snippets(
                add_anchors(wrap_tables("\n".join(pieces))), prompts_page, compiler
            )
            written += write_hub(
                lang, "prompts", prompts_page.title, body, pages, guides
            )

        written += write_hub(lang, "index", words["hub_title"], learn_hub(lang, pages), pages, guides)

    compiler.close()
    write_sitemap(pages)
    print(f"build-docs: wrote {written} pages")


def write_sitemap(pages: list[Page]) -> None:
    """Search engines get the whole site, both languages, paired by hreflang."""
    site = "https://needmoreeasy.com"
    pairs: list[tuple[str, str]] = [("/", "/ko/")]
    seen: set[str] = set()
    for page in pages:
        if page.lang != "en" or page.key in seen:
            continue
        seen.add(page.key)
        twin = f"/ko/learn/{page.slug}"
        pairs.append((page.url, twin))
    for slug in ("index", "guides", "prompts"):
        english = "/learn/" if slug == "index" else f"/learn/{slug}"
        korean = "/ko/learn/" if slug == "index" else f"/ko/learn/{slug}"
        pairs.append((english, korean))

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]
    for english, korean in sorted(pairs):
        for location in (english, korean):
            lines.append("  <url>")
            lines.append(f"    <loc>{site}{location}</loc>")
            lines.append(f'    <xhtml:link rel="alternate" hreflang="en" href="{site}{english}"/>')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="ko" href="{site}{korean}"/>')
            lines.append("  </url>")
    lines.append("</urlset>")
    (SITE / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_hub(
    lang: str, slug: str, title: str, body: str, pages: list[Page], guides: list[Page]
) -> int:
    words = STRINGS[lang]
    fake = Page(
        key=f"hub/{slug}",
        lang=lang,
        slug=slug,
        source=Path("."),
        text="",
        title=title,
        group="guides" if slug == "guides" else "first",
    )
    article = f"""    <article class="doc-main">
{crumbs(fake) if slug != "index" else ""}
<div class="prose">
{body}
</div>
    </article>"""
    twin = ("/ko/learn/" if lang == "en" else "/learn/") + (
        "" if slug == "index" else slug
    )
    html_text = page_shell(
        lang,
        title,
        words["hub_lede"],
        article,
        rail(fake, pages, guides),
        "",
        fake.url if slug != "index" else words["learn"],
        twin,
    )
    out = fake.out if slug != "index" else fake.out.with_name("index.html")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html_text, encoding="utf-8")
    return 1


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--repo",
        default=os.environ.get("NME_REPO", str(Path.home() / "nmt" / "needmoreeasy")),
    )
    parser.add_argument("--nme", default=None, help="path to the nme binary")
    arguments = parser.parse_args()

    repo = Path(arguments.repo).expanduser()
    docs = repo / "docs"
    if not docs.is_dir():
        raise SystemExit(f"build-docs: no docs at {docs}")

    binary = Path(arguments.nme) if arguments.nme else None
    if binary is None:
        for candidate in (repo / "target/release/nme", repo / "target/debug/nme"):
            if candidate.is_file():
                binary = candidate
                break
    build(docs, binary)


if __name__ == "__main__":
    main()
