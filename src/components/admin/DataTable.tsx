"use client";

import { useMemo, useState } from "react";
import { cx } from "./ui";
import { Icon } from "./Icons";
import { faDigits } from "@/lib/formatting";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  width?: string;
  align?: "start" | "end" | "center";
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  initialSort?: { key: string; dir: "asc" | "desc" };
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFn?: (row: T, q: string) => boolean;
  toolbar?: React.ReactNode;
  filters?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  /** Render action buttons for each row (e.g. a kebab menu). */
  rowActions?: (row: T) => React.ReactNode;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  initialSort,
  pageSize = 15,
  searchable = true,
  searchPlaceholder = "جستجو…",
  searchFn,
  toolbar,
  filters,
  emptyTitle = "موردی یافت نشد",
  emptyDescription,
  onRowClick,
  rowActions,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(
    initialSort ?? null
  );
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!q.trim() || !searchFn) return rows;
    const n = q.trim().toLowerCase();
    return rows.filter((r) => searchFn(r, n));
  }, [rows, q, searchFn]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = sorted.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  function toggleSort(key: string) {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortable) return;
    setPage(1);
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  const alignClass = (a?: Column<T>["align"]) =>
    a === "center" ? "text-center" : a === "end" ? "text-left" : "text-right";

  return (
    <div className="bg-white rounded-3xl border border-[#e5eaf5] overflow-hidden">
      {(searchable || toolbar || filters) && (
        <div className="px-5 py-4 border-b border-[#eef2f7] flex flex-wrap items-center gap-3">
          {searchable && (
            <div className="relative flex-1 min-w-[220px]">
              <Icon.Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#010514]/40"
                width={16}
                height={16}
              />
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pr-9 pl-4 py-2 rounded-xl border border-[#e5eaf5] bg-[#f7fafd] text-sm focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
              />
            </div>
          )}
          {filters}
          {toolbar && <div className="ms-auto flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="p-14 text-center text-[#010514]/55">
          <div className="font-bold text-[#010514] mb-1">{emptyTitle}</div>
          {emptyDescription && (
            <div className="text-sm">{emptyDescription}</div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7fafd] text-[#010514]/65">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    style={c.width ? { width: c.width } : undefined}
                    className={cx(
                      "p-4 font-medium",
                      alignClass(c.align),
                      c.sortable && "cursor-pointer select-none hover:text-[#1b3c8a]"
                    )}
                    onClick={() => toggleSort(c.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.header}
                      {c.sortable && sort?.key === c.key && (
                        <span className="text-[#1b3c8a]">
                          {sort.dir === "asc" ? (
                            <Icon.ChevronUp width={12} height={12} />
                          ) : (
                            <Icon.ChevronDown width={12} height={12} />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
                {rowActions && <th className="p-4 w-12" />}
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={cx(
                    "border-t border-[#eef2f7]",
                    onRowClick && "cursor-pointer hover:bg-[#f7fafd]"
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cx("p-4 align-middle", alignClass(c.align))}>
                      {c.cell(row)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="p-2" onClick={(e) => e.stopPropagation()}>
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-[#eef2f7] flex items-center justify-between text-sm">
          <div className="text-[#010514]/55">
            نمایش {faDigits((pageSafe - 1) * pageSize + 1)} تا{" "}
            {faDigits(Math.min(pageSafe * pageSize, sorted.length))} از{" "}
            {faDigits(sorted.length)}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pageSafe === 1}
              onClick={() => setPage(pageSafe - 1)}
              className="p-2 rounded-lg text-[#010514]/65 hover:bg-[#f7fafd] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon.ChevronRight width={16} height={16} />
            </button>
            <span className="px-3 py-1 text-[#010514]/75">
              صفحه {faDigits(pageSafe)} از {faDigits(totalPages)}
            </span>
            <button
              type="button"
              disabled={pageSafe === totalPages}
              onClick={() => setPage(pageSafe + 1)}
              className="p-2 rounded-lg text-[#010514]/65 hover:bg-[#f7fafd] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon.ChevronLeft width={16} height={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
