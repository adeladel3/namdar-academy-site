"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge, Button, Select } from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  formatDateTime,
  formatPhone,
  formatToman,
} from "@/lib/formatting";
import type { OrderStatus } from "@/lib/db";

export type OrderRow = {
  id: string;
  userName: string;
  userId: string;
  phone: string;
  courseTitle: string;
  finalAmount: number;
  status: OrderStatus;
  refNum?: string;
  createdAt: number;
  paidAt?: number;
};

export default function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const [status, setStatus] = useState<"" | OrderStatus>("");

  const filtered = rows.filter((r) => (status ? r.status === status : true));

  const columns: Column<OrderRow>[] = [
    {
      key: "id",
      header: "شناسه",
      sortable: true,
      sortValue: (r) => r.id,
      cell: (r) => (
        <Link
          href={`/admin/orders/${r.id}`}
          className="font-mono text-xs text-[#1b3c8a] hover:underline"
          dir="ltr"
        >
          {r.id.slice(0, 8)}
        </Link>
      ),
    },
    {
      key: "user",
      header: "کاربر",
      sortable: true,
      sortValue: (r) => r.userName,
      cell: (r) => (
        <Link
          href={`/admin/users/${r.userId}`}
          className="hover:text-[#1b3c8a] transition"
        >
          <div className="font-medium">{r.userName}</div>
          <div className="text-[11px] text-[#010514]/55 font-mono" dir="ltr">
            {formatPhone(r.phone)}
          </div>
        </Link>
      ),
    },
    {
      key: "course",
      header: "دوره",
      sortable: true,
      sortValue: (r) => r.courseTitle,
      cell: (r) => <span className="truncate">{r.courseTitle}</span>,
    },
    {
      key: "amount",
      header: "مبلغ",
      sortable: true,
      sortValue: (r) => r.finalAmount,
      cell: (r) => (
        <span className="font-bold text-[#1b3c8a]">
          {formatToman(r.finalAmount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      sortable: true,
      sortValue: (r) => r.status,
      cell: (r) => (
        <Badge className={ORDER_STATUS_COLORS[r.status]}>
          {ORDER_STATUS_LABELS[r.status]}
        </Badge>
      ),
    },
    {
      key: "refNum",
      header: "کد پیگیری",
      cell: (r) => (
        <span className="font-mono text-xs text-[#010514]/65" dir="ltr">
          {r.refNum ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاریخ",
      sortable: true,
      sortValue: (r) => r.createdAt,
      cell: (r) => (
        <span className="text-xs text-[#010514]/55">
          {formatDateTime(r.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      rows={filtered}
      columns={columns}
      rowKey={(r) => r.id}
      initialSort={{ key: "createdAt", dir: "desc" }}
      searchFn={(r, q) =>
        r.id.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.courseTitle.toLowerCase().includes(q) ||
        (r.refNum?.toLowerCase().includes(q) ?? false)
      }
      searchPlaceholder="جستجو بر اساس شناسه، کاربر، دوره یا کد پیگیری"
      filters={
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | OrderStatus)}
            className="!py-1.5 !px-3 !text-sm !w-auto"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="paid">موفق</option>
            <option value="pending">در انتظار</option>
            <option value="failed">ناموفق</option>
            <option value="refunded">مسترد شده</option>
            <option value="partial_refund">استرداد جزئی</option>
          </Select>
        </div>
      }
      toolbar={
        <a href="/api/admin/orders/export" download>
          <Button variant="secondary" size="sm">
            <Icon.Download width={15} height={15} /> خروجی CSV
          </Button>
        </a>
      }
    />
  );
}
