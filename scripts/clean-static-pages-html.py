#!/usr/bin/env python3
"""
Clean legacy-import tracking junk out of db.staticPages bodies.

The 4 legacy static pages came from a ChatGPT export that wrapped every
external citation in an <a target="_blank" ...class="flex h-4.5 ...">...</a>
element with `utm_source=chatgpt.com` URLs. That's tracker noise on the
public pages — strip it.

Specifically removes:
  * <a …> tags whose href contains utm_source=chatgpt.com (tag + inner text),
  * any <a> tag carrying the long `class="flex h-4.5 overflow-hidden …"`
    signature (even without the utm marker), because those are always the
    citation pills from the same export.

Leaves all other HTML intact.

Usage:
  python3 scripts/clean-static-pages-html.py --dry-run
  python3 scripts/clean-static-pages-html.py --apply
"""

from __future__ import annotations
import argparse
import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
LIVE_DB = PROJECT / "data" / "namdar.db.json"

# Match any <a ...>...</a> whose attributes contain utm_source=chatgpt.com
# OR the long citation-pill class signature (flex h-4.5 overflow-hidden rounded-xl).
# Non-greedy across the whole <a>…</a>.
PILL_RE = re.compile(
    r"<a\b[^>]*(?:utm_source=chatgpt\.com|class=\"flex h-4\.5[^\"]*overflow-hidden[^\"]*rounded-xl)[^>]*>.*?</a>",
    re.IGNORECASE | re.DOTALL,
)

# Whitespace inside <script>/<style>/<code>/<pre> is semantically meaningful
# (calculator page has inline scripts + styles). So ONLY strip the pill tags.
# Do NOT collapse whitespace or trim around punctuation.


def clean(html: str) -> tuple[str, int]:
    matches = PILL_RE.findall(html)
    cleaned = PILL_RE.sub("", html)
    return cleaned, len(matches)


def run(apply: bool):
    live = json.loads(LIVE_DB.read_text("utf-8"))
    pages = live.get("staticPages") or {}
    if not pages:
        print("  db.staticPages is empty — nothing to clean.")
        return 0

    report = []
    new_pages = {}
    total_removed = 0
    for slug, rec in pages.items():
        body = rec.get("body") or ""
        cleaned, removed = clean(body)
        total_removed += removed
        report.append(
            (slug, rec.get("title", ""), len(body), len(cleaned), removed)
        )
        new = dict(rec)
        new["body"] = cleaned
        new_pages[slug] = new

    print("── Static page HTML cleanup ─────────────────────────────────────")
    print(f"{'slug':<22} {'before':>7} {'after':>7} {'removed':>8}")
    print("-" * 52)
    for slug, _title, before, after, removed in report:
        print(f"{slug:<22} {before:>7} {after:>7} {removed:>8}")
    print("-" * 52)
    print(f"{'total tracking-pills removed':<38} {total_removed:>12}")

    if not apply:
        print("\n  dry-run only. re-run with --apply to persist.")
        return 0

    if total_removed == 0:
        print("\n  nothing to remove. already clean.")
        return 0

    stamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    backup = LIVE_DB.with_suffix(f".json.pre-static-pages-clean-{stamp}.bak")
    shutil.copy2(LIVE_DB, backup)
    print(f"\n  backup saved: {backup.name}")

    live["staticPages"] = new_pages
    LIVE_DB.write_text(json.dumps(live, ensure_ascii=False, indent=2), "utf-8")
    print(f"  wrote db: {LIVE_DB}")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    if not a.apply and not a.dry_run:
        ap.error("pass --apply or --dry-run")
    sys.exit(run(apply=a.apply))
