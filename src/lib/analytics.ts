/**
 * Aggregations over the file-backed DB. All numbers in Toman unless noted.
 */

import {
  listAllOrders,
  listCourses,
  listUsers,
  listEnrollmentRecordsForCourse,
  __rawSnapshot,
  type OrderRecord,
} from "@/lib/db";

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayBuckets(range: number) {
  const today = startOfDay(Date.now());
  const buckets: { t: number; label: string }[] = [];
  for (let i = range - 1; i >= 0; i--) {
    const t = today - i * DAY;
    buckets.push({
      t,
      label: new Date(t).toLocaleDateString("fa-IR", {
        month: "2-digit",
        day: "2-digit",
      }),
    });
  }
  return buckets;
}

// --- Overview --------------------------------------------------------------

export function getOverviewStats() {
  const users = listUsers();
  const courses = listCourses();
  const orders = listAllOrders();
  const paid = orders.filter((o) => o.status === "paid");
  const refunded = orders.filter(
    (o) => o.status === "refunded" || o.status === "partial_refund"
  );

  const totalRevenue = paid.reduce((s, o) => s + o.finalAmount, 0);
  const totalRefunds = refunded.reduce((s, o) => s + (o.refundAmount ?? 0), 0);
  const netRevenue = totalRevenue - totalRefunds;

  const monthAgo = Date.now() - 30 * DAY;
  const revenueMonth = paid
    .filter((o) => (o.paidAt ?? o.createdAt) >= monthAgo)
    .reduce((s, o) => s + o.finalAmount, 0);

  const prevMonthStart = Date.now() - 60 * DAY;
  const revenuePrevMonth = paid
    .filter(
      (o) =>
        (o.paidAt ?? o.createdAt) >= prevMonthStart &&
        (o.paidAt ?? o.createdAt) < monthAgo
    )
    .reduce((s, o) => s + o.finalAmount, 0);
  const revenueGrowth =
    revenuePrevMonth === 0
      ? null
      : (revenueMonth - revenuePrevMonth) / revenuePrevMonth;

  const newUsersMonth = users.filter((u) => u.createdAt >= monthAgo).length;
  const newPaidOrdersMonth = paid.filter(
    (o) => (o.paidAt ?? o.createdAt) >= monthAgo
  ).length;

  const conversionRate =
    users.length === 0
      ? 0
      : paid.length / users.length;

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === "published").length,
    totalOrders: orders.length,
    paidOrders: paid.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    failedOrders: orders.filter((o) => o.status === "failed").length,
    totalRevenue,
    netRevenue,
    revenueMonth,
    revenuePrevMonth,
    revenueGrowth,
    newUsersMonth,
    newPaidOrdersMonth,
    conversionRate,
    totalRefunds,
  };
}

// --- Time series ----------------------------------------------------------

export function getRevenueSeries(rangeDays = 30) {
  const orders = listAllOrders().filter((o) => o.status === "paid");
  const buckets = dayBuckets(rangeDays);
  const map = new Map<number, number>();
  for (const b of buckets) map.set(b.t, 0);

  for (const o of orders) {
    const day = startOfDay(o.paidAt ?? o.createdAt);
    if (map.has(day)) {
      map.set(day, (map.get(day) ?? 0) + o.finalAmount);
    }
  }

  return buckets.map((b) => ({
    date: b.t,
    label: b.label,
    revenue: map.get(b.t) ?? 0,
  }));
}

export function getGrowthSeries(rangeDays = 30) {
  const users = listUsers();
  const buckets = dayBuckets(rangeDays);
  const newMap = new Map<number, number>();
  for (const b of buckets) newMap.set(b.t, 0);

  for (const u of users) {
    const day = startOfDay(u.createdAt);
    if (newMap.has(day)) newMap.set(day, (newMap.get(day) ?? 0) + 1);
  }

  let cumulative = users.filter(
    (u) => u.createdAt < buckets[0].t
  ).length;

  return buckets.map((b) => {
    const added = newMap.get(b.t) ?? 0;
    cumulative += added;
    return { date: b.t, label: b.label, added, total: cumulative };
  });
}

export function getOrdersSeries(rangeDays = 30) {
  const orders = listAllOrders();
  const buckets = dayBuckets(rangeDays);
  const paidMap = new Map<number, number>();
  const failedMap = new Map<number, number>();
  for (const b of buckets) {
    paidMap.set(b.t, 0);
    failedMap.set(b.t, 0);
  }
  for (const o of orders) {
    const day = startOfDay(o.createdAt);
    if (!paidMap.has(day)) continue;
    if (o.status === "paid") paidMap.set(day, (paidMap.get(day) ?? 0) + 1);
    else if (o.status === "failed") failedMap.set(day, (failedMap.get(day) ?? 0) + 1);
  }
  return buckets.map((b) => ({
    date: b.t,
    label: b.label,
    paid: paidMap.get(b.t) ?? 0,
    failed: failedMap.get(b.t) ?? 0,
  }));
}

