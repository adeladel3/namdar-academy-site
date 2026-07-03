"use client";

import Link from "@/components/SafeLink";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { formatDateTime } from "@/lib/formatting";

export type AuditRow = {
  id: string;
  actorName: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

export default function AuditLogTable({ rows }: { rows: AuditRow[] }) {
  const columns: Column<AuditRow>[] = [
    {
      key: "timestamp",
      header: "زمان",
      sortable: true,
      sortValue: (r) => r.timestamp,
      cell: (r) => (
        <span className="text-xs text-[#010514]/55">
          {formatDateTime(r.timestamp)}
        </span>
      ),
    },
    {
      key: "actor",
      header: "انجام‌دهنده",
      sortable: true,
      sortValue: (r) => r.actorName,
      cell: (r) => (
        <Link
          href={`/admin/users/${r.actorId}`}
          className="hover:text-[#1b3c8a] transition"
        >
          {r.actorName}
        </Link>
      ),
    },
    {
      key: "action",
      header: "عملیات",
      sortable: true,
      sortValue: (r) => r.action,
      cell: (r) => (
        <code className="px-2 py-0.5 rounded-md bg-[#eef4ff] text-[#1b3c8a] text-xs font-mono">
          {r.action}
        </code>
      ),
    },
    {
      key: "target",
      header: "هدف",
      cell: (r) => (
        <span className="text-xs text-[#010514]/65 font-mono" dir="ltr">
          {r.targetType}:{r.targetId.slice(0, 10)}
        </span>
      ),
    },
    {
      key: "metadata",
      header: "متادیتا",
      cell: (r) =>
        r.metadata ? (
          <code
            className="text-[10px] text-[#010514]/55 font-mono max-w-xs truncate block"
            dir="ltr"
          >
            {JSON.stringify(r.metadata)}
          </code>
        ) : (
          <span className="text-[#010514]/30">—</span>
        ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      initialSort={{ key: "timestamp", dir: "desc" }}
      searchFn={(r, q) =>
        r.action.toLowerCase().includes(q) ||
        r.actorName.toLowerCase().includes(q) ||
        r.targetId.toLowerCase().includes(q)
      }
      searchPlaceholder="جستجو بر اساس عملیات یا کاربر"
    />
  );
}
