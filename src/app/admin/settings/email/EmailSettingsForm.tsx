"use client";

import SettingsForm from "../SettingsForm";
import { Field, Input, Select } from "@/components/admin/ui";

export default function EmailSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="email"
      title="تنظیمات ایمیل"
      description="برای ارسال ایمیل‌های تراکنشی (رسید خرید، اطلاع‌رسانی)."
      initial={initial}
      fields={[
        {
          key: "provider",
          render: (v, set) => (
            <Field label="ارائه‌دهنده">
              <Select
                value={String(v ?? "smtp")}
                onChange={(e) => set(e.target.value)}
              >
                <option value="smtp">SMTP سفارشی</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
              </Select>
            </Field>
          ),
        },
        {
          key: "from",
          render: (v, set) => (
            <Field label="ایمیل فرستنده">
              <Input
                dir="ltr"
                className="font-mono text-sm"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "smtpHost",
          render: (v, set) => (
            <Field label="SMTP Host">
              <Input
                dir="ltr"
                className="font-mono text-sm"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "smtpPort",
          render: (v, set) => (
            <Field label="SMTP Port">
              <Input
                type="number"
                dir="ltr"
                className="font-mono"
                value={String(v ?? 587)}
                onChange={(e) => set(Number(e.target.value))}
              />
            </Field>
          ),
        },
        {
          key: "smtpUser",
          render: (v, set) => (
            <Field label="نام کاربری">
              <Input
                dir="ltr"
                className="font-mono text-sm"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "smtpPass",
          render: (v, set) => (
            <Field label="رمز عبور">
              <Input
                type="password"
                dir="ltr"
                className="font-mono text-sm"
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
