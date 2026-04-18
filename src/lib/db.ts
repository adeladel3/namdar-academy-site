/**
 * File-backed JSON store — extended schema for admin panel.
 *
 * Designed to map 1:1 to Prisma/Postgres later. Each mutation goes through a
 * helper that calls persist() (debounced fs.writeFile). Reads are O(1) against
 * the in-memory snapshot loaded once at module init.
 */

import fs from "node:fs";
import path from "node:path";
import { COURSES as SEED_COURSES } from "@/data/courses";
import { ARTICLES as SEED_ARTICLES } from "@/data/articles";

// --- Types -----------------------------------------------------------------

export type UserRole = "admin" | "support" | "student";
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
};

export type OtpRecord = { code: string; expiresAt: number; attempts: number };

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
  badge?: string;
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
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partial_refund";

export type OrderRecord = {
  id: string;
  userId: string;
  courseSlug: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod: "sep" | "manual" | "grant";
  refNum?: string;
  authority?: string;
  createdAt: number;
  paidAt?: number;
  refundedAt?: number;
  refundAmount?: number;
  refundReason?: string;
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
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
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
  faqs: Record<string, FaqRecord>;
  discounts: Record<string, DiscountCode>;
  reviews: Record<string, CourseReview>;
  articles: Record<string, ArticleRecord>;
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
    faqs: {},
    discounts: {},
    reviews: {},
    articles: {},
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
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Snapshot | LegacySnapshotV1;
    if ((parsed as Snapshot).version === 2) return parsed as Snapshot;
    if ((parsed as LegacySnapshotV1).version === 1) {
      console.log("[db] migrating v1 → v2");
      const migrated = migrateV1toV2(parsed as LegacySnapshotV1);
      try {
        fs.writeFileSync(DB_PATH + ".v1.bak", raw);
      } catch {}
      return migrated;
    }
    return emptySnapshot();
  } catch {
    return emptySnapshot();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __namdar_db: Snapshot | undefined;
  // eslint-disable-next-line no-var
  var __namdar_db_timer: NodeJS.Timeout | undefined;
}

// Discard any cached global that doesn't match current schema version (e.g. from
// HMR after schema change). This forces a fresh load() on next access.
if (globalThis.__namdar_db && globalThis.__namdar_db.version !== 2) {
  globalThis.__namdar_db = undefined;
}

const db: Snapshot = globalThis.__namdar_db ?? (globalThis.__namdar_db = load());

function persist() {
  if (globalThis.__namdar_db_timer) return;
  globalThis.__namdar_db_timer = setTimeout(() => {
    globalThis.__namdar_db_timer = undefined;
    try {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(db), "utf8");
    } catch (e) {
      console.error("[db] persist failed:", (e as Error).message);
    }
  }, 50);
}

// --- Seeding ---------------------------------------------------------------

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-");
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
  db.faqs ??= {};
  db.discounts ??= {};
  db.reviews ??= {};
  db.articles ??= {};

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
      "site.contactEmail": "info@namdar.academy",
      "site.contactPhone": "021-00000000",
      "site.address": "تهران، ایران",
      "branding.primaryColor": "#1b3c8a",
      "branding.accentColor": "#f7cf5a",
      "branding.logoUrl": "",
      "branding.fontFamily": "Vazirmatn",
      "payment.provider": "sep",
      "payment.sepTerminalId": "",
      "sms.provider": "kavenegar",
      "sms.apiKey": "",
      "sms.senderLine": "",
      "sms.otpTemplate": "",
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
}

seedIfEmpty();

// --- ID helpers ------------------------------------------------------------

export function generateId(prefix = "") {
  const core = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  return prefix ? `${prefix}_${core}` : core;
}
export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
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
}): UserRecord {
  const isFirst = Object.keys(db.users).length === 0;
  const role: UserRole =
    input.role ??
    (isFirst || input.phone === process.env.ADMIN_PHONE ? "admin" : "student");
  const u: UserRecord = {
    id: input.id ?? generateId("u"),
    phone: input.phone,
    email: input.email,
    name: input.name,
    role,
    status: "active",
    createdAt: Date.now(),
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
export function enableUser(id: string) {
  return updateUser(id, {
    status: "active",
    disabledAt: undefined,
    disabledReason: undefined,
  });
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
}) {
  const existing = Object.values(db.enrollments).find(
    (e) => e.userId === userId && e.courseSlug === courseSlug
  );
  if (existing) return existing;
  const rec: EnrollmentRecord = {
    id: generateId("enr"),
    userId,
    courseSlug,
    enrolledAt: Date.now(),
    source: input?.source ?? "purchase",
    orderId: input?.orderId,
    grantedBy: input?.grantedBy,
  };
  db.enrollments[rec.id] = rec;
  const c = db.courses[courseSlug];
  if (c) c.studentsCount += 1;
  persist();
  return rec;
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
  return db.settings[key]?.value as T | undefined;
}
export function setSetting(key: string, value: unknown, updatedBy: string) {
  db.settings[key] = { key, value, updatedBy, updatedAt: Date.now() };
  persist();
}
export function listSettings(prefix?: string) {
  const all = Object.values(db.settings);
  return prefix ? all.filter((s) => s.key.startsWith(prefix)) : all;
}
export function getSettingsGroup(prefix: string): Record<string, unknown> {
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

// --- Raw debug access (dev only) -------------------------------------------

export function __rawSnapshot(): Snapshot {
  return db;
}
