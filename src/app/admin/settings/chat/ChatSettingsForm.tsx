"use client";

import SettingsForm from "../SettingsForm";
import { Field, Input, Select } from "@/components/admin/ui";

export default function ChatSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="chat"
      title="چت زنده"
      description="جایگذاری اسکریپت چت گفتینو، Raychat یا Tawk. برای غیرفعال کردن، حالت «off» را انتخاب کنید."
      initial={initial}
      fields={[
        {
          key: "provider",
          render: (v, set) => (
            <Field label="ارائه‌دهنده">
              <Select
                value={String(v ?? "off")}
                onChange={(e) => set(e.target.value)}
              >
                <option value="off">خاموش (بدون چت)</option>
                <option value="goftino">گفتینو (Goftino)</option>
                <option value="raychat">Raychat</option>
                <option value="tawk">Tawk.to</option>
              </Select>
            </Field>
          ),
        },
        {
          key: "apiKey",
          render: (v, set) => (
            <Field
              label="API Key / Widget ID"
              hint="از داشبورد سرویس چت خود کپی کنید."
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
    />
  );
}
