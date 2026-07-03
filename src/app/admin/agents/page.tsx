import Link from "@/components/SafeLink";
import { getAgentStats, listSalesAgents } from "@/lib/db";
import { Card, CardHeader } from "@/components/admin/ui";
import { faDigits } from "@/lib/formatting";
import AgentsTable from "./AgentsTable";

export const dynamic = "force-dynamic";

export default function AdminAgentsPage() {
  const agents = listSalesAgents().map((a) => ({
    ...a,
    stats: getAgentStats(a.id),
  }));

  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.isActive).length;
  const totalSales = agents.reduce((s, a) => s + a.stats.totalSales, 0);
  const totalRevenue = agents.reduce((s, a) => s + a.stats.totalRevenue, 0);
  const totalCommission = agents.reduce(
    (s, a) => s + a.stats.totalCommission,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            کارشناسان فروش
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            مدیریت کارشناسان، کدهای رفرال و مشاهده‌ی فروش‌های هر کارشناس
          </p>
        </div>
        <Link
          href="/admin/agents/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1b3c8a] text-white px-5 py-2.5 text-sm font-extrabold hover:bg-[#254aa0] active:scale-[0.98] transition"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          کارشناس جدید
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="تعداد کل" value={faDigits(totalAgents.toString())} />
        <StatCard label="فعال" value={faDigits(activeAgents.toString())} />
        <StatCard
          label="فروش موفق"
          value={faDigits(totalSales.toString())}
        />
        <StatCard
          label="گردش (تومان)"
          value={faDigits(totalRevenue.toLocaleString("en-US"))}
        />
        <StatCard
          label="کل کمیسیون (تومان)"
          value={faDigits(totalCommission.toLocaleString("en-US"))}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="لیست کارشناسان"
          subtitle="هر کارشناس یک کد رفرال اختصاصی دارد. لینک: namdaracademy.com/?ref=کد"
        />
        <AgentsTable agents={agents} />
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#e5eaf5]">
      <div className="text-[11px] text-[#010514]/55 font-bold mb-1">
        {label}
      </div>
      <div className="text-base md:text-lg font-extrabold text-[#0e1a3d] font-mono">
        {value}
      </div>
    </div>
  );
}
