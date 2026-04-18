"use client";

import { useState } from "react";
import { Button, toast } from "@/components/admin/ui";

export default function TestSmsButton() {
  const [busy, setBusy] = useState(false);

  async function send() {
    const phone = prompt("شماره‌ای که می‌خواهید پیامک تست برایش ارسال شود");
    if (!phone) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings/test-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const d = await res.json();
      if (res.ok) toast(d.message ?? "پیامک تست ارسال شد", "ok");
      else toast(d.error ?? "خطا", "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={send} disabled={busy}>
      ارسال پیامک تست
    </Button>
  );
}
