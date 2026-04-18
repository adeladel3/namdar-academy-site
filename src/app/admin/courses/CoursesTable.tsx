"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import {
  COURSE_STATUS_COLORS,
  COURSE_STATUS_LABELS,
  LEVEL_LABELS,
  faDigits,
  formatDate,
  formatToman,
} from "@/lib/formatting";
import type { CategoryRecord, CourseRecord } from "@/lib/db";
import { Badge, Dropdown, DropdownItem, Select } from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";

export default function CoursesTable({
  courses,
  categories,
}: {
  courses: CourseRecord[];
  categories: CategoryRecord[];
}) {
  const [status, setStatus] = useState<"" | CourseRecord["status"]>("");
  const [category, setCategory] = useState<string>("");
  const [level, setLevel] = useState<string>("");

  const filtered = courses.filter((c) => {
    if (status && c.status !== status) return false;
    if (category && c.categoryId !== category) return false;
    if (level && c.level !== level) return false;
    return true;
  });

  const columns: Column<CourseRecord>[] = [
    {
      key: "title",
      header: "دوره",
      sortable: true,
      sortValue: (r) => r.title,
      cell: (c) => (
        <Link
          href={`/admin/courses/${c.slug}`}
          className="flex items-center gap-3 hover:text-[#1b3c8a] transition"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.previewImage}
            alt={c.title}
            className="w-14 h-9 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <div className="font-bold truncate">{c.title}</div>
            <div className="text-[11px] text-[#010514]/50 font-mono" dir="ltr">
              /{c.slug}
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      sortable: true,
      sortValue: (r) => r.status,
      cell: (c) => (
        <Badge className={COURSE_STATUS_COLORS[c.status]}>
          {COURSE_STATUS_LABELS[c.status]}
        </Badge>
      ),
    },
    {
      key: "level",
      header: "سطح",
      sortable: true,
      sortValue: (r) => r.level,
      cell: (c) => (
        <span className="text-xs text-[#010514]/70">
          {LEVEL_LABELS[c.level]}
        </span>
      ),
    },
    {
      key: "price",
      header: "قیمت",
      sortable: true,
      sortValue: (r) => r.discountPrice ?? r.price,
      cell: (c) =>
        c.isFree ? (
          <span className="text-green-700 font-bold text-xs">رایگان</span>
        ) : c.discountPrice ? (
          <div>
            <div className="text-xs text-[#010514]/50 line-through">
              {formatToman(c.price)}
            </div>
            <div className="text-sm font-bold text-[#1b3c8a]">
              {formatToman(c.discountPrice)}
            </div>
          </div>
        ) : (
          <span className="text-sm font-bold text-[#1b3c8a]">
            {formatToman(c.price)}
          </span>
        ),
    },
    {
      key: "students",
      header: "ثبت‌نام",
      sortable: true,
      sortValue: (r) => r.studentsCount,
      cell: (c) => (
        <span className="text-sm text-[#010514]/75">
          {faDigits(c.studentsCount)}
        </span>
      ),
    },
    {
      key: "updated",
      header: "آخرین تغییر",
      sortable: true,
      sortValue: (r) => r.updatedAt,
      cell: (c) => (
        <span className="text-xs text-[#010514]/55">
          {formatDate(c.updatedAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      rows={filtered}
      columns={columns}
      rowKey={(r) => r.slug}
      initialSort={{ key: "updated", dir: "desc" }}
      searchPlaceholder="جستجو بر اساس عنوان یا slug"
      searchFn={(r, q) =>
        r.title.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q)
      }
      filters={
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "" | CourseRecord["status"])
            }
            className="!py-1.5 !px-3 !text-sm !w-auto"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="published">منتشر شده</option>
            <option value="draft">پیش‌نویس</option>
            <option value="archived">بایگانی</option>
          </Select>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="!py-1.5 !px-3 !text-sm !w-auto"
          >
            <option value="">همه دسته‌ها</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="!py-1.5 !px-3 !text-sm !w-auto"
          >
            <option value="">همه سطوح</option>
            <option value="beginner">مقدماتی</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">پیشرفته</option>
          </Select>
        </div>
      }
      rowActions={(c) => (
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
          <DropdownItem onClick={() => (window.location.href = `/admin/courses/${c.slug}`)}>
            <span className="inline-flex items-center gap-2">
              <Icon.Edit width={14} height={14} /> ویرایش
            </span>
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              window.open(`/courses/${c.slug}`, "_blank", "noopener")
            }
          >
            <span className="inline-flex items-center gap-2">
              <Icon.Eye width={14} height={14} /> مشاهده در سایت
            </span>
          </DropdownItem>
          <DropdownItem
            onClick={async () => {
              await fetch(`/api/admin/courses/${c.slug}/duplicate`, {
                method: "POST",
              });
              window.location.reload();
            }}
          >
            تکثیر
          </DropdownItem>
          <DropdownItem
            onClick={async () => {
              const action = c.status === "published" ? "unpublish" : "publish";
              await fetch(`/api/admin/courses/${c.slug}/${action}`, {
                method: "POST",
              });
              window.location.reload();
            }}
          >
            {c.status === "published" ? "لغو انتشار" : "انتشار"}
          </DropdownItem>
        </Dropdown>
      )}
      emptyTitle="دوره‌ای یافت نشد"
      emptyDescription="برای شروع یک دوره جدید ایجاد کنید."
    />
  );
}
