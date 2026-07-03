"use client";

import SettingsForm from "../SettingsForm";
import { Field, Input } from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";

// Desktop Landing "Our Success" stat block + mobile equivalent. 5 slots,
// each with a large value (e.g. "15K+", "75%", "16") and a label. Order
// follows the RTL visual reading of the strip.
const STAT_SLOTS = [
  { num: 1, default: { value: "15K+", label: "دانش پذیر" } },
  { num: 2, default: { value: "75%", label: "موفقیت در ترید" } },
  { num: 3, default: { value: "35", label: "دوره آموزشی حضوری و غیر حضوری" } },
  { num: 4, default: { value: "26", label: "تجربه منتورینگ" } },
  { num: 5, default: { value: "16", label: "سال تجربه آموزش" } },
] as const;

// «ویدیوهای منتخب» — گرید سه‌ستونه پایین صفحه فرود. ترتیب RTL: اولی سمت راست.
// کلیدهای settings عمداً با ترتیب بصری rollup2/1/3 جابه‌جا هستند؛ کد فعلی
// Landing.tsx هم همین mapping را دارد.
const ROLLUP_VIDEOS = [
  {
    settingKey: "rollup2VideoUrl",
    label: "ویدیوی منتخب ۱ (سمت راست) — معرفی دورهٔ کوچینگ MON",
  },
  {
    settingKey: "rollup1VideoUrl",
    label: "ویدیوی منتخب ۲ (وسط) — سخنرانی استاد امیرحسین نام‌آور",
  },
  {
    settingKey: "rollup3VideoUrl",
    label: "ویدیوی منتخب ۳ (سمت چپ) — مرور بازارهای جهانی و طلا",
  },
] as const;

export default function LandingSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="landing"
      title="صفحه فرود"
      description="محتوای صفحه اصلی — ویدیو معرفی، پوستر، و آمار بلوک «موفقیت‌های ما»."
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
                recommended={{
                  maxSizeKB: 200 * 1024,
                  formats: ["MP4", "WEBM"],
                  description:
                    "ویدیوی معرفی کوچینگ MON که در صفحه اصلی پخش می‌شود.",
                }}
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
                recommended={{
                  width: 1920,
                  height: 1080,
                  maxSizeKB: 1500,
                  formats: ["JPG", "WebP"],
                  description:
                    "فریم ابتدایی (پوستر) ویدیوی MON که قبل از پخش نمایش داده می‌شود.",
                }}
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        },
        // سه ویدیوی گرید «ویدیوهای منتخب» — اگر خالی بمانند، به‌جایش
        // ویدیوی MON پخش می‌شود (fallback پیش‌فرض در Landing.tsx).
        ...ROLLUP_VIDEOS.map((slot) => ({
          key: slot.settingKey,
          render: (v: unknown, set: (v: unknown) => void) => (
            <Field
              label={slot.label}
              hint="فایل mp4/webm. اگر خالی بماند، به‌جایش ویدیوی MON پخش می‌شود."
            >
              <MediaPicker
                kind="video"
                recommended={{
                  maxSizeKB: 200 * 1024,
                  formats: ["MP4", "WEBM"],
                  description:
                    "ویدیوی منتخب صفحه اصلی — در گرید سه‌ستونه پایین صفحه فرود پخش می‌شود.",
                }}
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        })),
        // Stats block — 5 slots × (value + label). Values render in the
        // large gradient font; labels below in Persian.
        ...STAT_SLOTS.flatMap((s) => [
          {
            key: `stat${s.num}.value`,
            render: (v: unknown, set: (v: unknown) => void) => (
              <Field
                label={`آمار ${s.num} — عدد`}
                hint={`مقدار بزرگ. مثلاً: ${s.default.value}`}
              >
                <Input
                  value={String(v ?? s.default.value)}
                  onChange={(e) => set(e.target.value)}
                  dir="ltr"
                  className="font-mono"
                />
              </Field>
            ),
          },
          {
            key: `stat${s.num}.label`,
            render: (v: unknown, set: (v: unknown) => void) => (
              <Field
                label={`آمار ${s.num} — عنوان`}
                hint={`متن زیر عدد. مثلاً: ${s.default.label}`}
              >
                <Input
                  value={String(v ?? s.default.label)}
                  onChange={(e) => set(e.target.value)}
                />
              </Field>
            ),
          },
        ]),
      ]}
    />
  );
}
