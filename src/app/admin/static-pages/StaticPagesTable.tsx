"use client";

import Link from "@/components/SafeLink";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge, Dropdown, DropdownItem } from "@/components/admin/ui";
import { formatDate } from "@/lib/formatting";
import type { StaticPageRecord } from "@/lib/db";

export default function StaticPagesTable({
  pages,
}: {
  pages: StaticPageRecord[];
}) {
  const columns: Column<StaticPageRecord>[] = [
    {
      key: "title",
      header: "عنوان",
      sortable: true,
      sortValue: (r) => r.title,
      cell: (p) => (
        <Link
          href={`/admin/static-pages/${p.slug}`}
          className="block hover:text-[#1b3c8a] transition"
        >
          <div className="font-bold truncate">{p.title}</div>
          <div
            className="text-[11px] text-[#010514]/50 font-mono mt-0.5"
            dir="ltr"
          >
            /p/{p.slug}
          </div>
        </Link>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      sortable: true,
      sortValue: (r) => String(r.published),
      cell: (p) => (
        <Badge
          className={
            p.published
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {p.published ? "منتشر شده" : "پیش‌نویس"}
        </Badge>
      ),
    },
    {
      key: "legacy",
      header: "منبع",
      sortable: true,
      sortValue: (r) => (r.legacyId ? `legacy-${r.legacyId}` : "manual"),
      cell: (p) =>
        p.legacyId ? (
          <span className="text-[11px] text-[#010514]/55 font-mono" dir="ltr">
            legacy #{p.legacyId}
          </span>
        ) : (
          <span className="text-[11px] text-[#010514]/40">—</span>
        ),
    },
    {
      key: "updated",
      header: "آخرین ویرایش",
      sortable: true,
      sortValue: (r) => r.updatedAt,
      cell: (p) => (
        <span className="text-xs text-[#010514]/55">
          {formatDate(p.updatedAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      rows={pages}
      columns={columns}
      rowKey={(r) => r.slug}
      initialSort={{ key: "updated", dir: "desc" }}
      searchFn={(r, q) =>
        r.title.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q)
      }
      searchPlaceholder="جستجو بر اساس عنوان یا slug"
      rowActions={(p) => (
        <Dropdown
          align="left"
          trigger={
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-[#f7fafd] text-[#010514]/55"
            >
              ⋮
            </button>
          }
        >
          <DropdownItem
            onClick={() =>
              (window.location.href = `/admin/static-pages/${p.slug}`)
            }
          >
            ویرایش
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              window.open(`/p/${p.slug}`, "_blank", "noopener")
            }
          >
            مشاهده در سایت
          </DropdownItem>
        </Dropdown>
      )}
      emptyTitle="صفحه‌ای وجود ندارد"
      emptyDescription="اولین صفحه ثابت خود را ایجاد کنید."
    />
  );
}
