"use client";

import { useMemo, useState } from "react";
import { faDigits, formatToman, formatTomanCompact } from "@/lib/formatting";

/** Formatter identifier that can be passed as a string prop from server
 *  components to client chart components (function props aren't allowed). */
export type ChartFormat =
  | "number"
  | "toman"
  | "tomanCompact"
  | "seconds";

function fmt(v: number, kind: ChartFormat = "number") {
  switch (kind) {
    case "toman":
      return formatToman(v);
    case "tomanCompact":
      return formatTomanCompact(v);
    case "seconds": {
      const m = Math.floor(v / 60);
      const s = Math.floor(v % 60);
      return `${faDigits(m)}:${faDigits(String(s).padStart(2, "0"))}`;
    }
    default:
      return faDigits(Math.round(v));
  }
}

// --- Line/Area chart ------------------------------------------------------

export function LineChart({
  data,
  valueKey = "value",
  height = 220,
  color = "#1b3c8a",
  format = "number",
  fill = true,
}: {
  data: { label: string; [k: string]: number | string }[];
  valueKey?: string;
  height?: number;
  color?: string;
  format?: ChartFormat;
  fill?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const values = data.map((d) => Number(d[valueKey] ?? 0));
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;

  const width = 800;
  const padX = 32;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const points = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });

  const path = useMemo(() => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottom = padY + innerH;
    return (
      path +
      ` L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`
    );
  }, [path, points, padY, innerH]);

  const gradId = `grad-${color.replace("#", "")}`;

  const xTicks = useMemo(() => {
    if (data.length <= 6) return data.map((d, i) => ({ i, label: d.label }));
    const step = Math.ceil(data.length / 6);
    return data
      .map((d, i) => (i % step === 0 ? { i, label: d.label } : null))
      .filter((x): x is { i: number; label: string } => !!x);
  }, [data]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const value = min + range * t;
    const y = padY + innerH - t * innerH;
    return { y, value };
  });

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padX}
              x2={width - padX}
              y1={t.y}
              y2={t.y}
              stroke="#eef2f7"
              strokeWidth={1}
            />
            <text
              x={width - padX + 4}
              y={t.y + 3}
              fontSize="10"
              fill="#01051480"
              textAnchor="start"
            >
              {fmt(t.value, format)}
            </text>
          </g>
        ))}

        {xTicks.map((t, i) => (
          <text
            key={i}
            x={padX + t.i * stepX}
            y={height - 6}
            fontSize="10"
            fill="#01051480"
            textAnchor="middle"
          >
            {t.label}
          </text>
        ))}

        {fill && <path d={areaPath} fill={`url(#${gradId})`} />}
        <path d={path} fill="none" stroke={color} strokeWidth={2.5} />

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - stepX / 2}
              y={padY}
              width={stepX}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            {hover === i && (
              <>
                <line
                  x1={p.x}
                  x2={p.x}
                  y1={padY}
                  y2={padY + innerH}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.4}
                />
                <circle cx={p.x} cy={p.y} r={5} fill={color} />
                <circle cx={p.x} cy={p.y} r={2.5} fill="#fff" />
              </>
            )}
          </g>
        ))}
      </svg>

      {hover !== null && (
        <div className="px-3 py-2 bg-white border border-[#e5eaf5] rounded-xl shadow inline-flex flex-col text-xs mt-[-28px] pointer-events-none relative z-10">
          <span className="text-[#010514]/55">{data[hover].label}</span>
          <span className="font-bold text-[#010514]">
            {fmt(values[hover], format)}
          </span>
        </div>
      )}
    </div>
  );
}

// --- Dual line ------------------------------------------------------------

