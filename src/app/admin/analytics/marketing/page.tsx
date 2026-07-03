import Link from "@/components/SafeLink";
import { Card, CardHeader } from "@/components/admin/ui";
import { BarChart, FunnelChart } from "@/components/admin/Charts";
import {
  PERIOD_LABELS,
  getCourseConversion,
  getCustomerCohorts,
  getDiscountPerformance,
  getRepeatPurchaseFunnel,
  getSalesKPIs,
  getTopCustomers,
  type PeriodKey,
} from "@/lib/analytics";
import {
  faDigits,
  formatPhone,
  formatToman,
  formatTomanCompact,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

const PERIODS: PeriodKey[] = ["today", "yesterday", "7d", "30d", "90d", "ytd", "all"];

export default async function MarketingAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = (PERIODS.includes(sp.period as PeriodKey)
    ? sp.period
    : "30d") as PeriodKey;

  const kpis = getSalesKPIs(period);
  const discounts = getDiscountPerformance(period);
  const conversion = getCourseConversion();
  const cohorts = getCustomerCohorts();
  const topCustomers = getTopCustomers(8);
  const repeat = getRepeatPurchaseFunnel();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <nav className="text-sm text-[#010514]/60 flex gap-2 mb-1">
            <Link href="/admin/analytics" className="hover:text-[#1b3c8a]">
              تحلیل و گزارش
            </Link>
            <span>/</span>
            <span className="text-[#010514]">گزارش فروش و مارکتینگ</span>
          </nav>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            گزارش فروش و مارکتینگ
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            شاخص‌های کلیدی کسب‌وکار با مقایسه‌ی دوره‌ای
          </p>
        </div>
        <PeriodSwitcher current={period} />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          label="درآمد"
          value={formatTomanCompact(kpis.revenue)}
          delta={kpis.revenueDelta}
          subtitle={formatToman(kpis.revenue)}
        />
        <KpiCard
          label="تعداد سفارش"
          value={faDigits(kpis.orders)}
          delta={kpis.ordersDelta}
        />
        <KpiCard
          label="ارزش متوسط سفارش"
          value={formatTomanCompact(Math.round(kpis.aov))}
          delta={kpis.aovDelta}
        />
        <KpiCard
          label="مشتریان خریدار"
          value={faDigits(kpis.customers)}
          delta={kpis.customersDelta}
          subtitle={`${faDigits(kpis.newCustomers)} جدید · ${faDigits(
            kpis.repeatCustomers
          )} تکراری`}
        />
        <KpiCard
          label="نرخ خرید تکراری"
          value={`${faDigits((kpis.repeatRate * 100).toFixed(1))}٪`}
          hint="کسانی که قبلاً هم خرید کرده‌اند"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="عملکرد کدهای تخفیف"
            subtitle={`در بازه‌ی ${PERIOD_LABELS[period]} — مرتب‌سازی بر اساس درآمد`}
          />
          {discounts.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز کد تخفیفی تعریف نشده است.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f7fafd] text-[#010514]/70">
                  <tr>
                    <th className="p-3 text-right">کد</th>
                    <th className="p-3 text-right">نوع</th>
                    <th className="p-3 text-right">استفاده</th>
                    <th className="p-3 text-right">درآمد</th>
                    <th className="p-3 text-right">تخفیف داده شده</th>
                    <th className="p-3 text-right">میانگین سفارش</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((d) => (
                    <tr
                      key={d.code}
                      className="border-t border-[#eef2f7] hover:bg-[#fafcff]"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-[#1b3c8a]" dir="ltr">
                            {d.code}
                          </code>
                          {!d.active && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-600">
                              غیرفعال
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-[#010514]/70">
                        {d.kind === "percent"
                          ? `${faDigits(d.value)}٪`
                          : `${formatTomanCompact(d.value)} ثابت`}
                      </td>
                      <td className="p-3">
                        <span className="font-bold">{faDigits(d.windowUses)}</span>
                        <span className="text-[11px] text-[#010514]/50 mx-1">
                          از {faDigits(d.totalUses)} کل
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#1b3c8a]">
                        {formatTomanCompact(d.windowRevenue)}
                      </td>
                      <td className="p-3 text-rose-600">
                        {d.windowDiscount > 0
                          ? `-${formatTomanCompact(d.windowDiscount)}`
                          : faDigits(0)}
                      </td>
                      <td className="p-3">
                        {d.avgOrderValue > 0
                          ? formatTomanCompact(Math.round(d.avgOrderValue))
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="قیف خرید تکراری" subtitle="سهم از کل مشتریان" />
          <div className="p-5">
            <FunnelChart data={repeat} />
            <div className="mt-4 text-xs text-[#010514]/60 leading-6">
              نرخ خرید دوم مشخص می‌کند چند درصد از مشتریان به مشتری دائمی تبدیل
              می‌شوند. نرخ بالاتر = سلامت کسب‌وکار.
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="تبدیل فروش دوره‌به‌دوره"
          subtitle="تمام تاریخ — نشان می‌دهد کدام دوره‌ها سفارش می‌گیرند ولی پرداخت نمی‌شوند"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7fafd] text-[#010514]/70">
              <tr>
                <th className="p-3 text-right">دوره</th>
                <th className="p-3 text-right">ثبت‌نام‌ها</th>
                <th className="p-3 text-right">سفارش</th>
                <th className="p-3 text-right">پرداخت موفق</th>
                <th className="p-3 text-right">نرخ تبدیل</th>
                <th className="p-3 text-right">درآمد</th>
                <th className="p-3 text-right">میانگین زمان تا خرید</th>
              </tr>
            </thead>
            <tbody>
              {conversion.map((c) => (
                <tr
                  key={c.slug}
                  className="border-t border-[#eef2f7] hover:bg-[#fafcff]"
                >
                  <td className="p-3">
                    <Link
                      href={`/admin/courses/${c.slug}`}
                      className="font-medium hover:text-[#1b3c8a]"
                    >
                      {c.title}
                    </Link>
                    <div className="text-[11px] text-[#010514]/50">
                      {c.status === "published" ? "منتشر شده" : c.status}
                    </div>
                  </td>
                  <td className="p-3">{faDigits(c.enrolls)}</td>
                  <td className="p-3 text-[#010514]/70">
                    <span>{faDigits(c.orders)}</span>
                    {(c.failed > 0 || c.pending > 0) && (
                      <span className="text-[10px] text-[#010514]/45 mx-1" dir="ltr">
                        ({faDigits(c.paid)}✓ / {faDigits(c.failed)}✗ / {faDigits(c.pending)}⏳)
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-emerald-700">
                    {faDigits(c.paid)}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        c.paidConversion >= 0.7
                          ? "text-emerald-700 font-bold"
                          : c.paidConversion >= 0.4
                            ? "text-amber-700 font-bold"
                            : "text-rose-700 font-bold"
                      }
                    >
                      {c.orders
                        ? `${faDigits((c.paidConversion * 100).toFixed(0))}٪`
                        : "—"}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[#1b3c8a]">
                    {formatTomanCompact(c.revenue)}
                  </td>
                  <td className="p-3 text-[#010514]/70">
                    {c.avgDaysToPay !== null
                      ? `${faDigits(c.avgDaysToPay.toFixed(1))} روز`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="کوهورت ارزش طول عمر مشتری"
            subtitle="به‌ازای ماه ثبت‌نام، میانگین درآمد هر مشتری"
          />
          {cohorts.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              داده کافی برای نمایش کوهورت وجود ندارد
            </div>
          ) : (
            <div className="p-4">
              <BarChart
                data={cohorts.map((c) => ({
                  label: c.month,
                  value: Math.round(c.ltv),
                }))}
                format="tomanCompact"
                color="#d4a62a"
                height={220}
              />
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-xs">
                  <thead className="text-[#010514]/60">
                    <tr>
                      <th className="p-2 text-right">ماه</th>
                      <th className="p-2 text-right">ثبت‌نام</th>
                      <th className="p-2 text-right">خریدار</th>
                      <th className="p-2 text-right">نرخ تبدیل</th>
                      <th className="p-2 text-right">LTV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map((c) => (
                      <tr key={c.month} className="border-t border-[#eef2f7]">
                        <td className="p-2 font-mono" dir="ltr">{c.month}</td>
                        <td className="p-2">{faDigits(c.size)}</td>
                        <td className="p-2">{faDigits(c.paying)}</td>
                        <td className="p-2">
                          {faDigits((c.conversion * 100).toFixed(0))}٪
                        </td>
                        <td className="p-2 font-bold text-[#1b3c8a]">
                          {formatTomanCompact(Math.round(c.ltv))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="برترین مشتریان"
            subtitle="مرتب‌سازی بر اساس مجموع خرید"
          />
          {topCustomers.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز خریدی ثبت نشده است
            </div>
          ) : (
            <ul className="divide-y divide-[#eef2f7]">
              {topCustomers.map((c, idx) => (
                <li key={c.userId} className="p-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold text-sm flex items-center justify-center">
                    {faDigits(idx + 1)}
                  </span>
                  <Link
                    href={`/admin/users/${c.userId}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-[#010514]/55 font-mono" dir="ltr">
                      {formatPhone(c.phone)}
                    </div>
                  </Link>
                  <div className="text-left">
                    <div className="font-bold text-[#1b3c8a]">
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
            href={`/admin/analytics/marketing?period=${p}`}
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

function KpiCard({
  label,
  value,
  delta,
  hint,
  subtitle,
}: {
  label: string;
  value: string;
  delta?: number | null;
  hint?: string;
  subtitle?: string;
}) {
  const deltaNumber =
    typeof delta === "number" ? (delta * 100).toFixed(1) : null;
  const positive = typeof delta === "number" ? delta >= 0 : null;
  return (
    <div className="rounded-3xl bg-white border border-[#e5eaf5] p-5">
      <div className="text-xs text-[#010514]/60 font-bold mb-1">{label}</div>
      <div className="text-xl md:text-2xl font-extrabold text-[#010514] mb-1">
        {value}
      </div>
      {subtitle && (
        <div className="text-[11px] text-[#010514]/55 mb-2">{subtitle}</div>
      )}
      {hint && !subtitle && (
        <div className="text-[11px] text-[#010514]/55 mb-2">{hint}</div>
      )}
      {deltaNumber !== null ? (
        <div
          className={
            positive
              ? "inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
              : "inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full"
          }
          title="تغییر نسبت به دوره‌ی قبلی با همین طول"
        >
          <span>{positive ? "▲" : "▼"}</span>
          <span dir="ltr">{faDigits(deltaNumber)}٪</span>
        </div>
      ) : delta === null ? (
        <div className="text-[11px] text-[#010514]/40">
          مقایسه در دسترس نیست
        </div>
      ) : null}
    </div>
  );
}
