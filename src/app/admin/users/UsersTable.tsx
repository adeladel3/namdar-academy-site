"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge, Select } from "@/components/admin/ui";
import {
  USER_ROLE_COLORS,
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  formatDate,
  formatPhone,
  formatRelative,
} from "@/lib/formatting";
import type { UserRecord } from "@/lib/db";

export default function UsersTable({ users }: { users: UserRecord[] }) {
  const [role, setRole] = useState<"" | UserRecord["role"]>("");
  const [status, setStatus] = useState<"" | UserRecord["status"]>("");

  const filtered = users.filter((u) => {
    if (role && u.role !== role) return false;
    if (status && u.status !== status) return false;
    return true;
  });

  const columns: Column<UserRecord>[] = [
    {
      key: "name",
      header: "کاربر",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (u) => (
        <Link
          href={`/admin/users/${u.id}`}
          className="flex items-center gap-3 hover:text-[#1b3c8a] transition"
        >
          <span className="w-9 h-9 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold text-sm flex items-center justify-center shrink-0">
            {u.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">{u.name}</div>
            {u.email && (
              <div className="text-[11px] text-[#010514]/55 truncate">
                {u.email}
              </div>
            )}
          </div>
        </Link>
      ),
    },
    {
      key: "phone",
      header: "موبایل",
      sortable: true,
      sortValue: (r) => r.phone,
      cell: (u) => (
        <span className="font-mono text-xs text-[#010514]/75" dir="ltr">
          {formatPhone(u.phone)}
        </span>
      ),
    },
    {
      key: "role",
      header: "نقش",
      sortable: true,
      sortValue: (r) => r.role,
      cell: (u) => (
        <Badge className={USER_ROLE_COLORS[u.role]}>
          {USER_ROLE_LABELS[u.role]}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      sortable: true,
      sortValue: (r) => r.status,
      cell: (u) => (
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
            u.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {USER_STATUS_LABELS[u.status]}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "ثبت‌نام",
      sortable: true,
      sortValue: (r) => r.createdAt,
      cell: (u) => (
        <span className="text-xs text-[#010514]/55">
          {formatDate(u.createdAt)}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      header: "آخرین ورود",
      sortable: true,
      sortValue: (r) => r.lastLoginAt ?? 0,
      cell: (u) => (
        <span className="text-xs text-[#010514]/55">
          {u.lastLoginAt ? formatRelative(u.lastLoginAt) : "هرگز"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      rows={filtered}
      columns={columns}
      rowKey={(u) => u.id}
      initialSort={{ key: "createdAt", dir: "desc" }}
      searchFn={(u, q) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.email?.toLowerCase().includes(q) ?? false)
      }
      searchPlaceholder="جستجو بر اساس نام، موبایل یا ایمیل"
      filters={
        <div className="flex items-center gap-2">
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as "" | UserRecord["role"])}
            className="!py-1.5 !px-3 !text-sm !w-auto"
          >
            <option value="">همه نقش‌ها</option>
            <option value="admin">مدیر</option>
            <option value="support">پشتیبانی</option>
            <option value="student">دانش‌پذیر</option>
          </Select>
          <Select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "" | UserRecord["status"])
            }
            className="!py-1.5 !px-3 !text-sm !w-auto"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="disabled">غیرفعال</option>
          </Select>
        </div>
      }
    />
  );
}
