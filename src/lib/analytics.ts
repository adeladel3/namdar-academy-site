/**
 * Aggregations over the file-backed DB. All numbers in Toman unless noted.
 */

import {
  listAllOrders,
  listCourses,
  listUsers,
  listDiscounts,
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

// --- Marketing / sales reports --------------------------------------------

export type PeriodKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "ytd"
  | "all";

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: "امروز",
  yesterday: "دیروز",
  "7d": "۷ روز گذشته",
  "30d": "۳۰ روز گذشته",
  "90d": "۹۰ روز گذشته",
  ytd: "از ابتدای سال",
  all: "کل دوران",
};

/**
 * Returns the inclusive [from, to] window for a period plus the previous
 * equal-length window for period-over-period comparison. Timestamps in ms.
 */
export function getPeriodWindow(period: PeriodKey): {
  from: number;
  to: number;
  prevFrom: number;
  prevTo: number;
  lengthDays: number;
} {
  const now = Date.now();
  const today0 = startOfDay(now);

  if (period === "today") {
    return {
      from: today0,
      to: now,
      prevFrom: today0 - DAY,
      prevTo: today0,
      lengthDays: 1,
    };
  }
  if (period === "yesterday") {
    return {
      from: today0 - DAY,
      to: today0,
      prevFrom: today0 - 2 * DAY,
      prevTo: today0 - DAY,
      lengthDays: 1,
    };
  }
  if (period === "ytd") {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
    const prevYearStart = new Date(new Date().getFullYear() - 1, 0, 1).getTime();
    return {
      from: yearStart,
      to: now,
      prevFrom: prevYearStart,
      prevTo: yearStart,
      lengthDays: Math.ceil((now - yearStart) / DAY),
    };
  }
  if (period === "all") {
    return {
      from: 0,
      to: now,
      prevFrom: 0,
      prevTo: 0,
      lengthDays: Math.ceil((now - 0) / DAY),
    };
  }
  const lengthDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const from = today0 - (lengthDays - 1) * DAY;
  return {
    from,
    to: now,
    prevFrom: from - lengthDays * DAY,
    prevTo: from,
    lengthDays,
  };
}

