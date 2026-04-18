"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Interactive search that overlays the Figma-rendered search bar (node 4:177).
 * - Transparent <input> sits above the Figma placeholder text.
 * - When the user starts typing, a backdrop layer fades in and hides the
 *   static Figma placeholder so the two strings don't overlap.
 * - A clean SVG magnifier icon sits centered in the blue pill. */
export default function LandingSearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const hasValue = q.length > 0;

  function submit() {
    const trimmed = q.trim();
    router.push(
      trimmed ? `/courses?q=${encodeURIComponent(trimmed)}` : "/courses"
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* Backdrop that hides the Figma placeholder while typing. */}
      <div
        aria-hidden
        className="absolute transition-opacity duration-300 pointer-events-none rounded-[64px] backdrop-blur-[5.15px] bg-[rgba(217,217,217,0.62)]"
        style={{
          top: 600,
          left: 724,
          width: 762,
          height: 64,
          opacity: hasValue ? 1 : 0,
        }}
      />

      {/* Transparent input over the text area. */}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="جستجوی دوره"
        className="absolute bg-transparent outline-none text-[18px] text-[#010514] font-['Yekan_Bakh:Bold',sans-serif] caret-[#1b3c8a]"
        dir="rtl"
        style={{
          top: 600,
          left: 724,
          width: 762,
          height: 64,
          paddingInline: 28,
        }}
      />

      {/* Blue submit pill with a white magnifier icon + press-down animation. */}
      <button
        type="submit"
        aria-label="جستجو"
        className="group absolute flex items-center justify-center cursor-pointer transition hover:brightness-110 active:scale-[0.98]"
        style={{
          top: 600,
          left: 575,
          width: 150,
          height: 64,
          background: "transparent",
          border: "none",
          borderRadius: 40,
        }}
      >
        <span className="flex items-center justify-center w-[60px] h-[60px] rounded-full bg-white/0 group-hover:bg-white/10 transition-colors">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-transform group-hover:scale-110"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </span>
      </button>
    </form>
  );
}
