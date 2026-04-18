import { cx } from "@/lib/cx";
import { faDigits } from "@/lib/formatting";
import { Sparkline } from "./Charts";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  deltaPct?: number | null;
  spark?: number[];
  tone?: "default" | "success" | "danger" | "warning";
};

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-white",
  success: "bg-green-50",
  danger: "bg-red-50",
  warning: "bg-yellow-50",
};

export default function StatCard({
  label,
  value,
  hint,
  icon,
  deltaPct,
  spark,
  tone = "default",
}: Props) {
  const delta =
    deltaPct == null || !isFinite(deltaPct)
      ? null
      : {
          pct: Math.round(deltaPct * 100),
          up: deltaPct >= 0,
        };

  return (
    <div
      className={cx(
        "p-5 rounded-3xl border border-[#e5eaf5] relative overflow-hidden",
        TONE[tone]
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-xs text-[#010514]/55">{label}</div>
        {icon && (
          <span className="w-9 h-9 rounded-xl bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-[#010514]">
        {typeof value === "number" ? faDigits(value) : value}
      </div>
      <div className="flex items-center justify-between mt-2">
        <div>
          {hint && <div className="text-xs text-[#010514]/55">{hint}</div>}
          {delta && (
            <div
              className={cx(
                "text-xs font-bold mt-0.5",
                delta.up ? "text-green-700" : "text-red-600"
              )}
            >
              {delta.up ? "▲" : "▼"} {faDigits(Math.abs(delta.pct))}٪
            </div>
          )}
        </div>
        {spark && spark.length > 1 && (
          <div className="w-24 h-9">
            <Sparkline values={spark} color="#1b3c8a" height={36} />
          </div>
        )}
      </div>
    </div>
  );
}
