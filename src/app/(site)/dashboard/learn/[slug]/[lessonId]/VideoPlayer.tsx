"use client";

import { useEffect, useRef, useState } from "react";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

type Props = {
  lessonId: string;
  videoUrl?: string;
  initialPositionSec: number;
  completed: boolean;
  canTrack: boolean;
};

export default function VideoPlayer({
  lessonId,
  videoUrl,
  initialPositionSec,
  completed: initialCompleted,
  canTrack,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [completed, setCompleted] = useState(initialCompleted);
  const [watchedPct, setWatchedPct] = useState(0);
  const lastSentRef = useRef(0);
  const lastDeltaTsRef = useRef(0);
  // Lazy state initializer keeps the impure crypto/Math.random call out of
  // the render path so React Compiler can optimize this component. The id is
  // stable for the component's lifetime.
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  );

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onLoaded = () => {
      if (initialPositionSec > 0 && initialPositionSec < v.duration - 3) {
        v.currentTime = initialPositionSec;
      }
      if (v.duration && isFinite(v.duration)) {
        const pct = Math.max(
          0,
          Math.min(100, Math.floor((v.currentTime / v.duration) * 100))
        );
        setWatchedPct((cur) => (pct > cur ? pct : cur));
      }
    };
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, [initialPositionSec]);

  useEffect(() => {
    if (initialCompleted) setWatchedPct(100);
  }, [initialCompleted]);

  async function send(patch: {
    positionSec?: number;
    completed?: boolean;
    event?: "play" | "pause" | "seek" | "progress" | "end";
    deltaSec?: number;
  }) {
    if (!canTrack) return;
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          sessionId,
          ...patch,
        }),
      });
    } catch {
      // silent — progress is best-effort
    }
  }

  function computeDelta(v: HTMLVideoElement) {
    const now = Date.now();
    if (lastDeltaTsRef.current === 0) {
      lastDeltaTsRef.current = now;
      return 0;
    }
    const delta = Math.round((now - lastDeltaTsRef.current) / 1000);
    lastDeltaTsRef.current = now;
    return v.paused ? 0 : Math.max(0, Math.min(delta, 15));
  }

  function updatePct(v: HTMLVideoElement) {
    if (!v.duration || !isFinite(v.duration)) return;
    const pct = Math.max(
      0,
      Math.min(100, Math.floor((v.currentTime / v.duration) * 100))
    );
    setWatchedPct((cur) => (pct > cur ? pct : cur));
  }

  function onTimeUpdate() {
    const v = ref.current;
    if (!v) return;
    updatePct(v);
    const now = Date.now();
    if (now - lastSentRef.current < 8000) return;
    lastSentRef.current = now;
    send({
      positionSec: Math.floor(v.currentTime),
      event: "progress",
      deltaSec: computeDelta(v),
    });
  }

  function onPlay() {
    const v = ref.current;
    if (!v) return;
    lastDeltaTsRef.current = Date.now();
    send({
      positionSec: Math.floor(v.currentTime),
      event: "play",
    });
  }

  function onPause() {
    const v = ref.current;
    if (!v) return;
    send({
      positionSec: Math.floor(v.currentTime),
      event: "pause",
      deltaSec: computeDelta(v),
    });
  }

  function onSeeked() {
    const v = ref.current;
    if (!v) return;
    send({
      positionSec: Math.floor(v.currentTime),
      event: "seek",
    });
  }

  function onEnded() {
    const v = ref.current;
    const duration = v?.duration ?? 0;
    const reachedEnd =
      duration > 0 && (v?.currentTime ?? 0) >= duration - 1.5;
    if (!reachedEnd) return;
    if (!completed) setCompleted(true);
    setWatchedPct(100);
    send({
      completed: true,
      positionSec: Math.floor(duration),
      event: "end",
    });
  }

  if (!videoUrl) {
    return (
      <div className="aspect-video w-full rounded-3xl bg-[#0f1f4a] text-white/80 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-5xl">🎬</div>
        <div className="font-bold text-lg">ویدیو این درس هنوز بارگذاری نشده</div>
        <p className="text-white/60 text-sm max-w-md">
          مدرس در حال آماده‌سازی این درس است. به‌زودی در همین صفحه قابل تماشا
          خواهد بود.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={ref}
        src={videoUrl}
        controls
        controlsList="nodownload"
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onSeeked={onSeeked}
        onEnded={onEnded}
        className="w-full aspect-video rounded-3xl bg-black shadow-xl"
        preload="metadata"
      />
      {canTrack && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <div
              className={`inline-flex items-center gap-2 ${
                completed ? "text-green-700 font-bold" : "text-[#010514]/65"
              }`}
            >
              {completed ? (
                <>
                  <span>✓</span> این درس کامل تماشا شد — درس بعدی باز شد.
                </>
              ) : (
                <span>
                  برای باز شدن درس بعدی، ویدیو را تا انتها (۱۰۰٪) تماشا کنید.
                </span>
              )}
            </div>
            <div
              className={`font-bold font-mono tabular-nums ${
                completed ? "text-green-700" : "text-[#1b3c8a]"
              }`}
              dir="ltr"
              aria-label="درصد تماشا شده"
            >
              {toFa(completed ? 100 : watchedPct)}٪
            </div>
          </div>
          <div
            className="h-2 rounded-full bg-[#eef2f7] overflow-hidden"
            role="progressbar"
            aria-valuenow={completed ? 100 : watchedPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full transition-all ${
                completed ? "bg-green-600" : "bg-[#1b3c8a]"
              }`}
              style={{ width: `${completed ? 100 : watchedPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
