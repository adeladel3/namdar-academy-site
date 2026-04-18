"use client";

import { useEffect, useRef } from "react";

const FEATURES: {
  title: string;
  body: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "۲ پیپ استاپ",
    body: "میانگین حدضرر دانش‌پذیران ۲ پیپ",
    icon: (
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#f3d27a" strokeWidth="1.8">
        <rect x="8" y="12" width="48" height="32" rx="2" />
        <path d="M20 44v8M44 44v8M16 52h32" strokeLinecap="round" />
        <path d="M18 22l8 8 6-6 10 10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="42" cy="20" r="2.5" />
      </svg>
    ),
  },
  {
    title: "بیش از ۱۰ میلیون دلار جذب سرمایه",
    body: "تا کنون دانش‌پذیران کوچینگ بیش از ۱۰ میلیون دلار جذب سرمایه کرده‌اند.",
    icon: (
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#f3d27a" strokeWidth="1.8">
        <circle cx="32" cy="26" r="14" />
        <path d="M22 18h20M22 26h20M22 34h20" strokeLinecap="round" />
        <path d="M22 38l-4 18 14-8 14 8-4-18" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "بیش از ۲۰۰ ریوارد",
    body: "در ماه به صورت کد شده و ۱.۲.۳.۴ به همراه با پلن معاملاتی مکتوب",
    icon: (
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#f3d27a" strokeWidth="1.8">
        <circle cx="20" cy="20" r="6" />
        <circle cx="44" cy="20" r="6" />
        <path d="M10 40c0-6 4-10 10-10s10 4 10 10" strokeLinecap="round" />
        <path d="M34 40c0-6 4-10 10-10s10 4 10 10" strokeLinecap="round" />
        <path d="M8 52c6-8 14-10 24-10s18 2 24 10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function MonCoachingSection({
  videoSrc = "",
  poster = "/figma/screenshot00080208at1732541.png",
}: {
  videoSrc?: string;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const node = sectionRef.current;
    if (!video || !node || !videoSrc) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [videoSrc]);

  return (
    <div
      ref={sectionRef}
      className="absolute left-[156px] right-[157px] top-[2278px] h-[900px] rounded-[46px] overflow-hidden bg-[#0a0e2f]"
      dir="rtl"
    >
      {/* Purple blob bottom-left */}
      <div className="absolute -left-[140px] -bottom-[180px] w-[620px] h-[620px] rounded-full bg-[#3c2cdb] opacity-60 blur-[80px] pointer-events-none" />
      {/* Thin top separator */}
      <div className="absolute top-[36px] left-[60px] right-[60px] h-px bg-white/10" />

      {/* Right side: title + features */}
      <div className="absolute right-[70px] top-[90px] w-[620px] text-white">
        {/* Title row */}
        <div className="flex items-start gap-5 justify-start">
          {/* MON sphere logo */}
          <div className="shrink-0 mt-1">
            <div
              className="w-[92px] h-[92px] rounded-full flex items-center justify-center shadow-[0_8px_28px_rgba(243,210,122,0.35)]"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #f6e3a8, #d4a44b 55%, #8a5f1c 100%)",
              }}
            >
              <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[26px] text-[#3a2408] tracking-wide">
                MON
              </span>
            </div>
          </div>
          <div className="flex-1 text-right">
            <h2 className="font-['Yekan_Bakh:Bold',sans-serif] text-[36px] leading-tight mb-2">
              کوچینگ معامله‌گری MON
            </h2>
            <p className="font-['Poppins:Medium',sans-serif] text-[20px] text-[#f3d27a] tracking-[2px]">
              MIDDLE OF NOWHERE
            </p>
          </div>
        </div>

        {/* Golden circle decoration */}
        <div
          className="absolute -right-[30px] top-[200px] w-[360px] h-[360px] rounded-full opacity-60 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #e9c878, #b7873a 60%, #6a4916 100%)",
          }}
        />

        {/* Feature list */}
        <ul className="relative mt-[80px] space-y-[46px]">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex items-start gap-5 text-right">
              <div className="flex-1 pt-1">
                <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[22px] mb-2">
                  {f.title}
                </h3>
                <p className="font-['Yekan_Bakh:Regular',sans-serif] text-[16px] leading-7 text-white/75">
                  {f.body}
                </p>
              </div>
              <div className="shrink-0">{f.icon}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Left side: video */}
      <div className="absolute left-[70px] top-[200px] w-[820px] aspect-[16/9] rounded-[14px] overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            muted
            loop
            playsInline
            controls
            preload="metadata"
            className="w-full h-full object-cover"
            aria-label="ویدیو معرفی کوچینگ MON"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt="ویدیوی معرفی کوچینگ MON"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
