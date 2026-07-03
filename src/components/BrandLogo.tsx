/* eslint-disable @next/next/no-img-element */
import Link from "@/components/SafeLink";

const LOGO_MARK_SRC = "/figma/layer21.png";

type Variant = "dark" | "light";
type Size = "xs" | "sm" | "md" | "lg";

type BrandLogoProps = {
  variant?: Variant;
  size?: Size;
  showTagline?: boolean;
  href?: string | null;
  className?: string;
  ariaLabel?: string;
};

const SIZES: Record<
  Size,
  {
    text: number;
    tagline: number;
    mark: number;     // mark image width/height
    gap: number;
    tagSpace: number; // NAMDAR ACADEMY letter-spacing (em)
  }
> = {
  xs: { text: 16, tagline: 8,  mark: 34, gap: 10, tagSpace: 0.16 },
  sm: { text: 20, tagline: 9,  mark: 44, gap: 12, tagSpace: 0.18 },
  md: { text: 26, tagline: 10, mark: 56, gap: 14, tagSpace: 0.18 },
  lg: { text: 32, tagline: 12, mark: 72, gap: 16, tagSpace: 0.2  },
};

export default function BrandLogo({
  variant = "dark",
  size = "md",
  showTagline = false,
  href = "/",
  className = "",
  ariaLabel = "خانه — نامدار آکادمی",
}: BrandLogoProps) {
  const s = SIZES[size];
  const isLight = variant === "light";
  const textColor = isLight ? "#ffffff" : "#1b3c8a";
  const taglineColor = isLight ? "rgba(255,255,255,0.62)" : "rgba(27,60,138,0.58)";

  const body = (
    <span
      className={`inline-flex items-center shrink-0 ${className}`}
      style={{ gap: s.gap }}
    >
      <span className="flex flex-col items-end leading-none">
        <span
          className="font-['Yekan_Bakh:Bold',sans-serif] font-extrabold tracking-tight whitespace-nowrap"
          style={{ color: textColor, fontSize: s.text }}
        >
          نامدار آکادمی
        </span>
        {showTagline ? (
          <span
            className="font-bold whitespace-nowrap"
            style={{
              color: taglineColor,
              fontSize: s.tagline,
              letterSpacing: `${s.tagSpace}em`,
              marginTop: Math.max(4, s.text * 0.26),
              paddingRight: `${s.tagSpace}em`,
            }}
          >
            NAMDAR ACADEMY
          </span>
        ) : null}
      </span>

      {/* M-wave mark — transparent, no background card */}
      <span
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: s.mark, height: s.mark }}
        aria-hidden
      >
        <img
          src={LOGO_MARK_SRC}
          alt=""
          draggable={false}
          className="block object-contain pointer-events-none"
          style={{
            width: "100%",
            height: "100%",
            filter: isLight
              ? "drop-shadow(0 2px 6px rgba(0,0,0,0.35)) brightness(1.08)"
              : "none",
          }}
        />
      </span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group inline-flex items-center shrink-0"
        aria-label={ariaLabel}
        dir="rtl"
      >
        {body}
      </Link>
    );
  }

  return <span dir="rtl">{body}</span>;
}
