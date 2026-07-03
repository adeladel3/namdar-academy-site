/**
 * File-backed JSON store — extended schema for admin panel.
 *
 * Designed to map 1:1 to Prisma/Postgres later. Each mutation goes through a
 * helper that calls persist() (debounced fs.writeFile). Reads are O(1) against
 * the in-memory snapshot loaded once at module init.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { COURSES as SEED_COURSES } from "@/data/courses";
import { ARTICLES as SEED_ARTICLES } from "@/data/articles";
import { slugifyTitle } from "@/lib/slug";

// --- Types -----------------------------------------------------------------

export type UserRole =
  | "admin"
  | "support"
  | "instructor"
  | "student"
  | "sales_agent";
export type UserStatus = "active" | "disabled";

export type UserRecord = {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: number;
  lastLoginAt?: number;
  disabledAt?: number;
  disabledReason?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  // Per-user RBAC overrides. See src/lib/rbac.ts.
  // Values are AdminAction strings; stored as plain strings to avoid a
  // cyclic import between db and rbac.
  permissionGrants?: string[];
  permissionDenies?: string[];
  // Ticket-visibility scope. Without these flags an admin/support user can
  // only see tickets that match their scope (assigned to them, in their
  // category list, or for a course they admin). Super admin & senior support
  // bypass this and see everything.
  isSuperAdmin?: boolean;
  isSeniorSupport?: boolean;
  ticketCategoryScope?: string[]; // values from TicketCategory; string[] to avoid cyclic type
  /** When this user signed up via a referral link, freeze the agent + link
   *  identifiers here. Lets us count signups per link and show "referred by"
   *  in the admin user detail page. */
  referredByAgentId?: string;
  referredByLinkId?: string;
  referredAt?: number;
};

export type OtpRecord = {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt?: number;
  sendCount?: number;
  windowStartedAt?: number;
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  order: number;
  icon?: string;
  parentId?: string;
};

export type TagRecord = { id: string; name: string; slug: string };

export type CourseLevelKey = "beginner" | "intermediate" | "advanced";
export type CourseStatus = "draft" | "published" | "archived";

/** Keys for the curated icon set shown in the long-form curriculum cards on
 *  detail pages (e.g. /coaching). The page maps each key to an inline SVG
 *  so admins don't have to paste SVG markup into the DB. New keys must be
 *  added to the lookup in `src/components/SyllabusIcon.tsx` as well. */
export type SyllabusIconKey =
  | "brain"
  | "money"
  | "chart"
  | "graduation"
  | "globe"
  | "star"
  | "shield"
  | "book"
  | "target"
  | "rocket"
  | "calendar"
  | "check";

export type SyllabusSection = {
  /** Stable identifier so reorders/edits don't regenerate React keys. */
  id: string;
  title: string;
  iconKey: SyllabusIconKey;
  bullets: string[];
};

export type CourseRecord = {
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  previewImage: string;
  previewVideoUrl?: string;
  categoryId?: string;
  tagIds: string[];
  level: CourseLevelKey;
  price: number;
  discountPrice?: number;
  isFree: boolean;
  allowPurchase: boolean;
  status: CourseStatus;
  instructor: string;
  durationMinutes: number;
  studentsCount: number;
  /** When true, the public course page and listing card hide the
   *  studentsCount stat. Internal admin views still show the real number. */
  hideStudentsCount?: boolean;
  badge?: string;
  /** Accent color used on landing pills + detail hero (hex, e.g. "#00cbb8"). */
  accentColor?: string;
  /** Short banner title shown on landing pills when >1 line is needed. */
  bannerTitle?: string;
  /** 0..6 — which slot on the landing "Explore Courses" strip this course
   *  fills. Unset = not featured on landing. Each slot can only be held by
   *  one course; the API enforces uniqueness on save. */
  landingSlot?: number;
  /** When set, every click on this course (landing pill, /courses card,
   *  course detail page) redirects here instead of the usual /courses/{slug}.
   *  Use for programs with their own dedicated landing (e.g. MON → /coaching). */
  externalHref?: string;
  /** User IDs of admins/support handling tickets for this specific course.
   *  When a user picks this course in a new ticket, the ticket is auto-routed
   *  to the first id in this list (assigneeId) and every id in the list can
   *  see/answer it even without a category-wide scope. */
  supportAdminIds?: string[];
  /** Long-form curriculum shown on detail pages (e.g. /coaching for MON).
   *  Optional — if absent, the page falls back to a generic default. Edited
   *  via /admin/courses/[slug]/syllabus. */
  syllabusSections?: SyllabusSection[];
  /** Sales-agent commission percent (0..100) for this course. When set,
   *  any purchase made through a referral link snapshots this rate on the
   *  Order and computes commissionAmount = finalAmount * rate / 100. */
  agentCommissionPercent?: number;
  /** Default access duration in days, applied to new enrollments. undefined
   *  = unlimited access. Admin can override per enrollment afterwards. */
  accessDurationDays?: number;
  /** SpotPlayer course id (the hex id copied from the SpotPlayer panel for
   *  this course). When set, the course is delivered through SpotPlayer: on
   *  enrollment a license is auto-created via the SpotPlayer API and the
   *  student is sent to the license page instead of the in-site player.
   *  Empty/undefined = regular in-site course. */
  spotPlayerCourseId?: string;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
};

export type ChapterRecord = {
  id: string;
  courseSlug: string;
  title: string;
  order: number;
};

export type LessonRecord = {
  id: string;
  chapterId: string;
  courseSlug: string;
  title: string;
  videoUrl?: string;
  videoDurationSec: number;
  order: number;
  freePreview: boolean;
  content?: string;
};

export type AttachmentRecord = {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: number;
};

export type MediaAsset = {
  id: string;
  kind: "image" | "video" | "file";
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  uploadedBy: string;
  createdAt: number;
};

export type EnrollmentRecord = {
  id: string;
  userId: string;
  courseSlug: string;
  enrolledAt: number;
  source: "purchase" | "grant" | "free";
  orderId?: string;
  grantedBy?: string;
  /** Unix ms when access expires. undefined = unlimited.
   *  When set, the course detail / lesson player should refuse playback
   *  past this timestamp. Admin can edit per enrollment. */
  expiresAt?: number;
  /** Days the access was granted for at enrollment time. Snapshotted from
   *  the course's accessDurationDays so later course changes don't shift
   *  existing students' expiry. */
  durationDays?: number;
  /** SpotPlayer license issued for this enrollment (only for courses that
   *  have a spotPlayerCourseId). Created lazily/idempotently — see
   *  ensureLicenseForEnrollment() in src/lib/spotplayer.ts. */
  spotPlayer?: {
    /** SpotPlayer license id (_id from the API response). */
    licenseId: string;
    /** The license key shown to the user and pasted into the app. */
    key: string;
    /** Relative web-player URL returned by the API. */
    url: string;
    createdAt: number;
  };
  /** Last error message from a failed license-creation attempt. Lets the
   *  license page show a retry state and the admin diagnose connectivity. */
  spotPlayerError?: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partial_refund";

export type ProductType = "course" | "seminar";

export type OrderRecord = {
  id: string;
  userId: string;
  /** نوع محصول. اگر تنظیم نشده باشد، به ازای سازگاری با سفارش‌های قدیمی
   *  «course» در نظر گرفته می‌شود. */
  productType?: ProductType;
  /** برای سفارش‌های دوره. در حالت سمینار خالی است یا برابر با seminarSlug
   *  می‌ماند (برای سازگاری با گزارش‌های قدیمی). */
  courseSlug: string;
  /** فقط برای سفارش‌های سمینار. */
  seminarSlug?: string;
  /** اطلاعات شناسایی خریدار سمینار که هنگام رزرو صندلی وارد می‌شود.
   *  این داده‌ها روی سفارش فریز می‌شوند تا تغییرات بعدی پروفایل کاربر،
   *  اطلاعات ثبت‌نام سمینار را عوض نکنند. */
  buyerFullName?: string;
  buyerNationalId?: string;
  buyerPhone?: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod: "sep" | "manual" | "grant";
  refNum?: string;
  authority?: string;
  traceNo?: string;
  securePan?: string;
  hashedCardNumber?: string;
  couponCode?: string;
  createdAt: number;
  paidAt?: number;
  refundedAt?: number;
  refundAmount?: number;
  refundReason?: string;
  // Referral attribution — captured from cookie at checkout time and frozen
  // on the order so later changes to the agent's referral code don't
  // retroactively alter past sales.
  referralCode?: string;
  agentId?: string;
  /** The specific ReferralLinkRecord that was used. Lets us show
   *  per-link conversion stats. */
  referralLinkId?: string;
  /** Percent (0..100) snapshotted from the course at purchase time. */
  commissionRate?: number;
  /** Final commission in toman. agentId is set together with this. */
  commissionAmount?: number;
};

export type VideoProgressRecord = {
  userId: string;
  lessonId: string;
  courseSlug: string;
  positionSec: number;
  maxPositionSec: number;
  watchedSec: number;
  watchCount: number;
  completed: boolean;
  firstWatchedAt: number;
  lastWatchedAt: number;
};

export type WatchEvent = {
  id: string;
  userId: string;
  lessonId: string;
  sessionId: string;
  type: "play" | "pause" | "seek" | "progress" | "end";
  positionSec: number;
  timestamp: number;
};

export type SiteSetting = {
  key: string;
  value: unknown;
  updatedBy: string;
  updatedAt: number;
};

export type AuditLogEntry = {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  timestamp: number;
};

export type NewsletterSub = { email: string; subscribedAt: number };

export type CallbackRequestStatus = "new" | "contacted" | "archived";

export type CallbackRequest = {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  topic?: string;
  preferredTime?: string;
  note?: string;
  relatedCourseSlug?: string;
  source: string;
  status: CallbackRequestStatus;
  createdAt: number;
  contactedAt?: number;
  contactedBy?: string;
};

export type TestimonialRecord = {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  quote: string;
  published: boolean;
  order: number;
  createdAt: number;
};

// «دسترسی پنل پرسش‌وپاسخ دوره» — جدا از enrollment نگه داشته می‌شود تا
// ادمین بتواند به یک کاربر دسترسی Q&A یک دوره را بدهد بدون اینکه محتوای
// دوره را هم به او باز کند. فعال شدن خودکار: کاربری که enroll است
// (purchase/grant/free) خودکار دسترسی Q&A دارد — این جدول فقط grant های
// «فقط پرسش‌وپاسخ» را track می‌کند.
export type CourseQAAccessRecord = {
  id: string; // ${userId}__${courseSlug}
  userId: string;
  courseSlug: string;
  grantedAt: number;
  grantedBy: string;
  note?: string;
};

// «دیوار افتخارات» — گالری تصاویر و ویدئوهای موفقیت دانش‌پذیران که در
// انتهای صفحه فرود نمایش داده می‌شود.
export type WallOfFameItem = {
  id: string;
  kind: "image" | "video";
  url: string;
  posterUrl?: string; // برای video — تصویر پیش‌نمایش قبل از پخش
  caption?: string;
  studentName?: string;
  order: number;
  published: boolean;
  createdAt: number;
};

export type FaqRecord = {
  id: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
};

export type DiscountCode = {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  maxUses?: number;
  uses: number;
  expiresAt?: number;
  courseSlug?: string;
  active: boolean;
  createdAt: number;
};

export type CourseReview = {
  id: string;
  userId: string;
  courseSlug: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: number;
};

export type ArticleRecord = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  readMinutes: number;
  published: boolean;
  authorId?: string;
  // --- SEO overrides (all optional; fall back to sensible defaults) --------
  /** Custom <title> for search engines; falls back to `title`. 50–60 chars ideal. */
  seoTitle?: string;
  /** Custom meta description; falls back to `excerpt`. 150–160 chars ideal. */
  metaDescription?: string;
  /** Focus keyword the article is optimized for — internal guidance only. */
  focusKeyword?: string;
  /** Free-form tags used for related articles + Schema.org keywords. */
  tags?: string[];
  /** Display name of the author (shown in search snippets). */
  authorName?: string;
  /** Separate image for social shares; falls back to `coverImage`. 1200×630 ideal. */
  ogImage?: string;
  /** When true, emits `<meta name="robots" content="noindex,nofollow">`. */
  noindex?: boolean;
  /** Override canonical URL (e.g. for syndicated content); usually empty. */
  canonicalUrl?: string;
  // -------------------------------------------------------------------------
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
};

// --- Static pages (T&C, purchase guide, calculator promo, ...) --------------

export type StaticPageRecord = {
  slug: string;
  title: string;
  summary: string;
  body: string; // HTML
  published: boolean;
  legacyId?: number;
  createdAt: number;
  updatedAt: number;
};

// --- Ticketing -------------------------------------------------------------

export type TicketStatus =
  | "open" // waiting for staff
  | "pending" // waiting for user
  | "solved" // staff marked resolved, user not yet confirmed
  | "closed"; // archived / user confirmed

export type TicketPriority = "low" | "normal" | "high" | "urgent";

export type TicketCategory =
  | "technical"
  | "billing"
  | "course"
  | "account"
  | "other";

export type TicketRecord = {
  id: string;
  userId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigneeId?: string;
  relatedCourseSlug?: string;
  /** اگر تیکت مربوط به یک سمینار حضوری باشد، slug سمینار اینجا ذخیره
   *  می‌شود. مشابه relatedCourseSlug؛ یکی از این دو پر می‌شود نه هر دو. */
  relatedSeminarSlug?: string;
  relatedOrderId?: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  lastMessageByRole: "user" | "staff";
  unreadForStaff: number;
  unreadForUser: number;
  resolvedAt?: number;
  closedAt?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  ratingComment?: string;
  ratedAt?: number;
};

