#!/usr/bin/env python3
"""
Transform legacy export JSONs into the new site's namdar.db.json shape.

Modes:
  --dry-run  : compute the merged DB, print a detailed report, write a
               side-car file (legacy-import/merged.preview.db.json) for
               inspection. Never touches data/namdar.db.json.
  --apply    : back up the live DB, then write the merged result.

Run --dry-run first, review, only then --apply.
"""

from __future__ import annotations
import argparse
import json
import re
import secrets
import shutil
import string
import sys
import time
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
LIVE_DB = PROJECT / "data" / "namdar.db.json"
EXPORTS = PROJECT / "legacy-import" / "exports"
PREVIEW = PROJECT / "legacy-import" / "merged.preview.db.json"

# ─── helpers ────────────────────────────────────────────────────────────────

def load(name: str) -> list[dict]:
    p = EXPORTS / f"{name}.json"
    if not p.exists():
        return []
    return json.loads(p.read_text("utf-8"))

def gen_id(prefix: str) -> str:
    ts = int(time.time() * 1000)
    rand = "".join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(6))
    return f"{prefix}_{ts:x}{rand}"

def to_ms(iso: str | None) -> int | None:
    if not iso:
        return None
    try:
        return int(datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp() * 1000)
    except Exception:
        return None

FA_AR_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")

def to_english_digits(s: str | None) -> str:
    if not s:
        return ""
    return s.translate(FA_AR_DIGITS)

def normalize_phone(raw: str | None) -> str | None:
    """Return 11-digit 09xxxxxxxxx or None."""
    if not raw:
        return None
    s = to_english_digits(str(raw).strip())
    s = re.sub(r"[^\d+]", "", s)
    if s.startswith("+98"):
        s = "0" + s[3:]
    elif s.startswith("98") and len(s) == 12:
        s = "0" + s[2:]
    elif s.startswith("9") and len(s) == 10:
        s = "0" + s
    if re.fullmatch(r"09\d{9}", s):
        return s
    return None

# Map Persian chars to latin-friendly slug. Falls back to legacy-id slug.
PERSIAN_MAP = {
    "آ": "a", "ا": "a", "ب": "b", "پ": "p", "ت": "t", "ث": "s",
    "ج": "j", "چ": "ch", "ح": "h", "خ": "kh", "د": "d", "ذ": "z",
    "ر": "r", "ز": "z", "ژ": "zh", "س": "s", "ش": "sh", "ص": "s",
    "ض": "z", "ط": "t", "ظ": "z", "ع": "a", "غ": "gh", "ف": "f",
    "ق": "gh", "ک": "k", "ك": "k", "گ": "g", "ل": "l", "م": "m",
    "ن": "n", "و": "v", "ه": "h", "ی": "y", "ي": "y", "ئ": "y",
    "ء": "", "ة": "h", " ": "-", "‌": "-", "\u200c": "-",
}

def slugify(text: str, fallback: str = "") -> str:
    if not text:
        return fallback
    s = text.strip().strip("/")
    # Already latin-ish? use it.
    if re.fullmatch(r"[a-zA-Z0-9\-_/]+", s):
        return s.lower().strip("-")
    # Persian to latin
    out = []
    for ch in s:
        if ch in PERSIAN_MAP:
            out.append(PERSIAN_MAP[ch])
        elif ch.isascii() and (ch.isalnum() or ch in "-_"):
            out.append(ch.lower())
        elif ch.isspace() or ch in ".,:;!?()[]{}«»":
            out.append("-")
    result = re.sub(r"-+", "-", "".join(out)).strip("-")
    return result or fallback

def unique_slug(base: str, taken: set[str]) -> str:
    slug = base or "item"
    if slug not in taken:
        taken.add(slug)
        return slug
    i = 2
    while f"{slug}-{i}" in taken:
        i += 1
    final = f"{slug}-{i}"
    taken.add(final)
    return final

def estimate_read_minutes(html: str) -> int:
    if not html:
        return 1
    plain = re.sub(r"<[^>]+>", "", html)
    words = len(plain.split())
    return max(1, round(words / 200))

# ─── transform ──────────────────────────────────────────────────────────────

