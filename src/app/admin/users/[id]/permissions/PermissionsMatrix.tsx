"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "@/components/admin/ui";
import type { AdminAction, PermissionSource } from "@/lib/rbac";
import type { UserRole } from "@/lib/db";

type Item = {
  action: AdminAction;
  label: string;
  allowed: boolean;
  source: PermissionSource;
  defaultAllowed: boolean;
};

type Group = {
  key: string;
  label: string;
  items: Item[];
};

type OverrideState = "grant" | "deny" | "inherit";

export default function PermissionsMatrix({
  userId,
  groups: initialGroups,
  role,
}: {
  userId: string;
  groups: Group[];
  role: UserRole;
}) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [pending, startTransition] = useTransition();
  const [busyAction, setBusyAction] = useState<AdminAction | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    for (const g of initialGroups) {
      // Expand by default if any item in the group is overridden — so users
      // land on the interesting rows without hunting.
      out[g.key] = g.items.some((i) => i.source !== "role");
    }
    return out;
  });
  const [query, setQuery] = useState("");

  const totalOverrides = useMemo(
    () =>
      groups.reduce(
        (sum, g) => sum + g.items.filter((i) => i.source !== "role").length,
        0
      ),
    [groups]
  );

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            i.label.toLowerCase().includes(q) ||
            i.action.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  async function setOverride(action: AdminAction, state: OverrideState) {
    setBusyAction(action);
    try {
      const res = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, state }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "خطا", "err");
        return;
      }
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((item) => {
            if (item.action !== action) return item;
            const nextSource: PermissionSource =
              state === "grant" ? "grant" : state === "deny" ? "deny" : "role";
            const nextAllowed =
              state === "grant"
                ? true
                : state === "deny"
                  ? false
                  : item.defaultAllowed;
            return { ...item, allowed: nextAllowed, source: nextSource };
          }),
        }))
      );
      toast("دسترسی به‌روزرسانی شد", "ok");
      startTransition(() => router.refresh());
    } finally {
      setBusyAction(null);
    }
  }

  // Single-toggle logic: flip the effective allowed bit. If result differs
  // from the role default, we persist an explicit grant/deny. If it matches
  // the default, we clear back to inherit so the override isn't sticky when
  // the role definition changes later.
  function handleToggle(item: Item) {
    const nextAllowed = !item.allowed;
    const nextState: OverrideState =
      nextAllowed === item.defaultAllowed
        ? "inherit"
        : nextAllowed
          ? "grant"
          : "deny";
    return setOverride(item.action, nextState);
  }

  function toggleGroup(key: string) {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function expandAll(expand: boolean) {
    const out: Record<string, boolean> = {};
    for (const g of groups) out[g.key] = expand;
    setOpenGroups(out);
  }

  async function setGroupAll(
    group: Group,
    action: "open" | "close" | "reset"
  ) {
    for (const item of group.items) {
      const desired: OverrideState =
        action === "reset"
          ? "inherit"
          : action === "open"
            ? item.defaultAllowed
              ? "inherit"
              : "grant"
            : item.defaultAllowed
              ? "deny"
              : "inherit";
      // Skip no-ops to avoid hammering the API.
      const current: OverrideState =
        item.source === "grant"
          ? "grant"
          : item.source === "deny"
            ? "deny"
            : "inherit";
      if (current === desired) continue;
      // eslint-disable-next-line no-await-in-loop
      await setOverride(item.action, desired);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-[#eef2f7] flex items-center gap-3 flex-wrap bg-[#fafbfd]">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجو در دسترسی‌ها…"
            className="w-full px-3 py-2 rounded-full text-sm border border-[#e5eaf5] bg-white focus:outline-none focus:border-[#1b3c8a] transition"
          />
        </div>
        <div className="flex items-center gap-2">
          {totalOverrides > 0 && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
              {faNum(totalOverrides)} override فعال
            </span>
          )}
          <button
            type="button"
            onClick={() => expandAll(true)}
            className="text-[11px] px-3 py-1.5 rounded-full border border-[#e5eaf5] text-[#010514]/70 hover:border-[#1b3c8a] hover:text-[#1b3c8a] transition font-bold"
          >
            باز کردن همه
          </button>
          <button
            type="button"
            onClick={() => expandAll(false)}
            className="text-[11px] px-3 py-1.5 rounded-full border border-[#e5eaf5] text-[#010514]/70 hover:border-[#1b3c8a] hover:text-[#1b3c8a] transition font-bold"
          >
            جمع کردن همه
          </button>
        </div>
      </div>

      <div className="divide-y divide-[#eef2f7]">
        {filteredGroups.map((g) => {
          const isOpen = openGroups[g.key] ?? false;
          const onCount = g.items.filter((i) => i.allowed).length;
          const overrideCount = g.items.filter(
            (i) => i.source !== "role"
          ).length;
          return (
            <section key={g.key}>
              {/* Group header — click to expand/collapse */}
              <button
                type="button"
                onClick={() => toggleGroup(g.key)}
                className="w-full px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#f8fafc] transition text-right"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-block transition-transform duration-200 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                    aria-hidden
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#010514]/50"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </span>
                  <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#1b3c8a] to-[#49bbbd]" />
                  <span className="text-sm font-bold text-[#010514] truncate">
                    {g.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-[#010514]/55">
                    {faNum(onCount)} از {faNum(g.items.length)} باز
                  </span>
                  {overrideCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      {faNum(overrideCount)} override
                    </span>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-4">
                  {/* Group bulk actions */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setGroupAll(g, "open")}
                      disabled={pending || busyAction !== null}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold transition disabled:opacity-50"
                    >
                      همه را باز کن
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupAll(g, "close")}
                      disabled={pending || busyAction !== null}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold transition disabled:opacity-50"
                    >
                      همه را ببند
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupAll(g, "reset")}
                      disabled={pending || busyAction !== null}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-[#eef4ff] text-[#1b3c8a] hover:bg-[#dfe7ff] border border-[#d6e0f2] font-bold transition disabled:opacity-50"
                    >
                      بازگشت به پیش‌فرض نقش
                    </button>
                  </div>

                  <ul className="rounded-2xl border border-[#eef2f7] overflow-hidden divide-y divide-[#eef2f7] bg-white">
                    {g.items.map((item) => {
                      const isBusy = busyAction === item.action || pending;
                      const isOverride = item.source !== "role";
                      return (
                        <li
                          key={item.action}
                          className={`flex items-center justify-between gap-3 px-4 py-2.5 transition ${
                            isOverride ? "bg-amber-50/40" : "hover:bg-[#f8fafc]"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-sm font-medium text-[#010514]"
                                title={item.action}
                              >
                                {item.label}
                              </span>
                              {item.source === "grant" && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                                  اعطای ویژه
                                </span>
                              )}
                              {item.source === "deny" && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                                  محرومیت ویژه
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isOverride && (
                              <button
                                type="button"
                                onClick={() =>
                                  setOverride(item.action, "inherit")
                                }
                                disabled={isBusy}
                                title="بازگشت به پیش‌فرض نقش"
                                className="text-[11px] px-2 py-1 rounded-full text-[#1b3c8a] hover:bg-[#eef4ff] transition disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="1 4 1 10 7 10" />
                                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                                </svg>
                                پیش‌فرض
                              </button>
                            )}
                            <Switch
                              checked={item.allowed}
                              disabled={isBusy}
                              onChange={() => handleToggle(item)}
                              label={item.label}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-[#010514]/55">
            نتیجه‌ای برای «{query}» پیدا نشد
          </div>
        )}
      </div>

      <div className="px-5 py-4 bg-[#f8fafc] text-xs text-[#010514]/55 rounded-b-3xl">
        نقش فعلی کاربر: <span className="font-bold">{role}</span> — تغییر نقش از
        منوی پروفایل کاربر انجام می‌شود. کلیک روی هر سوییچ، دسترسی را فعال یا
        غیرفعال می‌کند؛ اگر نتیجه با پیش‌فرض نقش فرق داشته باشد، به‌صورت
        override ثبت می‌شود.
      </div>
    </div>
  );
}

function Switch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#1b3c8a]/40 ${
        checked ? "bg-emerald-500" : "bg-[#cbd5e1]"
      }`}
    >
      <span
        aria-hidden
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
        style={{ insetInlineStart: checked ? "22px" : "2px" }}
      />
    </button>
  );
}

function faNum(n: number): string {
  return n.toLocaleString("fa-IR");
}
