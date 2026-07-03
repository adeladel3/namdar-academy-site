"use client";

import { useEffect, useRef, useState } from "react";

type Achievement = {
  title: string;
  body: string;
  tag: string;
  progress: number;
  level: string;
  icon: React.ReactNode;
  glow: string;
};

const ACHIEVEMENTS: Achievement[] = [
  {
    title: "۲ پیپ استاپ",
    body: "میانگین حدضرر دانش‌پذیران تنها ۲ پیپ — دقتی در سطح تیم‌های حرفه‌ای.",
    tag: "PRECISION",
    progress: 96,
    level: "LVL · MAX",
    glow: "rgba(247,207,90,0.55)",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
      </svg>
    ),
  },
  {
    title: "+۱۰M$ جذب سرمایه",
    body: "بیش از ۱۰ میلیون دلار سرمایه جذب‌شده توسط فارغ‌التحصیلان کوچینگ.",
    tag: "FUNDED",
    progress: 88,
    level: "LVL · LEGEND",
    glow: "rgba(122,196,255,0.55)",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h9l3 3v13H6z" />
        <path d="M15 4v3h3" />
        <path d="M9 12h6M9 16h6" />
        <circle cx="17" cy="19" r="3" fill="currentColor" stroke="none" opacity="0.2" />
      </svg>
    ),
  },
  {
    title: "+۲۰۰ ریوارد در ماه",
    body: "ستاپ‌های کد‌شده ۱.۲.۳.۴ همراه با پلن معاملاتی مکتوب — ماهانه بیش از ۲۰۰ ریوارد.",
    tag: "STREAK",
    progress: 78,
    level: "LVL · ELITE",
    glow: "rgba(163,124,255,0.55)",
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c1.5 3 4 4.5 4 8a4 4 0 1 1-8 0c0-2 1-3 1.5-4.5C10 8 11 6 12 3z" />
        <path d="M12 21v-3" />
      </svg>
    ),
  },
];

