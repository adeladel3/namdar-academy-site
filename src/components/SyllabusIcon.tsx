import type { SyllabusIconKey } from "@/lib/db";

/**
 * Curated icon set for the long-form curriculum cards on course detail pages.
 *
 * The admin syllabus editor picks an `iconKey` from this list instead of
 * pasting SVG into the DB — that way the on-page rendering stays consistent
 * (size, stroke, color) and we never have to sanitise user-supplied SVG.
 *
 * When adding a new icon: also extend `SyllabusIconKey` in `src/lib/db.ts`
 * and `SYLLABUS_ICON_OPTIONS` below so the admin UI exposes it.
 */
const PATHS: Record<SyllabusIconKey, React.ReactNode> = {
  brain: (
    <>
      <path d="M9.5 3a3.5 3.5 0 00-3.45 4.07A3.5 3.5 0 005 14a3.5 3.5 0 003 3.46V20a2 2 0 002 2h0V3.5A.5.5 0 009.5 3z" />
      <path d="M14.5 3a3.5 3.5 0 013.45 4.07A3.5 3.5 0 0119 14a3.5 3.5 0 01-3 3.46V20a2 2 0 01-2 2h0V3.5a.5.5 0 01.5-.5z" />
    </>
  ),
  money: (
    <>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="2.4" />
    </>
  ),
  chart: (
    <>
      <path d="M3 17l5-6 4 3 4-7 5 4" />
      <polyline points="3 21 21 21" />
    </>
  ),
  graduation: (
    <>
      <path d="M22 10L12 4 2 10l10 6 10-6z" />
      <path d="M6 12v5a6 6 0 0012 0v-5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </>
  ),
  star: (
    <path d="M12 2l3 6 6 .8-4.5 4.2 1 6.5L12 16l-5.5 3 1-6.5L3 8.8 9 8z" />
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
      <polyline points="9 12 11 14 15 10" />
    </>
  ),
  book: (
    <>
      <path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4z" />
      <path d="M4 16a4 4 0 014-4h12" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5l3 3M9 14l-6 6 4-1 1-4-3 3M14 4a8 8 0 016 6c-1 5-4 8-9 9l-1-4-4-1c1-5 4-8 9-9z" />
      <circle cx="15" cy="9" r="1.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
};

/** Persian labels for the admin <Select>. Keep in sync with PATHS keys. */
export const SYLLABUS_ICON_OPTIONS: { value: SyllabusIconKey; label: string }[] =
  [
    { value: "brain", label: "مغز (روان‌شناسی)" },
    { value: "money", label: "پول / مدیریت سرمایه" },
    { value: "chart", label: "نمودار (تحلیل)" },
    { value: "graduation", label: "کلاه فارغ‌التحصیلی" },
    { value: "globe", label: "کره (اقتصاد کلان)" },
    { value: "star", label: "ستاره (تخصصی)" },
    { value: "shield", label: "سپر (ریسک/اعتبار)" },
    { value: "book", label: "کتاب / منابع" },
    { value: "target", label: "هدف / تمرکز" },
    { value: "rocket", label: "موشک / مسیر رشد" },
    { value: "calendar", label: "تقویم / برنامه" },
    { value: "check", label: "تیک (تکمیل)" },
  ];

export default function SyllabusIcon({
  iconKey,
  width = 20,
  height = 20,
  className,
}: {
  iconKey: SyllabusIconKey;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[iconKey] ?? PATHS.star}
    </svg>
  );
}
