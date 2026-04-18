import type {
  CourseLevelKey,
  CourseStatus,
  OrderStatus,
  UserRole,
  UserStatus,
} from "@/lib/db";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function faDigits(input: string | number) {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function formatToman(amount: number) {
  return amount.toLocaleString("fa-IR") + " تومان";
}

export function formatTomanCompact(amount: number) {
  if (amount >= 1_000_000_000) {
    return faDigits((amount / 1_000_000_000).toFixed(1)) + " میلیارد";
  }
  if (amount >= 1_000_000) {
    return faDigits((amount / 1_000_000).toFixed(1)) + " میلیون";
  }
  if (amount >= 1_000) {
    return faDigits((amount / 1_000).toFixed(0)) + " هزار";
  }
  return faDigits(amount);
}

export function formatMinutes(minutes: number) {
  if (!minutes) return "۰ دقیقه";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${faDigits(h)} ساعت ${faDigits(m)} دقیقه`;
  if (h) return `${faDigits(h)} ساعت`;
  return `${faDigits(m)} دقیقه`;
}

export function formatSeconds(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${faDigits(m)}:${faDigits(String(s).padStart(2, "0"))}`;
}

const DATE_FMT = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const DATETIME_FMT = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(ts: number | Date) {
  return DATE_FMT.format(typeof ts === "number" ? new Date(ts) : ts);
}

export function formatDateTime(ts: number | Date) {
  return DATETIME_FMT.format(typeof ts === "number" ? new Date(ts) : ts);
}

export function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "همین الان";
  const m = Math.floor(s / 60);
  if (m < 60) return `${faDigits(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${faDigits(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${faDigits(d)} روز پیش`;
  return formatDate(ts);
}

// --- Labels ---------------------------------------------------------------

export const LEVEL_LABELS: Record<CourseLevelKey, string> = {
  beginner: "مقدماتی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: "پیش‌نویس",
  published: "منتشر شده",
  archived: "بایگانی",
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-700",
  archived: "bg-neutral-200 text-neutral-600",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار پرداخت",
  paid: "موفق",
  failed: "ناموفق",
  refunded: "مسترد شده",
  partial_refund: "استرداد جزئی",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-neutral-200 text-neutral-700",
  partial_refund: "bg-orange-100 text-orange-700",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "مدیر",
  support: "پشتیبانی",
  student: "دانش‌پذیر",
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-[#1b3c8a] text-white",
  support: "bg-[#49bbbd] text-white",
  student: "bg-[#eef4ff] text-[#1b3c8a]",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "فعال",
  disabled: "غیرفعال",
};

export function formatPhone(phone: string) {
  return faDigits(phone);
}

export function percent(num: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((num / total) * 100));
}