export type TicketAttachment = {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

export type TicketMessageRecord = {
  id: string;
  ticketId: string;
  authorId: string;
  authorRole: "user" | "staff";
  body: string;
  internal: boolean;
  attachments?: TicketAttachment[];
  createdAt: number;
};

/** One step in an agent's tiered commission schedule. The agent's
 *  cumulative sales (within the chosen period) decides which tier applies;
 *  the WHOLE period's revenue is then multiplied by that tier's `percent`
 *  retroactively. So if the agent passes a higher tier mid-month, every
 *  earlier sale that month is recomputed at the new rate too. */
export type CommissionTier = {
  /** Inclusive lower bound in toman. The tier with the highest
   *  `atLeastToman` value that is ≤ the period's total wins. */
  atLeastToman: number;
  /** 0..100, applied to the entire period's revenue. */
  percent: number;
};

/** Sales agent — a person who promotes courses via a referral code. Linked
 *  to a UserRecord (role="sales_agent") so they can log into the dashboard
 *  and view their own sales. The userId may be undefined for "external"
 *  agents who don't have a site account yet. */
export type SalesAgentRecord = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  /** Optional link to a UserRecord. When set, this user can log in and view
   *  their own dashboard. When unset, the agent exists only as an
   *  attribution target visible to admins. */
  userId?: string;
  /** Unique, case-insensitive referral code (e.g. "MONA10", "SALE-ALI").
   *  Stored as written by admin; matching is done case-insensitively. */
  referralCode: string;
  isActive: boolean;
  notes?: string;
  /** Tiered commission schedule. Stored sorted ascending by
   *  `atLeastToman`. When empty/undefined the agent earns 0% via the tier
   *  system — but legacy per-order `commissionAmount` snapshots (from the
   *  old per-course `agentCommissionPercent`) still show in the order
   *  table. The tier system is the source of truth for monthly payouts. */
  commissionTiers?: CommissionTier[];
  /** Window over which sales are accumulated to pick a tier. Defaults to
   *  the current calendar month — the typical sales-commission cycle. */
  commissionPeriod?: "month" | "all_time";
  createdAt: number;
  updatedAt: number;
};

/** A specific tracking link an agent built. One agent can have many — each
 *  with its own label/UTM/landing so they can measure which channel works.
 *  Every agent gets a "default" link auto-created when they're added; the
 *  default link has label "اصلی" and no UTM. */
export type ReferralLinkRecord = {
  id: string;
  agentId: string;
  /** Human-readable label set by the agent ("تلگرام", "اینستاگرام", ...). */
  label: string;
  /** Optional override of where the visitor lands. Default = site root. */
  landingPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /** Counters maintained by the /r/[id] route and registration hook. */
  clicks: number;
  /** Number of distinct users who registered after clicking. */
  signups: number;
  /** Number of paid orders attributed to this specific link. */
  paidOrders: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};

// --- Seminars (rich product type with separate front/landing + member-area
// content). Designed independently from CourseRecord because:
//  ١) ماهیت محصول حضوری متفاوت است (تاریخ/مکان/ظرفیت/کد ملی/QR).
//  ٢) ادمین می‌خواهد دو ناحیه‌ی محتوای کاملاً مجزا را مدیریت کند:
//      - landing: همان لندینگ عمومی که هر بازدیدکننده می‌بیند.
//      - member:  بسته‌ی محتوای پس‌از‌خرید که فقط ثبت‌نام‌شدگان می‌بینند.
//  ٣) سرفصل/درس/پیشرفت مثل دوره‌های آنلاین لازم نیست.

export type SeminarMediaKind = "image" | "video" | "file" | "link" | "embed";

/** بلوک محتوایی قابل آپلود از پنل ادمین. هر بلوک یک کارت در صفحه‌ی هدف
 *  (لندینگ یا پنل کاربری) می‌سازد. سفارش نمایش با فیلد `order`. */
export type SeminarContentBlock = {
  id: string;
  kind: SeminarMediaKind;
  /** عنوان نمایشی روی کارت. */
  title: string;
  /** متن توضیحی یا کپشن. */
  description?: string;
  /** آدرس فایل/تصویر/ویدیو/لینک خارجی. برای embed: کد embed. */
  url?: string;
  /** پیش‌نمایش (برای ویدیو). */
  posterUrl?: string;
  /** ترتیب نمایش — کوچکتر بالاتر. */
  order: number;
  /** اگر false باشد، بلوک از لیست محتوا حذف نمی‌شود ولی روی صفحه نمایش
   *  داده نمی‌شود. */
  visible: boolean;
  createdAt: number;
  updatedAt: number;
};

export type SeminarRecord = {
  slug: string;
  /** عنوان اصلی صفحه و پنل ادمین. */
  title: string;
  /** عنوان کوتاه برای کارت/شناسایی. */
  shortTitle?: string;
  /** توضیح یک‌خطی برای متاتگ‌ها و کارت‌های لیست. */
  shortDesc: string;
  /** قیمت ثبت‌نام به تومان. */
  price: number;
  /** قیمت با تخفیف اختیاری. */
  discountPrice?: number;
  /** آیا فروش این سمینار فعلاً فعال است؟ وقتی false باشد، دکمه‌ی «رزرو
   *  صندلی» در صفحه‌ی لندینگ غیرفعال می‌شود. */
  allowPurchase: boolean;
  status: "draft" | "published" | "archived";
  /** تاریخ برگزاری به‌صورت رشته‌ی ISO (`2026-06-11T18:00:00+03:30`). در
   *  صفحه‌ی لندینگ به فارسی فرمت می‌شود. */
  eventDate?: string;
  /** نام مکان (مثل «سالن همایش‌های سیتی سنتر اصفهان»). */
  venueName?: string;
  /** آدرس کامل برای QR / پنل خریدار. */
  venueAddress?: string;
  /** پیوند نقشه (Google Maps / Neshan). */
  venueMapUrl?: string;
  /** ظرفیت کلی صندلی‌ها. صرفاً برای نمایش — رزرو پس از پر شدن همچنان
   *  انجام می‌شود مگر `allowPurchase` خاموش بشود. */
  capacity?: number;
  /** آیا تعداد رزروشده در پنل خریداران نمایش داده شود؟ */
  showCapacityCounter: boolean;
  /** تصویر اصلی هیرو. */
  heroImage?: string;
  /** ویدیوی معرفی (در فرم رزرو پشت دکمه پلی نمایش داده می‌شود). */
  heroVideoUrl?: string;
  /** متن طولانی توضیح سمینار — می‌تواند HTML باشد. */
  longDesc?: string;
  /** نام و معرفی کوتاه مدرس. */
  instructorName?: string;
  instructorBio?: string;
  instructorImage?: string;
  /** مسئول مالی/پشتیبانی برای نمایش روی پنل خریدار. */
  supportPhone?: string;
  supportTelegram?: string;
  /** بلوک‌های محتوای لندینگ عمومی (که توسط ادمین آپلود می‌شود). */
  landingBlocks?: SeminarContentBlock[];
  /** بلوک‌های محتوای پس‌از‌خرید (PDF، ویدیو، QR، راهنما، اطلاعیه...). */
  memberBlocks?: SeminarContentBlock[];

  /** آی‌دی ادمین/پشتیبان‌هایی که مسئول پاسخ‌دهی به تیکت‌های این سمینار
   *  هستند. وقتی کاربری در فرم تیکت این سمینار را انتخاب کند، تیکت
   *  خودکار به نفر اول این لیست ارجاع می‌شود و همه‌ی افراد لیست در
   *  پنل خود اون تیکت را می‌بینند. */
  supportAdminIds?: string[];

  // ─── محتوای ساختارمند لندینگ — طبق طرح PDF کاربر ─────────────────────
  /** خط بالای عنوان در هیرو (مثلاً «بعد از سال‌ها …»). */
  heroEyebrow?: string;
  /** زیرعنوان در هیرو (مثلاً «سمینار ترید طلا در سال ۱۴۰۵»). */
  heroSubtitle?: string;
  /** متن وعده‌ی هیرو — جای longDesc کوتاه. */
  heroPromise?: string;
  /** عنوان بخش سؤالات pain point. */
  painPointsTitle?: string;
  /** فهرست سؤالاتی که سمینار به آن‌ها پاسخ می‌دهد. */
  painPoints?: string[];
  /** نقل قول کوتاه از مدرس روی صفحه (شعار). */
  instructorTagline?: string;
  /** لیست آمار مدرس (مثل «بیش از ۱ میلیون دانش‌پذیر»). */
  instructorStats?: string[];
  /** عنوان بخش قبل/بعد. */
  beforeAfterTitle?: string;
  /** ردیف‌های جدول مقایسه قبل/بعد سمینار. */
  beforeAfter?: { before: string; after: string }[];
  /** عنوان بخش CTA نهایی. */
  finalCtaTitle?: string;
  /** پاراگراف توضیحی بخش CTA نهایی. */
  finalCtaDescription?: string;

  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
};

/** ثبت‌نام یک کاربر در یک سمینار. مشابه EnrollmentRecord برای دوره‌ها،
 *  ولی اطلاعات شناسنامه‌ای خریدار را نگه می‌دارد چون برای ورود به سالن
 *  لازم است. */
export type SeminarRegistrationRecord = {
  id: string;
  userId: string;
  seminarSlug: string;
  /** نام و نام خانوادگی مطابق شناسنامه — همان چیزی که کاربر در پاپ‌آپ
   *  وارد کرده است. */
  fullName: string;
  /** کد ملی ۱۰ رقمی (فقط ارقام انگلیسی). */
  nationalId: string;
  /** شماره‌ی موبایل تأییدشده با OTP. */
  phone: string;
  /** سفارش مرتبط — برای ردیابی مالی. */
  orderId?: string;
  /** کد QR یکتا برای ورود به سالن. اگر null باشد یعنی هنوز صادر نشده. */
  qrCode?: string;
  /** آیا روز سمینار حضور یافته؟ (admin marks). */
  attended?: boolean;
  registeredAt: number;
  source: "purchase" | "grant";
  grantedBy?: string;
};

type Snapshot = {
  version: 2;
  users: Record<string, UserRecord>;
  otps: Record<string, OtpRecord>;
  categories: Record<string, CategoryRecord>;
  tags: Record<string, TagRecord>;
  courses: Record<string, CourseRecord>;
  chapters: Record<string, ChapterRecord>;
  lessons: Record<string, LessonRecord>;
  attachments: Record<string, AttachmentRecord>;
  media: Record<string, MediaAsset>;
  enrollments: Record<string, EnrollmentRecord>;
  orders: Record<string, OrderRecord>;
  videoProgress: Record<string, VideoProgressRecord>;
  watchEvents: WatchEvent[];
  settings: Record<string, SiteSetting>;
  auditLog: AuditLogEntry[];
  newsletterSubs: Record<string, NewsletterSub>;
  testimonials: Record<string, TestimonialRecord>;
  courseQAAccess: Record<string, CourseQAAccessRecord>;
  wallOfFame: Record<string, WallOfFameItem>;
  faqs: Record<string, FaqRecord>;
  discounts: Record<string, DiscountCode>;
  reviews: Record<string, CourseReview>;
  articles: Record<string, ArticleRecord>;
  staticPages: Record<string, StaticPageRecord>;
  callbackRequests: Record<string, CallbackRequest>;
  tickets: Record<string, TicketRecord>;
  ticketMessages: Record<string, TicketMessageRecord>;
  salesAgents: Record<string, SalesAgentRecord>;
  referralLinks: Record<string, ReferralLinkRecord>;
  seminars: Record<string, SeminarRecord>;
  seminarRegistrations: Record<string, SeminarRegistrationRecord>;
};

// --- Storage ---------------------------------------------------------------

const DB_PATH = path.resolve(
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "namdar.db.json")
);

function emptySnapshot(): Snapshot {
  return {
    version: 2,
    users: {},
    otps: {},
    categories: {},
    tags: {},
    courses: {},
    chapters: {},
    lessons: {},
    attachments: {},
    media: {},
    enrollments: {},
    orders: {},
    videoProgress: {},
    watchEvents: [],
    settings: {},
    auditLog: [],
    newsletterSubs: {},
    testimonials: {},
    courseQAAccess: {},
    wallOfFame: {},
    faqs: {},
    discounts: {},
    reviews: {},
    articles: {},
    staticPages: {},
    callbackRequests: {},
    tickets: {},
    ticketMessages: {},
    salesAgents: {},
    referralLinks: {},
    seminars: {},
    seminarRegistrations: {},
  };
}

// --- v1 → v2 migration -----------------------------------------------------

type LegacySnapshotV1 = {
  version: 1;
  users?: Record<
    string,
    { id: string; phone: string; name: string; role: "user" | "admin"; createdAt?: number }
  >;
  otps?: Record<string, OtpRecord>;
  orders?: Record<
    string,
    {
      id: string;
      userId: string;
      courseSlug: string;
      amount: number;
      status: "pending" | "paid" | "failed";
      refId?: string;
      authority?: string;
      createdAt: number;
    }
  >;
  enrollments?: Record<string, string[]>;
  courses?: Record<
    string,
    {
      slug: string;
      title: string;
      shortDesc: string;
      longDesc: string;
      level: string;
      price: number;
      discountPrice?: number;
      duration: string;
      lessons: number;
      students: number;
      instructor: string;
      image: string;
      badge?: string;
      chapters: { title: string; lessons: string[] }[];
    }
  >;
  lessons?: Record<
    string,
    {
      id: string;
      courseSlug: string;
      chapter: string;
      title: string;
      order: number;
      videoUrl?: string;
      durationSec?: number;
      freePreview?: boolean;
    }
  >;
  progress?: Record<
    string,
    { userId: string; lessonId: string; completed: boolean; positionSec: number; updatedAt: number }
  >;
};

function levelKey(lvl: string): CourseLevelKey {
  if (lvl === "مقدماتی") return "beginner";
  if (lvl === "متوسط") return "intermediate";
  if (lvl === "پیشرفته") return "advanced";
  return "beginner";
}

