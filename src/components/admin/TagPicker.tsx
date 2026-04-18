"use client";

import { useState } from "react";
import type { TagRecord } from "@/lib/db";
import { cx } from "./ui";
import { Icon } from "./Icons";

type Props = {
  allTags: TagRecord[];
  value: string[];
  onChange: (ids: string[]) => void;
};

export default function TagPicker({ allTags, value, onChange }: Props) {
  const [q, setQ] = useState("");

  const selected = new Set(value);
  const matched = allTags.filter(
    (t) => !selected.has(t.id) && t.name.includes(q.trim())
  );
  const canCreate =
    q.trim().length >= 2 &&
    !allTags.some((t) => t.name === q.trim());

  function toggle(id: string) {
    if (selected.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  async function createAndAdd() {
    const name = q.trim();
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok && data.id) {
      onChange([...value, data.id]);
      setQ("");
    }
  }

  return (
    <div className="rounded-2xl border border-[#e5eaf5] bg-white p-3 space-y-2">
      <div className="flex items-center flex-wrap gap-2 min-h-[32px]">
        {value.map((id) => {
          const t = allTags.find((x) => x.id === id);
          if (!t) return null;
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eef4ff] text-[#1b3c8a] text-xs font-bold"
            >
              {t.name}
              <button
                type="button"
                onClick={() => toggle(id)}
                className="text-[#1b3c8a]/65 hover:text-[#1b3c8a]"
              >
                ×
              </button>
            </span>
          );
        })}
        {value.length === 0 && (
          <span className="text-xs text-[#010514]/45">هنوز تگی انتخاب نشده</span>
        )}
      </div>
      <div className="border-t border-[#eef2f7] pt-2">
        <div className="relative">
          <Icon.Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#010514]/40"
            width={14}
            height={14}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو یا افزودن تگ جدید"
            className="w-full pr-8 pl-3 py-2 rounded-xl bg-[#f7fafd] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3c8a]/15"
          />
        </div>
        {q.trim().length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {matched.slice(0, 10).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className="px-2.5 py-1 rounded-full bg-white border border-[#e5eaf5] text-xs hover:border-[#1b3c8a] hover:text-[#1b3c8a] transition"
              >
                {t.name}
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={createAndAdd}
                className={cx(
                  "px-2.5 py-1 rounded-full bg-[#1b3c8a] text-white text-xs font-bold inline-flex items-center gap-1"
                )}
              >
                <Icon.Plus width={12} height={12} /> ایجاد «{q.trim()}»
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
