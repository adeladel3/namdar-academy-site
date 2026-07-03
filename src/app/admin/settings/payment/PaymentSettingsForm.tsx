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
        {
          key: "callbackBaseUrl",
          render: (v, set) => (
            <Field
              label="آدرس عمومی سایت (برای کالبک سپ)"
              hint="باید دقیقاً با دامنه‌ای که در قرارداد به سپ اعلام کرده‌اید یکسان باشد. مثال: https://namdaracademy.com — بدون اسلش انتهایی. اگر خالی بگذارید از NEXT_PUBLIC_SITE_URL استفاده می‌شود."
            >
              <Input
                dir="ltr"
                type="url"
                className="font-mono"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="https://namdaracademy.com"
              />
            </Field>
          ),
        },
      ]}
      footer={
        <div className="space-y-2 text-xs text-[#010514]/65 leading-7">
          <p>این مقادیر قبل از متغیرهای محیطی خوانده می‌شوند.</p>
          <p>
            <strong>یادآوری مهم سپ:</strong> آدرس بازگشت (RedirectUrl) باید با
            دامنه‌ی ثبت‌شده در قرارداد یکسان باشد و آی‌پی سرور پروداکشن باید
            به سپ اعلام شده باشد. آدرس‌های localhost قابل قبول نیست.
          </p>
        </div>
      }
    />
  );
}
