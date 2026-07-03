import type {
  CourseLevelKey,
  CourseStatus,
  OrderStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UserRole,
  UserStatus,
} from "@/lib/db";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function faDigits(input: string | number) {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function toEnglishDigits(input: string) {
  return String(input)
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function formatToman(amount: number | null | undefined) {
  const n = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  return n.toLocaleString("fa-IR") + " تومان";
}

export function phoneToTelHref(phone: string): string {
  const digits = (phone || "").replace(/[^\d]/g, "");
  if (!digits) return "tel:";
  if (digits.startsWith("98")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+98${digits.slice(1)}`;
  return `tel:+${digits}`;
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

function toValidDate(ts: number | Date | string | null | undefined): Date | null {
  if (ts == null) return null;
  const d = ts instanceof Date ? ts : new Date(typeof ts === "string" ? ts : Number(ts));
  return Number.isFinite(d.getTime()) ? d : null;
}

export function formatDate(ts: number | Date | string | null | undefined) {
  const d = toValidDate(ts);
  return d ? DATE_FMT.format(d) : "—";
}

export function formatDateTime(ts: number | Date | string | null | undefined) {
  const d = toValidDate(ts);
  return d ? DATETIME_FMT.format(d) : "—";
}

export function formatRelative(ts: number | Date | string | null | undefined) {
  const d = toValidDate(ts);
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "همین الان";
  const m = Math.floor(s / 60);
  if (m < 60) return `${faDigits(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${faDigits(h)} ساعت پیش`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${faDigits(day)} روز پیش`;
  return formatDate(d);
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
  instructor: "مدرس",
  student: "دانش‌پذیر",
  sales_agent: "کارشناس فروش",
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-[#1b3c8a] text-white",
  support: "bg-[#49bbbd] text-white",
  instructor: "bg-[#d4a62a] text-white",
  student: "bg-[#eef4ff] text-[#1b3c8a]",
  sales_agent: "bg-[#7c4dff] text-white",
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

// --- Ticket labels --------------------------------------------------------

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "در انتظار پاسخ",
  pending: "منتظر شماست",
  solved: "حل شده",
  closed: "بسته شده",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  pending: "bg-sky-100 text-sky-800",
  solved: "bg-emerald-100 text-emerald-700",
  closed: "bg-neutral-200 text-neutral-600",
};

export const TICKET_STATUS_DOTS: Record<TicketStatus, string> = {
  open: "bg-amber-500",
  pending: "bg-sky-500",
  solved: "bg-emerald-500",
  closed: "bg-neutral-400",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "کم",
  normal: "معمولی",
  high: "زیاد",
  urgent: "فوری",
};

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: "bg-neutral-100 text-neutral-600",
  normal: "bg-sky-50 text-sky-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: "فنی و تکنیکال",
  billing: "پرداخت و صورتحساب",
  course: "دوره‌ها و محتوا",
  account: "حساب کاربری",
  other: "سایر موارد",
};
