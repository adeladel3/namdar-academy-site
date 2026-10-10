"use client";

import { useState } from "react";
import SettingsForm from "../SettingsForm";
import { Field, Input, Select } from "@/components/admin/ui";

export default function PaymentSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  const [provider, setProvider] = useState<string>(
    String(initial.provider ?? "sep"),
  );

  return (
    <SettingsForm
      group="payment"
      title="تنظیمات درگاه پرداخت"
      description="انتخاب ارائه‌دهنده درگاه پرداخت و تنظیم اطلاعات احراز هویت. مقادیر محرمانه (Client Secret, Password) در این صفحه نمایش داده نمی‌شوند."
      initial={initial}
      fields={[
        {
          key: "provider",
          render: (v, set) => (
            <Field label="ارائه‌دهنده درگاه فعال">
              <Select
                value={String(v ?? "sep")}
                onChange={(e) => {
                  set(e.target.value);
                  setProvider(e.target.value);
                }}
              >
                <option value="sep">سامان (سپ) — درگاه کارت به کارت</option>
                <option value="snappay">اسنپ‌پی — پرداخت اقساطی (BNPL)</option>
              </Select>
            </Field>
          ),
        },
        {
          key: "callbackBaseUrl",
          render: (v, set) => (
            <Field
              label="آدرس عمومی سایت (برای کالبک)"
              hint="مثال: https://namdaracademy.com — بدون اسلش انتهایی. اگر خالی بگذارید از NEXT_PUBLIC_SITE_URL استفاده می‌شود."
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

        // SEP (Saman) settings
        ...(provider === "sep"
          ? [
              {
                key: "sepTerminalId",
                render: (v: unknown, set: (val: unknown) => void) => (
                  <Field
                    label="شناسه ترمینال سپ (SEP_TERMINAL_ID)"
                    hint="از پرتال بانک سامان دریافت می‌شود. اگر خالی بگذارید، پرداخت در حالت شبیه‌سازی (dev) کار می‌کند."
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
            ]
          : []),

        // SnappPay settings
        ...(provider === "snappay"
          ? [
              {
                key: "snappayBaseUrl",
                render: (v: unknown, set: (val: unknown) => void) => (
                  <Field
                    label="Base URL (Production)"
                    hint="پیش‌فرض: https://api.snapppay.ir — تغییر ندهید مگر اینکه staging را تست می‌کنید."
                  >
                    <Input
                      dir="ltr"
                      className="font-mono"
                      value={String(v ?? "")}
                      onChange={(e) => set(e.target.value)}
                      placeholder="https://api.snapppay.ir"
                    />
                  </Field>
                ),
              },
              {
                key: "snappayClientId",
                render: (v: unknown, set: (val: unknown) => void) => (
                  <Field
                    label="Client ID"
                    hint="از بخش «توسعه فنی ← دسترسی‌های فنی» پرتال اسنپ‌پی دریافت کنید."
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
                key: "snappayClientSecret",
                render: (v: unknown, set: (val: unknown) => void) => (
                  <Field
                    label="Client Secret"
                    hint="مقدار محرمانه. فقط یک‌بار در پرتال نمایش داده می‌شود. در اینجا هم masked نمایش داده می‌شود."
                  >
                    <Input
                      dir="ltr"
                      type="password"
                      className="font-mono"
                      value={String(v ?? "")}
                      onChange={(e) => set(e.target.value)}
                      placeholder={v === "••••••" ? "••••••" : ""}
                    />
                  </Field>
                ),
              },
              {
                key: "snappayUsername",
                render: (v: unknown, set: (val: unknown) => void) => (
                  <Field
                    label="Username (OAuth)"
                    hint="نام کاربری برای دریافت توکن OAuth."
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
                key: "snappayPassword",
                render: (v: unknown, set: (val: unknown) => void) => (
                  <Field
                    label="Password (OAuth)"
                    hint="رمز عبور OAuth. در اینجا masked نمایش داده می‌شود."
                  >
                    <Input
                      dir="ltr"
                      type="password"
                      className="font-mono"
                      value={String(v ?? "")}
                      onChange={(e) => set(e.target.value)}
                      placeholder={v === "••••••" ? "••••••" : ""}
                    />
                  </Field>
                ),
              },
            ]
          : []),
      ]}
      footer={
        <div className="space-y-2 text-xs text-[#010514]/65 leading-7">
          <p>
            این مقادیر قبل از متغیرهای محیطی (<code>SNAPPAY_*</code>,{" "}
            <code>SEP_*</code>) خوانده می‌شوند.
          </p>
          {provider === "sep" && (
            <p>
              <strong>یادآوری مهم سپ:</strong> آدرس بازگشت (RedirectUrl) باید با
              دامنه‌ی ثبت‌شده در قرارداد یکسان باشد و آی‌پی سرور پروداکشن باید
              به سپ اعلام شده باشد. آدرس‌های localhost قابل قبول نیست.
            </p>
          )}
          {provider === "snappay" && (
            <p>
              <strong>یادآوری مهم اسنپ‌پی:</strong> IP سرور باید در پرتال
              اسنپ‌پی سفید‌لیست شود (بخش «توسعه فنی»). برای تست از آدرس{" "}
              <code>https://whatisip.snapppay.ir/whatis/ip</code> استفاده کنید.
            </p>
          )}
        </div>
      }
    />
  );
}