function migrateV1toV2(old: LegacySnapshotV1): Snapshot {
  const next = emptySnapshot();

  for (const [id, u] of Object.entries(old.users ?? {})) {
    next.users[id] = {
      id: u.id,
      phone: u.phone,
      name: u.name,
      role: u.role === "admin" ? "admin" : "student",
      status: "active",
      createdAt: u.createdAt ?? Date.now(),
    };
  }

  next.otps = { ...(old.otps ?? {}) };

  const now = Date.now();
  const chapterIdCache: Record<string, string> = {}; // key: `${slug}:::${chapterTitle}` → chapterId

  for (const [slug, c] of Object.entries(old.courses ?? {})) {
    next.courses[slug] = {
      slug,
      title: c.title,
      shortDesc: c.shortDesc,
      longDesc: c.longDesc,
      previewImage: c.image,
      categoryId: undefined,
      tagIds: [],
      level: levelKey(c.level),
      price: c.price,
      discountPrice: c.discountPrice,
      isFree: c.price === 0,
      allowPurchase: true,
      status: "published",
      instructor: c.instructor,
      durationMinutes: 0,
      studentsCount: c.students ?? 0,
      badge: c.badge,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    };

    c.chapters.forEach((ch, ci) => {
      const chId = `ch_${slug}_${ci}`;
      chapterIdCache[`${slug}:::${ch.title}`] = chId;
      next.chapters[chId] = {
        id: chId,
        courseSlug: slug,
        title: ch.title,
        order: ci,
      };
    });
  }

  for (const [id, l] of Object.entries(old.lessons ?? {})) {
    const chId = chapterIdCache[`${l.courseSlug}:::${l.chapter}`];
    if (!chId) continue;
    next.lessons[id] = {
      id,
      chapterId: chId,
      courseSlug: l.courseSlug,
      title: l.title,
      videoUrl: l.videoUrl,
      videoDurationSec: l.durationSec ?? 0,
      order: l.order,
      freePreview: l.freePreview === true,
    };
  }

  let eidx = 0;
  for (const [userId, slugs] of Object.entries(old.enrollments ?? {})) {
    for (const slug of slugs) {
      const id = `enr_${eidx++}_${userId.slice(-4)}`;
      next.enrollments[id] = {
        id,
        userId,
        courseSlug: slug,
        enrolledAt: now,
        source: "purchase",
      };
    }
  }

  for (const [id, o] of Object.entries(old.orders ?? {})) {
    next.orders[id] = {
      id,
      userId: o.userId,
      courseSlug: o.courseSlug,
      amount: o.amount,
      discountAmount: 0,
      finalAmount: o.amount,
      status: o.status,
      paymentMethod: o.refId?.startsWith("DEV-") ? "manual" : "sep",
      refNum: o.refId,
      authority: o.authority,
      createdAt: o.createdAt,
      paidAt: o.status === "paid" ? o.createdAt : undefined,
    };
  }

  for (const [, p] of Object.entries(old.progress ?? {})) {
    const lesson = next.lessons[p.lessonId];
    if (!lesson) continue;
    const key = `${p.userId}:${p.lessonId}`;
    next.videoProgress[key] = {
      userId: p.userId,
      lessonId: p.lessonId,
      courseSlug: lesson.courseSlug,
      positionSec: p.positionSec,
      maxPositionSec: p.positionSec,
      watchedSec: p.positionSec,
      watchCount: 1,
      completed: p.completed,
      firstWatchedAt: p.updatedAt,
      lastWatchedAt: p.updatedAt,
    };
  }

  return next;
}

function load(): Snapshot {
  // ابتدا فایل اصلی، سپس آخرین بک‌آپ سالم (در صورت corruption).
  const candidates = [DB_PATH, `${DB_PATH}.bak`];
  for (const filePath of candidates) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as Snapshot | LegacySnapshotV1;
      if ((parsed as Snapshot).version === 2) {
        if (filePath !== DB_PATH) {
          console.warn(
            `[db] فایل اصلی (${DB_PATH}) corrupt بود؛ از بک‌آپ ${filePath} بازیابی شد.`
          );
        }
        return ensureSchema(parsed as Snapshot);
      }
      if ((parsed as LegacySnapshotV1).version === 1) {
        console.log("[db] migrating v1 → v2");
        const migrated = migrateV1toV2(parsed as LegacySnapshotV1);
        try {
          fs.writeFileSync(DB_PATH + ".v1.bak", raw);
        } catch {}
        return ensureSchema(migrated);
      }
    } catch {
      /* فایل بعدی را امتحان کن */
    }
  }
  return emptySnapshot();
}

/** Add any v2 sub-trees that were introduced after the on-disk snapshot was
 *  last written. Pure additive — never removes or rewrites existing data,
 *  so we never need to bump the version for new optional tables. */
function ensureSchema(snap: Snapshot): Snapshot {
  // Cast: older on-disk snapshots may legitimately miss newly-added tables.
  const s = snap as unknown as Partial<Snapshot> & Snapshot;
  if (!s.salesAgents) s.salesAgents = {};
  if (!s.referralLinks) s.referralLinks = {};
  if (!s.seminars) s.seminars = {};
  if (!s.seminarRegistrations) s.seminarRegistrations = {};
  return s;
}

declare global {
  // eslint-disable-next-line no-var
  var __namdar_db: Snapshot | undefined;
  // eslint-disable-next-line no-var
  var __namdar_db_timer: NodeJS.Timeout | undefined;
  // eslint-disable-next-line no-var
  var __namdar_db_mtime: number | undefined;
  // eslint-disable-next-line no-var
  var __namdar_db_lastcheck: number | undefined;
  // eslint-disable-next-line no-var
  var __namdar_db_fingerprint: string | undefined;
}

// Discard any cached global that doesn't match current schema version (e.g. from
// HMR after schema change). This forces a fresh load() on next access.
if (globalThis.__namdar_db && globalThis.__namdar_db.version !== 2) {
  globalThis.__namdar_db = undefined;
}

// Also discard the cached snapshot if the seed defaults are stale (placeholder
// contact values left from an older boot). The subsequent load() will re-read
// disk, and the placeholder-migration block below will clean anything left.
if (
  globalThis.__namdar_db &&
  (globalThis.__namdar_db.settings?.["site.contactPhone"]?.value === "021-00000000" ||
    globalThis.__namdar_db.settings?.["site.contactEmail"]?.value === "info@namdar.academy")
) {
  globalThis.__namdar_db = undefined;
}

const db: Snapshot = globalThis.__namdar_db ?? (globalThis.__namdar_db = load());

// Record the mtime we loaded so later reads can detect external edits.
try {
  globalThis.__namdar_db_mtime ??= fs.statSync(DB_PATH).mtimeMs;
} catch {
  /* file may not exist yet — first write will create it */
}

/**
 * Re-read the on-disk JSON if it has been modified since the last load.
 * This fixes the dev-time edge case where the in-memory snapshot goes stale
 * because the JSON file was edited outside the running Node process
 * (manual edit, git checkout, external script, etc.). Throttled to once
 * per 500ms so it doesn't add a syscall to every single read.
 *
 * Mutates `db` in place so existing closures keep pointing at the fresh data.
 */
function syncFromDisk() {
  const now = Date.now();
  if (
    globalThis.__namdar_db_lastcheck !== undefined &&
    now - globalThis.__namdar_db_lastcheck < 500
  ) {
    return;
  }
  globalThis.__namdar_db_lastcheck = now;

  try {
    const mtime = fs.statSync(DB_PATH).mtimeMs;
    if (globalThis.__namdar_db_mtime === mtime) return;

    // A persist() we triggered will also update the file's mtime — don't
    // clobber the in-memory state if there's a pending debounce write.
    if (globalThis.__namdar_db_timer) return;

    const fresh = load();
    for (const k of Object.keys(db)) {
      delete (db as unknown as Record<string, unknown>)[k];
    }
    Object.assign(db, fresh);
    globalThis.__namdar_db_mtime = mtime;
  } catch {
    /* stat failed — leave the in-memory state as-is */
  }
}

/**
 * نوشتن اسنپ‌شات روی دیسک.
 *
 * بهینه‌سازی‌ها:
 *   - debounce 150ms (تجمیع چند mutation متوالی در یک fs write).
 *   - skip در صورتی که payload عملاً برابر آخرین payload نوشته‌شده باشد
 *     (با hash MD5 سریع، نه با diff عمیق).
 *   - نوشتن اتمیک: writeFile → fsync → rename. در حالت قبلی، اگر سرور
 *     در میانه‌ی writeFileSync کشته می‌شد، فایل JSON نیم‌نوشته باقی
 *     می‌ماند و در راه‌اندازی بعدی هیچ داده‌ای لود نمی‌شد.
 *   - گرفتن بک‌آپ rolling از آخرین snapshot سالم (data/db.json.bak).
 */
function computeFingerprint(payload: string): string {
  return crypto.createHash("md5").update(payload).digest("hex");
}

function persist() {
  if (globalThis.__namdar_db_timer) return;
  globalThis.__namdar_db_timer = setTimeout(() => {
    globalThis.__namdar_db_timer = undefined;
    try {
      const payload = JSON.stringify(db);
      const fingerprint = computeFingerprint(payload);
      if (globalThis.__namdar_db_fingerprint === fingerprint) {
        // هیچ تغییری نسبت به آخرین نوشتن نیست — فقط چند الومنت با مقدار
        // یکسان دوباره ست شده‌اند. از write خودداری می‌کنیم.
        return;
      }
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      const tmp = `${DB_PATH}.tmp`;
      fs.writeFileSync(tmp, payload, "utf8");
      // اتمیک: rename داخل همان پارتیشن atomic است؛ اگر سرور حین نوشتن
      // tmp کشته شود فایل اصلی دست‌نخورده باقی می‌ماند.
      try {
        if (fs.existsSync(DB_PATH)) {
          fs.copyFileSync(DB_PATH, `${DB_PATH}.bak`);
        }
      } catch {
        /* بک‌آپ ناموفق مانع save اصلی نمی‌شود */
      }
      fs.renameSync(tmp, DB_PATH);
      try {
        globalThis.__namdar_db_mtime = fs.statSync(DB_PATH).mtimeMs;
      } catch {}
      globalThis.__namdar_db_fingerprint = fingerprint;
    } catch (e) {
      console.error("[db] persist failed:", (e as Error).message);
    }
  }, 150);
}

// --- Seeding ---------------------------------------------------------------

// \u0627\u0632 helper \u06CC\u06A9\u067E\u0627\u0631\u0686\u0647 `slugifyTitle` (import \u062F\u0631 \u0628\u0627\u0644\u0627\u06CC \u0641\u0627\u06CC\u0644) \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F \u062A\u0627
// \u0647\u0645\u0647 \u062C\u0627\u06CC \u0633\u0627\u06CC\u062A \u0622\u062F\u0631\u0633\u200C\u0647\u0627 \u0628\u0647 \u06CC\u06A9 \u0634\u06A9\u0644 \u0633\u0627\u062E\u062A\u0647 \u0634\u0648\u0646\u062F (\u0641\u0627\u0631\u0633\u06CC \u0646\u06AF\u0647 \u062F\u0627\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F\u060C
// \u0646\u0647 \u0641\u06CC\u0646\u06AF\u06CC\u0644\u06CC\u0634).
function slugify(s: string) {
  return slugifyTitle(s);
}

