"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("err");
      setMsg("ایمیل نامعتبر است");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("ok");
        setMsg("عضویت شما ثبت شد ✓");
        setEmail("");
      } else {
        const d = await res.json().catch(() => ({}));
        setStatus("err");
        setMsg(d.error ?? "خطا در ثبت عضویت");
      }
    } catch {
      setStatus("err");
      setMsg("خطای شبکه");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="ایمیل شما"
          dir="ltr"
          className="flex-1 h-10 px-4 rounded-full bg-white/10 text-white placeholder:text-white/50 border border-white/20 text-sm focus:outline-none focus:border-white/50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-10 px-4 rounded-full bg-white text-[#0f1f4a] font-bold text-sm hover:bg-white/90 transition disabled:opacity-50"
        >
          {status === "loading" ? "..." : "عضویت"}
        </button>
      </div>
      {msg && (
        <p
          className={
            status === "ok"
              ? "text-xs text-green-300"
              : "text-xs text-red-300"
          }
        >
          {msg}
        </p>
      )}
    </form>
  );
}
