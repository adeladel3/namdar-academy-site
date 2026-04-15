"use client";

import { useEffect, useRef, useState } from "react";

const FIGMA_WIDTH = 1920;
const FIGMA_HEIGHT = 10518;

export default function FigmaStage({
  children,
}: {
  children: React.ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      if (!stageRef.current) return;
      const w = stageRef.current.clientWidth;
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
      style={{ height: FIGMA_HEIGHT * scale }}
    >
      <div
        className="figma-canvas"
        style={{ ["--figma-scale" as string]: scale }}
      >
        {children}
      </div>
    </div>
  );
}
