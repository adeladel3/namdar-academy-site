"use client";

import SettingsForm from "../SettingsForm";
import { Field, Input, Textarea } from "@/components/admin/ui";

export default function SiteSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="site"
      title="تنظیمات سایت"
      description="اطلاعات پایه‌ای که در هدر/فوتر و ایمیل‌ها استفاده می‌شوند."
      initial={initial}
      fields={[
        {
          key: "title",
          render: (v, set) => (
            <Field label="عنوان سایت">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "tagline",
          render: (v, set) => (
            <Field label="شعار" hint="زیر عنوان برند — در هدر نمایش داده می‌شود.">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "contactEmail",
          render: (v, set) => (
            <Field label="ایمیل پشتیبانی">
              <Input
                dir="ltr"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "contactPhone",
          render: (v, set) => (
            <Field label="تلفن پشتیبانی">
              <Input
                dir="ltr"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "address",
          render: (v, set) => (
            <Field label="آدرس">
              <Textarea
                rows={2}
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
      ]}
    />
  );
}
