"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Donut } from "@/components/admin/Charts";
import {
  faDigits,
  formatPhone,
  formatRelative,
  percent,
} from "@/lib/formatting";

export type StudentRow = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  enrolledAt: number;
  source: "purchase" | "grant" | "free";
  completedLessons: number;
  totalLessons: number;
  lastActivityAt: number | null;
};

const SOURCE_LABEL: Record<StudentRow["source"], string> = {
  purchase: "خرید",
  grant: "اعطا",
  free: "رایگان",
};

export default function StudentsTable({ rows }: { rows: StudentRow[] }) {
  const columns: Column<StudentRow>[] = [
    {
      key: "name",
      header: "کاربر",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <Link
          href={`/admin/users/${r.userId}`}
          className="hover:text-[#1b3c8a] transition"
        >
          <div className="font-bold text-[#010514]">{r.name}</div>
          <div className="text-[11px] text-[#010514]/55 font-mono" dir="ltr">
            {formatPhone(r.phone)}
          </div>
        </Link>
      ),
    },
    {
      key: "progress",
      header: "پیشرفت",
      sortable: true,
      sortValue: (r) =>
        r.totalLessons ? r.completedLessons / r.totalLessons : 0,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Donut
            value={r.completedLessons}
            max={Math.max(1, r.totalLessons)}
            size={52}
            strokeWidth={7}
          />
          <div className="text-xs text-[#010514]/65">
            {faDigits(r.completedLessons)} / {faDigits(r.totalLessons)} درس
            <div className="text-[10px]">
              ({faDigits(percent(r.completedLessons, r.totalLessons))}٪)
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "source",
      header: "روش ثبت‌نام",
      sortable: true,
      sortValue: (r) => r.source,
      cell: (r) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold">
          {SOURCE_LABEL[r.source]}
        </span>
      ),
    },
    {
      key: "enrolledAt",
      header: "تاریخ ثبت‌نام",
      sortable: true,
      sortValue: (r) => r.enrolledAt,
      cell: (r) => (
        <span className="text-xs text-[#010514]/55">
          {formatRelative(r.enrolledAt)}
        </span>
      ),
    },
    {
      key: "lastActivity",
      header: "آخرین فعالیت",
      sortable: true,
      sortValue: (r) => r.lastActivityAt ?? 0,
      cell: (r) => (
        <span className="text-xs text-[#010514]/55">
          {r.lastActivityAt ? formatRelative(r.lastActivityAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      initialSort={{ key: "enrolledAt", dir: "desc" }}
      searchFn={(r, q) =>
        r.name.toLowerCase().includes(q) || r.phone.includes(q)
      }
    />
  );
}
