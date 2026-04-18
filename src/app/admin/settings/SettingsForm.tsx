"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, toast } from "@/components/admin/ui";

type Props = {
  group: string;
  fields: {
    key: string;
    render: (
      value: unknown,
      set: (v: unknown) => void
    ) => React.ReactNode;
  }[];
  initial: Record<string, unknown>;
  title: string;
  description?: string;
  footer?: React.ReactNode;
};

export default function SettingsForm({
  group,
  fields,
  initial,
  title,
  description,
  footer,
}: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [busy, setBusy] = useState(false);

  function set(k: string, v: unknown) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) payload[f.key] = values[f.key];
      const res = await fetch(
        `/api/admin/settings/${encodeURIComponent(group)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast(d.error ?? "خطا در ذخیره", "err");
        return;
      }
      toast("تنظیمات ذخیره شد", "ok");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="font-bold text-[#010514]">{title}</h2>
        {description && (
          <p className="text-xs text-[#010514]/55 mt-1 leading-6">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            {f.render(values[f.key], (v) => set(f.key, v))}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[#eef2f7] flex items-center justify-between gap-3">
        <div>{footer}</div>
        <Button onClick={save} disabled={busy}>
          {busy ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>
    </Card>
  );
}
