"use client";

import { useEffect, useRef, useState } from "react";

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
  const lastSentRef = useRef(0);
  const lastDeltaTsRef = useRef(0);
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  );

  useEffect(() => {
    const v = ref.current;
    if (!v || !initialPositionSec) return;
    const onLoaded = () => {
      if (initialPositionSec > 0 && initialPositionSec < v.duration - 3) {
        v.currentTime = initialPositionSec;
      }
    };
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, [initialPositionSec]);

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
          sessionId: sessionIdRef.current,
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

  function onTimeUpdate() {
    const v = ref.current;
    if (!v) return;
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
    if (!completed) setCompleted(true);
    send({
      completed: true,
      positionSec: Math.floor(ref.current?.duration ?? 0),
      event: "end",
    });
  }

  function markComplete() {
    setCompleted(true);
    send({ completed: true });
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
        <div className="mt-3 flex items-center justify-between text-sm">
          <div
            className={`inline-flex items-center gap-2 ${
              completed ? "text-green-700 font-bold" : "text-[#010514]/55"
            }`}
          >
            {completed ? (
              <>
                <span>✓</span> این درس را کامل کرده‌اید
              </>
            ) : (
              <span>پیشرفت شما به‌صورت خودکار ذخیره می‌شود</span>
            )}
          </div>
          {!completed && (
            <button
              type="button"
              onClick={markComplete}
              className="px-4 py-2 rounded-full text-xs bg-green-600 text-white font-bold hover:opacity-90 transition"
            >
              علامت‌گذاری به عنوان خوانده‌شده
            </button>
          )}
        </div>
      )}
    </div>
  );
}
