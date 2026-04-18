import Link from "next/link";
import { Card, CardHeader } from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import {
  getFunnel,
  getOverviewStats,
  getRevenueSeries,
  getGrowthSeries,
  getRetention,
  getTopCourses,
} from "@/lib/analytics";
import {
  DualLineChart,
  FunnelChart,
  LineChart,
} from "@/components/admin/Charts";
import StatCard from "@/components/admin/StatCard";
import {
  faDigits,
  formatToman,
  formatTomanCompact,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default function AnalyticsOverview() {
  const stats = getOverviewStats();
  const revenue = getRevenueSeries(30);
  const growth = getGrowthSeries(30);
  const funnel = getFunnel();
  const retention = getRetention();
  const top = getTopCourses(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          تحلیل و گزارش
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          نمای کلی رشد، فروش، قیف تبدیل و پایداری کاربران
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsNav
          href="/admin/analytics/revenue"
          icon={<Icon.Money width={18} height={18} />}
          title="درآمد"
          sub="روزانه / ماهانه / سالانه"
        />
        <AnalyticsNav
          href="/admin/analytics/funnel"
          icon={<Icon.Funnel width={18} height={18} />}
          title="قیف تبدیل"
          sub="بازدید → ثبت‌نام → خرید"
        />
        <AnalyticsNav
          href="/admin/analytics/retention"
          icon={<Icon.Users width={18} height={18} />}
          title="Retention"
          sub="پایداری کوهورت ماهانه"
        />
        <AnalyticsNav
          href="/admin/analytics/courses"
          icon={<Icon.Book width={18} height={18} />}
          title="دوره‌ها"
          sub="محبوب‌ترین و نرخ تکمیل"
        />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="درآمد خالص کل"
          value={formatTomanCompact(stats.netRevenue)}
          hint={`از ${formatTomanCompact(stats.totalRevenue)} ناخالص`}
        />
        <StatCard
          label="کاربران فعال"
          value={stats.activeUsers}
          hint={`از ${faDigits(stats.totalUsers)} کل`}
        />
        <StatCard
          label="نرخ تبدیل"
          value={`${faDigits((stats.conversionRate * 100).toFixed(1))}٪`}
        />
        <StatCard
          label="دوره‌های فعال"
          value={stats.publishedCourses}
          hint={`از ${faDigits(stats.totalCourses)}`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="درآمد ۳۰ روز گذشته"
            subtitle={formatToman(revenue.reduce((s, r) => s + r.revenue, 0))}
          />
          <div className="p-4">
            <LineChart
              data={revenue.map((r) => ({ label: r.label, value: r.revenue }))}
              format="tomanCompact"
              color="#1b3c8a"
              height={220}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="رشد کاربران" />
          <div className="p-4">
            <DualLineChart
              data={growth.map((g) => ({
                label: g.label,
                added: g.added,
                total: g.total,
              }))}
              keys={[
                { key: "added", color: "#49bbbd", name: "کاربر جدید" },
                { key: "total", color: "#1b3c8a", name: "مجموع" },
              ]}
              height={220}
            />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="قیف تبدیل"
            right={
              <Link
                href="/admin/analytics/funnel"
                className="text-sm text-[#1b3c8a] font-bold hover:underline"
              >
                جزئیات ←
              </Link>
            }
          />
          <div className="p-5">
            <FunnelChart data={funnel} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Retention ماهانه" />
          <div className="p-4">
            {retention.length === 0 ? (
              <div className="text-center text-[#010514]/55 text-sm py-8">
                داده کافی وجود ندارد
              </div>
            ) : (
              <ul className="space-y-3">
                {retention.map((r) => (
                  <li key={r.month} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span>{r.month}</span>
                      <span className="font-bold">
                        {faDigits((r.rate * 100).toFixed(1))}٪
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f7fafd] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1b3c8a]"
                        style={{ width: `${Math.round(r.rate * 100)}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#010514]/50 mt-0.5">
                      {faDigits(r.retained)} از {faDigits(r.size)} کاربر
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

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
        {top.length === 0 ? (
          <div className="p-10 text-center text-[#010514]/55 text-sm">
            هنوز فروشی ثبت نشده است.
          </div>
        ) : (
          <div className="divide-y divide-[#eef2f7]">
            {top.map((c) => (
              <Link
                key={c.slug}
                href={`/admin/courses/${c.slug}`}
                className="flex items-center gap-4 p-4 hover:bg-[#f7fafd] transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-16 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{c.title}</div>
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
    </div>
  );
}

function AnalyticsNav({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="p-5 rounded-3xl bg-white border border-[#e5eaf5] hover:border-[#1b3c8a] transition block"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="w-9 h-9 rounded-xl bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center">
          {icon}
        </span>
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-xs text-[#010514]/55">{sub}</p>
    </Link>
  );
}
