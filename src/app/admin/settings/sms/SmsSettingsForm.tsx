"use client";

import SettingsForm from "../SettingsForm";
import TestSmsButton from "./TestSmsButton";
import { Field, Input, Select, Textarea } from "@/components/admin/ui";

export default function SmsSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="sms"
      title="تنظیمات پیامک"
      description="برای ارسال کد OTP و اطلاع‌رسانی."
      initial={initial}
      footer={<TestSmsButton />}
      fields={[
        {
          key: "provider",
          render: (v, set) => (
            <Field label="ارائه‌دهنده">
              <Select
                value={String(v ?? "kavenegar")}
                onChange={(e) => set(e.target.value)}
              >
                <option value="kavenegar">کاوه‌نگار</option>
                <option value="smsir">SMS.ir</option>
                <option value="melipayamak">ملی‌پیامک</option>
              </Select>
            </Field>
          ),
        },
        {
          key: "apiKey",
          render: (v, set) => (
            <Field label="API Key">
              <Input
                type="password"
                dir="ltr"
                className="font-mono"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
        {
          key: "senderLine",
          render: (v, set) => (
            <Field label="خط فرستنده">
              <Input
                dir="ltr"
                className="font-mono"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="10008663"
              />
            </Field>
          ),
        },
        {
          key: "otpTemplate",
          render: (v, set) => (
            <Field
              label="قالب OTP"
              hint="متغیرها: {{code}}، {{brand}}"
            >
              <Textarea
                rows={3}
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="کد ورود شما به {{brand}}: {{code}}"
              />
            </Field>
          ),
        },
      ]}
    />
  );
}