def run(apply: bool):
    live = json.loads(LIVE_DB.read_text("utf-8"))
    now = int(time.time() * 1000)

    # Load legacy exports
    legacy_users       = load("users")
    legacy_categories  = load("categories")
    legacy_posts       = load("posts")
    legacy_products    = load("products")
    legacy_product_fs  = load("product_files")
    legacy_user_prods  = load("user_products")
    legacy_orders      = load("product_orders")
    legacy_payments    = load("payments")
    legacy_hashtags    = load("hashtags")
    legacy_hashtag_post= load("hashtag_post")
    legacy_cat_post    = load("category_post")
    legacy_cat_product = load("category_product")
    legacy_pictures    = load("pictures")
    legacy_newsletter  = load("newsletter_emails")
    legacy_contacts    = load("contact_uses")

    # Indexes into legacy tables
    pic_by_id = {p["Id"]: p for p in legacy_pictures}
    user_by_id = {u["Id"]: u for u in legacy_users}
    post_cats = {}        # PostId -> [CategoryId]
    for rel in legacy_cat_post:
        # Table columns are usually PostsId/CategoriesId in EF many-to-many
        post_id = rel.get("PostsId") or rel.get("PostId")
        cat_id  = rel.get("CategoriesId") or rel.get("CategoryId")
        if post_id and cat_id:
            post_cats.setdefault(post_id, []).append(cat_id)
    prod_cats = {}
    for rel in legacy_cat_product:
        prod_id = rel.get("ProductsId") or rel.get("ProductId")
        cat_id  = rel.get("CategoriesId") or rel.get("CategoryId")
        if prod_id and cat_id:
            prod_cats.setdefault(prod_id, []).append(cat_id)
    post_tags = {}
    for rel in legacy_hashtag_post:
        post_id = rel.get("PostsId") or rel.get("PostId")
        tag_id  = rel.get("HashtagsId") or rel.get("HashtagId")
        if post_id and tag_id:
            post_tags.setdefault(post_id, []).append(tag_id)

    # Fallback image pool from /public/figma. Used as a placeholder until the
    # real Media/ folder is uploaded; the legacy path is kept in `legacyCoverImage`
    # so we can swap in real files later without re-importing.
    ARTICLE_FALLBACKS = [
        "/figma/image13.png", "/figma/image15.png",
        "/figma/image17.png", "/figma/image18.png",
        "/figma/image1.png",  "/figma/image10.png",
        "/figma/image11.png",
    ]
    COURSE_FALLBACK = "/figma/tt6a9115copy2.png"

    def legacy_picture_path(pic_id: int | None) -> str | None:
        if not pic_id or pic_id not in pic_by_id:
            return None
        p = pic_by_id[pic_id]
        url = (p.get("Url") or "").rstrip("/")
        name = p.get("Name") or ""
        if not name:
            return None
        return f"/legacy-media{url}/{name}"

    def article_cover(idx: int) -> str:
        return ARTICLE_FALLBACKS[idx % len(ARTICLE_FALLBACKS)]

    # ─── Tags (Hashtags → tags) ──────────────────────────────────────────
    tags_live = dict(live.get("tags", {}))
    existing_tag_slugs = {t["slug"] for t in tags_live.values() if isinstance(t, dict) and "slug" in t}
    tag_id_map: dict[int, str] = {}  # legacy ID -> new ID
    for t in legacy_hashtags:
        slug = slugify(t["Name"], f"tag-{t['Id']}")
        slug = unique_slug(slug, existing_tag_slugs)
        new_id = f"tag_{slug}"
        tag_id_map[t["Id"]] = new_id
        tags_live[new_id] = {
            "id": new_id,
            "name": t["Name"],
            "slug": slug,
            "order": 0,
        }

    # ─── Categories (merge into existing) ──────────────────────────────
    cats_live = dict(live.get("categories", {}))
    existing_cat_slugs = {c["slug"] for c in cats_live.values() if isinstance(c, dict) and "slug" in c}
    cat_id_map: dict[int, str] = {}
    for idx, c in enumerate(legacy_categories):
        slug_base = slugify(c.get("SeoUrlText") or c["Name"], f"cat-{c['Id']}")
        slug = unique_slug(slug_base, existing_cat_slugs)
        new_id = f"cat_{slug}"
        cat_id_map[c["Id"]] = new_id
        cats_live[new_id] = {
            "id": new_id,
            "name": c["Name"],
            "slug": slug,
            "order": c.get("Priority", 0) or 0,
        }

    # ─── Users ───────────────────────────────────────────────────────────
    users_live = dict(live.get("users", {}))
    # existing phones to avoid duplicates
    existing_phones = {u.get("phone") for u in users_live.values() if u.get("phone")}
    user_id_map: dict[int, str] = {}  # legacy ID -> new ID
    dropped_dup_phone = 0
    dropped_bad_phone = 0
    for u in legacy_users:
        phone = normalize_phone(u.get("Mobile"))
        if not phone:
            dropped_bad_phone += 1
            continue
        if phone in existing_phones:
            dropped_dup_phone += 1
            # still register map so downstream references still resolve to an existing user
            for live_id, live_u in users_live.items():
                if live_u.get("phone") == phone:
                    user_id_map[u["Id"]] = live_id
                    break
            continue
        name_parts = [p for p in [u.get("FirstName"), u.get("LastName")] if p]
        name = " ".join(name_parts).strip() or "کاربر"
        new_id = gen_id("u")
        user_id_map[u["Id"]] = new_id
        users_live[new_id] = {
            "id": new_id,
            "phone": phone,
            "name": name,
            "role": "student",
            "status": "active",
            "createdAt": to_ms(u.get("CreateDate")) or now,
            "email": u.get("Email") or None,
            "legacyId": u["Id"],
        }
        existing_phones.add(phone)

    # ─── Courses (Products → courses) ──────────────────────────────────
    courses_live = dict(live.get("courses", {}))
    existing_course_slugs = set(courses_live.keys())
    course_id_map: dict[int, str] = {}  # legacy ProductId -> new slug
    for p in legacy_products:
        base = slugify(p.get("SeoUrlText") or p["Name"], f"course-{p['Id']}")
        slug = unique_slug(base, existing_course_slugs)
        course_id_map[p["Id"]] = slug
        instructor_name = "استاد امیرحسین نام‌آور"
        if p.get("LecturerId") and p["LecturerId"] in user_by_id:
            lec = user_by_id[p["LecturerId"]]
            nm = " ".join(x for x in [lec.get("FirstName"), lec.get("LastName")] if x).strip()
            if nm:
                instructor_name = nm
        try:
            students_count = int(p.get("StudentCount") or 0)
        except (TypeError, ValueError):
            students_count = 0
        courses_live[slug] = {
            "slug": slug,
            "title": p["Name"],
            "shortDesc": p.get("Summary") or "",
            "longDesc": p.get("Description") or "",
            "previewImage": COURSE_FALLBACK,
            "legacyCoverImage": legacy_picture_path(p.get("PictureId")),
            "tagIds": [],
            "level": "intermediate",
            "price": int(p.get("Price") or 0),
            "isFree": not p.get("Price"),
            "allowPurchase": True,
            "status": "published" if p.get("Active") else "draft",
            "instructor": instructor_name,
            "durationMinutes": int(p.get("Duration") or 0),
            "studentsCount": students_count,
            "badge": None,
            "createdAt": to_ms(p.get("CreateDate")) or now,
            "updatedAt": to_ms(p.get("UpdateDate")) or now,
            "publishedAt": to_ms(p.get("CreateDate")) or now,
            "legacyId": p["Id"],
        }

    # ─── Chapters & Lessons from ProductFiles ──────────────────────────
    chapters_live = dict(live.get("chapters", {}))
    lessons_live  = dict(live.get("lessons", {}))
    chapter_id_map: dict[int, str] = {}  # legacy ProductFile.Id (when parent) -> new chapter id
    # First pass: chapters (ParentId IS NULL)
    for pf in legacy_product_fs:
        if pf.get("ParentId") is not None:
            continue
        if pf["ProductId"] not in course_id_map:
            continue
        course_slug = course_id_map[pf["ProductId"]]
        new_id = f"ch_{course_slug}_{pf['Id']}"
        chapter_id_map[pf["Id"]] = new_id
        chapters_live[new_id] = {
            "id": new_id,
            "courseSlug": course_slug,
            "title": pf.get("Name") or f"فصل {pf.get('Priority', 0)}",
            "order": pf.get("Priority", 0) or 0,
        }
    # Second pass: lessons (ParentId IS NOT NULL)
    for pf in legacy_product_fs:
        if pf.get("ParentId") is None:
            continue
        if pf["ProductId"] not in course_id_map:
            continue
        if pf["ParentId"] not in chapter_id_map:
            continue
        course_slug = course_id_map[pf["ProductId"]]
        chapter_id = chapter_id_map[pf["ParentId"]]
        new_id = f"lsn_{course_slug}_{pf['Id']}"
        lessons_live[new_id] = {
            "id": new_id,
            "chapterId": chapter_id,
            "courseSlug": course_slug,
            "title": pf.get("Name") or "درس",
            "videoDurationSec": 0,
            "order": pf.get("Priority", 0) or 0,
            "freePreview": False,
        }

    # ─── Articles (Posts → articles) ──────────────────────────────────
    articles_live = dict(live.get("articles", {}))
    existing_article_slugs = set(articles_live.keys())
    article_id_map: dict[int, str] = {}
    for a_idx, p in enumerate(legacy_posts):
        base = slugify(p.get("SeoUrlText") or p["Name"], f"article-{p['Id']}")
        slug = unique_slug(base, existing_article_slugs)
        article_id_map[p["Id"]] = slug
        # Resolve category name (prefer direct CategoryId, then join table)
        cat_id = p.get("CategoryId") or (post_cats.get(p["Id"], [None])[0])
        cat_name = ""
        if cat_id and cat_id in cat_id_map:
            cat_rec = cats_live[cat_id_map[cat_id]]
            cat_name = cat_rec.get("name", "")
        articles_live[slug] = {
            "slug": slug,
            "title": p["Name"],
            "excerpt": p.get("Summary") or "",
            "content": p.get("Description") or "",
            "category": cat_name,
            "coverImage": article_cover(a_idx),
            "legacyCoverImage": legacy_picture_path(p.get("PictureId")),
            "readMinutes": estimate_read_minutes(p.get("Description") or ""),
            "published": bool(p.get("Active") and p.get("AdminConfirm")),
            "createdAt": to_ms(p.get("CreateDate")) or now,
            "updatedAt": to_ms(p.get("UpdateDate")) or now,
            "publishedAt": to_ms(p.get("PublishDate")) or now,
            "seoTitle": p.get("SeoTitle") or None,
            "seoDescription": p.get("SeoDescription") or None,
            "views": p.get("VisitCount") or 0,
            "rating": p.get("RateAvg") or 0,
            "legacyId": p["Id"],
        }

    # ─── Orders (ProductOrders + Payments) ──────────────────────────────
    orders_live = dict(live.get("orders", {}))
    payment_by_order = {}
    for pay in legacy_payments:
        oid = pay.get("ProductOrderId")
        if oid:
            payment_by_order.setdefault(oid, []).append(pay)

    order_id_map: dict[str, str] = {}  # legacy order GUID -> new id
    orphan_orders = 0
    for o in legacy_orders:
        if o["UserId"] not in user_id_map:
            orphan_orders += 1
            continue
        new_uid = user_id_map[o["UserId"]]
        new_oid = gen_id("ord")
        order_id_map[o["Id"]] = new_oid
        pays = payment_by_order.get(o["Id"], [])
        success_pay = next((p for p in pays if p.get("IsSuccess")), None)
        ref_num = success_pay.get("RefNumber") if success_pay else None
        orders_live[new_oid] = {
            "id": new_oid,
            "userId": new_uid,
            "courseSlug": None,   # multi-item orders: populated via UserProducts join below if single-item
            "amount": int(o.get("BasePrice") or o.get("Price") or 0),
            "discountAmount": int(o.get("DiscountPrice") or 0),
            "finalAmount": int(o.get("FinalPrice") or o.get("PaymentPrice") or 0),
            "status": "paid" if o.get("IsPaid") else "pending",
            "paymentMethod": "legacy",
            "createdAt": to_ms(o.get("CreateDate")) or now,
            "paidAt": to_ms(o.get("CreateDate")) if o.get("IsPaid") else None,
            "refNum": ref_num,
            "authority": None,
            "legacyId": o["Id"],
        }

    # ─── Enrollments (UserProducts) ──────────────────────────────────
    enrollments_live = dict(live.get("enrollments", {}))
    orphan_enroll = 0
    for up in legacy_user_prods:
        if up["UserId"] not in user_id_map:
            orphan_enroll += 1
            continue
        if up["ProductId"] not in course_id_map:
            orphan_enroll += 1
            continue
        new_id = gen_id("enr")
        enrollments_live[new_id] = {
            "id": new_id,
            "userId": user_id_map[up["UserId"]],
            "courseSlug": course_id_map[up["ProductId"]],
            "enrolledAt": to_ms(up.get("CreateDate")) or now,
            "source": "legacy",
            "orderId": None,
            "legacyId": up["Id"],
        }

    # ─── Newsletter subscribers ──────────────────────────────────────
    newsletter_live = dict(live.get("newsletterSubs", {}))
    for n in legacy_newsletter:
        email = (n.get("Email") or "").strip().lower()
        if not email:
            continue
        if email in newsletter_live:
            continue
        newsletter_live[email] = {
            "email": email,
            "subscribedAt": to_ms(n.get("CreateDate")) or now,
        }

    # ─── ContactUses → callbackRequests ───────────────────────────────
    cb_live = dict(live.get("callbackRequests", {}))
    for c in legacy_contacts:
        phone = normalize_phone(c.get("Mobile"))
        if not phone:
            continue
        new_id = gen_id("cb")
        cb_live[new_id] = {
            "id": new_id,
            "phone": phone,
            "source": "legacy-contact",
            "status": "done" if c.get("Status") else "new",
            "createdAt": to_ms(c.get("CreateDate")) or now,
            "fullName": c.get("FullName"),
            "email": c.get("Email"),
            "subject": c.get("Title"),
            "message": c.get("Body"),
            "legacyId": c["Id"],
        }

    # ─── Build merged snapshot ────────────────────────────────────────
    merged = dict(live)
    merged["users"]           = users_live
    merged["categories"]      = cats_live
    merged["tags"]            = tags_live
    merged["courses"]         = courses_live
    merged["chapters"]        = chapters_live
    merged["lessons"]         = lessons_live
    merged["articles"]        = articles_live
    merged["orders"]          = orders_live
    merged["enrollments"]     = enrollments_live
    merged["newsletterSubs"]  = newsletter_live
    merged["callbackRequests"]= cb_live

    # ─── Report ────────────────────────────────────────────────────
    def delta(key, is_dict=True):
        before = len(live.get(key) or {})
        after = len(merged.get(key) or {})
        return f"{key:<18} before={before:<6} after={after:<6} added={after-before}"

    print("=" * 60)
    print("MERGE REPORT")
    print("=" * 60)
    for key in ["users", "articles", "courses", "chapters", "lessons",
                "categories", "tags", "orders", "enrollments",
                "newsletterSubs", "callbackRequests"]:
        print("  " + delta(key))
    print()
    print(f"  users with dup phone (skipped, re-mapped): {dropped_dup_phone}")
    print(f"  users with invalid phone (dropped):        {dropped_bad_phone}")
    print(f"  orders orphaned (user not found):          {orphan_orders}")
    print(f"  enrollments orphaned:                      {orphan_enroll}")
    print()

    # Preview file
    preview_path = PREVIEW
    preview_path.write_text(json.dumps(merged, ensure_ascii=False), "utf-8")
    print(f"  preview written: {preview_path}  ({preview_path.stat().st_size/1024/1024:.2f} MB)")

    if not apply:
        print()
        print("DRY-RUN: live DB untouched. Re-run with --apply to commit.")
        return

    # apply
    bak = LIVE_DB.with_name(f"namdar.db.json.pre-legacy-import-{datetime.now().strftime('%Y-%m-%d')}.bak")
    shutil.copyfile(LIVE_DB, bak)
    LIVE_DB.write_text(json.dumps(merged, ensure_ascii=False), "utf-8")
    print()
    print(f"  APPLIED. Backup: {bak.name}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    try:
        run(apply=args.apply)
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)
