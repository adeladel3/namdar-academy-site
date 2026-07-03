"use client";

import { useLayoutEffect, useRef, useState } from "react";

const FIGMA_WIDTH = 1920;
const FIGMA_HEIGHT = 9416;
// The original Figma canvas reserved the top 120px for a brand+nav band that
// is now provided by the global SiteHeader. We also trim the empty hero
// padding above the instructor portrait so the visible content starts right
// under the SiteHeader without an oversized gap.
const FIGMA_TOP_CROP = 240;

export default function FigmaStage({
  children,
}: {
  children: React.ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      if (!stageRef.current) return;
      const w = stageRef.current.clientWidth;
      // Always fit the full 1920px canvas inside the viewport — on phones
      // this produces very small but complete visuals the user can pinch-
      // zoom. Better than clipping half the page off-screen.
      setScale(Math.min(1, w / FIGMA_WIDTH));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      ref={stageRef}
      className="figma-stage"
      style={{
        height:
          scale != null
            ? (FIGMA_HEIGHT - FIGMA_TOP_CROP) * scale
            : `min(100vh, ${FIGMA_HEIGHT}px)`,
        contain: "layout paint",
      }}
    >
      <div
        className="figma-canvas"
        style={{
          ["--figma-scale" as string]: scale ?? 1,
          visibility: scale == null ? "hidden" : "visible",
          marginTop: scale != null ? `-${FIGMA_TOP_CROP * scale}px` : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
