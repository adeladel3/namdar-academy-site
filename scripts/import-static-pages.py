#!/usr/bin/env python3
"""
Import legacy static_pages.json into db.staticPages.

The main legacy-import pipeline (scripts/legacy-import.py) never handled this
table; running that again would rewrite everything. This one-off script only
touches db.staticPages and is idempotent: re-running skips slugs that already
exist unless --force is passed.

Usage:
  python3 scripts/import-static-pages.py --dry-run
  python3 scripts/import-static-pages.py --apply
  python3 scripts/import-static-pages.py --apply --force  # overwrite existing
"""

from __future__ import annotations
import argparse
import json
import re
import shutil
import sys
import time
import unicodedata
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
LIVE_DB = PROJECT / "data" / "namdar.db.json"
SOURCE = PROJECT / "legacy-import" / "exports" / "static_pages.json"


# Hand-picked slug mapping. SeoUrlText in the legacy DB is null/invalid for
# 3 of the 4 rows, so we generate stable English slugs keyed by legacy Id
# — same approach the sales team can reference in any future admin UI.
SLUG_BY_LEGACY_ID = {
    8: "terms",               # قوانین و مقررات استفاده از سایت
    9: "purchase-guide",      # راهنمای خرید از نامدار آکادمی
    10: "calculator",         # ماشین حساب
    11: "lq1-course-intro",   # دوره LQ1 (معرفی)
}


def slugify_fallback(text: str) -> str:
    """Last-resort slugifier in case a legacy row has no mapping."""
    t = unicodedata.normalize("NFKC", text or "").strip()
    t = re.sub(r"[\u200c\u200f\u200e]", "", t)  # ZWNJ / LRM / RLM
    t = re.sub(r"[^\w\s\-]", "", t, flags=re.UNICODE)
    t = re.sub(r"\s+", "-", t)
    return t.strip("-").lower() or f"page-{int(time.time())}"


def to_ms(iso: str | None) -> int | None:
    if not iso:
        return None
    try:
        s = iso.replace("Z", "+00:00")
        return int(datetime.fromisoformat(s).timestamp() * 1000)
    except Exception:
        return None


def run(apply: bool, force: bool):
    if not SOURCE.exists():
        print(f"  source missing: {SOURCE}", file=sys.stderr)
        return 1

    legacy = json.loads(SOURCE.read_text("utf-8"))
    live = json.loads(LIVE_DB.read_text("utf-8"))
    pages = dict(live.get("staticPages") or {})

    now = int(time.time() * 1000)
    created = []
    skipped_existing = []
    overwritten = []

    for row in legacy:
        lid = row.get("Id")
        slug = SLUG_BY_LEGACY_ID.get(lid) or slugify_fallback(row.get("Name") or "")
        if slug in pages and not force:
            skipped_existing.append((slug, row.get("Name")))
            continue

        record = {
            "slug": slug,
            "title": (row.get("Name") or "").strip(),
            "summary": (row.get("Summary") or "").strip(),
            "body": row.get("Description") or "",
            # legacy Active=False for all 4 rows; don't publish automatically,
            # let admin turn them on after review.
            "published": bool(row.get("Active")),
            "legacyId": lid,
            "createdAt": to_ms(row.get("CreateDate")) or now,
            "updatedAt": to_ms(row.get("UpdateDate")) or now,
        }
        was_present = slug in pages
        pages[slug] = record
        if was_present:
            overwritten.append((slug, record["title"]))
        else:
            created.append((slug, record["title"]))

    print("── Static pages import plan ─────────────────────────────────────")
    print(f"  source rows         : {len(legacy)}")
    print(f"  created (new slugs) : {len(created)}")
    for s, t in created:
        print(f"     + {s}  — {t}")
    print(f"  skipped (existing)  : {len(skipped_existing)}")
    for s, t in skipped_existing:
        print(f"     = {s}  — {t}")
    print(f"  overwritten (force) : {len(overwritten)}")
    for s, t in overwritten:
        print(f"     ! {s}  — {t}")

    if not apply:
        print("\n  dry-run only. re-run with --apply to persist.")
        return 0

    if not created and not overwritten:
        print("\n  nothing to write. done.")
        return 0

    stamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    backup = LIVE_DB.with_suffix(f".json.pre-static-pages-{stamp}.bak")
    shutil.copy2(LIVE_DB, backup)
    print(f"\n  backup saved: {backup.name}")

    live["staticPages"] = pages
    LIVE_DB.write_text(json.dumps(live, ensure_ascii=False, indent=2), "utf-8")
    print(f"  wrote db: {LIVE_DB}")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true", help="overwrite existing slugs")
    a = ap.parse_args()
    if not a.apply and not a.dry_run:
        ap.error("pass --apply or --dry-run")
    sys.exit(run(apply=a.apply, force=a.force))
