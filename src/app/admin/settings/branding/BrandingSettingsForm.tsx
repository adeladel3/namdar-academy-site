"use client";

import SettingsForm from "../SettingsForm";
import { Field, Input } from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";

export default function BrandingSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="branding"
      title="برند و ظاهر"
      description="لوگو، رنگ و فونت پیش‌فرض سایت."
      initial={initial}
      fields={[
        {
          key: "logoUrl",
          render: (v, set) => (
            <Field label="لوگو">
              <MediaPicker
                kind="image"
                recommended={{
                  width: 800,
                  height: 240,
                  maxSizeKB: 150,
                  formats: ["PNG", "SVG", "WebP"],
                  description:
                    "لوگوی اصلی سایت با پس‌زمینه شفاف ترجیحی است.",
                }}
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        },
        {
          key: "primaryColor",
          render: (v, set) => (
            <Field label="رنگ اصلی">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={String(v ?? "#1b3c8a")}
                  onChange={(e) => set(e.target.value)}
                  className="w-14 h-10 rounded-lg border border-[#e5eaf5] cursor-pointer"
                />
                <Input
                  dir="ltr"
                  value={String(v ?? "")}
                  onChange={(e) => set(e.target.value)}
                  className="font-mono"
                />
              </div>
            </Field>
          ),
        },
        {
          key: "accentColor",
          render: (v, set) => (
            <Field label="رنگ تاکید">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={String(v ?? "#f7cf5a")}
                  onChange={(e) => set(e.target.value)}
                  className="w-14 h-10 rounded-lg border border-[#e5eaf5] cursor-pointer"
                />
                <Input
                  dir="ltr"
                  value={String(v ?? "")}
                  onChange={(e) => set(e.target.value)}
                  className="font-mono"
                />
              </div>
            </Field>
          ),
        },
        {
          key: "fontFamily",
          render: (v, set) => (
            <Field label="فونت اصلی">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="Vazirmatn"
              />
            </Field>
          ),
        },
      ]}
    />
  );
}