function deltaRatio(current: number, previous: number): number | null {
  if (!previous) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

/** Revenue + orders + customer KPIs for a given period, with PoP deltas. */
export function getSalesKPIs(period: PeriodKey) {
  const w = getPeriodWindow(period);
  const orders = listAllOrders();

  const paidIn = (from: number, to: number) =>
    orders.filter(
      (o) =>
        o.status === "paid" &&
        (o.paidAt ?? o.createdAt) >= from &&
        (o.paidAt ?? o.createdAt) < to
    );

  const curr = paidIn(w.from, w.to);
  const prev = paidIn(w.prevFrom, w.prevTo);

  const revenue = curr.reduce((s, o) => s + o.finalAmount, 0);
  const revenuePrev = prev.reduce((s, o) => s + o.finalAmount, 0);
  const ordersCount = curr.length;
  const ordersCountPrev = prev.length;
  const aov = ordersCount ? revenue / ordersCount : 0;
  const aovPrev = ordersCountPrev ? revenuePrev / ordersCountPrev : 0;
  const customers = new Set(curr.map((o) => o.userId)).size;
  const customersPrev = new Set(prev.map((o) => o.userId)).size;
  const discountGiven = curr.reduce((s, o) => s + (o.discountAmount ?? 0), 0);
  const discountGivenPrev = prev.reduce(
    (s, o) => s + (o.discountAmount ?? 0),
    0
  );

  // Repeat rate in this window: customers in this window who also have a
  // paid order strictly before this window.
  const priorCustomers = new Set(
    orders
      .filter((o) => o.status === "paid" && (o.paidAt ?? o.createdAt) < w.from)
      .map((o) => o.userId)
  );
  const repeatCustomers = new Set(
    curr.filter((o) => priorCustomers.has(o.userId)).map((o) => o.userId)
  );
  const repeatRate = customers ? repeatCustomers.size / customers : 0;

  return {
    period,
    window: w,
    revenue,
    revenueDelta: deltaRatio(revenue, revenuePrev),
    orders: ordersCount,
    ordersDelta: deltaRatio(ordersCount, ordersCountPrev),
    aov,
    aovDelta: deltaRatio(aov, aovPrev),
    customers,
    customersDelta: deltaRatio(customers, customersPrev),
    discountGiven,
    discountGivenDelta: deltaRatio(discountGiven, discountGivenPrev),
    repeatRate,
    repeatCustomers: repeatCustomers.size,
    newCustomers: customers - repeatCustomers.size,
  };
}

/** Per-discount-code performance: uses, attributed revenue, total discount given. */
export function getDiscountPerformance(period: PeriodKey) {
  const w = getPeriodWindow(period);
  const orders = listAllOrders().filter(
    (o) =>
      o.status === "paid" &&
      o.couponCode &&
      (o.paidAt ?? o.createdAt) >= w.from &&
      (o.paidAt ?? o.createdAt) < w.to
  );
  const codes = listDiscounts();

  const stats = new Map<
    string,
    { uses: number; revenue: number; discount: number }
  >();
  for (const o of orders) {
    const key = (o.couponCode ?? "").toUpperCase();
    if (!key) continue;
    const cur = stats.get(key) ?? { uses: 0, revenue: 0, discount: 0 };
    cur.uses += 1;
    cur.revenue += o.finalAmount;
    cur.discount += o.discountAmount ?? 0;
    stats.set(key, cur);
  }

  return codes
    .map((c) => {
      const s = stats.get(c.code.toUpperCase()) ?? {
        uses: 0,
        revenue: 0,
        discount: 0,
      };
      return {
        code: c.code,
        kind: c.kind,
        value: c.value,
        active: c.active,
        totalUses: c.uses,
        windowUses: s.uses,
        windowRevenue: s.revenue,
        windowDiscount: s.discount,
        avgOrderValue: s.uses ? s.revenue / s.uses : 0,
        expiresAt: c.expiresAt,
        courseSlug: c.courseSlug,
      };
    })
    .sort((a, b) => b.windowRevenue - a.windowRevenue);
}

/**
 * Per-course conversion: how many users enrolled / paid / avg days to pay
 * from signup. No traffic source data — conversion computed from signup→pay.
 */
export function getCourseConversion() {
  const courses = listCourses();
  const orders = listAllOrders();
  const users = listUsers();
  const userSignup = new Map<string, number>();
  for (const u of users) userSignup.set(u.id, u.createdAt);

  return courses.map((c) => {
    const enrolls = listEnrollmentRecordsForCourse(c.slug);
    const courseOrders = orders.filter((o) => {
      if (!o.courseSlug) return false;
      if (o.courseSlug === c.slug) return true;
      return o.courseSlug.split(",").map((s) => s.trim()).includes(c.slug);
    });
    const paid = courseOrders.filter((o) => o.status === "paid");
    const failed = courseOrders.filter((o) => o.status === "failed");
    const pending = courseOrders.filter((o) => o.status === "pending");
    const revenue = paid.reduce((s, o) => s + o.finalAmount, 0);

    const daysToPayList: number[] = [];
    for (const o of paid) {
      const at = o.paidAt ?? o.createdAt;
      const signup = userSignup.get(o.userId);
      if (!signup) continue;
      daysToPayList.push((at - signup) / DAY);
    }
    const avgDaysToPay = daysToPayList.length
      ? daysToPayList.reduce((s, v) => s + v, 0) / daysToPayList.length
      : null;

    const attempted = courseOrders.length;
    const paidConversion = attempted ? paid.length / attempted : 0;

    return {
      slug: c.slug,
      title: c.title,
      status: c.status,
      price: c.price,
      discountPrice: c.discountPrice,
      enrolls: enrolls.length,
      orders: attempted,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
      paidConversion,
      revenue,
      avgDaysToPay,
    };
  });
}

/** Signup-month cohort × paid-revenue-per-user over time. */
export function getCustomerCohorts() {
  const users = listUsers();
  const orders = listAllOrders().filter((o) => o.status === "paid");

  const cohort = new Map<
    string,
    { size: number; paying: Set<string>; revenue: number; orders: number }
  >();

  const signupByUser = new Map<string, number>();
  for (const u of users) signupByUser.set(u.id, u.createdAt);

  for (const u of users) {
    const d = new Date(u.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const c = cohort.get(key) ?? {
      size: 0,
      paying: new Set<string>(),
      revenue: 0,
      orders: 0,
    };
    c.size += 1;
    cohort.set(key, c);
  }
  for (const o of orders) {
    const signup = signupByUser.get(o.userId);
    if (!signup) continue;
    const d = new Date(signup);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const c = cohort.get(key);
    if (!c) continue;
    c.paying.add(o.userId);
    c.revenue += o.finalAmount;
    c.orders += 1;
  }

  return [...cohort.entries()]
    .map(([month, v]) => ({
      month,
      size: v.size,
      paying: v.paying.size,
      revenue: v.revenue,
      orders: v.orders,
      ltv: v.paying.size ? v.revenue / v.paying.size : 0,
      conversion: v.size ? v.paying.size / v.size : 0,
    }))
    .sort((a, b) => (a.month < b.month ? 1 : -1))
    .slice(0, 12);
}

/** Top spenders — customers ranked by total paid amount. */
export function getTopCustomers(limit = 10) {
  const orders = listAllOrders().filter((o) => o.status === "paid");
  const users = listUsers();
  const byUser = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const cur = byUser.get(o.userId) ?? { revenue: 0, orders: 0 };
    cur.revenue += o.finalAmount;
    cur.orders += 1;
    byUser.set(o.userId, cur);
  }
  return [...byUser.entries()]
    .map(([userId, v]) => {
      const u = users.find((x) => x.id === userId);
      return {
        userId,
        name: u?.name ?? "(کاربر حذف شده)",
        phone: u?.phone ?? "",
        revenue: v.revenue,
        orders: v.orders,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/** Repeat-purchase funnel: % of customers with 1, 2, 3+ paid orders. */
export function getRepeatPurchaseFunnel() {
  const orders = listAllOrders().filter((o) => o.status === "paid");
  const byUser = new Map<string, number>();
  for (const o of orders) byUser.set(o.userId, (byUser.get(o.userId) ?? 0) + 1);

  const total = byUser.size;
  const one = [...byUser.values()].filter((v) => v >= 1).length;
  const two = [...byUser.values()].filter((v) => v >= 2).length;
  const three = [...byUser.values()].filter((v) => v >= 3).length;

  return [
    { label: "حداقل ۱ خرید", value: one, rate: 1 },
    {
      label: "حداقل ۲ خرید",
      value: two,
      rate: total ? two / total : 0,
    },
    {
      label: "حداقل ۳ خرید",
      value: three,
      rate: total ? three / total : 0,
    },
  ];
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
