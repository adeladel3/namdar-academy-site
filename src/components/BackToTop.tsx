"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="بازگشت به بالای صفحه"
      onClick={handleClick}
      className={`fixed bottom-6 left-6 z-40 group transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <span
        className="relative block w-14 h-14 md:w-16 md:h-16 rounded-full transition-all duration-500 ease-out group-hover:scale-[1.12] group-hover:-translate-y-1.5 group-hover:rotate-[6deg] will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.08) 38%), radial-gradient(circle at 78% 28%, rgba(255,180,220,0.42) 0%, transparent 45%), radial-gradient(circle at 70% 78%, rgba(120,220,255,0.52) 0%, transparent 48%), radial-gradient(circle at 30% 75%, rgba(255,220,150,0.36) 0%, transparent 50%), rgba(255,255,255,0.1)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow:
            "inset 0 0 28px rgba(255,255,255,0.25), inset -10px -8px 22px rgba(120,220,255,0.14), inset 10px 8px 22px rgba(255,180,220,0.12), 0 14px 32px -8px rgba(10,40,80,0.45), 0 0 20px rgba(255,255,255,0.2)",
        }}
      >
        {/* Specular highlight */}
        <span
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            left: "20%",
            top: "14%",
            width: "32%",
            height: "22%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 65%)",
            filter: "blur(2px)",
          }}
        />

        {/* Iridescent rim */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none opacity-70"
          style={{
            background:
              "radial-gradient(circle at 78% 78%, rgba(255,230,180,0.5) 0%, transparent 22%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Up arrow */}
        <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_2px_5px_rgba(10,40,80,0.5)] transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-0.5">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 14 12 8 18 14" />
          </svg>
        </span>

        {/* Hover rainbow glow */}
        <span
          aria-hidden
          className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(255,180,220,0.4), rgba(180,220,255,0.4), rgba(255,230,180,0.35), rgba(200,180,255,0.4), rgba(255,180,220,0.4))",
            filter: "blur(14px)",
            zIndex: -1,
          }}
        />
      </span>
    </button>
  );
}
