import Link from "@/components/SafeLink";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { getAdminSections } from "@/lib/admin-sections";
import {
  PERIOD_LABELS,
  getGrowthSeries,
  getOrdersSeries,
  getOverviewStats,
  getRevenueSeries,
  getSalesKPIs,
  getTopCourses,
  getTopCustomers,
  type PeriodKey,
} from "@/lib/analytics";
import {
  listAllOrders,
  listCallbackRequests,
  listUsers,
  getCourse,
  getUser,
  getTicketCounts,
} from "@/lib/db";
import {
  DualLineChart,
  LineChart,
} from "@/components/admin/Charts";
import { Card, CardHeader } from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  faDigits,
  formatDateTime,
  formatPhone,
  formatRelative,
  formatToman,
  formatTomanCompact,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

const PERIODS: PeriodKey[] = ["today", "7d", "30d", "90d", "ytd", "all"];

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  // اگر کاربر staff است ولی دسترسی به داشبورد ندارد (مثلاً منتوری که فقط
  // `ticket.*` گرفته)، به اولین بخش مجازش ریدایرکت کن تا KPI و آمار
  // محرمانه را نبیند. layout قبلاً تضمین کرده session معتبر و staff است.
  const session = await getSession();
  if (!can(session, "dashboard.view")) {
    const firstAllowed = getAdminSections().find((s) => {
      const a = s.actions[0];
      return a && can(session, a);
    });
    redirect(firstAllowed?.href ?? "/dashboard");
  }

  const sp = await searchParams;
  const period = (PERIODS.includes(sp.period as PeriodKey)
    ? sp.period
    : "30d") as PeriodKey;

  const overview = getOverviewStats();
  const kpi = getSalesKPIs(period);
  const revenueSeries = getRevenueSeries(30);
  const growthSeries = getGrowthSeries(30);
  const ordersSeries = getOrdersSeries(30);
  const topCourses = getTopCourses(5);
  const topCustomers = getTopCustomers(5);
  const recentOrders = listAllOrders().slice(0, 8);
  const recentUsers = listUsers().slice(0, 6);
  const tickets = getTicketCounts();
  const newCallbacks = listCallbackRequests({ status: "new" }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            داشبورد مدیریت
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            نمای کلی کسب‌وکار — در بازه‌ی {PERIOD_LABELS[period]}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodSwitcher current={period} />
          <Link
            href="/admin/analytics/marketing"
            className="text-xs font-bold text-white bg-gradient-to-r from-[#1b3c8a] to-[#49bbbd] px-4 py-2 rounded-full hover:opacity-95 transition whitespace-nowrap"
          >
            گزارش جامع فروش ←
          </Link>
        </div>
      </div>

      <AlertsStrip
        pending={overview.pendingOrders}
        failedMonth={overview.failedOrders}
        openTickets={tickets.open}
        unreadTickets={tickets.unreadForStaff}
        newCallbacks={newCallbacks}
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          label="درآمد"
          value={formatTomanCompact(kpi.revenue)}
          delta={kpi.revenueDelta}
          subtitle={formatToman(kpi.revenue)}
          icon={<Icon.Money width={16} height={16} />}
          highlight
        />
        <KpiCard
          label="تعداد سفارش موفق"
          value={faDigits(kpi.orders)}
          delta={kpi.ordersDelta}
          icon={<Icon.Receipt width={16} height={16} />}
        />
        <KpiCard
          label="ارزش متوسط سفارش"
          value={formatTomanCompact(Math.round(kpi.aov))}
          delta={kpi.aovDelta}
          icon={<Icon.Trend width={16} height={16} />}
        />
        <KpiCard
          label="مشتریان خریدار"
          value={faDigits(kpi.customers)}
          delta={kpi.customersDelta}
          subtitle={`${faDigits(kpi.newCustomers)} جدید · ${faDigits(
            kpi.repeatCustomers
          )} تکراری`}
          icon={<Icon.Users width={16} height={16} />}
        />
        <KpiCard
          label="نرخ خرید تکراری"
          value={`${faDigits((kpi.repeatRate * 100).toFixed(1))}٪`}
          hint="سهم مشتری‌های قدیمی از خرید این بازه"
          icon={<Icon.Check width={16} height={16} />}
        />
      </div>

      <Card>
        <CardHeader
          title="روند درآمد ۳۰ روز گذشته"
          subtitle={`مجموع خالص کل: ${formatTomanCompact(overview.netRevenue)}`}
        />
        <div className="p-4">
          <LineChart
            data={revenueSeries.map((r) => ({
              label: r.label,
              value: r.revenue,
            }))}
            format="tomanCompact"
            color="#1b3c8a"
            height={260}
          />
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="رشد کاربران"
            subtitle="تعداد کاربر جدید روزانه"
          />
          <div className="p-4">
            <LineChart
              data={growthSeries.map((g) => ({
                label: g.label,
                value: g.added,
              }))}
              color="#49bbbd"
              height={220}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="وضعیت سفارش‌ها" subtitle="موفق / ناموفق روزانه" />
          <div className="p-4">
            <DualLineChart
              data={ordersSeries.map((o) => ({
                label: o.label,
                paid: o.paid,
                failed: o.failed,
              }))}
              keys={[
                { key: "paid", color: "#22c55e", name: "موفق" },
                { key: "failed", color: "#ef4444", name: "ناموفق" },
              ]}
              height={220}
            />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="پرفروش‌ترین دوره‌ها"
            right={
              <Link
                href="/admin/analytics/courses"
                className="text-sm text-[#1b3c8a] font-bold hover:underline"
              >
                همه ←
              </Link>
            }
          />
          {topCourses.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز سفارشی ثبت نشده است.
            </div>
          ) : (
            <div className="divide-y divide-[#eef2f7]">
              {topCourses.map((c, idx) => (
                <Link
                  key={c.slug}
                  href={`/admin/courses/${c.slug}`}
                  className="flex items-center gap-4 p-4 hover:bg-[#f7fafd] transition"
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {faDigits(idx + 1)}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-14 h-9 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#010514] truncate">
                      {c.title}
                    </div>
                    <div className="text-xs text-[#010514]/55">
                      {faDigits(c.enrolled)} ثبت‌نام
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#1b3c8a]">
                      {formatTomanCompact(c.revenue)}
                    </div>
                    <div className="text-xs text-[#010514]/55">
                      {faDigits(c.sales)} فروش
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="برترین مشتریان"
            right={
              <Link
                href="/admin/analytics/marketing"
                className="text-sm text-[#1b3c8a] font-bold hover:underline"
              >
                جزئیات ←
              </Link>
            }
          />
          {topCustomers.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز مشتری خریدی نداریم.
            </div>
          ) : (
            <ul className="divide-y divide-[#eef2f7]">
              {topCustomers.map((c, idx) => (
                <li key={c.userId} className="flex items-center gap-3 p-4">
                  <span className="w-7 h-7 rounded-full bg-[#fff7d8] text-[#a98608] font-bold text-xs flex items-center justify-center shrink-0">
                    {faDigits(idx + 1)}
                  </span>
                  <Link
                    href={`/admin/users/${c.userId}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="font-medium text-sm truncate">{c.name}</div>
                    <div
                      className="text-[11px] text-[#010514]/55 font-mono"
                      dir="ltr"
                    >
                      {formatPhone(c.phone)}
                    </div>
                  </Link>
                  <div className="text-left">
                    <div className="font-bold text-[#1b3c8a] text-sm">
                      {formatTomanCompact(c.revenue)}
                    </div>
                    <div className="text-xs text-[#010514]/55">
                      {faDigits(c.orders)} سفارش
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="آخرین سفارش‌ها"
            right={
              <Link
                href="/admin/orders"
                className="text-sm text-[#1b3c8a] font-bold hover:underline"
              >
                همه ←
              </Link>
            }
          />
          {recentOrders.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز سفارشی ثبت نشده است.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f7fafd] text-[#010514]/65">
                  <tr>
                    <th className="text-right p-3">کاربر</th>
                    <th className="text-right p-3">دوره</th>
                    <th className="text-right p-3">مبلغ</th>
                    <th className="text-right p-3">وضعیت</th>
                    <th className="text-right p-3">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => {
                    const u = getUser(o.userId);
                    const c = getCourse(o.courseSlug);
                    return (
                      <tr key={o.id} className="border-t border-[#eef2f7]">
                        <td className="p-3">
                          <div className="text-sm">{u?.name ?? "—"}</div>
                          <div
                            className="text-[11px] text-[#010514]/55 font-mono"
                            dir="ltr"
                          >
                            {u ? formatPhone(u.phone) : ""}
                          </div>
                        </td>
                        <td className="p-3 truncate max-w-[200px]">
                          {c?.title ?? o.courseSlug}
                        </td>
                        <td className="p-3 font-bold text-[#1b3c8a]">
                          {formatTomanCompact(o.finalAmount)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${ORDER_STATUS_COLORS[o.status]}`}
                          >
                            {ORDER_STATUS_LABELS[o.status]}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-[#010514]/55">
                          {formatDateTime(o.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="کاربران جدید" />
          {recentUsers.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز کاربری نیست.
            </div>
          ) : (
            <ul className="divide-y divide-[#eef2f7]">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-9 h-9 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold text-sm flex items-center justify-center">
                    {u.name.charAt(0)}
                  </span>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="font-medium text-sm truncate">{u.name}</div>
                    <div
                      className="text-[11px] text-[#010514]/55 font-mono"
                      dir="ltr"
                    >
                      {formatPhone(u.phone)}
                    </div>
                  </Link>
                  <span className="text-[10px] text-[#010514]/50">
                    {formatRelative(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function PeriodSwitcher({ current }: { current: PeriodKey }) {
  return (
    <div className="inline-flex items-center gap-1 bg-white rounded-full border border-[#e5eaf5] p-1 overflow-x-auto max-w-full">
      {PERIODS.map((p) => {
        const active = p === current;
        return (
          <Link
            key={p}
            href={`/admin?period=${p}`}
            className={
              active
                ? "px-3 py-1.5 text-xs rounded-full bg-[#1b3c8a] text-white font-bold whitespace-nowrap"
                : "px-3 py-1.5 text-xs rounded-full text-[#010514]/65 hover:text-[#010514] whitespace-nowrap"
            }
          >
            {PERIOD_LABELS[p]}
          </Link>
        );
      })}
    </div>
  );
}

function AlertsStrip({
  pending,
  failedMonth,
  openTickets,
  unreadTickets,
  newCallbacks,
}: {
  pending: number;
  failedMonth: number;
  openTickets: number;
  unreadTickets: number;
  newCallbacks: number;
}) {
  const alerts: {
    tone: "warning" | "danger" | "info";
    text: string;
    href: string;
    count: number;
  }[] = [];
  if (pending > 0)
    alerts.push({
      tone: "warning",
      text: "سفارش در انتظار پرداخت",
      href: "/admin/orders?status=pending",
      count: pending,
    });
  if (failedMonth > 0)
    alerts.push({
      tone: "danger",
      text: "پرداخت ناموفق",
      href: "/admin/orders?status=failed",
      count: failedMonth,
    });
  if (openTickets > 0)
    alerts.push({
      tone: "info",
      text: `تیکت باز${unreadTickets > 0 ? ` (${faDigits(unreadTickets)} خوانده‌نشده)` : ""}`,
      href: "/admin/tickets",
      count: openTickets,
    });
  if (newCallbacks > 0)
    alerts.push({
      tone: "info",
      text: "درخواست تماس جدید",
      href: "/admin/callback-requests",
      count: newCallbacks,
    });

  if (alerts.length === 0) return null;

  const toneCls: Record<string, string> = {
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-sky-50 border-sky-200 text-sky-800",
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {alerts.map((a) => (
        <Link
          key={a.text}
          href={a.href}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold hover:opacity-90 transition ${toneCls[a.tone]}`}
        >
          <span className="w-5 h-5 rounded-full bg-white/80 text-current flex items-center justify-center text-[11px]">
            {faDigits(a.count)}
          </span>
          <span>{a.text}</span>
        </Link>
      ))}
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  hint,
  subtitle,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  delta?: number | null;
  hint?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  const deltaNumber =
    typeof delta === "number" ? (delta * 100).toFixed(1) : null;
  const positive = typeof delta === "number" ? delta >= 0 : null;
  return (
    <div
      className={
        highlight
          ? "rounded-3xl bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] text-white p-5"
          : "rounded-3xl bg-white border border-[#e5eaf5] p-5"
      }
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <span
            className={
              highlight
                ? "w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center"
                : "w-7 h-7 rounded-lg bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center"
            }
          >
            {icon}
          </span>
        )}
        <div
          className={
            highlight
              ? "text-xs text-white/85 font-bold"
              : "text-xs text-[#010514]/60 font-bold"
          }
        >
          {label}
        </div>
      </div>
      <div
        className={
          highlight
            ? "text-xl md:text-2xl font-extrabold mb-1"
            : "text-xl md:text-2xl font-extrabold text-[#010514] mb-1"
        }
      >
        {value}
      </div>
      {subtitle && (
        <div
          className={
            highlight
              ? "text-[11px] text-white/80 mb-2"
              : "text-[11px] text-[#010514]/55 mb-2"
          }
        >
          {subtitle}
        </div>
      )}
      {hint && !subtitle && (
        <div
          className={
            highlight
              ? "text-[11px] text-white/80 mb-2"
              : "text-[11px] text-[#010514]/55 mb-2"
          }
        >
          {hint}
        </div>
      )}
      {deltaNumber !== null ? (
        <div
          className={
            highlight
              ? "inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full"
              : positive
                ? "inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
                : "inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full"
          }
          title="تغییر نسبت به دوره‌ی قبلی با همین طول"
        >
          <span>{positive ? "▲" : "▼"}</span>
          <span dir="ltr">{faDigits(deltaNumber)}٪</span>
        </div>
      ) : delta === null ? (
        <div
          className={
            highlight
              ? "text-[11px] text-white/70"
              : "text-[11px] text-[#010514]/40"
          }
        >
          مقایسه در دسترس نیست
        </div>
      ) : null}
    </div>
  );
}
