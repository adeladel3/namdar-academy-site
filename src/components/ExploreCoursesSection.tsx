"use client";

import Link from "@/components/SafeLink";
import type { MutableRefObject, ReactNode } from "react";
import { useRef, useState } from "react";

const imgDetail = "/figma/detail.png";
const imgLq1BannerCopy1 = "/figma/lq1bannercopy1.jpg";
const imgStar8 = "/figma/star8.svg";
const imgStar12 = "/figma/star12.svg";
const imgIcon8 = "/figma/icon8.svg";

type Course = {
  pillLabel: string;
  detailTitle: string;
  detailLevel: string;
  description: string;
  price: string;
  rating: number; // 0..5 in 0.5 increments
  color: string; // accent — used by ghost + banner tint
  bannerTitle: string; // short name shown on the banner artwork
  bannerBadge?: string; // optional tag below the banner title (e.g. "شاملِ ICT")
  slug?: string; // target course slug — default link is /courses/{slug}
  href?: string; // explicit click target — wins over slug (for courses that
  // live on a custom landing like /coaching)
  bannerImage?: string; // اگر مقدار داشته باشد، جایگزین تصویر پس‌زمینهٔ LQ1 می‌شود.
  // برای دوره‌هایی که عکس اختصاصی خود را دارند (مثل MON با عکس صفحه /coaching).
};

/** A course assigned to a landing slot from the admin panel. Any field can
 *  be omitted to fall back to the slot's hardcoded Figma default. */
export type LandingSlotOverride = Partial<Course>;

const COURSES: Course[] = [
  {
    pillLabel: "دوره روان‌شناسی معاملات",
    detailTitle: "دوره روان‌شناسی معاملات",
    detailLevel: "سطح مقدماتی تا پیشرفته",
    description: "کنترل احساسات، مدیریت ریسک و حذف خطاهای رفتاری در ترید.",
    price: "۱۲،۰۰۰،۰۰۰ تومان",
    rating: 4.8,
    color: "#2196f3",
    bannerTitle: "روان‌شناسی\nمعاملات",
  },
  {
    pillLabel: "دوره تکنوفاند",
    detailTitle: "دوره تکنوفاند",
    detailLevel: "سطح پیشرفته",
    description: "ترکیب تحلیل تکنیکال و فاندامنتال برای تصمیم‌گیری بهتر.",
    price: "۱۸،۰۰۰،۰۰۰ تومان",
    rating: 4.9,
    color: "#00cbb8",
    bannerTitle: "دوره\nتکنوفاند",
  },
  {
    pillLabel: "دوره اکوجامع",
    detailTitle: "دوره اکوجامع",
    detailLevel: "سطح متوسط تا پیشرفته",
    description: "نگاه جامع اقتصاد کلان و تحلیل بخش‌های کلیدی بازار.",
    price: "۱۶،۰۰۰،۰۰۰ تومان",
    rating: 4.7,
    color: "#545ae8",
    bannerTitle: "دوره\nاکوجامع",
  },
  {
    pillLabel: "دوره پیش بینی",
    detailTitle: "دوره پیش بینی",
    detailLevel: "سطح پیشرفته",
    description: "ابزارهای پیش‌بینی روند و نقاط بازگشت بازار با دقت بالا.",
    price: "۱۵،۰۰۰،۰۰۰ تومان",
    rating: 4.6,
    color: "#435fae",
    bannerTitle: "دوره\nپیش‌بینی",
  },
  {
    pillLabel: "دوره اقتصاد کلان",
    detailTitle: "دوره اقتصاد کلان",
    detailLevel: "سطح متوسط",
    description: "متغیرهای کلان، FOMC و تأثیرشان بر دارایی‌های پرریسک.",
    price: "۱۴،۰۰۰،۰۰۰ تومان",
    rating: 4.5,
    color: "#545ae8",
    bannerTitle: "اقتصاد\nکلان",
  },
  {
    pillLabel: "دوره تکنیکال",
    detailTitle: "دوره تکنیکال",
    detailLevel: "سطح پایه تا پیشرفته",
    description: "پرایس اکشن، پترن‌های کلاسیک و اندیکاتورهای حرفه‌ای.",
    price: "۲۰،۰۰۰،۰۰۰ تومان",
    rating: 5.0,
    color: "#00a8ff",
    bannerTitle: "تحلیل\nتکنیکال",
  },
  {
    pillLabel: "دوره lq1",
    detailTitle: "دوره آموزشی LQ1",
    detailLevel: "سطح دوره پیشرفته",
    description: "نقدینگی و ساختار بازار — سیستم اختصاصی نامدار آکادمی.",
    price: "۲۴،۰۰۰،۰۰۰ تومان",
    rating: 5.0,
    color: "#0eaf77",
    bannerTitle: "دوره\nLQ1",
    bannerBadge: "شاملِ ICT",
  },
];