const QUEST_BADGES = [
  { label: "MASTERCLASS", icon: "★" },
  { label: "DISCORD VIP", icon: "◆" },
  { label: "FUND-READY", icon: "⚡" },
  { label: "LIVE COACHING", icon: "●" },
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

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

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      io.disconnect();
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [videoSrc]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div
      ref={sectionRef}
      className="mon-section absolute left-[156px] right-[157px] top-[2470px] h-[900px] rounded-[46px] overflow-hidden"
      dir="rtl"
      style={{
        background:
          "radial-gradient(120% 90% at 85% 0%, #1a1555 0%, #0a0e2f 45%, #05071f 100%)",
      }}
    >
      {/* animated gradient border */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[46px] pointer-events-none"
        style={{
          padding: 1,
          background:
            "linear-gradient(135deg, rgba(247,207,90,0.45), rgba(163,124,255,0.15) 35%, rgba(73,187,189,0.35) 70%, rgba(247,207,90,0.35))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Ambient glows */}
      <div className="absolute -left-[180px] -bottom-[220px] w-[680px] h-[680px] rounded-full pointer-events-none opacity-60 blur-[90px]"
        style={{ background: "radial-gradient(circle, #3c2cdb 0%, transparent 70%)" }} />
      <div className="absolute -right-[120px] -top-[140px] w-[520px] h-[520px] rounded-full pointer-events-none opacity-50 blur-[80px]"
        style={{ background: "radial-gradient(circle, #f7cf5a 0%, transparent 70%)" }} />
      <div className="absolute left-1/2 top-1/2 w-[300px] h-[300px] rounded-full pointer-events-none opacity-30 blur-[100px] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, #49bbbd 0%, transparent 70%)" }} />

      {/* Grid overlay for gamified feel */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 50%, #000 40%, transparent 80%)",
        }}
      />

      {/* ===== Top bar — title + quest ribbon ===== */}
      <div className="absolute top-[46px] right-[60px] left-[60px] flex items-center justify-between">
        {/* Title + MON logo (LEFT side) */}
        <div className="flex items-center gap-5">
          {/* MON logo — real image with gold halo */}
          <div className="relative shrink-0">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full opacity-70 blur-[24px]"
              style={{ background: "radial-gradient(circle, rgba(255,176,75,0.65) 0%, rgba(255,176,75,0) 70%)" }}
            />
            <div className="relative w-[110px] h-[110px] rounded-full overflow-hidden shadow-[0_10px_40px_rgba(247,207,90,0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/figma/image1.png"
                alt="لوگوی MON"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center top" }}
              />
            </div>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-70 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ade80]" />
              </span>
              <span className="font-['Yekan_Bakh:Medium',sans-serif] text-[13px] text-[#4ade80] tracking-[1.5px]">
                دوره فعال · ثبت‌نام باز
              </span>
            </div>
            <h2 className="font-['Yekan_Bakh:Bold',sans-serif] text-[38px] text-white leading-[1.1] text-right" dir="rtl">
              کوچینگ معامله‌گری MON
            </h2>
            <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-[#f7cf5a] tracking-[3px] mt-0.5" dir="ltr">
              MIDDLE OF NOWHERE
            </p>
          </div>
        </div>

        {/* Quest chips (RIGHT side) */}
        <div className="flex items-center gap-2.5" dir="ltr">
          {QUEST_BADGES.map((b, i) => (
            <div
              key={b.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm"
              style={{
                animation: `questPulse 4s ease-in-out ${i * 0.3}s infinite`,
              }}
            >
              <span className="text-[#f7cf5a] text-[13px]">{b.icon}</span>
              <span className="font-['Poppins:Medium',sans-serif] text-[11px] text-white/85 tracking-[1px]">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Main content grid ===== */}
      <div className="absolute top-[190px] left-[60px] right-[60px] bottom-[60px] flex flex-row-reverse gap-[32px]">
        {/* LEFT — Video player */}
        <div className="flex-1 relative">
          <div
            className="relative w-full h-full rounded-[22px] overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #000 0%, #0a0e2f 100%)",
              boxShadow:
                "0 25px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(247,207,90,0.25) inset, 0 0 40px rgba(247,207,90,0.15) inset",
            }}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(isPlaying ? false : true)}
          >
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                poster={poster}
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                aria-label="ویدیو معرفی کوچینگ MON"
                onClick={togglePlay}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt="ویدیوی معرفی کوچینگ MON"
                className="w-full h-full object-cover"
              />
            )}

            {/* Top-left HUD overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15" dir="ltr">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-pulse" />
              <span className="font-['Poppins:Medium',sans-serif] text-[12px] text-white tracking-[1.5px]">
                LIVE PREVIEW
              </span>
            </div>

            {/* Top-right scene chapters */}
            <div className="absolute top-4 right-4 flex items-center gap-1" dir="ltr">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[3px] w-8 rounded-full bg-white/20 overflow-hidden"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: i === 0 ? "100%" : i === 1 ? "40%" : "0%",
                      background:
                        "linear-gradient(90deg, #f7cf5a, #ffb84a)",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Center play button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "توقف ویدیو" : "پخش ویدیو"}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                showControls || !isPlaying ? "opacity-100" : "opacity-0"
              }`}
            >
              <span
                aria-hidden
                className="absolute w-[120px] h-[120px] rounded-full blur-[30px] opacity-70"
                style={{ background: "radial-gradient(circle, #f7cf5a 0%, transparent 70%)" }}
              />
              <span
                className="relative w-[86px] h-[86px] rounded-full flex items-center justify-center shadow-[0_12px_40px_rgba(247,207,90,0.5)] transition-transform duration-300 group-hover:scale-110"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #fff1c4, #f7cf5a 60%, #c48a1f 100%)",
                }}
              >
                {isPlaying ? (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#3a2408">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="#3a2408">
                    <path d="M7 4.5v15a1 1 0 0 0 1.55.83l11-7.5a1 1 0 0 0 0-1.66l-11-7.5A1 1 0 0 0 7 4.5z" />
                  </svg>
                )}
              </span>
            </button>

            {/* Bottom HUD: timeline + stats */}
            <div className="absolute left-4 right-4 bottom-4 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/55 backdrop-blur-md border border-white/15" dir="ltr">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" strokeLinecap="round" />
                </svg>
                <span className="font-['Poppins:Medium',sans-serif] text-[12px] text-white tracking-[1px]">
                  ۳ دقیقه معرفی
                </span>
              </div>

              <div className="flex-1 h-[6px] rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: isPlaying ? "65%" : "0%",
                    background: "linear-gradient(90deg, #f7cf5a, #ffb84a)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#f7cf5a]/20 backdrop-blur-md border border-[#f7cf5a]/35" dir="ltr">
                <span className="text-[#f7cf5a]">◆</span>
                <span className="font-['Poppins:Bold',sans-serif] text-[12px] text-[#f7cf5a] tracking-[1px]">
                  +500 XP
                </span>
              </div>
            </div>
          </div>

          {/* corner ticks — gamified frame */}
          {["top-[-8px] left-[-8px]", "top-[-8px] right-[-8px]", "bottom-[-8px] left-[-8px]", "bottom-[-8px] right-[-8px]"].map(
            (pos) => (
              <span
                key={pos}
                aria-hidden
                className={`absolute ${pos} w-4 h-4 border-[#f7cf5a]`}
                style={{
                  borderTopWidth: pos.includes("top") ? 2 : 0,
                  borderBottomWidth: pos.includes("bottom") ? 2 : 0,
                  borderLeftWidth: pos.includes("left") ? 2 : 0,
                  borderRightWidth: pos.includes("right") ? 2 : 0,
                  borderStyle: "solid",
                  borderRadius: 3,
                }}
              />
            )
          )}
        </div>

        {/* RIGHT — Achievement cards */}
        <div className="w-[440px] flex flex-col gap-3">
          {/* Stats header */}
          <div className="flex items-center justify-between mb-1 px-1">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15 8l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
              </svg>
              <span className="font-['Yekan_Bakh:Bold',sans-serif] text-[18px] text-white tracking-wide">
                دستاوردهای دانش‌پذیران MON
              </span>
            </div>
            <span className="font-['Yekan_Bakh:Medium',sans-serif] text-[12px] text-white/55 tracking-[1px]">
              فصل چهارم
            </span>
          </div>

          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.title}
              className="relative group flex-1 rounded-[18px] p-[1px] overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${a.glow}, rgba(255,255,255,0.05) 60%, ${a.glow})`,
              }}
            >
              <div
                className="relative h-full rounded-[17px] p-5 flex gap-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* icon */}
                <div className="relative shrink-0">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-[14px] blur-[14px] opacity-70"
                    style={{ background: a.glow }}
                  />
                  <div
                    className="relative w-[54px] h-[54px] rounded-[14px] flex items-center justify-center text-[#f7cf5a]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(247,207,90,0.2), rgba(247,207,90,0.05))",
                      border: "1px solid rgba(247,207,90,0.3)",
                    }}
                  >
                    {a.icon}
                  </div>
                </div>

                {/* body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5" dir="ltr">
                    <span className="font-['Poppins:Medium',sans-serif] text-[12px] text-white/60 tracking-[2px]">
                      {a.level}
                    </span>
                    <span className="font-['Poppins:Bold',sans-serif] text-[11px] text-[#f7cf5a] tracking-[2px] px-2.5 py-1 rounded-full border border-[#f7cf5a]/35 bg-[#f7cf5a]/10">
                      {a.tag}
                    </span>
                  </div>
                  <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[22px] text-white mb-1.5">
                    {a.title}
                  </h3>
                  <p className="font-['Yekan_Bakh:Regular',sans-serif] text-[14px] leading-[1.8] text-white/70 mb-3 line-clamp-2">
                    {a.body}
                  </p>
                  {/* progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[5px] rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${a.progress}%`,
                          background:
                            "linear-gradient(90deg, #f7cf5a, #ffb84a)",
                          boxShadow: "0 0 10px rgba(247,207,90,0.6)",
                        }}
                      />
                    </div>
                    <span className="font-['Poppins:Bold',sans-serif] text-[13px] text-[#f7cf5a] tabular-nums" dir="ltr">
                      {a.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* local keyframes */}
      <style jsx>{`
        @keyframes monShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes questPulse {
          0%, 100% { transform: translateY(0); opacity: 0.92; }
          50% { transform: translateY(-2px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
