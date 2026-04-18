"use client";

import { useState } from "react";

export default function PreviewVideoButton({
  videoUrl,
  title,
}: {
  videoUrl: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute inset-0 flex items-center justify-center group"
        aria-label="مشاهده پیش‌نمایش"
      >
        <span className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#1b3c8a">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-12 left-0 text-white/80 hover:text-white text-sm flex items-center gap-1"
            >
              ✕ بستن
            </button>
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full aspect-video rounded-2xl bg-black shadow-2xl"
              aria-label={title}
            />
          </div>
        </div>
      )}
    </>
  );
}
