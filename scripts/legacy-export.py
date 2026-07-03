#!/usr/bin/env python3
"""
Exports legacy MSSQL tables (restored in the namdar-mssql container) to JSON
files under legacy-import/exports/. Idempotent.

Reads only — never writes back to the MSSQL database.
"""

from __future__ import annotations
import json
import os
import sys
from datetime import datetime, date
from decimal import Decimal
from pathlib import Path

import pymssql

HERE = Path(__file__).resolve().parent
OUT_DIR = HERE.parent / "legacy-import" / "exports"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Host port exposed by the docker run command.
CONN = dict(
    server="127.0.0.1",
    port=14333,
    user="sa",
    password="Namdar!Import#2026",
    database="namdar_academy_db",
    charset="UTF-8",
    tds_version="7.4",
)


def _default(o):
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    if isinstance(o, Decimal):
        return float(o)
    if isinstance(o, bytes):
        return o.decode("utf-8", errors="replace")
    raise TypeError(f"no serializer for {type(o).__name__}")


def dump(cur, name: str, query: str):
    cur.execute(query)
    cols = [c[0] for c in cur.description]
    rows = [dict(zip(cols, r)) for r in cur.fetchall()]
    out = OUT_DIR / f"{name}.json"
    with out.open("w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, default=_default)
    print(f"  {name:<20} {len(rows):>8} rows -> {out.name}")


def main():
    conn = pymssql.connect(**CONN)
    cur = conn.cursor()

    dump(cur, "users", """
        SELECT Id, Mobile, Email, FirstName, LastName, CreateDate,
               IsLecturer, Specialty, PictureId
        FROM Users
        WHERE Deleted=0 AND Locked=0 AND Mobile IS NOT NULL AND LEN(Mobile)>=10
    """)

    dump(cur, "categories", """
        SELECT Id, ParentId, Name, SeoUrlText, Summary, Description,
               Priority, Active, Deleted, PictureId
        FROM Categories WHERE Deleted=0
    """)

    dump(cur, "posts", """
        SELECT Id, Name, SeoUrlText, Summary, Description, SeoTitle,
               SeoDescription, PictureId, CategoryId, UserId, Active,
               AdminConfirm, PublishDate, CreateDate, UpdateDate,
               VisitCount, RateAvg
        FROM Posts WHERE Deleted=0
    """)

    dump(cur, "products", """
        SELECT Id, Name, SeoUrlText, Summary, Description, Information,
               Price, PreviousPrice, BasePrice, PictureId, CategoryId,
               LecturerId, StudentCount, LessonCount, Duration, Active,
               CreateDate, UpdateDate, VisitCount, RateAvg, Elected, Special
        FROM Products WHERE Deleted=0
    """)

    dump(cur, "product_files", """
        SELECT Id, ProductId, ParentId, Name, Label, FileId, Priority
        FROM ProductFiles
    """)

    dump(cur, "user_products", """
        SELECT Id, UserId, ProductId, Price, CreateDate,
               SpotPlayerUrl, TicketExpireDate, MerchantTrackNo
        FROM UserProducts
    """)

    dump(cur, "product_orders", """
        SELECT Id, UserId, Price, BasePrice, DiscountPrice, PaymentPrice,
               FinalPrice, CreateDate, IsPaid, Deleted, UserDescription
        FROM ProductOrders WHERE Deleted=0
    """)

    dump(cur, "payments", """
        SELECT Id, ProductOrderId, UserId, Amount, RefNumber,
               CreateDate, IsSuccess, IsOnline
        FROM Payments
    """)

    dump(cur, "hashtags", "SELECT Id, Name FROM Hashtags")
    dump(cur, "hashtag_post", "SELECT * FROM HashtagPost")
    dump(cur, "category_post", "SELECT * FROM CategoryPost")
    dump(cur, "category_product", "SELECT * FROM CategoryProduct")

    dump(cur, "pictures", """
        SELECT Id, Url, Name, Extension, ContentType
        FROM Pictures
    """)

    dump(cur, "newsletter_emails", """
        SELECT Id, Email, CreateDate FROM NewsletterEmails
    """)

    dump(cur, "contact_uses", """
        SELECT Id, UserId, FullName, Mobile, Email, Title, Body,
               CreateDate, Status
        FROM ContactUses
    """)

    dump(cur, "static_pages", """
        SELECT Id, Name, SeoUrlText, Summary, Description, Active
        FROM StaticPages WHERE Deleted=0
    """)

    conn.close()
    print("\nDone.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
