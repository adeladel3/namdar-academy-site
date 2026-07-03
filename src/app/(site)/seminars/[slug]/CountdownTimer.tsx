"use client";

import { useEffect, useState } from "react";
import { faDigits } from "@/lib/formatting";

/**
 * شمارش معکوس تا تاریخ برگزاری سمینار. فقط روی کلاینت رندر می‌شود تا
 * تفاوت ساعت سرور و کلاینت باعث mismatch در HTML نشود (در غیر این صورت
 * Next روی هر refresh بنری hydration mismatch می‌دهد).
 */
export default function CountdownTimer({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso).getTime();
  // null تا اولین tick بعد از mount روی کلاینت ست شود — اولین مقدار از
  // ticker می‌آید نه از effect body، تا hydration mismatch هم رخ ندهد.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // اولین مقدار را در یک microtask آینده می‌گذاریم تا داخل بدنه‌ی effect
    // مستقیماً setState صدا نزنیم.
    const id = setInterval(() => setNow(Date.now()), 1000);
    const first = setTimeout(() => setNow(Date.now()), 0);
    return () => {
      clearInterval(id);
      clearTimeout(first);
    };
  }, []);

  if (now === null) {
    // قبل از mount روی کلاینت — placeholder ساده می‌دهیم تا layout shift نداشته باشیم.
    return <CountdownGrid days="--" hours="--" minutes="--" seconds="--" />;
  }

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (diff <= 0) {
    return (
      <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-50 backdrop-blur">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-extrabold">رویداد در حال برگزاری است</span>
      </div>
    );
  }

  return (
    <CountdownGrid
      days={faDigits(days)}
      hours={faDigits(String(hours).padStart(2, "0"))}
      minutes={faDigits(String(minutes).padStart(2, "0"))}
      seconds={faDigits(String(seconds).padStart(2, "0"))}
    />
  );
}

function CountdownGrid({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}) {
  // dir="ltr" تا cells از چپ به راست چیده شوند (روز در چپ، ثانیه در راست) —
  // ترتیب استاندارد ساعت‌شمار دیجیتال. بدون این، چون والد RTL است cell ها
  // برعکس می‌شدند و واحد بزرگ‌تر در راست قرار می‌گرفت.
  return (
    <div className="flex items-stretch gap-2 sm:gap-3" dir="ltr">
      <Cell value={days} label="روز" />
      <Sep />
      <Cell value={hours} label="ساعت" />
      <Sep />
      <Cell value={minutes} label="دقیقه" />
      <Sep />
      <Cell value={seconds} label="ثانیه" />
    </div>
  );
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-3 sm:px-4 py-2.5 rounded-2xl min-w-[64px] sm:min-w-[80px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
        border: "1px solid rgba(247,207,90,0.45)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 22px -10px rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span
        className="font-black text-2xl sm:text-3xl tabular-nums tracking-tight text-[#f7cf5a] drop-shadow-[0_0_10px_rgba(247,207,90,0.55)]"
        dir="ltr"
      >
        {value}
      </span>
      <span className="text-[10px] sm:text-[11px] font-bold text-white/75 mt-0.5">
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span
      className="self-center font-black text-2xl sm:text-3xl text-[#f7cf5a]/70 drop-shadow-[0_0_8px_rgba(247,207,90,0.4)]"
      aria-hidden
    >
      :
    </span>
  );
}
