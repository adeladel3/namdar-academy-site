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
            <Field
              label="آدرس دفاتر"
              hint="اگر چند دفتر دارید، هر کدام را در یک خط جدا بنویسید — مثل: تهران، ایران / لندن، انگلستان / دبی، امارات"
            >
              <Textarea
                rows={4}
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "contactTelegram",
          render: (v, set) => (
            <Field
              label="آی‌دی تلگرام"
              hint="بدون @ — مثل namdaracademy. در صفحه تماس استفاده می‌شود."
            >
              <Input
                dir="ltr"
                placeholder="namdaracademy"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "contactWhatsapp",
          render: (v, set) => (
            <Field
              label="شماره واتساپ"
              hint="با کد کشور، بدون + و صفر — مثل 989121234567"
            >
              <Input
                dir="ltr"
                placeholder="989121234567"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "contactHours",
          render: (v, set) => (
            <Field label="ساعات کاری پشتیبانی">
              <Input
                value={String(v ?? "")}
                placeholder="شنبه تا چهارشنبه — ۹:۰۰ تا ۱۸:۰۰"
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "socialInstagram",
          render: (v, set) => (
            <Field label="آدرس اینستاگرام" hint="آدرس کامل با https:// — یا خالی برای عدم نمایش">
              <Input
                dir="ltr"
                placeholder="https://www.instagram.com/amirhossein.namavar"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "socialTelegram",
          render: (v, set) => (
            <Field label="آدرس کانال تلگرام" hint="آدرس کامل — یا خالی برای عدم نمایش">
              <Input
                dir="ltr"
                placeholder="https://t.me/namdaracademy"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "socialAparat",
          render: (v, set) => (
            <Field label="آدرس کانال آپارات" hint="آدرس کامل — یا خالی برای عدم نمایش">
              <Input
                dir="ltr"
                placeholder="https://www.aparat.com/namdaracademy"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "socialYoutube",
          render: (v, set) => (
            <Field label="آدرس کانال یوتیوب" hint="آدرس کامل — یا خالی برای عدم نمایش">
              <Input
                dir="ltr"
                placeholder="https://www.youtube.com/@namdaracademy"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "socialWhatsapp",
          render: (v, set) => (
            <Field
              label="لینک واتساپ"
              hint="فرمت wa.me — مثل https://wa.me/982191008222"
            >
              <Input
                dir="ltr"
                placeholder="https://wa.me/982191008222"
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