function seedIfEmpty() {
  const now = Date.now();

  // Defensive: ensure all top-level tables exist (in case a partial or legacy
  // snapshot leaked through).
  db.users ??= {};
  db.otps ??= {};
  db.categories ??= {};
  db.tags ??= {};
  db.courses ??= {};
  db.chapters ??= {};
  db.lessons ??= {};
  db.attachments ??= {};
  db.media ??= {};
  db.enrollments ??= {};
  db.orders ??= {};
  db.videoProgress ??= {};
  db.watchEvents ??= [];
  db.settings ??= {};
  db.auditLog ??= [];
  db.newsletterSubs ??= {};
  db.testimonials ??= {};
  db.courseQAAccess ??= {};
  db.wallOfFame ??= {};
  db.faqs ??= {};
  db.discounts ??= {};
  db.reviews ??= {};
  db.articles ??= {};
  db.staticPages ??= {};
  db.callbackRequests ??= {};
  db.tickets ??= {};
  db.ticketMessages ??= {};

  if (Object.keys(db.categories).length === 0) {
    const cats = [
      { name: "ترید", order: 0 },
      { name: "سرمایه‌گذاری", order: 1 },
      { name: "روان‌شناسی", order: 2 },
      { name: "تحلیل تکنیکال", order: 3 },
    ];
    for (const c of cats) {
      const id = `cat_${slugify(c.name)}`;
      db.categories[id] = { id, name: c.name, slug: slugify(c.name), order: c.order };
    }
    persist();
  }

  if (Object.keys(db.courses).length === 0) {
    for (const c of SEED_COURSES) {
      const slug = c.slug;
      db.courses[slug] = {
        slug,
        title: c.title,
        shortDesc: c.shortDesc,
        longDesc: c.longDesc,
        previewImage: c.image,
        tagIds: [],
        level: levelKey(c.level),
        price: c.price,
        discountPrice: c.discountPrice,
        isFree: c.price === 0,
        allowPurchase: true,
        status: "published",
        instructor: c.instructor,
        durationMinutes: 0,
        studentsCount: c.students,
        badge: c.badge,
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      };
      c.chapters.forEach((ch, ci) => {
        const chId = `ch_${slug}_${ci}`;
        db.chapters[chId] = {
          id: chId,
          courseSlug: slug,
          title: ch.title,
          order: ci,
        };
        ch.lessons.forEach((title, li) => {
          const id = `${slug}-${ci}-${li}`;
          db.lessons[id] = {
            id,
            chapterId: chId,
            courseSlug: slug,
            title,
            order: li,
            videoDurationSec: 0,
            freePreview: ci === 0 && li === 0,
          };
        });
      });
    }
    persist();
  }

  if (Object.keys(db.settings).length === 0) {
    const defaults: Record<string, unknown> = {
      "site.title": "نامدار آکادمی",
      "site.tagline": "مرجع آموزش ترید و سرمایه‌گذاری",
      "site.contactEmail": "info@namdaracademy.com",
      "site.contactPhone": "021-9100-8222",
      "site.address": "تهران، ایران\nلندن، انگلستان\nدبی، امارات",
      "site.contactTelegram": "namdaracademy",
      "site.contactWhatsapp": "989354013025",
      "site.contactHours": "شنبه تا پنج‌شنبه · ۹:۰۰ تا ۱۸:۰۰",
      "branding.primaryColor": "#1b3c8a",
      "branding.accentColor": "#f7cf5a",
      "branding.logoUrl": "",
      "branding.fontFamily": "Vazirmatn",
      "payment.provider": "sep",
      "payment.sepTerminalId": "",
      "payment.callbackBaseUrl": "",
      "sms.provider": "kavenegar",
      "sms.apiKey": "",
      "sms.senderLine": "",
      "sms.otpTemplate": "",
      "sms.otpPatternName": "",
      "email.provider": "smtp",
      "email.from": "noreply@namdar.academy",
      "email.smtpHost": "",
      "email.smtpPort": 587,
      "email.smtpUser": "",
      "email.smtpPass": "",
      "chat.provider": "off",
      "chat.apiKey": "",
    };
    for (const [key, value] of Object.entries(defaults)) {
      db.settings[key] = {
        key,
        value,
        updatedBy: "system",
        updatedAt: now,
      };
    }
    persist();
  }

  if (Object.keys(db.articles).length === 0 && SEED_ARTICLES.length > 0) {
    for (const a of SEED_ARTICLES) {
      db.articles[a.slug] = {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        category: a.category,
        coverImage: a.image,
        readMinutes: a.readMinutes,
        published: true,
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      };
    }
    persist();
  }

  const adminPhone = process.env.ADMIN_PHONE;
  if (adminPhone) {
    const existing = Object.values(db.users).find((u) => u.phone === adminPhone);
    if (existing && existing.role !== "admin") {
      existing.role = "admin";
      persist();
    }
  }

  // One-shot: if no super admin exists yet, promote the oldest admin so the
  // ticket inbox stays usable for the existing owner. Without this, the new
  // scope filter would hide every ticket from them after this code ships.
  const admins = Object.values(db.users).filter((u) => u.role === "admin");
  if (admins.length > 0 && !admins.some((u) => u.isSuperAdmin)) {
    const oldest = [...admins].sort((a, b) => a.createdAt - b.createdAt)[0];
    oldest.isSuperAdmin = true;
    persist();
  }

  // Seed سمینار طلا اصفهان (یک‌بار، فقط اگر هنوز هیچ سمیناری با این slug
  // وجود نداشته باشد). مقادیر بر اساس PDF رسمی سمینار است؛ ادمین می‌تواند
  // بعداً از پنل تغییرشان دهد.
  const GOLD_SLUG = "سمینار-طلا-اصفهان";
  if (!db.seminars[GOLD_SLUG]) {
    db.seminars[GOLD_SLUG] = {
      slug: GOLD_SLUG,
      title: "سمینار ترید طلا در سال ۱۴۰۵",
      shortTitle: "سمینار طلا اصفهان",
      shortDesc:
        "تجربه ۱۷ سال ترید روی طلا مهندس نام‌آور به‌صورت فشرده و عملی داخل این سمینار حضوری با شما اصفهانی‌های عزیز به اشتراک گذاشته می‌شود.",
      price: 490_000,
      allowPurchase: true,
      status: "published",
      eventDate: "2026-06-11T18:00:00+03:30",
      venueName: "سالن همایش‌های سیتی سنتر اصفهان",
      venueAddress: "اصفهان، سیتی سنتر، سالن همایش‌ها",
      capacity: 300,
      showCapacityCounter: true,
      instructorName: "مهندس امیرحسین نام‌آور",
      instructorTagline:
        "هدف من انتقال اطلاعات نیست. هدف کوتاه کردن مسیر یادگیری ترید شماست.",
      instructorBio:
        "مهندس امیرحسین نام‌آور، مدرس سمینار ترید طلا، با ۱۷ سال تجربه‌ی ترید بازارهای مالی و آموزش به بیش از یک میلیون دانش‌پذیر.",
      instructorStats: [
        "بیش از ۱ میلیون نفر دانش‌پذیر غیر‌حضوری",
        "بیش از ۲ هزار نفر دانش‌پذیر حضوری",
        "ثبت رکورد ۷۵٪ موفقیت دانش‌پذیران در ترید",
        "بیش از ۱۷ سال تجربه ترید بازارهای مالی",
      ],
      heroEyebrow: "بعد از سال‌ها…",
      heroSubtitle: "برای اولین بار سمینار حضوری مهندس امیرحسین نام‌آور در اصفهان",
      heroPromise:
        "تجربه ۱۷ سال ترید روی طلا مهندس نام‌آور به‌صورت فشرده و عملی داخل این سمینار حضوری با شما اصفهانی‌های عزیز به اشتراک گذاشته می‌شود.",
      painPointsTitle:
        "اگر حداقل پاسخ دوتا از سؤال‌های زیر برات مهمه، این سمینار برای تو طراحی شده",
      painPoints: [
        "طلا رو چطور ترید کنی؟",
        "TP و STOP تریدهای طلاتو کجا بذاری؟",
        "ستاپ اصولی ترید طلا رو یاد بگیری؟",
        "نوسان‌گیری از طلا رو یاد بگیری؟",
        "قیمت طلا تا پایان سال ۱۴۰۵ به کجا می‌رسه؟",
        "پله‌های خرید و فروش طلا کجاست؟",
      ],
      beforeAfterTitle: "قبل — بعد · سمینار ترید طلا اصفهان",
      beforeAfter: [
        { before: "سردرگمی و ترس ترید طلا", after: "چهارچوب مشخص ترید طلا" },
        { before: "مسیر نامشخص ترید", after: "مسیر حرفه‌ای ترید" },
        {
          before: "سردرگمی نوسان‌گیری طلا",
          after: "اصول حرفه‌ای نوسان‌گیری طلا",
        },
      ],
      finalCtaTitle: "رزرو نهایی صندلی سمینار",
      finalCtaDescription:
        "ظرفیت سالن این رویداد به‌شدت محدود است. فرم زیر را تکمیل کنید تا ثبت‌نام شما نهایی شود.",
      landingBlocks: [],
      memberBlocks: [],
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    };
    persist();
  }
}

seedIfEmpty();

// One-shot migration: older seeds wrote placeholder contact info into the
// settings table ("021-00000000", "info@namdar.academy", plain "تهران، ایران").
// Overwrite any setting still stuck on those placeholders with the real
// values so a long-running dev process with stale in-memory state self-heals.
{
  const PLACEHOLDER_MAP: Record<string, { placeholders: string[]; real: string }> = {
    "site.contactPhone": {
      placeholders: ["021-00000000", "021-0000-0000", ""],
      real: "021-9100-8222",
    },
    "site.contactEmail": {
      placeholders: ["info@namdar.academy", ""],
      real: "info@namdaracademy.com",
    },
    "site.address": {
      placeholders: ["تهران، ایران", ""],
      real: "تهران، ایران\nلندن، انگلستان\nدبی، امارات",
    },
    "site.contactTelegram": {
      placeholders: [""],
      real: "namdaracademy",
    },
    "site.contactWhatsapp": {
      placeholders: ["989121234567", "982191008222", ""],
      real: "989354013025",
    },
    "site.contactHours": {
      placeholders: ["شنبه تا چهارشنبه — ۹:۰۰ تا ۱۸:۰۰", ""],
      real: "شنبه تا پنج‌شنبه · ۹:۰۰ تا ۱۸:۰۰",
    },
  };
  let migrated = false;
  for (const [key, spec] of Object.entries(PLACEHOLDER_MAP)) {
    const cur = db.settings[key]?.value;
    const curStr = typeof cur === "string" ? cur : "";
    if (cur === undefined || spec.placeholders.includes(curStr)) {
      db.settings[key] = {
        key,
        value: spec.real,
        updatedBy: "system-migration",
        updatedAt: Date.now(),
      };
      migrated = true;
    }
  }
  if (migrated) persist();
}

// --- ID helpers ------------------------------------------------------------

export function generateId(prefix = "") {
  // node:crypto is Node's CSPRNG — V8's Math.random() is xorshift128+
  // (non-cryptographic) and its state can be recovered from a few observed
  // outputs. IDs leak through URLs / emails so we keep them unpredictable.
  const core =
    crypto.randomBytes(6).toString("base64url") + Date.now().toString(36);
  return prefix ? `${prefix}_${core}` : core;
}
export function generateOtp() {
  // CSPRNG for OTPs — otherwise a handful of observable Math.random() outputs
  // elsewhere in the process can reveal V8's PRNG state and let an attacker
  // predict live codes before the 5-attempt verify window closes.
  return String(crypto.randomInt(100000, 1000000));
}

// --- Users -----------------------------------------------------------------