const DEFAULT_INDEX = 6;
const FLY_DURATION = 900; // ms — a touch longer for a luxurious feel
const CONTENT_SWAP_AT = 0.55; // swap banner content at this fraction of the flight

/** Pick a pill font size that keeps the (rotated) title on a single line.
 *  The pills fit about 12 chars at 24px; longer strings step down. */
function pillFontSize(label: string): number {
  const n = label.length;
  if (n <= 10) return 24;
  if (n <= 12) return 22;
  if (n <= 14) return 20;
  if (n <= 17) return 18;
  if (n <= 20) return 16;
  return 14;
}

// easeInOutCubic — scale interpolation (starts & ends soft, smooth in middle)
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function ExploreCoursesSection({
  slotOverrides,
}: {
  /** Length-7 array. index i = slot i on the pill strip. Pass `null` to use
   *  the hardcoded Figma default for that slot; pass an override to swap in
   *  a course the admin has featured. */
  slotOverrides?: (LandingSlotOverride | null | undefined)[];
} = {}) {
  const [selected, setSelected] = useState<number>(DEFAULT_INDEX);
  const [flying, setFlying] = useState<boolean>(false);
  const pillRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Merge admin overrides on top of the Figma defaults. Each slot's visual
  // position/size stays exactly as designed; only text + color + slug flip.
  const effective: Course[] = COURSES.map((base, i) => {
    const o = slotOverrides?.[i];
    if (!o) return base;
    return { ...base, ...o };
  });

  function handlePillClick(i: number) {
    if (i === selected || flying) return;

    const pill = pillRefs.current[i];
    const banner = bannerRef.current;

    if (!pill || !banner || typeof window === "undefined") {
      setSelected(i);
      return;
    }

    const pillRect = pill.getBoundingClientRect();
    const bannerRect = banner.getBoundingClientRect();

    const color = effective[i].color;

    // Build the flying ghost element.
    const ghost = document.createElement("div");
    ghost.setAttribute("aria-hidden", "true");
    Object.assign(ghost.style, {
      position: "fixed",
      left: `${pillRect.left}px`,
      top: `${pillRect.top}px`,
      width: `${pillRect.width}px`,
      height: `${pillRect.height}px`,
      borderRadius: "24px",
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      boxShadow: `0 24px 60px ${color}66, 0 0 0 1px rgba(255,255,255,0.14) inset, 0 0 40px ${color}44`,
      pointerEvents: "none",
      zIndex: "9999",
      transformOrigin: "top left",
      willChange: "transform, opacity, border-radius, filter",
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(ghost);

    // Soft halo that flies with the ghost to amplify the "modern" feel.
    const halo = document.createElement("div");
    halo.setAttribute("aria-hidden", "true");
    Object.assign(halo.style, {
      position: "fixed",
      left: `${pillRect.left - 30}px`,
      top: `${pillRect.top - 30}px`,
      width: `${pillRect.width + 60}px`,
      height: `${pillRect.height + 60}px`,
      borderRadius: "40px",
      background: `radial-gradient(circle, ${color}55 0%, transparent 72%)`,
      pointerEvents: "none",
      zIndex: "9998",
      transformOrigin: "top left",
      filter: "blur(6px)",
      opacity: "0",
      willChange: "transform, opacity",
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(halo);

    const dx = bannerRect.left - pillRect.left;
    const dy = bannerRect.top - pillRect.top;
    const sx = bannerRect.width / pillRect.width;
    const sy = bannerRect.height / pillRect.height;

    // Arc depth — how far BELOW the linear path the ghost dips at mid-flight.
    const arcHeight = Math.max(pillRect.height, bannerRect.height) * 0.55;

    // Build many evenly-spaced keyframes so linear WAAPI easing produces a smooth constant arc.
    const STEPS = 24;
    const ghostFrames: Keyframe[] = [];
    for (let k = 0; k <= STEPS; k++) {
      const t = k / STEPS;
      const easedScale = easeInOutCubic(t);
      const arc = Math.sin(Math.PI * t); // parabolic 0..1..0

      const x = dx * t;
      const y = dy * t + arcHeight * arc;
      const scaleXv = 1 + (sx - 1) * easedScale;
      const scaleYv = 1 + (sy - 1) * easedScale;
      const rotate = -2 + 2 * easedScale; // -2deg → 0deg
      const br = 24 + (34 - 24) * easedScale;

      // Opacity: stays 1 until near the end, then fades to hand off to the real banner.
      let opacity = 1;
      if (t > 0.82) opacity = Math.max(0, 1 - (t - 0.82) / 0.18);

      // Motion blur peaks at mid-flight for a cinematic feel.
      const blur = 0.6 * arc;

      ghostFrames.push({
        transform: `translate(${x}px, ${y}px) scale(${scaleXv}, ${scaleYv}) rotate(${rotate}deg)`,
        borderRadius: `${br}px`,
        opacity,
        filter: `blur(${blur}px)`,
        offset: t,
      });
    }

    const ghostAnim = ghost.animate(ghostFrames, {
      duration: FLY_DURATION,
      easing: "linear", // keyframe math controls the curve — keep WAAPI easing flat
      fill: "forwards",
    });

    // Halo follows the ghost with a tiny lag for depth.
    const haloFrames: Keyframe[] = [];
    for (let k = 0; k <= STEPS; k++) {
      const t = k / STEPS;
      const easedScale = easeInOutCubic(t);
      const arc = Math.sin(Math.PI * t);
      const x = dx * t;
      const y = dy * t + arcHeight * arc;
      const scaleXv = 1 + (sx - 1) * easedScale;
      const scaleYv = 1 + (sy - 1) * easedScale;
      let opacity = 0;
      if (t < 0.5) opacity = t * 1.6;
      else opacity = (1 - t) * 1.6;
      opacity = Math.min(0.85, opacity);
      haloFrames.push({
        transform: `translate(${x}px, ${y}px) scale(${scaleXv}, ${scaleYv})`,
        opacity,
        offset: t,
      });
    }
    const haloAnim = halo.animate(haloFrames, {
      duration: FLY_DURATION,
      easing: "linear",
      fill: "forwards",
    });

    setFlying(true);

    const swapTimer = window.setTimeout(() => {
      setSelected(i);
    }, FLY_DURATION * CONTENT_SWAP_AT);

    const cleanup = () => {
      ghost.remove();
      halo.remove();
      setFlying(false);
    };

    ghostAnim.onfinish = cleanup;
    ghostAnim.oncancel = () => {
      window.clearTimeout(swapTimer);
      cleanup();
    };
    haloAnim.onfinish = () => {
      // already cleaned up by ghostAnim, but in case that one errors
      if (halo.isConnected) halo.remove();
    };
  }

  const course = effective[selected];
  const stars = renderStars(course.rating);

  return (
    <>
      {/* ================= Explore Course wrapper (pills + bg + button) ================= */}
      <div className="absolute contents right-[-65px] top-[4067px]" data-node-id="4:90" data-name="Explore Course">
        <div className="absolute flex h-[938px] items-center justify-center right-[-65px] top-[4067px] w-[1507px]">
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="bg-[#9dccff] h-[938px] opacity-20 rounded-br-[100px] w-[1507px]" data-node-id="4:91" data-name="Rectangle" />
          </div>
        </div>
        <div className="absolute contents left-[115px] top-[4303px]" data-node-id="4:92" data-name="Category">
          <div className="absolute bg-black h-[82.296px] left-[115px] opacity-5 rounded-[29.5px] top-[4808px] w-[1682.724px]" data-node-id="4:93" data-name="Rectangle" />

          <PillButton
            index={0}
            pillRefs={pillRefs}
            onClick={handlePillClick}
            positionClass="left-[calc(41.67%+88.06px)] top-[4429.9px]"
          >
            <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:94" data-name="Book">
              <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:95;0:1642" data-name="Rectangle" />
              <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:95;0:1643" data-name="Rectangle" />
              <div className="absolute inset-[11.67%_19.88%_12%_20.12%] rounded-[24px]" style={{ backgroundColor: effective[0].color }} data-node-id="4:96" data-name="Rectangle" />
              <div className="-translate-x-1/2 absolute flex h-[259.602px] items-center justify-center left-[calc(50%-0.56px)] top-[calc(50%-129.76px)] w-[38.974px]">
                <div className="-rotate-90 flex-none">
                  <p
                    className="font-['Yekan_Bakh:Medium',sans-serif] h-[38.974px] leading-[normal] not-italic relative text-center text-white w-[259.602px] whitespace-nowrap"
                    style={{ fontSize: `${pillFontSize(effective[0].pillLabel)}px` }}
                    dir="auto"
                    data-node-id="4:97"
                  >
                    {effective[0].pillLabel}
                  </p>
                </div>
              </div>
            </div>
          </PillButton>

          <PillButton
            index={1}
            pillRefs={pillRefs}
            onClick={handlePillClick}
            positionClass="left-[calc(50%+62px)] top-[4429.9px]"
          >
            <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:98" data-name="Book">
              <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:99;0:1642" data-name="Rectangle" />
              <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:99;0:1643" data-name="Rectangle" />
              <div className="absolute inset-[12%_20.12%_11.67%_19.88%] rounded-[24px]" style={{ backgroundColor: effective[1].color }} data-node-id="4:100" data-name="Rectangle" />
              <div className="absolute flex h-[191px] items-center justify-center left-[31.33%] right-[31.33%] top-[calc(50%-95.21px)]" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[92.5176cqw] w-[99.6624cqh]">
                  <p
                    className="font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] not-italic relative size-full text-center text-white whitespace-nowrap"
                    style={{ fontSize: `${pillFontSize(effective[1].pillLabel)}px` }}
                    dir="auto"
                    data-node-id="4:101"
                  >
                    {effective[1].pillLabel}
                  </p>
                </div>
              </div>
            </div>
          </PillButton>

          <PillButton
            index={2}
            pillRefs={pillRefs}
            onClick={handlePillClick}
            positionClass="right-[calc(25%+172.7px)] top-[4429.9px]"
          >
            <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:102" data-name="Book">
              <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:103;0:1642" data-name="Rectangle" />
              <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:103;0:1643" data-name="Rectangle" />
              <div className="absolute inset-[13.7%_19.96%_9.97%_20.04%] rounded-[24px]" style={{ backgroundColor: effective[2].color }} data-node-id="4:104" data-name="Rectangle" />
              <div className="absolute flex h-[193px] items-center justify-center left-[31.26%] right-[31.41%] top-[calc(50%-90.63px)]" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[92.445cqw] w-[99.666cqh]">
                  <p
                    className="font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] not-italic relative size-full text-center text-white whitespace-nowrap"
                    style={{ fontSize: `${pillFontSize(effective[2].pillLabel)}px` }}
                    dir="auto"
                    data-node-id="4:105"
                  >
                    {effective[2].pillLabel}
                  </p>
                </div>
              </div>
            </div>
          </PillButton>

          <PillButton
            index={3}
            pillRefs={pillRefs}
            onClick={handlePillClick}
            positionClass="right-[calc(25%+38.7px)] top-[4429.9px]"
          >
            <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:106" data-name="Book">
              <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:107;0:1642" data-name="Rectangle" />
              <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:107;0:1643" data-name="Rectangle" />
              <div className="absolute inset-[11.67%_19.88%_12%_20.12%] rounded-[24px]" style={{ backgroundColor: effective[3].color }} data-node-id="4:108" data-name="Rectangle" />
              <div className="absolute flex h-[154px] items-center justify-center left-[31.33%] right-[31.33%] top-[calc(50%-77.21px)]" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[93.8809cqw] w-[99.5783cqh]">
                  <p
                    className="font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] not-italic relative size-full text-center text-white whitespace-nowrap"
                    style={{ fontSize: `${pillFontSize(effective[3].pillLabel)}px` }}
                    dir="auto"
                    data-node-id="4:109"
                  >
                    {effective[3].pillLabel}
                  </p>
                </div>
              </div>
            </div>
          </PillButton>

          <PillButton
            index={4}
            pillRefs={pillRefs}
            onClick={handlePillClick}
            positionClass="right-[calc(16.67%+64.7px)] top-[4429.9px]"
          >
            <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:110" data-name="Book">
              <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:111;0:1642" data-name="Rectangle" />
              <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:111;0:1643" data-name="Rectangle" />
              <div className="absolute inset-[12.98%_20.81%_10.68%_19.19%] rounded-[24px]" style={{ backgroundColor: effective[4].color }} data-node-id="4:112" data-name="Rectangle" />
              <div className="absolute flex h-[199px] items-center justify-center left-[31.91%] right-[30.75%] top-[calc(50%-93.54px)]" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[92.228cqw] w-[99.6764cqh]">
                  <p
                    className="font-['Yekan_Bakh:Medium',sans-serif] leading-[normal] not-italic relative size-full text-center text-white whitespace-nowrap"
                    style={{ fontSize: `${pillFontSize(effective[4].pillLabel)}px` }}
                    dir="auto"
                    data-node-id="4:113"
                  >
                    {effective[4].pillLabel}
                  </p>
                </div>
              </div>
            </div>
          </PillButton>

          <PillButton
            index={5}
            pillRefs={pillRefs}
            onClick={handlePillClick}
            positionClass="right-[calc(8.33%+90.7px)] top-[4429.9px]"
          >
            <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:114" data-name="Book">
              <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:115;0:1642" data-name="Rectangle" />
              <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:115;0:1643" data-name="Rectangle" />
              <div className="absolute inset-[11.67%_19.88%_12%_20.12%] rounded-[24px]" style={{ backgroundColor: effective[5].color }} data-node-id="4:116" data-name="Rectangle" />
              <div className="absolute flex h-[125px] items-center justify-center left-[31.33%] right-[31.33%] top-[calc(50%-62.71px)]" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[94.9778cqw] w-[99.4779cqh]">
                  <p
                    className="font-['Roboto:Medium','Noto_Sans_Arabic:Regular',sans-serif] font-medium leading-[normal] relative size-full text-center text-white whitespace-nowrap"
                    style={{
                      fontSize: `${pillFontSize(effective[5].pillLabel)}px`,
                      fontVariationSettings: "'wdth' 100",
                    }}
                    dir="auto"
                    data-node-id="4:117"
                  >
                    {effective[5].pillLabel}
                  </p>
                </div>
              </div>
            </div>
          </PillButton>

          <PillButton
            index={6}
            pillRefs={pillRefs}
            onClick={handlePillClick}
            positionClass="right-[116.7px] top-[4429.9px]"
          >
            <div className="h-[418.426px] overflow-clip relative w-[104.394px]" data-node-id="4:118" data-name="Book">
              <div className="absolute bg-white inset-0 rounded-[24px] shadow-[0px_3px_49px_9px_rgba(0,0,0,0.06)]" data-node-id="I4:119;0:1642" data-name="Rectangle" />
              <div className="absolute bg-[#ebf5ff] inset-[4.33%_12%_4.33%_10.67%] rounded-[24px]" data-node-id="I4:119;0:1643" data-name="Rectangle" />
              <div className="absolute inset-[14.35%_20.42%_9.31%_19.58%] rounded-[24px]" style={{ backgroundColor: effective[6].color }} data-node-id="4:120" data-name="Rectangle" />
              <div className="absolute flex h-[208px] items-center justify-center left-[31.68%] right-[30.98%] top-[calc(50%-97.06px)]" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[91.9044cqw] w-[99.691cqh]">
                  <p
                    className="font-['Roboto:Medium','Noto_Sans_Arabic:Regular',sans-serif] font-medium leading-[normal] relative size-full text-center text-white whitespace-nowrap"
                    style={{
                      fontSize: `${pillFontSize(effective[6].pillLabel)}px`,
                      fontVariationSettings: "'wdth' 100",
                    }}
                    dir="auto"
                    data-node-id="4:121"
                  >
                    {effective[6].pillLabel}
                  </p>
                </div>
              </div>
            </div>
          </PillButton>

          <div className="absolute h-[429.612px] left-[181px] top-[4425px] w-[684.781px]" data-node-id="4:122" data-name="Detail">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgDetail} />
          </div>

          <Link
            href="/courses"
            className="group absolute flex items-center justify-center gap-2.5 left-[128px] top-[4303px] h-[39.056px] w-[171.195px] hover:opacity-90 transition"
            aria-label="نمایش همه دوره‌ها"
            dir="rtl"
            data-node-id="4:123"
          >
            <span
              className="font-['Yekan_Bakh:Medium',sans-serif] text-[#1b3c8a] text-[24px] whitespace-nowrap border-b border-transparent group-hover:border-[#1b3c8a]/45 pb-0.5 transition"
              dir="auto"
            >
              نمایش بیشتر
            </span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1b3c8a"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:-translate-x-1"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ================= Expanded detail card (dynamic) ================= */}
      <div className="absolute contents left-[175px] top-[4425px]" data-node-id="4:261">
        <div className="absolute bg-white border border-[rgba(0,0,0,0.3)] border-solid h-[432px] left-[175px] rounded-[25px] top-[4425px] w-[691px]" data-node-id="4:262" />

        {/* Price oval — full hit target linking to the selected course.
            Falls back to /courses if no slug is resolved yet. */}
        <Link
          key={`price-${selected}`}
          href={course.href ?? (course.slug ? `/courses/${course.slug}` : "/courses")}
          aria-label={course.href ? `اطلاعات بیشتر ${course.detailTitle}` : `مشاهده و خرید ${course.detailTitle}`}
          className="group absolute flex flex-col items-center justify-center left-[220px] top-[4747.45px] w-[315px] h-[73.378px] rounded-xl explore-text-swap transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99]"
          style={{ animationDelay: "540ms" }}
          data-node-id="4:263"
        >
          {course.href ? (
            // Programs with their own landing page (e.g. MON → /coaching)
            // skip the price and invite the user to learn more instead.
            <span
              className="font-['Yekan_Bakh:Bold',sans-serif] text-[#00cbb8] text-[22px] leading-none tracking-[0.5px]"
              dir="rtl"
            >
              اطلاعات بیشتر
            </span>
          ) : (
            <>
              <span className="font-['Yekan_Bakh:Medium',sans-serif] text-[#00cbb8]/80 text-[13px] leading-none mb-1 transition group-hover:text-[#00cbb8]">
                خرید دوره
              </span>
              <span
                className="font-['Yekan_Bakh:Bold',sans-serif] text-[#00cbb8] text-[22px] leading-none tabular-nums tracking-[0.5px]"
                dir="rtl"
              >
                {course.price}
              </span>
            </>
          )}
        </Link>

        {/* Banner with accent tint + ref used for flight destination */}
        <div
          ref={bannerRef}
          className="absolute h-[352.699px] left-[calc(25%+87.81px)] rounded-[34px] top-[4465.13px] w-[268.433px] overflow-hidden"
          data-node-id="4:264"
          data-name="course banner"
          style={{
            boxShadow: `0 12px 40px ${course.color}33`,
            transition: "box-shadow 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            key={`banner-${selected}`}
            className="absolute inset-0 pointer-events-none rounded-[34px] overflow-hidden explore-banner-swap"
          >
            {course.bannerImage ? (
              // عکس اختصاصی این دوره — کل کادر را پر می‌کند و رنگ tint روی آن
              // اعمال نمی‌شود تا عکس واقعی واضح دیده شود.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                src={course.bannerImage}
              />
            ) : (
              <>
                <img alt="" className="absolute h-[100.03%] left-[-38.58%] max-w-none top-[-0.02%] w-[323.3%]" src={imgLq1BannerCopy1} />
                {/* Accent color wash — tints the shared base image in the course color */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-color"
                  style={{
                    background: `linear-gradient(135deg, ${course.color}dd 0%, ${course.color}66 100%)`,
                  }}
                />
                {/* Blur panel that hides the baked-in "LQ1" text so the course name can replace it */}
                <div
                  className="absolute inset-x-[6%] top-[30%] bottom-[18%] rounded-[24px] backdrop-blur-[14px]"
                  style={{
                    background: `linear-gradient(180deg, ${course.color}33 0%, ${course.color}55 50%, ${course.color}22 100%)`,
                  }}
                />
              </>
            )}
            {/* وقتی عکس اختصاصی دوره است، یک overlay تیره ملایم اضافه می‌کنیم
                تا عنوان سفید روی عکس خوانا بماند. */}
            {course.bannerImage && (
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(8,23,56,0.15) 0%, rgba(8,23,56,0.55) 60%, rgba(8,23,56,0.78) 100%)",
                }}
              />
            )}
            {/* Course name (replaces the original image text) */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-white">
              <p
                className="font-['Yekan_Bakh:Bold',sans-serif] text-[30px] leading-[1.22] text-center whitespace-pre-line drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                dir="rtl"
              >
                {course.bannerTitle}
              </p>
              {course.bannerBadge ? (
                <p
                  className="mt-3 font-['Yekan_Bakh:Regular',sans-serif] text-[13px] opacity-85 tracking-wide"
                  dir="rtl"
                >
                  {course.bannerBadge}
                </p>
              ) : null}
            </div>
            {/* Soft top-highlight for a glassy finish */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 45%, rgba(0,0,0,0.18) 100%)",
              }}
            />
            {/* Full-banner click target — goes to the course page */}
            <Link
              href={course.href ?? (course.slug ? `/courses/${course.slug}` : "/courses")}
              aria-label={`مشاهده ${course.detailTitle}`}
              className="absolute inset-0 z-10"
            />
          </div>
        </div>

        <div className="absolute border-2 border-[#00cbb8] border-solid h-[73.378px] left-[220px] rounded-[63px] top-[4747.45px] w-[315px] pointer-events-none" data-node-id="4:265" />

        {/* Title (dynamic) — links to course page */}
        <Link
          key={`title-${selected}`}
          href={course.href ?? (course.slug ? `/courses/${course.slug}` : "/courses")}
          className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] h-[48.574px] leading-[normal] left-[calc(8.33%+256.5px)] not-italic text-[#1b3c8a] text-[30px] text-center top-[4480.81px] w-[343px] explore-text-swap hover:text-[#136cb5] transition-colors"
          style={{ animationDelay: "340ms" }}
          dir="auto"
          data-node-id="4:266"
        >
          {course.detailTitle}
        </Link>

        {/* Level (dynamic) */}
        <p
          key={`level-${selected}`}
          className="-translate-x-1/2 absolute font-['Yekan_Bakh:Bold',sans-serif] h-[23.77px] leading-[normal] left-[calc(8.33%+300.5px)] not-italic text-[#444] text-[15px] text-center top-[4535.58px] w-[343px] explore-text-swap"
          style={{ animationDelay: "400ms" }}
          dir="auto"
          data-node-id="4:267"
        >
          {course.detailLevel}
        </p>

        {/* Description (dynamic) — clamped to the container to avoid overflow */}
        <p
          key={`desc-${selected}`}
          className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[109.55px] leading-[1.65] left-[510px] not-italic text-[#696984] text-[20px] text-right top-[4582.09px] w-[310px] overflow-hidden explore-text-swap"
          style={{
            animationDelay: "460ms",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
          dir="auto"
          data-node-id="4:268"
        >
          {course.description}
        </p>

        {/* Rating stars (dynamic — driven by course.rating) */}
        <div
          key={`stars-${selected}`}
          className="contents explore-stars-swap"
          style={{ animationDelay: "500ms" }}
        >
          {stars.map((kind, idx) => {
            // Position values from original Figma pixel coords — keep exact placement.
            const positions = [
              "left-[calc(16.67%+166px)]",
              "left-[calc(16.67%+141px)]",
              "left-[calc(16.67%+117px)]",
              "left-[calc(16.67%+92px)]",
              "left-[calc(16.67%+67px)]",
            ];
            const src = kind === "full" ? imgStar8 : imgStar12;
            return (
              <div
                key={idx}
                className={`absolute h-[24.804px] ${positions[idx]} top-[4701.98px] w-[24px] explore-star-pop`}
                style={{
                  animationDelay: `${560 + idx * 60}ms`,
                  opacity: kind === "empty" ? 0.25 : 1,
                }}
              >
                <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
                  <img alt="" className="block max-w-none size-full" src={src} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes exploreBannerSwap {
          0% {
            opacity: 0;
            transform: scale(0.92);
            filter: blur(6px) saturate(1.4);
          }
          60% {
            opacity: 0.92;
            filter: blur(1px) saturate(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0) saturate(1);
          }
        }
        .explore-banner-swap {
          animation: exploreBannerSwap 780ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: 420ms;
        }
        @keyframes exploreTextSwap {
          0% {
            opacity: 0;
            transform: translateY(14px);
            filter: blur(3px);
          }
          60% {
            opacity: 0.85;
            filter: blur(0.5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .explore-text-swap {
          animation: exploreTextSwap 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes exploreStarPop {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(4px);
          }
          70% {
            opacity: 1;
            transform: scale(1.2) translateY(0);
          }
          100% {
            opacity: var(--star-opacity, 1);
            transform: scale(1) translateY(0);
          }
        }
        .explore-star-pop {
          animation: exploreStarPop 480ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .explore-pill-btn {
          transition:
            transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 220ms ease;
        }
        .explore-pill-btn:hover {
          transform: translateY(-4px);
          filter: drop-shadow(0 12px 22px rgba(27, 60, 138, 0.14));
        }
        .explore-pill-btn:active {
          transform: translateY(-1px) scale(0.97);
        }
        @media (prefers-reduced-motion: reduce) {
          .explore-banner-swap,
          .explore-text-swap,
          .explore-star-pop {
            animation-duration: 1ms !important;
          }
        }
      `}</style>
    </>
  );
}

function PillButton({
  index,
  pillRefs,
  onClick,
  positionClass,
  children,
}: {
  index: number;
  pillRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
  onClick: (i: number) => void;
  positionClass: string;
  children: ReactNode;
}) {
  return (
    <button
      ref={(el) => {
        pillRefs.current[index] = el;
      }}
      type="button"
      onClick={() => onClick(index)}
      aria-label={COURSES[index].pillLabel}
      className={`explore-pill-btn absolute flex h-[420.172px] items-center justify-center ${positionClass} w-[111.297px] cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1b3c8a]/35 rounded-[24px] bg-transparent border-0 p-0`}
    >
      <div className="flex-none rotate-[-0.99deg] skew-x-[-0.04deg]">{children}</div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderStars(rating: number): Array<"full" | "half" | "empty"> {
  const r = Math.max(0, Math.min(5, rating));
  const result: Array<"full" | "half" | "empty"> = [];
  for (let i = 1; i <= 5; i++) {
    if (r >= i) result.push("full");
    else if (r >= i - 0.5) result.push("half");
    else result.push("empty");
  }
  return result;
}