// --- Funnel ---------------------------------------------------------------

export function getFunnel() {
  const users = listUsers();
  const orders = listAllOrders();
  const signedUp = users.length;
  const startedOrder = new Set(orders.map((o) => o.userId)).size;
  const paidOrder = new Set(
    orders.filter((o) => o.status === "paid").map((o) => o.userId)
  ).size;

  return [
    { label: "ثبت‌نام", value: signedUp },
    { label: "شروع خرید", value: startedOrder },
    { label: "پرداخت موفق", value: paidOrder },
  ];
}

// --- Retention (cohort by signup month) -----------------------------------

export function getRetention() {
  const users = listUsers();
  const orders = listAllOrders().filter((o) => o.status === "paid");

  const cohorts = new Map<string, { size: number; retained: Set<string> }>();
  const paidUsers = new Map<string, number>(); // userId → first paidAt

  for (const o of orders) {
    const at = o.paidAt ?? o.createdAt;
    const current = paidUsers.get(o.userId);
    if (!current || at < current) paidUsers.set(o.userId, at);
  }

  for (const u of users) {
    const cohortKey = new Date(u.createdAt).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "2-digit",
    });
    if (!cohorts.has(cohortKey)) {
      cohorts.set(cohortKey, { size: 0, retained: new Set() });
    }
    const c = cohorts.get(cohortKey)!;
    c.size += 1;
    if (paidUsers.has(u.id)) c.retained.add(u.id);
  }

  return [...cohorts.entries()]
    .map(([month, { size, retained }]) => ({
      month,
      size,
      retained: retained.size,
      rate: size ? retained.size / size : 0,
    }))
    .sort((a, b) => (a.month < b.month ? 1 : -1))
    .slice(0, 12);
}

// --- Top courses ----------------------------------------------------------

export function getTopCourses(limit = 10) {
  const courses = listCourses();
  const orders = listAllOrders().filter((o) => o.status === "paid");

  const salesBySlug = new Map<string, { count: number; revenue: number }>();
  for (const c of courses)
    salesBySlug.set(c.slug, { count: 0, revenue: 0 });
  for (const o of orders) {
    const s = salesBySlug.get(o.courseSlug);
    if (s) {
      s.count += 1;
      s.revenue += o.finalAmount;
    }
  }

  return courses
    .map((c) => {
      const s = salesBySlug.get(c.slug) ?? { count: 0, revenue: 0 };
      const enrolled = listEnrollmentRecordsForCourse(c.slug).length;
      return {
        slug: c.slug,
        title: c.title,
        image: c.previewImage,
        status: c.status,
        sales: s.count,
        revenue: s.revenue,
        enrolled,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// --- Video analytics ------------------------------------------------------

export function getLessonAnalytics(lessonId: string) {
  const snap = __rawSnapshot();
  const progress = Object.values(snap.videoProgress).filter(
    (p) => p.lessonId === lessonId
  );
  const events = snap.watchEvents.filter((e) => e.lessonId === lessonId);
  const lesson = snap.lessons[lessonId];
  const duration = lesson?.videoDurationSec ?? 0;

  const viewers = progress.length;
  const completed = progress.filter((p) => p.completed).length;
  const avgWatchSec =
    viewers === 0
      ? 0
      : Math.round(progress.reduce((s, p) => s + p.watchedSec, 0) / viewers);
  const totalWatchSec = progress.reduce((s, p) => s + p.watchedSec, 0);
  const completionRate = viewers ? completed / viewers : 0;

  // Drop-off: sample 20 buckets across the duration and count how many
  // progress records reached each bucket.
  const BUCKETS = 20;
  const dropoff: { t: number; viewers: number }[] = [];
  if (duration > 0) {
    for (let i = 0; i < BUCKETS; i++) {
      const t = Math.round((duration * i) / BUCKETS);
      const reached = progress.filter((p) => p.maxPositionSec >= t).length;
      dropoff.push({ t, viewers: reached });
    }
  }

  return {
    viewers,
    completed,
    completionRate,
    avgWatchSec,
    totalWatchSec,
    dropoff,
    eventsCount: events.length,
  };
}

// --- Helper for order buckets by month (for revenue page) ------------------

export function groupOrdersByMonth(orders: OrderRecord[]) {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    if (o.status !== "paid") continue;
    const d = new Date(o.paidAt ?? o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cur = map.get(key) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += o.finalAmount;
    map.set(key, cur);
  }
  return [...map.entries()]
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => (a.month < b.month ? 1 : -1));
}
