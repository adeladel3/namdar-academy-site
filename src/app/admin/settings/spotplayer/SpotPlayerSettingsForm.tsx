"use client";

import SettingsForm from "../SettingsForm";
import { Field, Input } from "@/components/admin/ui";

export default function SpotPlayerSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="spotplayer"
      title="تنظیمات اسپات‌پلیر"
      description="کلید رابط برنامه‌نویسی اسپات‌پلیر برای ساخت خودکار لایسنس هنگام خرید یا اعطای دوره. کد دوره (Course ID) به‌صورت جداگانه در برگه «قیمت و انتشار» هر دوره وارد می‌شود."
      initial={initial}
      fields={[
        {
          key: "apiKey",
          render: (v, set) => (
            <Field
              label="کلید رابط برنامه‌نویسی (API Key)"
              hint="این کلید را از داشبورد پنل اسپات‌پلیر کپی کنید. در هدر $API برای ساخت لایسنس استفاده می‌شود."
            >
              <Input
                type="password"
                dir="ltr"
                className="font-mono"
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="••••••••••••••••"
              />
            </Field>
          ),
        },
        {
          key: "offlineDays",
          render: (v, set) => (
            <Field
              label="روزهای مجاز استفاده آفلاین"
              hint="مدت‌زمانی که کاربر می‌تواند بدون اتصال به اینترنت ویدیو را ببیند. پیش‌فرض ۳۰ روز."
            >
              <Input
                type="number"
                dir="ltr"
                className="font-mono"
                value={String(v ?? "30")}
                onChange={(e) => set(e.target.value)}
                placeholder="30"
              />
            </Field>
          ),
        },
      ]}
    />
  );
}
