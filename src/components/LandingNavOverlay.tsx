import Link from "next/link";

/* Invisible clickable overlay that sits on top of the Figma-absolute
 * positioned nav labels inside Landing.tsx. Positions are taken verbatim
 * from the Figma node coordinates (x/y in the 1920-wide canvas). */
const NAV_ITEMS = [
  { href: "/", x: 1306, w: 55, label: "خانه" },
  { href: "/about", x: 1145, w: 100, label: "درباره ما" },
  { href: "/courses", x: 994, w: 90, label: "دوره‌ها" },
  { href: "/articles", x: 845, w: 87, label: "مقالات" },
  { href: "/contact", x: 662, w: 128, label: "تماس با ما" },
];

export default function LandingNavOverlay() {
  return (
    <>
      {/* Logo → home */}
      <Link
        href="/"
        aria-label="خانه — نامدار آکادمی"
        className="absolute block"
        style={{ top: 30, left: 1440, width: 260, height: 100 }}
      />
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={item.label}
          className="absolute block"
          style={{ top: 55, left: item.x - 12, width: item.w + 24, height: 70 }}
        />
      ))}

      {/* Auth CTAs in the top-right area (above fold, near the logo) */}
      <Link
        href="/login"
        className="absolute flex items-center justify-center rounded-full border-2 border-[#1b3c8a] text-[#1b3c8a] font-bold"
        style={{
          top: 72,
          left: 380,
          width: 120,
          height: 56,
          fontSize: 20,
        }}
      >
        ورود
      </Link>
      <Link
        href="/signup"
        className="absolute flex items-center justify-center rounded-full bg-[#1b3c8a] text-white font-bold"
        style={{
          top: 72,
          left: 240,
          width: 130,
          height: 56,
          fontSize: 20,
        }}
      >
        ثبت‌نام
      </Link>
    </>
  );
}
