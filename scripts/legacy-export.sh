#!/usr/bin/env bash
# Exports the legacy MSSQL DB tables we need into plain JSON files under
# legacy-import/exports/. Runs inside the dedicated MSSQL container we set up.
# Idempotent: re-running overwrites the output files.
set -euo pipefail

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/legacy-import/exports"
mkdir -p "$OUT_DIR"

SQLCMD() {
  docker run --rm --network namdar-import \
    mcr.microsoft.com/mssql-tools:latest \
    /opt/mssql-tools/bin/sqlcmd -S 'namdar-mssql,1433' -U sa -P 'Namdar!Import#2026' \
    -d namdar_academy_db -W -s '|' -h -1 "$@" 2>&1 | grep -v '^WARNING' | grep -v 'rows affected'
}

# Dump a table as JSON via FOR JSON PATH, bypassing sqlcmd's row-wrap limits.
dump_json() {
  local name="$1"
  local query="$2"
  local out="$OUT_DIR/$name.json"
  echo "  exporting $name -> $out"
  docker run --rm --network namdar-import \
    mcr.microsoft.com/mssql-tools:latest \
    /opt/mssql-tools/bin/sqlcmd -S 'namdar-mssql,1433' -U sa -P 'Namdar!Import#2026' \
    -d namdar_academy_db -h -1 -y 0 -Y 0 -w 65535 \
    -Q "SET NOCOUNT ON; $query" 2>/dev/null \
    | grep -v '^WARNING' \
    | sed -E '/^[[:space:]]*$/d' \
    | python3 -c "
import sys, json
raw = sys.stdin.read().strip()
# sqlcmd wraps FOR JSON output across lines at ~2033 chars; strip trailing spaces only
# and concatenate lines.
cleaned = ''.join(line.rstrip() for line in raw.splitlines())
if not cleaned:
    print('[]')
else:
    try:
        parsed = json.loads(cleaned)
        print(json.dumps(parsed, ensure_ascii=False))
    except Exception as e:
        sys.stderr.write(f'parse-error in {\"$name\"}: {e}\n')
        print(cleaned)
" > "$out"
  local n=$(python3 -c "import json; print(len(json.load(open('$out'))))" 2>/dev/null || echo '?')
  echo "    rows: $n"
}

echo "== Users (active + valid mobile) =="
dump_json users "SELECT Id, Mobile, Email, FirstName, LastName, CreateDate, IsLecturer, Specialty, PictureId FROM Users WHERE Deleted=0 AND Locked=0 AND Mobile IS NOT NULL AND LEN(Mobile)>=10 FOR JSON PATH"

echo "== Categories =="
dump_json categories "SELECT Id, ParentId, Name, SeoUrlText, Summary, Description, Priority, Active, Deleted, PictureId FROM Categories WHERE Deleted=0 FOR JSON PATH"

echo "== Posts (articles) =="
dump_json posts "SELECT Id, Name, SeoUrlText, Summary, Description, SeoTitle, SeoDescription, PictureId, CategoryId, UserId, Active, AdminConfirm, PublishDate, CreateDate, UpdateDate, VisitCount, RateAvg FROM Posts WHERE Deleted=0 FOR JSON PATH"

echo "== Products (courses) =="
dump_json products "SELECT Id, Name, SeoUrlText, Summary, Description, Information, Price, PreviousPrice, BasePrice, PictureId, CategoryId, LecturerId, StudentCount, LessonCount, Duration, Active, CreateDate, UpdateDate, VisitCount, RateAvg, Elected, Special FROM Products WHERE Deleted=0 FOR JSON PATH"

echo "== ProductFiles (chapters/lessons) =="
dump_json product_files "SELECT Id, ProductId, ParentId, Name, Label, FileId, Priority FROM ProductFiles FOR JSON PATH"

echo "== UserProducts (enrollments) =="
dump_json user_products "SELECT Id, UserId, ProductId, Price, CreateDate, SpotPlayerUrl, TicketExpireDate, MerchantTrackNo FROM UserProducts FOR JSON PATH"

echo "== ProductOrders =="
dump_json product_orders "SELECT Id, UserId, Price, BasePrice, DiscountPrice, PaymentPrice, FinalPrice, CreateDate, IsPaid, Deleted, UserDescription FROM ProductOrders WHERE Deleted=0 FOR JSON PATH"

echo "== Payments =="
dump_json payments "SELECT Id, ProductOrderId, UserId, Amount, RefNumber, CreateDate, IsSuccess, IsOnline FROM Payments FOR JSON PATH"

echo "== Hashtags =="
dump_json hashtags "SELECT Id, Name FROM Hashtags FOR JSON PATH"

echo "== HashtagPost =="
dump_json hashtag_post "SELECT * FROM HashtagPost FOR JSON PATH"

echo "== CategoryPost =="
dump_json category_post "SELECT * FROM CategoryPost FOR JSON PATH"

echo "== CategoryProduct =="
dump_json category_product "SELECT * FROM CategoryProduct FOR JSON PATH"

echo "== Pictures (for resolving image paths) =="
dump_json pictures "SELECT Id, Url, Name, Extension, ContentType FROM Pictures FOR JSON PATH"

echo "== NewsletterEmails =="
dump_json newsletter_emails "SELECT Id, Email, CreateDate FROM NewsletterEmails FOR JSON PATH"

echo "== ContactUses =="
dump_json contact_uses "SELECT Id, UserId, FullName, Mobile, Email, Title, Body, CreateDate, Status FROM ContactUses FOR JSON PATH"

echo "== StaticPages =="
dump_json static_pages "SELECT Id, Name, SeoUrlText, Summary, Description, Active FROM StaticPages WHERE Deleted=0 FOR JSON PATH"

echo
echo "Done. Files under: $OUT_DIR"
ls -lh "$OUT_DIR"
