"use client";

import { useRef, useState, type ReactNode } from "react";

type Props = {
  videoUrl?: string;
  poster?: string;
  title?: string;
  className?: string;
  posterClassName?: string;
  posterStyle?: React.CSSProperties;
  buttonSize?: number;
  variant?: "light" | "gold" | "dark";
  /** Decorative overlay shown over the poster; hidden when video starts playing. */
  overlay?: ReactNode;
};

export default function InlineVideo({
  videoUrl,
  poster,
  title,
  className,
  posterClassName,
  posterStyle,
  buttonSize = 80,
  variant = "light",
  overlay,
}: Props) {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const start = () => {
    if (!videoUrl) return;
    setStarted(true);
    queueMicrotask(() => videoRef.current?.play().catch(() => {}));
  };

  return (
    <div className={className}>
      {!started ? (
        <>
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt={title || ""}
              className={
                posterClassName ||
                "absolute inset-0 w-full h-full object-cover"
              }
              style={posterStyle}
            />
          )}
          {overlay}
          <button
            type="button"
            onClick={start}
            aria-label={`پخش ${title || "ویدیو"}`}
            className="absolute inset-0 flex items-center justify-center group cursor-pointer z-10"
            disabled={!videoUrl}
          >
            {variant === "gold" ? (
              <span className="relative flex items-center justify-center">
                {/* Pulsing outer ring */}
                <span
                  aria-hidden
                  className="absolute rounded-full border border-[#f7cf5a]/50 animate-ping"
                  style={{
                    width: buttonSize + 16,
                    height: buttonSize + 16,
                    animationDuration: "2.4s",
                  }}
                />
                {/* Gold bezel ring */}
                <span
                  className="relative flex items-center justify-center rounded-full p-[2px] group-hover:scale-[1.08] transition-transform duration-500 ease-out"
                  style={{
                    width: buttonSize,
                    height: buttonSize,
                    background:
                      "linear-gradient(160deg, #fff4d6 0%, #f7cf5a 45%, #8a6310 100%)",
                    boxShadow:
                      "0 14px 38px -8px rgba(247,207,90,0.55), 0 0 0 1px rgba(247,207,90,0.3)",
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-full w-full h-full"
                    style={{
                      background:
                        "radial-gradient(circle at 35% 28%, #1b2d6e 0%, #0e1a3d 60%, #060a1f 100%)",
                    }}
                  >
                    <svg
                      width={buttonSize * 0.36}
                      height={buttonSize * 0.36}
                      viewBox="0 0 24 24"
                      fill="#f7cf5a"
                      style={{
                        filter:
                          "drop-shadow(0 0 8px rgba(247,207,90,0.5))",
                        transform: "translateX(2px)",
                      }}
                    >
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  </span>
                </span>
              </span>
            ) : variant === "dark" ? (
              <span
                className="relative flex items-center justify-center rounded-full bg-[#0e1a3d]/85 backdrop-blur-sm border border-white/15 group-hover:bg-[#1b3c8a] group-hover:border-[#f7cf5a]/50 transition-all duration-400 shadow-2xl"
                style={{ width: buttonSize, height: buttonSize }}
              >
                <svg
                  width={buttonSize * 0.4}
                  height={buttonSize * 0.4}
                  viewBox="0 0 24 24"
                  fill="white"
                  style={{ transform: "translateX(2px)" }}
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </span>
            ) : (
              <span
                className="rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition"
                style={{ width: buttonSize, height: buttonSize }}
              >
                <svg
                  width={buttonSize * 0.45}
                  height={buttonSize * 0.45}
                  viewBox="0 0 24 24"
                  fill="#1b3c8a"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </span>
            )}
          </button>
        </>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          controls
          preload="auto"
          playsInline
          className="absolute inset-0 w-full h-full object-cover bg-black"
          aria-label={title}
        />
      )}
    </div>
  );
}