export function findUserByPhone(phone: string) {
  return Object.values(db.users).find((u) => u.phone === phone);
}
export function findUserByEmail(email: string) {
  const n = email.trim().toLowerCase();
  return Object.values(db.users).find((u) => u.email?.toLowerCase() === n);
}
export function getUser(id: string) {
  return db.users[id];
}
export function listUsers(filter?: {
  q?: string;
  role?: UserRole;
  status?: UserStatus;
}) {
  const q = filter?.q?.trim().toLowerCase();
  return Object.values(db.users)
    .filter((u) => {
      if (filter?.role && u.role !== filter.role) return false;
      if (filter?.status && u.status !== filter.status) return false;
      if (q) {
        const hit =
          u.name.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.email?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}
export function createUser(input: {
  id?: string;
  phone: string;
  email?: string;
  name: string;
  role?: UserRole;
  referredByAgentId?: string;
  referredByLinkId?: string;
  referredAt?: number;
}): UserRecord {
  const isFirst = Object.keys(db.users).length === 0;
  // Only the very first user in an empty DB auto-bootstraps to admin.
  // We deliberately DO NOT re-apply ADMIN_PHONE auto-promotion here: if an
  // admin row was ever deleted and the number re-registers, it must go
  // through manual promotion from an existing admin — not be elevated
  // automatically by matching an env string. (The separate startup hook at
  // top of this file still promotes an existing non-admin user whose phone
  // matches ADMIN_PHONE, which is fine because that row already existed.)
  const role: UserRole = input.role ?? (isFirst ? "admin" : "student");
  const u: UserRecord = {
    id: input.id ?? generateId("u"),
    phone: input.phone,
    email: input.email,
    name: input.name,
    role,
    status: "active",
    createdAt: Date.now(),
    ...(input.referredByAgentId
      ? {
          referredByAgentId: input.referredByAgentId,
          referredByLinkId: input.referredByLinkId,
          referredAt: input.referredAt ?? Date.now(),
        }
      : {}),
  };
  db.users[u.id] = u;
  persist();
  return u;
}
export function updateUser(id: string, patch: Partial<UserRecord>) {
  const u = db.users[id];
  if (!u) return undefined;
  Object.assign(u, patch, { id: u.id });
  persist();
  return u;
}
export function disableUser(id: string, reason: string | undefined) {
  return updateUser(id, {
    status: "disabled",
    disabledAt: Date.now(),
    disabledReason: reason,
  });
}
export type PermissionOverrideState = "grant" | "deny" | "inherit";

/**
 * Update a single per-user permission override. "inherit" clears any
 * existing override for this action and falls back to the role default.
 */
export function setUserPermission(
  userId: string,
  action: string,
  state: PermissionOverrideState
) {
  const u = db.users[userId];
  if (!u) return undefined;
  const grants = new Set(u.permissionGrants ?? []);
  const denies = new Set(u.permissionDenies ?? []);
  grants.delete(action);
  denies.delete(action);
  if (state === "grant") grants.add(action);
  else if (state === "deny") denies.add(action);
  u.permissionGrants = [...grants];
  u.permissionDenies = [...denies];
  persist();
  return u;
}

export function enableUser(id: string) {
  return updateUser(id, {
    status: "active",
    disabledAt: undefined,
    disabledReason: undefined,
  });
}

/**
 * مجوزهای پایه‌ی لازم برای پاسخ به تیکت‌ها از پنل ادمین. وقتی یک کاربر معمولی
 * به عنوان پشتیبان یک دوره/سمینار تعیین می‌شود، این مجوزها به‌صورت idempotent
 * به او اعطا می‌شوند تا بتواند وارد /admin شود، اینباکس تیکت‌ها را ببیند و
 * پاسخ بدهد. ticket scope جداگانه از طریق `getTicketViewerScope()` محاسبه
 * می‌شود تا فقط تیکت‌های دوره‌ی خودش را ببیند.
 *
 * مجوز با state = "deny" دست‌نخورده می‌ماند (ادمین می‌تواند صراحتاً deny کند).
 */
export function grantCourseSupporterPerms(userIds: string[]) {
  const REQUIRED = ["dashboard.view", "ticket.view", "ticket.reply"];
  let changed = false;
  for (const userId of userIds) {
    const u = db.users[userId];
    if (!u) continue;
    const grants = new Set(u.permissionGrants ?? []);
    const denies = new Set(u.permissionDenies ?? []);
    for (const action of REQUIRED) {
      if (denies.has(action)) continue;
      if (!grants.has(action)) {
        grants.add(action);
        changed = true;
      }
    }
    u.permissionGrants = [...grants];
  }
  if (changed) persist();
}
export function touchUserLogin(id: string) {
  updateUser(id, { lastLoginAt: Date.now() });
}

// --- OTP -------------------------------------------------------------------

export function setOtp(phone: string, rec: OtpRecord) {
  db.otps[phone] = rec;
  persist();
}
export function getOtp(phone: string) {
  return db.otps[phone];
}
export function deleteOtp(phone: string) {
  delete db.otps[phone];
  persist();
}

const OTP_COOLDOWN_MS = 60_000;
const OTP_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const OTP_DAILY_MAX = 10;

export type OtpRateLimit =
  | { ok: true }
  | { ok: false; reason: "cooldown" | "daily_limit"; retryAfterSec: number };

export function checkOtpRateLimit(phone: string, now = Date.now()): OtpRateLimit {
  const rec = db.otps[phone];
  if (!rec) return { ok: true };
  if (rec.lastSentAt && now - rec.lastSentAt < OTP_COOLDOWN_MS) {
    return {
      ok: false,
      reason: "cooldown",
      retryAfterSec: Math.ceil((OTP_COOLDOWN_MS - (now - rec.lastSentAt)) / 1000),
    };
  }
  const windowStart = rec.windowStartedAt ?? 0;
  const withinWindow = now - windowStart < OTP_DAILY_WINDOW_MS;
  if (withinWindow && (rec.sendCount ?? 0) >= OTP_DAILY_MAX) {
    return {
      ok: false,
      reason: "daily_limit",
      retryAfterSec: Math.ceil((OTP_DAILY_WINDOW_MS - (now - windowStart)) / 1000),
    };
  }
  return { ok: true };
}

export function recordOtpSent(
  phone: string,
  rec: Omit<OtpRecord, "lastSentAt" | "sendCount" | "windowStartedAt">,
  now = Date.now()
) {
  const prev = db.otps[phone];
  const windowStart = prev?.windowStartedAt ?? 0;
  const inWindow = now - windowStart < OTP_DAILY_WINDOW_MS;
  db.otps[phone] = {
    ...rec,
    lastSentAt: now,
    windowStartedAt: inWindow ? windowStart : now,
    sendCount: (inWindow ? prev?.sendCount ?? 0 : 0) + 1,
  };
  persist();
}

// --- Categories & Tags -----------------------------------------------------

export function listCategories() {
  return Object.values(db.categories).sort((a, b) => a.order - b.order);
}
export function getCategory(id: string) {
  return db.categories[id];
}
export function upsertCategory(c: CategoryRecord) {
  db.categories[c.id] = c;
  persist();
}
export function deleteCategory(id: string) {
  delete db.categories[id];
  for (const c of Object.values(db.courses)) {
    if (c.categoryId === id) c.categoryId = undefined;
  }
  persist();
}

export function listTags() {
  return Object.values(db.tags).sort((a, b) => a.name.localeCompare(b.name));
}
export function upsertTag(t: TagRecord) {
  db.tags[t.id] = t;
  persist();
}
export function deleteTag(id: string) {
  delete db.tags[id];
  for (const c of Object.values(db.courses)) {
    c.tagIds = c.tagIds.filter((x) => x !== id);
  }
  persist();
}

// --- Courses ---------------------------------------------------------------

export function listCourses(filter?: {
  status?: CourseStatus;
  categoryId?: string;
  q?: string;
  level?: CourseLevelKey;
}) {
  const q = filter?.q?.trim().toLowerCase();
  return Object.values(db.courses)
    .filter((c) => {
      if (filter?.status && c.status !== filter.status) return false;
      if (filter?.categoryId && c.categoryId !== filter.categoryId) return false;
      if (filter?.level && c.level !== filter.level) return false;
      if (q) {
        const hit =
          c.title.toLowerCase().includes(q) ||
          c.shortDesc.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
export function getCourse(slug: string) {
  return db.courses[slug];
}
export function upsertCourse(c: CourseRecord) {
  db.courses[c.slug] = { ...c, updatedAt: Date.now() };
  persist();
}
export function deleteCourse(slug: string) {
  delete db.courses[slug];
  for (const ch of Object.values(db.chapters)) {
    if (ch.courseSlug === slug) delete db.chapters[ch.id];
  }
  for (const l of Object.values(db.lessons)) {
    if (l.courseSlug === slug) delete db.lessons[l.id];
  }
  for (const e of Object.values(db.enrollments)) {
    if (e.courseSlug === slug) delete db.enrollments[e.id];
  }
  persist();
}
export function publishCourse(slug: string) {
  const c = db.courses[slug];
  if (!c) return;
  c.status = "published";
  c.publishedAt = Date.now();
  c.updatedAt = Date.now();
  persist();
}
export function unpublishCourse(slug: string) {
  const c = db.courses[slug];
  if (!c) return;
  c.status = "draft";
  c.updatedAt = Date.now();
  persist();
}
export function archiveCourse(slug: string) {
  const c = db.courses[slug];
  if (!c) return;
  c.status = "archived";
  c.updatedAt = Date.now();
  persist();
}

// --- Chapters --------------------------------------------------------------

export function listChapters(courseSlug: string) {
  return Object.values(db.chapters)
    .filter((c) => c.courseSlug === courseSlug)
    .sort((a, b) => a.order - b.order);
}
export function getChapter(id: string) {
  return db.chapters[id];
}
export function upsertChapter(c: ChapterRecord) {
  db.chapters[c.id] = c;
  persist();
}
export function deleteChapter(id: string) {
  const ch = db.chapters[id];
  if (!ch) return;
  delete db.chapters[id];
  for (const l of Object.values(db.lessons)) {
    if (l.chapterId === id) delete db.lessons[l.id];
  }
  persist();
}
export function reorderChapters(courseSlug: string, orderMap: Record<string, number>) {
  for (const ch of Object.values(db.chapters)) {
    if (ch.courseSlug === courseSlug && orderMap[ch.id] !== undefined) {
      ch.order = orderMap[ch.id];
    }
  }
  persist();
}

// --- Lessons ---------------------------------------------------------------

export function listLessons(courseSlug: string) {
  return Object.values(db.lessons)
    .filter((l) => l.courseSlug === courseSlug)
    .sort((a, b) => {
      const chA = db.chapters[a.chapterId]?.order ?? 0;
      const chB = db.chapters[b.chapterId]?.order ?? 0;
      if (chA !== chB) return chA - chB;
      return a.order - b.order;
    });
}
export function listLessonsByChapter(chapterId: string) {
  return Object.values(db.lessons)
    .filter((l) => l.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);
}
export function getLesson(id: string) {
  return db.lessons[id];
}
export function upsertLesson(l: LessonRecord) {
  db.lessons[l.id] = l;
  persist();
}
export function deleteLesson(id: string) {
  delete db.lessons[id];
  for (const a of Object.values(db.attachments)) {
    if (a.lessonId === id) delete db.attachments[a.id];
  }
  persist();
}
export function reorderLessons(chapterId: string, orderMap: Record<string, number>) {
  for (const l of Object.values(db.lessons)) {
    if (l.chapterId === chapterId && orderMap[l.id] !== undefined) {
      l.order = orderMap[l.id];
    }
  }
  persist();
}

// --- Attachments -----------------------------------------------------------

export function listAttachments(lessonId: string) {
  return Object.values(db.attachments).filter((a) => a.lessonId === lessonId);
}
export function upsertAttachment(a: AttachmentRecord) {
  db.attachments[a.id] = a;
  persist();
}
export function deleteAttachment(id: string) {
  delete db.attachments[id];
  persist();
}

// --- Media -----------------------------------------------------------------

export function listMedia(filter?: { kind?: MediaAsset["kind"]; q?: string }) {
  const q = filter?.q?.trim().toLowerCase();
  return Object.values(db.media)
    .filter((m) => {
      if (filter?.kind && m.kind !== filter.kind) return false;
      if (q && !m.fileName.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}
export function upsertMedia(m: MediaAsset) {
  db.media[m.id] = m;
  persist();
}
export function deleteMedia(id: string) {
  delete db.media[id];
  persist();
}

// --- Enrollments -----------------------------------------------------------

export function enroll(userId: string, courseSlug: string, input?: {
  source?: EnrollmentRecord["source"];
  orderId?: string;
  grantedBy?: string;
  /** Override the course's default access duration. */
  durationDays?: number;
}) {
  const existing = Object.values(db.enrollments).find(
    (e) => e.userId === userId && e.courseSlug === courseSlug
  );
  if (existing) return existing;
  const now = Date.now();
  // Snapshot the access window from either the explicit override or the
  // course's current accessDurationDays. Later admin edits to the course
  // don't shift this student's expiry — they'd have to edit the enrollment.
  const c = db.courses[courseSlug];
  const days = input?.durationDays ?? c?.accessDurationDays;
  const expiresAt =
    typeof days === "number" && days > 0
      ? now + days * 24 * 60 * 60 * 1000
      : undefined;
  const rec: EnrollmentRecord = {
    id: generateId("enr"),
    userId,
    courseSlug,
    enrolledAt: now,
    source: input?.source ?? "purchase",
    orderId: input?.orderId,
    grantedBy: input?.grantedBy,
    ...(typeof days === "number" && days > 0 ? { durationDays: days } : {}),
    ...(expiresAt ? { expiresAt } : {}),
  };
  db.enrollments[rec.id] = rec;
  if (c) c.studentsCount += 1;
  persist();
  return rec;
}

/** Update an enrollment — admin uses this to extend/shorten access. */
export function updateEnrollment(
  id: string,
  patch: Partial<Pick<EnrollmentRecord, "expiresAt" | "durationDays">>,
): EnrollmentRecord | undefined {
  const e = db.enrollments[id];
  if (!e) return undefined;
  if (patch.expiresAt !== undefined) e.expiresAt = patch.expiresAt;
  if (patch.durationDays !== undefined) e.durationDays = patch.durationDays;
  persist();
  return e;
}

/** True when an enrollment's access window has lapsed. Returns false if the
 *  enrollment has no expiry (lifetime access). */
export function isEnrollmentExpired(e: EnrollmentRecord): boolean {
  return typeof e.expiresAt === "number" && e.expiresAt < Date.now();
}
export function unenroll(userId: string, courseSlug: string) {
  for (const [id, e] of Object.entries(db.enrollments)) {
    if (e.userId === userId && e.courseSlug === courseSlug) {
      delete db.enrollments[id];
      const c = db.courses[courseSlug];
      if (c && c.studentsCount > 0) c.studentsCount -= 1;
      persist();
      return true;
    }
  }
  return false;
}
export function isEnrolled(userId: string, courseSlug: string) {
  return Object.values(db.enrollments).some(
    (e) => e.userId === userId && e.courseSlug === courseSlug
  );
}
export function listEnrollments(userId: string) {
  return Object.values(db.enrollments)
    .filter((e) => e.userId === userId)
    .map((e) => e.courseSlug);
}
export function listEnrollmentRecordsForUser(userId: string) {
  return Object.values(db.enrollments)
    .filter((e) => e.userId === userId)
    .sort((a, b) => b.enrolledAt - a.enrolledAt);
}
export function listEnrollmentRecordsForCourse(courseSlug: string) {
  return Object.values(db.enrollments)
    .filter((e) => e.courseSlug === courseSlug)
    .sort((a, b) => b.enrolledAt - a.enrolledAt);
}
/** The single enrollment record for a (user, course) pair, if any. */
export function getEnrollment(
  userId: string,
  courseSlug: string
): EnrollmentRecord | undefined {
  return Object.values(db.enrollments).find(
    (e) => e.userId === userId && e.courseSlug === courseSlug
  );
}
export function getEnrollmentById(id: string): EnrollmentRecord | undefined {
  return db.enrollments[id];
}
/** Store a freshly-created SpotPlayer license on an enrollment and clear any
 *  previous error. No-op if the enrollment no longer exists. */
export function setEnrollmentSpotPlayer(
  id: string,
  license: NonNullable<EnrollmentRecord["spotPlayer"]>
): EnrollmentRecord | undefined {
  const e = db.enrollments[id];
  if (!e) return undefined;
  e.spotPlayer = license;
  delete e.spotPlayerError;
  persist();
  return e;
}
/** Record the last SpotPlayer license-creation failure for diagnostics/retry. */
export function setEnrollmentSpotPlayerError(
  id: string,
  error: string
): EnrollmentRecord | undefined {
  const e = db.enrollments[id];
  if (!e) return undefined;
  e.spotPlayerError = error;
  persist();
  return e;
}

// --- Orders ----------------------------------------------------------------

export function createOrder(o: OrderRecord) {
  db.orders[o.id] = o;
  persist();
}
export function getOrder(id: string) {
  return db.orders[id];
}
export function updateOrder(id: string, patch: Partial<OrderRecord>) {
  const o = db.orders[id];
  if (!o) return;
  Object.assign(o, patch, { id: o.id });
  persist();
}
export function listOrdersByUser(userId: string) {
  return Object.values(db.orders)
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}
export function listAllOrders(filter?: {
  status?: OrderStatus;
  q?: string;
  from?: number;
  to?: number;
}) {
  const q = filter?.q?.trim().toLowerCase();
  return Object.values(db.orders)
    .filter((o) => {
      if (filter?.status && o.status !== filter.status) return false;
      if (filter?.from && o.createdAt < filter.from) return false;
      if (filter?.to && o.createdAt > filter.to) return false;
      if (q) {
        const hit =
          o.id.toLowerCase().includes(q) ||
          o.courseSlug.toLowerCase().includes(q) ||
          o.refNum?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

// --- Video progress & events ----------------------------------------------

function progKey(userId: string, lessonId: string) {
  return `${userId}:${lessonId}`;
}
export function getProgress(userId: string, lessonId: string) {
  return db.videoProgress[progKey(userId, lessonId)];
}
export function listProgressForCourse(userId: string, courseSlug: string) {
  return Object.values(db.videoProgress).filter(
    (p) => p.userId === userId && p.courseSlug === courseSlug
  );
}
export function listProgressForUser(userId: string) {
  return Object.values(db.videoProgress).filter((p) => p.userId === userId);
}
export function listProgressForLesson(lessonId: string) {
  return Object.values(db.videoProgress).filter((p) => p.lessonId === lessonId);
}
export function upsertProgress(p: VideoProgressRecord) {
  db.videoProgress[progKey(p.userId, p.lessonId)] = p;
  persist();
}

export function appendWatchEvent(ev: Omit<WatchEvent, "id">) {
  const withId: WatchEvent = { ...ev, id: generateId("w") };
  db.watchEvents.push(withId);
  // Cap at 50k events to avoid unbounded growth in dev.
  if (db.watchEvents.length > 50000) {
    db.watchEvents.splice(0, db.watchEvents.length - 50000);
  }
  persist();
}
export function listWatchEventsForLesson(lessonId: string) {
  return db.watchEvents.filter((e) => e.lessonId === lessonId);
}
export function listWatchEventsForUser(userId: string, limit = 200) {
  return db.watchEvents
    .filter((e) => e.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

// --- Settings --------------------------------------------------------------

export function getSetting<T = unknown>(key: string): T | undefined {
  syncFromDisk();
  return db.settings[key]?.value as T | undefined;
}
export function setSetting(key: string, value: unknown, updatedBy: string) {
  db.settings[key] = { key, value, updatedBy, updatedAt: Date.now() };
  persist();
}
export function listSettings(prefix?: string) {
  syncFromDisk();
  const all = Object.values(db.settings);
  return prefix ? all.filter((s) => s.key.startsWith(prefix)) : all;
}
export function getSettingsGroup(prefix: string): Record<string, unknown> {
  syncFromDisk();
  const out: Record<string, unknown> = {};
  for (const s of Object.values(db.settings)) {
    if (s.key.startsWith(prefix)) {
      out[s.key.slice(prefix.length).replace(/^\./, "")] = s.value;
    }
  }
  return out;
}

// --- Audit log -------------------------------------------------------------

export function logAudit(
  entry: Omit<AuditLogEntry, "id" | "timestamp"> & { timestamp?: number }
) {
  const rec: AuditLogEntry = {
    id: generateId("al"),
    timestamp: entry.timestamp ?? Date.now(),
    ...entry,
  };
  db.auditLog.push(rec);
  if (db.auditLog.length > 5000) {
    db.auditLog.splice(0, db.auditLog.length - 5000);
  }
  persist();
}
export function listAudit(filter?: {
  actorId?: string;
  action?: string;
  from?: number;
  to?: number;
  limit?: number;
}) {
  return db.auditLog
    .filter((e) => {
      if (filter?.actorId && e.actorId !== filter.actorId) return false;
      if (filter?.action && !e.action.includes(filter.action)) return false;
      if (filter?.from && e.timestamp < filter.from) return false;
      if (filter?.to && e.timestamp > filter.to) return false;
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, filter?.limit ?? 200);
}

// --- Newsletter ------------------------------------------------------------

export function addNewsletterSub(email: string) {
  const key = email.trim().toLowerCase();
  if (!key) return false;
  if (db.newsletterSubs[key]) return true;
  db.newsletterSubs[key] = { email: key, subscribedAt: Date.now() };
  persist();
  return true;
}
export function listNewsletterSubs() {
  return Object.values(db.newsletterSubs).sort(
    (a, b) => b.subscribedAt - a.subscribedAt
  );
}
export function removeNewsletterSub(email: string) {
  delete db.newsletterSubs[email.trim().toLowerCase()];
  persist();
}

// --- Callback requests -----------------------------------------------------

export function addCallbackRequest(input: {
  phone: string;
  name?: string;
  email?: string;
  topic?: string;
  preferredTime?: string;
  note?: string;
  relatedCourseSlug?: string;
  source?: string;
}) {
  const id = `cb_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const rec: CallbackRequest = {
    id,
    phone: input.phone.trim(),
    name: input.name?.trim() || undefined,
    email: input.email?.trim() || undefined,
    topic: input.topic?.trim() || undefined,
    preferredTime: input.preferredTime?.trim() || undefined,
    note: input.note?.trim() || undefined,
    relatedCourseSlug: input.relatedCourseSlug?.trim() || undefined,
    source: input.source?.trim() || "site",
    status: "new",
    createdAt: Date.now(),
  };
  db.callbackRequests[id] = rec;
  persist();
  return rec;
}

export function listCallbackRequests(filter?: {
  status?: CallbackRequestStatus;
}) {
  let arr = Object.values(db.callbackRequests);
  if (filter?.status) arr = arr.filter((r) => r.status === filter.status);
  return arr.sort((a, b) => b.createdAt - a.createdAt);
}

export function getCallbackRequest(id: string) {
  return db.callbackRequests[id];
}

export function updateCallbackRequestStatus(
  id: string,
  status: CallbackRequestStatus,
  actorId?: string
) {
  const rec = db.callbackRequests[id];
  if (!rec) return undefined;
  rec.status = status;
  if (status === "contacted") {
    rec.contactedAt = Date.now();
    rec.contactedBy = actorId;
  }
  db.callbackRequests[id] = rec;
  persist();
  return rec;
}

export function deleteCallbackRequest(id: string) {
  delete db.callbackRequests[id];
  persist();
}

// --- Testimonials ----------------------------------------------------------

export function listTestimonials(filter?: { publishedOnly?: boolean }) {
  let arr = Object.values(db.testimonials);
  if (filter?.publishedOnly) arr = arr.filter((t) => t.published);
  return arr.sort((a, b) => a.order - b.order);
}
export function getTestimonial(id: string) {
  return db.testimonials[id];
}
export function upsertTestimonial(t: TestimonialRecord) {
  db.testimonials[t.id] = t;
  persist();
}
export function deleteTestimonial(id: string) {
  delete db.testimonials[id];
  persist();
}

// --- Wall of Fame ----------------------------------------------------------

export function listWallOfFame(filter?: { publishedOnly?: boolean }) {
  let arr = Object.values(db.wallOfFame);
  if (filter?.publishedOnly) arr = arr.filter((w) => w.published);
  return arr.sort((a, b) => a.order - b.order);
}
export function getWallOfFameItem(id: string) {
  return db.wallOfFame[id];
}
export function upsertWallOfFameItem(w: WallOfFameItem) {
  db.wallOfFame[w.id] = w;
  persist();
}
export function deleteWallOfFameItem(id: string) {
  delete db.wallOfFame[id];
  persist();
}

// --- Course Q&A Access ----------------------------------------------------
// منبع حقیقت برای دسترسی به پنل پرسش‌وپاسخ یک دوره. کاربر دسترسی دارد
// اگر یا enroll باشد (خرید/grant/free) یا ادمین مستقیماً دسترسی Q&A
// را به او داده باشد (بدون enroll).

function qaAccessId(userId: string, courseSlug: string) {
  return `${userId}__${courseSlug}`;
}

export function grantCourseQAAccess(
  userId: string,
  courseSlug: string,
  grantedBy: string,
  note?: string
) {
  const id = qaAccessId(userId, courseSlug);
  db.courseQAAccess[id] = {
    id,
    userId,
    courseSlug,
    grantedAt: Date.now(),
    grantedBy,
    note: note?.trim() || undefined,
  };
  persist();
  return db.courseQAAccess[id];
}

export function revokeCourseQAAccess(userId: string, courseSlug: string) {
  delete db.courseQAAccess[qaAccessId(userId, courseSlug)];
  persist();
}

export function hasCourseQAAccess(userId: string, courseSlug: string): boolean {
  if (isEnrolled(userId, courseSlug)) return true;
  return !!db.courseQAAccess[qaAccessId(userId, courseSlug)];
}

/** فقط grant های دستی (بدون enrollment ها). */
export function listManualQAAccessRecords() {
  return Object.values(db.courseQAAccess).sort(
    (a, b) => b.grantedAt - a.grantedAt
  );
}

/** لیست slug تمام دوره‌هایی که کاربر به پنل Q&A شان دسترسی دارد
 * (ترکیب enrollment + manual grant، بدون تکرار). */
export function listQAAccessibleCourseSlugs(userId: string): string[] {
  const fromEnrollment = listEnrollments(userId);
  const fromGrants = Object.values(db.courseQAAccess)
    .filter((g) => g.userId === userId)
    .map((g) => g.courseSlug);
  return Array.from(new Set([...fromEnrollment, ...fromGrants]));
}

// --- FAQs ------------------------------------------------------------------

export function listFaqs(filter?: { publishedOnly?: boolean }) {
  let arr = Object.values(db.faqs);
  if (filter?.publishedOnly) arr = arr.filter((f) => f.published);
  return arr.sort((a, b) => a.order - b.order);
}
export function getFaq(id: string) {
  return db.faqs[id];
}
export function upsertFaq(f: FaqRecord) {
  db.faqs[f.id] = f;
  persist();
}
export function deleteFaq(id: string) {
  delete db.faqs[id];
  persist();
}

// --- Discount codes --------------------------------------------------------

export function listDiscounts() {
  return Object.values(db.discounts).sort((a, b) => b.createdAt - a.createdAt);
}
export function getDiscount(code: string) {
  return db.discounts[code.trim().toUpperCase()];
}
export function upsertDiscount(d: DiscountCode) {
  db.discounts[d.code.trim().toUpperCase()] = d;
  persist();
}
export function deleteDiscount(code: string) {
  delete db.discounts[code.trim().toUpperCase()];
  persist();
}
export function incrementDiscountUses(code: string) {
  const d = db.discounts[code.trim().toUpperCase()];
  if (!d) return;
  d.uses += 1;
  persist();
}

/** Validates a code against a target course+amount and returns the discount
 *  amount (Toman) that should be subtracted from the order, or an error. */
export function validateDiscount(input: {
  code: string;
  courseSlug: string;
  amountToman: number;
}):
  | { ok: true; amountOff: number; kind: DiscountCode["kind"]; code: string }
  | { ok: false; error: string } {
  const d = getDiscount(input.code);
  if (!d) return { ok: false, error: "کد تخفیف معتبر نیست" };
  if (!d.active) return { ok: false, error: "این کد غیرفعال است" };
  if (d.expiresAt && d.expiresAt < Date.now())
    return { ok: false, error: "کد تخفیف منقضی شده" };
  if (d.maxUses && d.uses >= d.maxUses)
    return { ok: false, error: "ظرفیت استفاده از کد تکمیل شده" };
  if (d.courseSlug && d.courseSlug !== input.courseSlug)
    return { ok: false, error: "این کد برای این دوره قابل استفاده نیست" };
  const amountOff =
    d.kind === "percent"
      ? Math.round((input.amountToman * d.value) / 100)
      : Math.min(d.value, input.amountToman);
  return { ok: true, amountOff, kind: d.kind, code: d.code };
}

// --- Course reviews --------------------------------------------------------

export function listReviews(filter?: {
  courseSlug?: string;
  approvedOnly?: boolean;
  userId?: string;
}) {
  let arr = Object.values(db.reviews);
  if (filter?.courseSlug)
    arr = arr.filter((r) => r.courseSlug === filter.courseSlug);
  if (filter?.approvedOnly) arr = arr.filter((r) => r.approved);
  if (filter?.userId) arr = arr.filter((r) => r.userId === filter.userId);
  return arr.sort((a, b) => b.createdAt - a.createdAt);
}
export function getReview(id: string) {
  return db.reviews[id];
}
export function upsertReview(r: CourseReview) {
  db.reviews[r.id] = r;
  persist();
}
export function deleteReview(id: string) {
  delete db.reviews[id];
  persist();
}
export function getCourseRating(courseSlug: string) {
  const rs = listReviews({ courseSlug, approvedOnly: true });
  if (rs.length === 0) return { avg: 0, count: 0 };
  const sum = rs.reduce((s, r) => s + r.rating, 0);
  return { avg: Math.round((sum / rs.length) * 10) / 10, count: rs.length };
}

// --- Articles --------------------------------------------------------------

export function listArticles(filter?: {
  publishedOnly?: boolean;
  category?: string;
  q?: string;
}) {
  const q = filter?.q?.trim().toLowerCase();
  return Object.values(db.articles)
    .filter((a) => {
      if (filter?.publishedOnly && !a.published) return false;
      if (filter?.category && a.category !== filter.category) return false;
      if (q) {
        const hit =
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    })
    .sort((a, b) => (b.publishedAt ?? b.updatedAt) - (a.publishedAt ?? a.updatedAt));
}
export function getArticle(slug: string) {
  return db.articles[slug];
}
export function upsertArticle(a: ArticleRecord) {
  db.articles[a.slug] = { ...a, updatedAt: Date.now() };
  persist();
}
export function deleteArticle(slug: string) {
  delete db.articles[slug];
  persist();
}

// --- Static pages ----------------------------------------------------------

export function listStaticPages(filter?: { publishedOnly?: boolean }) {
  return Object.values(db.staticPages)
    .filter((p) => (filter?.publishedOnly ? p.published : true))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
export function getStaticPage(slug: string) {
  return db.staticPages[slug];
}
export function upsertStaticPage(p: StaticPageRecord) {
  db.staticPages[p.slug] = { ...p, updatedAt: Date.now() };
  persist();
}
export function deleteStaticPage(slug: string) {
  delete db.staticPages[slug];
  persist();
}

// --- Tickets ---------------------------------------------------------------

export function createTicket(input: {
  userId: string;
  subject: string;
  category: TicketCategory;
  priority?: TicketPriority;
  body: string;
  relatedCourseSlug?: string;
  relatedSeminarSlug?: string;
  relatedOrderId?: string;
  attachments?: TicketAttachment[];
}): { ticket: TicketRecord; firstMessage: TicketMessageRecord } {
  const now = Date.now();

  // Auto-route به نفر اول supportAdminIds. اگر تیکت مربوط به سمینار باشد
  // از supportAdminIds سمینار، در غیر این صورت از دوره. کل لیست همچنان از
  // طریق scope تیکت را می‌بینند؛ assign فقط برای داشتن owner مشخص است.
  let assigneeId: string | undefined;
  if (input.relatedSeminarSlug) {
    const s = db.seminars[input.relatedSeminarSlug];
    const admins = s?.supportAdminIds?.filter((id) => !!db.users[id]) ?? [];
    if (admins.length > 0) assigneeId = admins[0];
  } else if (input.relatedCourseSlug) {
    const c = db.courses[input.relatedCourseSlug];
    const admins = c?.supportAdminIds?.filter((id) => !!db.users[id]) ?? [];
    if (admins.length > 0) assigneeId = admins[0];
  }

  const ticket: TicketRecord = {
    id: generateId("tkt"),
    userId: input.userId,
    subject: input.subject.trim(),
    category: input.category,
    priority: input.priority ?? "normal",
    status: "open",
    assigneeId,
    relatedCourseSlug: input.relatedCourseSlug,
    relatedSeminarSlug: input.relatedSeminarSlug,
    relatedOrderId: input.relatedOrderId,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    lastMessageByRole: "user",
    unreadForStaff: 1,
    unreadForUser: 0,
  };
  db.tickets[ticket.id] = ticket;
  const firstMessage: TicketMessageRecord = {
    id: generateId("tmsg"),
    ticketId: ticket.id,
    authorId: input.userId,
    authorRole: "user",
    body: input.body.trim(),
    internal: false,
    attachments: input.attachments?.length ? input.attachments : undefined,
    createdAt: now,
  };
  db.ticketMessages[firstMessage.id] = firstMessage;
  persist();
  return { ticket, firstMessage };
}

export function getTicket(id: string) {
  return db.tickets[id];
}

export function listTicketsForUser(userId: string) {
  return Object.values(db.tickets)
    .filter((t) => t.userId === userId)
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

export type TicketViewerScope = {
  /** true → user sees every ticket in the system */
  unrestricted: boolean;
  /** category list this user is responsible for; empty if none */
  categories: TicketCategory[];
  /** course slugs where this user is in supportAdminIds */
  courseSlugs: string[];
  /** seminar slugs where this user is in supportAdminIds */
  seminarSlugs: string[];
};

/** Compute what subset of tickets a staff user can see. Used to gate the
 *  admin tickets inbox + detail page so a category-scoped support agent only
 *  ever sees tickets in their lane. */
export function getTicketViewerScope(userId: string): TicketViewerScope {
  const u = db.users[userId];
  if (!u) {
    return {
      unrestricted: false,
      categories: [],
      courseSlugs: [],
      seminarSlugs: [],
    };
  }
  const unrestricted = !!(u.isSuperAdmin || u.isSeniorSupport);
  const categories = (u.ticketCategoryScope ?? []).filter(
    (c): c is TicketCategory =>
      c === "technical" ||
      c === "billing" ||
      c === "course" ||
      c === "account" ||
      c === "other"
  );
  const courseSlugs: string[] = [];
  for (const c of Object.values(db.courses)) {
    if (c.supportAdminIds?.includes(userId)) courseSlugs.push(c.slug);
  }
  const seminarSlugs: string[] = [];
  for (const s of Object.values(db.seminars)) {
    if (s.supportAdminIds?.includes(userId)) seminarSlugs.push(s.slug);
  }
  return { unrestricted, categories, courseSlugs, seminarSlugs };
}

/** Is this ticket within the viewer's scope? Assigned-to-me always passes,
 *  even without a category or course match — otherwise reassigning a ticket
 *  outside a person's lane would hide it from them. */
function ticketInScope(t: TicketRecord, scope: TicketViewerScope, userId: string) {
  if (scope.unrestricted) return true;
  if (t.assigneeId && t.assigneeId === userId) return true;
  if (scope.categories.includes(t.category)) return true;
  if (t.relatedCourseSlug && scope.courseSlugs.includes(t.relatedCourseSlug)) {
    return true;
  }
  if (t.relatedSeminarSlug && scope.seminarSlugs.includes(t.relatedSeminarSlug)) {
    return true;
  }
  return false;
}

export function listAllTickets(filter?: {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assigneeId?: string;
  q?: string;
  /** When set, restricts the result to tickets visible to this viewer.
   *  Super admin / senior support get everything; everyone else gets only
   *  their own assignments + scope. */
  viewerId?: string;
}) {
  let arr = Object.values(db.tickets);
  if (filter?.viewerId) {
    const scope = getTicketViewerScope(filter.viewerId);
    arr = arr.filter((t) => ticketInScope(t, scope, filter.viewerId!));
  }
  if (filter?.status) arr = arr.filter((t) => t.status === filter.status);
  if (filter?.priority) arr = arr.filter((t) => t.priority === filter.priority);
  if (filter?.category) arr = arr.filter((t) => t.category === filter.category);
  if (filter?.assigneeId) arr = arr.filter((t) => t.assigneeId === filter.assigneeId);
  if (filter?.q) {
    const q = filter.q.trim().toLowerCase();
    if (q) {
      arr = arr.filter((t) => t.subject.toLowerCase().includes(q));
    }
  }
  return arr.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

/** Can this staff user open this specific ticket? Used on the detail page. */
export function canViewerSeeTicket(userId: string, ticket: TicketRecord) {
  const scope = getTicketViewerScope(userId);
  return ticketInScope(ticket, scope, userId);
}

export function listMessagesForTicket(ticketId: string, opts?: { includeInternal?: boolean }) {
  return Object.values(db.ticketMessages)
    .filter(
      (m) =>
        m.ticketId === ticketId &&
        (opts?.includeInternal ? true : !m.internal)
    )
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function appendTicketMessage(input: {
  ticketId: string;
  authorId: string;
  authorRole: "user" | "staff";
  body: string;
  internal?: boolean;
  attachments?: TicketAttachment[];
}): TicketMessageRecord | undefined {
  const ticket = db.tickets[input.ticketId];
  if (!ticket) return undefined;
  const now = Date.now();
  const msg: TicketMessageRecord = {
    id: generateId("tmsg"),
    ticketId: ticket.id,
    authorId: input.authorId,
    authorRole: input.authorRole,
    body: input.body.trim(),
    internal: !!input.internal,
    attachments: input.attachments?.length ? input.attachments : undefined,
    createdAt: now,
  };
  db.ticketMessages[msg.id] = msg;

  // Update ticket metadata only for non-internal messages
  if (!msg.internal) {
    ticket.lastMessageAt = now;
    ticket.lastMessageByRole = input.authorRole;
    ticket.updatedAt = now;
    if (input.authorRole === "user") {
      // user replied → goes back to open, bump staff unread
      if (ticket.status === "pending" || ticket.status === "solved") {
        ticket.status = "open";
        ticket.resolvedAt = undefined;
      }
      ticket.unreadForStaff += 1;
    } else {
      // staff replied → waiting on user
      if (ticket.status === "open") ticket.status = "pending";
      ticket.unreadForUser += 1;
    }
  } else {
    ticket.updatedAt = now;
  }
  db.tickets[ticket.id] = ticket;
  persist();
  return msg;
}

export function updateTicket(id: string, patch: Partial<TicketRecord>) {
  const t = db.tickets[id];
  if (!t) return undefined;
  Object.assign(t, patch, { id: t.id, updatedAt: Date.now() });
  persist();
  return t;
}

export function setTicketStatus(id: string, status: TicketStatus) {
  const t = db.tickets[id];
  if (!t) return undefined;
  const now = Date.now();
  t.status = status;
  t.updatedAt = now;
  if (status === "solved") t.resolvedAt = now;
  if (status === "closed") t.closedAt = now;
  if (status === "open" || status === "pending") {
    t.resolvedAt = undefined;
    t.closedAt = undefined;
  }
  db.tickets[id] = t;
  persist();
  return t;
}

export function assignTicket(id: string, assigneeId: string | undefined) {
  const t = db.tickets[id];
  if (!t) return undefined;
  t.assigneeId = assigneeId;
  t.updatedAt = Date.now();
  db.tickets[id] = t;
  persist();
  return t;
}

export function markTicketReadByUser(ticketId: string, userId: string) {
  const t = db.tickets[ticketId];
  if (!t || t.userId !== userId) return;
  if (t.unreadForUser > 0) {
    t.unreadForUser = 0;
    db.tickets[ticketId] = t;
    persist();
  }
}

export function markTicketReadByStaff(ticketId: string) {
  const t = db.tickets[ticketId];
  if (!t) return;
  if (t.unreadForStaff > 0) {
    t.unreadForStaff = 0;
    db.tickets[ticketId] = t;
    persist();
  }
}

export function rateTicket(
  ticketId: string,
  userId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  comment?: string
) {
  const t = db.tickets[ticketId];
  if (!t || t.userId !== userId) return undefined;
  t.rating = rating;
  t.ratingComment = comment?.trim();
  t.ratedAt = Date.now();
  if (t.status === "solved") t.status = "closed";
  t.updatedAt = Date.now();
  db.tickets[ticketId] = t;
  persist();
  return t;
}

export function getTicketCounts(viewerId?: string) {
  let all = Object.values(db.tickets);
  if (viewerId) {
    const scope = getTicketViewerScope(viewerId);
    all = all.filter((t) => ticketInScope(t, scope, viewerId));
  }
  return {
    total: all.length,
    open: all.filter((t) => t.status === "open").length,
    pending: all.filter((t) => t.status === "pending").length,
    solved: all.filter((t) => t.status === "solved").length,
    closed: all.filter((t) => t.status === "closed").length,
    unreadForStaff: all.reduce((s, t) => s + (t.unreadForStaff > 0 ? 1 : 0), 0),
  };
}

// --- Sales agents -----------------------------------------------------------

/** Normalize a referral code: trim + uppercase. We store codes as written by
 *  admin but match case-insensitively against this form so user-typed
 *  "mona10" still resolves to "MONA10". */
export function normalizeReferralCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function listSalesAgents(filter?: { active?: boolean }) {
  return Object.values(db.salesAgents)
    .filter((a) => filter?.active === undefined || a.isActive === filter.active)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getSalesAgent(id: string): SalesAgentRecord | undefined {
  return db.salesAgents[id];
}

export function getSalesAgentByCode(code: string): SalesAgentRecord | undefined {
  const target = normalizeReferralCode(code);
  return Object.values(db.salesAgents).find(
    (a) => normalizeReferralCode(a.referralCode) === target,
  );
}

export function getSalesAgentByUserId(userId: string): SalesAgentRecord | undefined {
  return Object.values(db.salesAgents).find((a) => a.userId === userId);
}

/** Find the agent whose registered phone equals the given user's phone.
 *  We use this for self-service login: when a user with role=student logs in
 *  with their normal phone and that phone is registered as a sales agent,
 *  the agent dashboard becomes available to them. No role change needed. */
export function getSalesAgentByPhone(phone: string): SalesAgentRecord | undefined {
  const target = phone.trim();
  if (!target) return undefined;
  return Object.values(db.salesAgents).find((a) => a.phone?.trim() === target);
}

export function createSalesAgent(input: {
  name: string;
  referralCode: string;
  phone?: string;
  email?: string;
  userId?: string;
  isActive?: boolean;
  notes?: string;
}): SalesAgentRecord {
  const code = normalizeReferralCode(input.referralCode);
  if (!code) throw new Error("کد رفرال نمی‌تواند خالی باشد");
  if (getSalesAgentByCode(code)) {
    throw new Error("این کد رفرال قبلاً ثبت شده است");
  }
  const now = Date.now();
  const rec: SalesAgentRecord = {
    id: `agent_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    referralCode: code,
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    userId: input.userId,
    isActive: input.isActive ?? true,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  db.salesAgents[rec.id] = rec;
  // Auto-create a "main" link so the agent has something to share right away.
  // Without this, the dashboard would show "no links yet" which is awkward UX.
  const linkId = `link_${Math.random().toString(36).slice(2, 10)}`;
  db.referralLinks[linkId] = {
    id: linkId,
    agentId: rec.id,
    label: "اصلی",
    clicks: 0,
    signups: 0,
    paidOrders: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  persist();
  return rec;
}

export function updateSalesAgent(
  id: string,
  patch: Partial<Omit<SalesAgentRecord, "id" | "createdAt">>,
): SalesAgentRecord | undefined {
  const cur = db.salesAgents[id];
  if (!cur) return undefined;
  if (patch.referralCode !== undefined) {
    const code = normalizeReferralCode(patch.referralCode);
    if (!code) throw new Error("کد رفرال نمی‌تواند خالی باشد");
    const other = getSalesAgentByCode(code);
    if (other && other.id !== id) {
      throw new Error("این کد رفرال قبلاً برای کارشناس دیگری ثبت شده است");
    }
    cur.referralCode = code;
  }
  if (patch.name !== undefined) cur.name = patch.name.trim();
  if (patch.phone !== undefined) cur.phone = patch.phone.trim() || undefined;
  if (patch.email !== undefined) cur.email = patch.email.trim() || undefined;
  if (patch.userId !== undefined) cur.userId = patch.userId || undefined;
  if (patch.isActive !== undefined) cur.isActive = patch.isActive;
  if (patch.notes !== undefined) cur.notes = patch.notes.trim() || undefined;
  if (patch.commissionTiers !== undefined) {
    cur.commissionTiers = sanitizeCommissionTiers(patch.commissionTiers);
  }
  if (patch.commissionPeriod !== undefined) {
    cur.commissionPeriod =
      patch.commissionPeriod === "all_time" ? "all_time" : "month";
  }
  cur.updatedAt = Date.now();
  persist();
  return cur;
}

/**
 * Strip invalid rows, clamp ranges, and sort ascending. Two tiers at the
 * same threshold are de-duped — the last one wins. Returns `undefined` if
 * the cleaned list is empty so the field clears from the record entirely
 * (avoids storing a noisy empty array).
 */
function sanitizeCommissionTiers(
  raw: CommissionTier[]
): CommissionTier[] | undefined {
  const clean: CommissionTier[] = [];
  const seen = new Map<number, number>();
  for (const t of raw) {
    const atLeast = Math.max(0, Math.floor(Number(t?.atLeastToman) || 0));
    const percent = Math.max(0, Math.min(100, Number(t?.percent) || 0));
    if (!Number.isFinite(atLeast) || !Number.isFinite(percent)) continue;
    seen.set(atLeast, percent);
  }
  for (const [atLeast, percent] of seen.entries()) {
    clean.push({ atLeastToman: atLeast, percent });
  }
  clean.sort((a, b) => a.atLeastToman - b.atLeastToman);
  return clean.length ? clean : undefined;
}

/**
 * Compute the agent's current tiered commission.
 *
 * Algorithm:
 *   1. Sum paid orders attributed to the agent, filtered by period.
 *   2. Find the tier with the highest `atLeastToman` that is ≤ that total.
 *   3. Commission = total × tier.percent / 100. The tier applies
 *      retroactively to every sale in the period, which is what the user
 *      explicitly asked for ("اگر پله دوم رو رد میکنم همه فروش از صفر تا
 *      هرجایی که فروخته میشه درصد ایگرگ").
 *
 * Period boundaries use the server's local timezone. For Persian-calendar
 * months later, swap the boundary computation here.
 */
export function computeAgentTieredCommission(agentId: string): {
  period: "month" | "all_time";
  periodLabel: string;
  periodTotal: number;
  saleCount: number;
  tiers: CommissionTier[];
  currentTier: CommissionTier | null;
  currentRate: number;
  earned: number;
  nextTier: CommissionTier | null;
  toNextTier: number;
} {
  const agent = db.salesAgents[agentId];
  const tiers = agent?.commissionTiers ?? [];
  const period = agent?.commissionPeriod ?? "month";

  const now = new Date();
  let from = -Infinity;
  let periodLabel = "از ابتدا";
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    from = start;
    periodLabel = now.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
    });
  }

  const orders = Object.values(db.orders).filter(
    (o) =>
      o.agentId === agentId &&
      o.status === "paid" &&
      (o.paidAt ?? o.createdAt) >= from
  );
  const periodTotal = orders.reduce((s, o) => s + o.finalAmount, 0);

  let currentTier: CommissionTier | null = null;
  for (const t of tiers) {
    if (periodTotal >= t.atLeastToman) currentTier = t;
    else break;
  }
  const nextTier = currentTier
    ? tiers.find((t) => t.atLeastToman > currentTier.atLeastToman) ?? null
    : tiers[0] ?? null;
  const toNextTier = nextTier
    ? Math.max(0, nextTier.atLeastToman - periodTotal)
    : 0;

  const currentRate = currentTier?.percent ?? 0;
  const earned = Math.round((periodTotal * currentRate) / 100);

  return {
    period,
    periodLabel,
    periodTotal,
    saleCount: orders.length,
    tiers,
    currentTier,
    currentRate,
    earned,
    nextTier,
    toNextTier,
  };
}

export function deleteSalesAgent(id: string): boolean {
  if (!db.salesAgents[id]) return false;
  delete db.salesAgents[id];
  persist();
  return true;
}

/** All paid orders attributed to a given agent, newest first. */
export function listOrdersForAgent(agentId: string): OrderRecord[] {
  return Object.values(db.orders)
    .filter((o) => o.agentId === agentId)
    .sort((a, b) => (b.paidAt ?? b.createdAt) - (a.paidAt ?? a.createdAt));
}

/** Aggregated KPIs for one agent — used in admin list + agent dashboard. */
export function getAgentStats(agentId: string) {
  const orders = listOrdersForAgent(agentId);
  const paid = orders.filter((o) => o.status === "paid");
  return {
    totalSales: paid.length,
    totalRevenue: paid.reduce((s, o) => s + o.finalAmount, 0),
    totalCommission: paid.reduce((s, o) => s + (o.commissionAmount ?? 0), 0),
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    lastSaleAt: paid[0]?.paidAt,
  };
}

// --- Referral links ---------------------------------------------------------

export function listReferralLinks(filter?: {
  agentId?: string;
  active?: boolean;
}): ReferralLinkRecord[] {
  return Object.values(db.referralLinks)
    .filter((l) => {
      if (filter?.agentId && l.agentId !== filter.agentId) return false;
      if (filter?.active !== undefined && l.isActive !== filter.active)
        return false;
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getReferralLink(id: string): ReferralLinkRecord | undefined {
  return db.referralLinks[id];
}

export function createReferralLink(input: {
  agentId: string;
  label: string;
  landingPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  isActive?: boolean;
}): ReferralLinkRecord {
  if (!db.salesAgents[input.agentId]) {
    throw new Error("کارشناس پیدا نشد");
  }
  const now = Date.now();
  const rec: ReferralLinkRecord = {
    id: `link_${Math.random().toString(36).slice(2, 10)}`,
    agentId: input.agentId,
    label: input.label.trim() || "بدون عنوان",
    landingPath: input.landingPath?.trim() || undefined,
    utmSource: input.utmSource?.trim() || undefined,
    utmMedium: input.utmMedium?.trim() || undefined,
    utmCampaign: input.utmCampaign?.trim() || undefined,
    clicks: 0,
    signups: 0,
    paidOrders: 0,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
  db.referralLinks[rec.id] = rec;
  persist();
  return rec;
}

export function updateReferralLink(
  id: string,
  patch: Partial<Omit<ReferralLinkRecord, "id" | "agentId" | "createdAt" | "clicks" | "signups" | "paidOrders">>,
): ReferralLinkRecord | undefined {
  const l = db.referralLinks[id];
  if (!l) return undefined;
  if (patch.label !== undefined) l.label = patch.label.trim() || "بدون عنوان";
  if (patch.landingPath !== undefined)
    l.landingPath = patch.landingPath.trim() || undefined;
  if (patch.utmSource !== undefined)
    l.utmSource = patch.utmSource.trim() || undefined;
  if (patch.utmMedium !== undefined)
    l.utmMedium = patch.utmMedium.trim() || undefined;
  if (patch.utmCampaign !== undefined)
    l.utmCampaign = patch.utmCampaign.trim() || undefined;
  if (patch.isActive !== undefined) l.isActive = patch.isActive;
  l.updatedAt = Date.now();
  persist();
  return l;
}

export function deleteReferralLink(id: string): boolean {
  if (!db.referralLinks[id]) return false;
  delete db.referralLinks[id];
  persist();
  return true;
}

/** Bump click counter. Called by the /r/[id] redirect route. */
export function incrementLinkClicks(id: string): void {
  const l = db.referralLinks[id];
  if (!l) return;
  l.clicks += 1;
  persist();
}

/** Bump signup counter. Called when a new user finishes OTP signup with
 *  a referral cookie in their request. */
export function incrementLinkSignups(id: string): void {
  const l = db.referralLinks[id];
  if (!l) return;
  l.signups += 1;
  persist();
}

/** Bump paid-order counter. Called from the payment callback once a paid
 *  order with attributed linkId is finalized. */
export function incrementLinkPaidOrders(id: string): void {
  const l = db.referralLinks[id];
  if (!l) return;
  l.paidOrders += 1;
  persist();
}

/** Users referred by a specific agent — used in both the agent's "my
 *  clients" tab and the admin's agent detail page. */
export function listUsersReferredByAgent(agentId: string): UserRecord[] {
  return Object.values(db.users)
    .filter((u) => u.referredByAgentId === agentId)
    .sort((a, b) => (b.referredAt ?? 0) - (a.referredAt ?? 0));
}

// --- Seminars --------------------------------------------------------------

/** فهرست همه‌ی سمینارها — به‌ترتیب تاریخ ایجاد نزولی. */
export function listSeminars(filter?: { publishedOnly?: boolean }): SeminarRecord[] {
  syncFromDisk();
  let list = Object.values(db.seminars);
  if (filter?.publishedOnly) list = list.filter((s) => s.status === "published");
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export function getSeminar(slug: string): SeminarRecord | undefined {
  syncFromDisk();
  return db.seminars[slug];
}

export function upsertSeminar(s: SeminarRecord): SeminarRecord {
  db.seminars[s.slug] = s;
  persist();
  return s;
}

export function deleteSeminar(slug: string): boolean {
  if (!db.seminars[slug]) return false;
  delete db.seminars[slug];
  // پاکسازی ثبت‌نام‌های وابسته همان لحظه‌ای که سمینار حذف شود لازم نیست؛
  // اما ثبت‌نام‌های یتیم می‌مانند. اینجا تصمیم گرفته‌ایم نگه‌داریم تا
  // اطلاعات تاریخی حفظ شود (مثل سفارش‌های دوره‌ی حذف‌شده).
  persist();
  return true;
}

/** افزودن/ویرایش یک بلوک محتوا. namespace = "landing" یا "member". */
export function upsertSeminarBlock(
  seminarSlug: string,
  namespace: "landing" | "member",
  block: SeminarContentBlock,
): SeminarContentBlock | undefined {
  const s = db.seminars[seminarSlug];
  if (!s) return undefined;
  const key = namespace === "landing" ? "landingBlocks" : "memberBlocks";
  const list = (s[key] ?? []).slice();
  const idx = list.findIndex((b) => b.id === block.id);
  if (idx >= 0) list[idx] = block;
  else list.push(block);
  s[key] = list;
  s.updatedAt = Date.now();
  persist();
  return block;
}

export function deleteSeminarBlock(
  seminarSlug: string,
  namespace: "landing" | "member",
  blockId: string,
): boolean {
  const s = db.seminars[seminarSlug];
  if (!s) return false;
  const key = namespace === "landing" ? "landingBlocks" : "memberBlocks";
  const list = (s[key] ?? []).filter((b) => b.id !== blockId);
  s[key] = list;
  s.updatedAt = Date.now();
  persist();
  return true;
}

export function reorderSeminarBlocks(
  seminarSlug: string,
  namespace: "landing" | "member",
  orderMap: Record<string, number>,
): boolean {
  const s = db.seminars[seminarSlug];
  if (!s) return false;
  const key = namespace === "landing" ? "landingBlocks" : "memberBlocks";
  const list = (s[key] ?? []).slice();
  for (const b of list) {
    if (orderMap[b.id] !== undefined) b.order = orderMap[b.id];
  }
  list.sort((a, b) => a.order - b.order);
  s[key] = list;
  s.updatedAt = Date.now();
  persist();
  return true;
}

// --- Seminar Registrations -------------------------------------------------

/** ساخت ثبت‌نام جدید برای کاربر (idempotent — اگر قبلاً ثبت شده باشد همان را برمی‌گرداند). */
export function registerSeminar(input: {
  userId: string;
  seminarSlug: string;
  fullName: string;
  nationalId: string;
  phone: string;
  orderId?: string;
  source?: "purchase" | "grant";
  grantedBy?: string;
}): SeminarRegistrationRecord {
  const existing = Object.values(db.seminarRegistrations).find(
    (r) => r.userId === input.userId && r.seminarSlug === input.seminarSlug,
  );
  if (existing) {
    // اگر قبلاً «grant» بوده ولی الان «purchase» می‌شود، orderId را به‌روز کنیم.
    if (input.orderId && !existing.orderId) {
      existing.orderId = input.orderId;
      existing.source = input.source ?? existing.source;
      persist();
    }
    return existing;
  }
  const rec: SeminarRegistrationRecord = {
    id: generateId("sreg"),
    userId: input.userId,
    seminarSlug: input.seminarSlug,
    fullName: input.fullName,
    nationalId: input.nationalId,
    phone: input.phone,
    orderId: input.orderId,
    qrCode: generateId("qr"),
    registeredAt: Date.now(),
    source: input.source ?? "purchase",
    grantedBy: input.grantedBy,
  };
  db.seminarRegistrations[rec.id] = rec;
  persist();
  return rec;
}

export function isRegisteredForSeminar(userId: string, seminarSlug: string): boolean {
  return Object.values(db.seminarRegistrations).some(
    (r) => r.userId === userId && r.seminarSlug === seminarSlug,
  );
}

export function getSeminarRegistration(
  userId: string,
  seminarSlug: string,
): SeminarRegistrationRecord | undefined {
  return Object.values(db.seminarRegistrations).find(
    (r) => r.userId === userId && r.seminarSlug === seminarSlug,
  );
}

export function listSeminarRegistrationsByUser(userId: string): SeminarRegistrationRecord[] {
  return Object.values(db.seminarRegistrations)
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.registeredAt - a.registeredAt);
}

export function listSeminarRegistrationsBySeminar(seminarSlug: string): SeminarRegistrationRecord[] {
  return Object.values(db.seminarRegistrations)
    .filter((r) => r.seminarSlug === seminarSlug)
    .sort((a, b) => b.registeredAt - a.registeredAt);
}

export function updateSeminarRegistration(
  id: string,
  patch: Partial<Pick<SeminarRegistrationRecord, "attended" | "qrCode" | "fullName" | "nationalId" | "phone">>,
): SeminarRegistrationRecord | undefined {
  const r = db.seminarRegistrations[id];
  if (!r) return undefined;
  Object.assign(r, patch);
  persist();
  return r;
}

export function deleteSeminarRegistration(id: string): boolean {
  if (!db.seminarRegistrations[id]) return false;
  delete db.seminarRegistrations[id];
  persist();
  return true;
}

// --- Raw debug access (dev only) -------------------------------------------

export function __rawSnapshot(): Snapshot {
  return db;
}
