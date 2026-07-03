"use client";

import Link from "@/components/SafeLink";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge, Dropdown, DropdownItem } from "@/components/admin/ui";
import { formatDate } from "@/lib/formatting";
import type { ArticleRecord } from "@/lib/db";

export default function ArticlesTable({
  articles,
}: {
  articles: ArticleRecord[];
}) {
  const columns: Column<ArticleRecord>[] = [
    {
      key: "title",
      header: "عنوان",
      sortable: true,
      sortValue: (r) => r.title,
      cell: (a) => (
        <Link
          href={`/admin/articles/${a.slug}`}
          className="flex items-center gap-3 hover:text-[#1b3c8a] transition"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.coverImage}
            alt={a.title}
            className="w-14 h-9 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <div className="font-bold truncate">{a.title}</div>
            <div className="text-[11px] text-[#010514]/50 font-mono" dir="ltr">
              /{a.slug}
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: "category",
      header: "دسته",
      sortable: true,
      sortValue: (r) => r.category,
      cell: (a) => (
        <span className="text-xs text-[#010514]/70">{a.category}</span>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      sortable: true,
      sortValue: (r) => String(r.published),
      cell: (a) => (
        <Badge
          className={
            a.published
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {a.published ? "منتشر شده" : "پیش‌نویس"}
        </Badge>
      ),
    },
    {
      key: "updated",
      header: "آخرین ویرایش",
      sortable: true,
      sortValue: (r) => r.updatedAt,
      cell: (a) => (
        <span className="text-xs text-[#010514]/55">
          {formatDate(a.updatedAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      rows={articles}
      columns={columns}
      rowKey={(r) => r.slug}
      initialSort={{ key: "updated", dir: "desc" }}
      searchFn={(r, q) =>
        r.title.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      }
      searchPlaceholder="جستجو بر اساس عنوان، slug یا دسته"
      rowActions={(a) => (
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
              (window.location.href = `/admin/articles/${a.slug}`)
            }
          >
            ویرایش
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              window.open(`/articles/${a.slug}`, "_blank", "noopener")
            }
          >
            مشاهده در سایت
          </DropdownItem>
        </Dropdown>
      )}
      emptyTitle="مقاله‌ای وجود ندارد"
      emptyDescription="اولین مقاله خود را ایجاد کنید."
    />
  );
}
