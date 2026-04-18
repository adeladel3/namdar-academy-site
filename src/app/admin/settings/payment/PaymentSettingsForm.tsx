"use client";

import SettingsForm from "../SettingsForm";
import { Field, Input, Select } from "@/components/admin/ui";

export default function PaymentSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="payment"
      title="تنظیمات درگاه پرداخت"
      description="در حال حاضر فقط درگاه سامان (سپ) پشتیبانی می‌شود. ترمینال از بانک سامان دریافت می‌شود."
      initial={initial}
      fields={[
        {
          key: "provider",
          render: (v, set) => (
            <Field label="ارائه‌دهنده درگاه">
              <Select
                value={String(v ?? "sep")}
                onChange={(e) => set(e.target.value)}
              >
                <option value="sep">سامان (سپ)</option>
              </Select>
            </Field>
          ),
        },
        {
          key: "sepTerminalId",
          render: (v, set) => (
            <Field
              label="شناسه ترمینال (SEP_TERMINAL_ID)"
              hint="اگر خالی بگذارید، پرداخت در حالت شبیه‌سازی (dev) کار می‌کند."
            >
              <Input
                dir="ltr"
                className="font-mono"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
              />
            </Field>
          ),
        },
      ]}
      footer={
        <span className="text-xs text-[#010514]/55">
          این مقدار قبل از مقدار env خوانده می‌شود.
        </span>
      }
    />
  );
}