export function DualLineChart({
  data,
  keys,
  height = 220,
  format = "number",
}: {
  data: { label: string; [k: string]: number | string }[];
  keys: { key: string; color: string; name: string }[];
  height?: number;
  format?: ChartFormat;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const allValues = keys.flatMap((k) =>
    data.map((d) => Number(d[k.key] ?? 0))
  );
  const max = Math.max(1, ...allValues);
  const min = Math.min(0, ...allValues);
  const range = max - min || 1;

  const width = 800;
  const padX = 32;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;

  function toPath(values: number[]) {
    return values
      .map((v, i) => {
        const x = padX + i * stepX;
        const y = padY + innerH - ((v - min) / range) * innerH;
        return (i === 0 ? "M" : "L") + ` ${x} ${y}`;
      })
      .join(" ");
  }

  const xTicks =
    data.length <= 6
      ? data.map((d, i) => ({ i, label: d.label }))
      : data
          .map((d, i) =>
            i % Math.ceil(data.length / 6) === 0 ? { i, label: d.label } : null
          )
          .filter((x): x is { i: number; label: string } => !!x);

  const yTicks = [0, 0.5, 1].map((t) => ({
    y: padY + innerH - t * innerH,
    value: min + range * t,
  }));

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-3 text-xs">
        {keys.map((k) => (
          <div key={k.key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: k.color }}
            />
            <span className="text-[#010514]/70">{k.name}</span>
          </div>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
      >
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padX}
              x2={width - padX}
              y1={t.y}
              y2={t.y}
              stroke="#eef2f7"
              strokeWidth={1}
            />
            <text
              x={width - padX + 4}
              y={t.y + 3}
              fontSize="10"
              fill="#01051480"
              textAnchor="start"
            >
              {fmt(t.value, format)}
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text
            key={i}
            x={padX + t.i * stepX}
            y={height - 6}
            fontSize="10"
            fill="#01051480"
            textAnchor="middle"
          >
            {t.label}
          </text>
        ))}
        {keys.map((k) => (
          <path
            key={k.key}
            d={toPath(data.map((d) => Number(d[k.key] ?? 0)))}
            fill="none"
            stroke={k.color}
            strokeWidth={2.5}
          />
        ))}
        {data.map((_, i) => {
          const x = padX + i * stepX;
          return (
            <rect
              key={i}
              x={x - stepX / 2}
              y={padY}
              width={stepX}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          );
        })}
        {hover !== null &&
          keys.map((k) => {
            const x = padX + hover * stepX;
            const v = Number(data[hover][k.key] ?? 0);
            const y = padY + innerH - ((v - min) / range) * innerH;
            return (
              <g key={k.key}>
                <circle cx={x} cy={y} r={4} fill={k.color} />
              </g>
            );
          })}
      </svg>
      {hover !== null && (
        <div className="px-3 py-2 bg-white border border-[#e5eaf5] rounded-xl shadow inline-flex flex-col gap-1 text-xs mt-[-30px] relative z-10">
          <span className="text-[#010514]/55">{data[hover].label}</span>
          {keys.map((k) => (
            <div key={k.key} className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: k.color }}
              />
              <span className="text-[#010514]/70">{k.name}:</span>
              <span className="font-bold text-[#010514]">
                {fmt(Number(data[hover][k.key] ?? 0), format)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Bar chart ------------------------------------------------------------

export function BarChart({
  data,
  valueKey = "value",
  height = 220,
  color = "#1b3c8a",
  format = "number",
}: {
  data: { label: string; [k: string]: number | string }[];
  valueKey?: string;
  height?: number;
  color?: string;
  format?: ChartFormat;
}) {
  const values = data.map((d) => Number(d[valueKey] ?? 0));
  const max = Math.max(1, ...values);

  const width = 800;
  const padX = 32;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const barWidth = Math.max(8, (innerW / data.length) * 0.6);
  const step = innerW / Math.max(1, data.length);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      preserveAspectRatio="none"
    >
      {[0, 0.5, 1].map((t, i) => (
        <line
          key={i}
          x1={padX}
          x2={width - padX}
          y1={padY + innerH - t * innerH}
          y2={padY + innerH - t * innerH}
          stroke="#eef2f7"
          strokeWidth={1}
        />
      ))}
      {values.map((v, i) => {
        const x = padX + i * step + (step - barWidth) / 2;
        const h = (v / max) * innerH;
        const y = padY + innerH - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={h} rx={4} fill={color} />
            <text
              x={x + barWidth / 2}
              y={y - 4}
              fontSize="10"
              fill="#01051490"
              textAnchor="middle"
            >
              {fmt(v, format)}
            </text>
            <text
              x={x + barWidth / 2}
              y={height - 6}
              fontSize="10"
              fill="#01051480"
              textAnchor="middle"
            >
              {data[i].label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// --- Sparkline ------------------------------------------------------------

export function Sparkline({
  values,
  color = "#1b3c8a",
  height = 36,
}: {
  values: number[];
  color?: string;
  height?: number;
}) {
  if (values.length === 0) return null;
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;
  const width = 120;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  const path = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return (i === 0 ? "M" : "L") + ` ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <path d={path} fill="none" stroke={color} strokeWidth={1.75} />
    </svg>
  );
}

// --- Funnel ---------------------------------------------------------------

export function FunnelChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const prev = i === 0 ? d.value : data[i - 1].value;
        const conv = prev === 0 ? 0 : (d.value / prev) * 100;
        return (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-28 text-sm text-[#010514]/70">{d.label}</div>
            <div className="flex-1 h-9 bg-[#f7fafd] rounded-xl overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-l from-[#136cb5] to-[#49bbbd] flex items-center px-3 text-white text-xs font-bold transition-all"
                style={{ width: `${pct}%` }}
              >
                {faDigits(d.value)}
              </div>
            </div>
            <div className="w-20 text-xs text-[#010514]/55 text-left">
              {i === 0 ? "۱۰۰٪" : `${faDigits(conv.toFixed(1))}٪`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Donut ---------------------------------------------------------------

export function Donut({
  value,
  max = 100,
  size = 80,
  strokeWidth = 10,
  color = "#1b3c8a",
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#eef2f7"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-sm font-bold text-[#010514]">
          {faDigits(Math.round(pct))}٪
        </span>
        {label && (
          <span className="text-[10px] text-[#010514]/55">{label}</span>
        )}
      </div>
    </div>
  );
}
