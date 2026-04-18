"use client";

import SettingsForm from "../SettingsForm";
import { Field } from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";

export default function LandingSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="landing"
      title="صفحه فرود"
      description="محتوای رسانه‌ای صفحه اصلی — ویدیوی معرفی کوچینگ MON و تصویر پیش‌نمایش آن."
      initial={initial}
      fields={[
        {
          key: "monVideoUrl",
          render: (v, set) => (
            <Field
              label="ویدیوی معرفی کوچینگ MON"
              hint="فایل mp4/webm که در بخش «کوچینگ معامله‌گری MON» صفحه اصلی پخش می‌شود."
            >
              <MediaPicker
                kind="video"
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        },
        {
          key: "monPosterUrl",
          render: (v, set) => (
            <Field
              label="تصویر پیش‌نمایش ویدیوی MON"
              hint="فریم ابتدایی که قبل از پخش ویدیو نمایش داده می‌شود."
            >
              <MediaPicker
                kind="image"
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        },
      ]}
    />
  );
}
