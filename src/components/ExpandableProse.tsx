"use client";

import { useEffect, useRef, useState } from "react";

/**
 * یک wrapper برای متن‌های طولانی توضیحات دوره. به‌صورت پیش‌فرض
 * `collapsedHeight` پیکسل از محتوا نمایش داده می‌شود، گرادیانت محو شدن
 * در پایین قرار می‌گیرد، و یک دکمه «نمایش کامل» اضافه می‌شود. اگر
 * ارتفاع واقعی محتوا کم‌تر از collapsedHeight باشد، دکمه نمایش داده
 * نمی‌شود و رفتار یک div معمولی است.
 *
 * چرا client component: محاسبه‌ی ارتفاع واقعی پس از layout نیاز به
 * window/DOM دارد. در SSR محتوا کاملاً رندر می‌شود (همان مارک‌آپ کامل
 * در HTML اولیه)، فقط پس از hydration به حالت collapsed برمی‌گردد.
 * برای کاربری که JS غیرفعال دارد، متن کامل قابل خواندن باقی می‌ماند.
 *
 * چرا یک کاربر JS-غیرفعال مهم است: ربات‌های موتور جستجو (گوگل) هم
 * بدون JS صفحه را می‌خوانند؛ اگر متن را در حالت collapsed از DOM
 * حذف می‌کردیم، رتبه‌ی SEO صفحات دوره ضربه می‌خورد.
 */
export default function ExpandableProse({
  children,
  collapsedHeight = 220,
  fadeColor = "rgba(255,255,255,1)",
  expandLabel = "نمایش کامل توضیحات",
  collapseLabel = "نمایش کمتر",
  className = "",
}: {
  children: React.ReactNode;
  /** ارتفاع پیش‌فرض که در حالت بسته نمایش داده می‌شود (پیکسل). */
  collapsedHeight?: number;
  /** رنگ پایه‌ی پس‌زمینه‌ای که گرادیانت از آن شروع می‌شود؛ روی پس‌زمینه‌ی
   *  سفید کارت white، روی پس‌زمینه‌ی روشن آبی صفحه‌ی coaching #f4faff. */
  fadeColor?: string;
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
}) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  // در SSR و render اولیه به‌صورت collapsed نمایش می‌دهیم تا flash از
  // «همه‌چیز باز → بعد بسته شد» جلوگیری شود. متن کامل همچنان داخل DOM
  // می‌ماند (overflow:hidden مخفی می‌کند نه display:none)، پس
  // SEO/screen-reader سالم می‌ماند. بعد از hydration اگر محتوا کوتاه‌تر
  // از حد collapsed بود، open=true می‌شود و overflow حذف می‌گردد.
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(true);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => {
      const isOverflow = el.scrollHeight - 8 > collapsedHeight;
      setHydrated(true);
      setOverflows(isOverflow);
      // اگر محتوا کوتاه است، خودبه‌خود باز کن (تا max-height بی‌اثر شود).
      // اگر بلند است، دست‌نزن — تصمیم باز/بسته بودن دست کاربر است.
      if (!isOverflow) setOpen(true);
    };
    measure();
    // ResizeObserver برای تغییر فونت/تصاویر دیرلود
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [collapsedHeight]);

  // در SSR (hydrated=false) همیشه به‌صورت collapsed نمایش می‌دهیم تا
  // در hydration اولیه CLS و flash ایجاد نشود. بعد از client mount،
  // اگر محتوا اندازه‌اش از حد بیشتر است و open=false، collapsed می‌ماند.
  const showCollapsed = !open;
  const showButton = hydrated && overflows;

  return (
    <div className={className}>
      <div
        className="relative transition-[max-height] duration-300 ease-out"
        style={{
          maxHeight: showCollapsed ? `${collapsedHeight}px` : "none",
          overflow: showCollapsed ? "hidden" : "visible",
        }}
      >
        <div ref={innerRef}>{children}</div>
        {showCollapsed && (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to top, ${fadeColor}, rgba(255,255,255,0))`,
            }}
          />
        )}
      </div>
      {showButton && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1b3c8a] text-white text-sm font-bold hover:bg-[#0e1a3d] transition shadow-[0_8px_18px_-6px_rgba(27,60,138,0.45)]"
            aria-expanded={open}
          >
            {open ? collapseLabel : expandLabel}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
