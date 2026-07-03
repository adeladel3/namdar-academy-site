import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { computeAgentTieredCommission, getSalesAgent } from "@/lib/db";
import { Card, CardHeader } from "@/components/admin/ui";
import { faDigits } from "@/lib/formatting";
import CommissionEditor from "./CommissionEditor";

export const dynamic = "force-dynamic";

export default async function AgentCommissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getSalesAgent(id);
  if (!agent) notFound();

  const summary = computeAgentTieredCommission(id);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[#010514]/60 flex gap-2 flex-wrap">
        <Link href="/admin/agents" className="hover:text-[#1b3c8a]">
          کارشناسان فروش
        </Link>
        <span>/</span>
        <Link href={`/admin/agents/${id}`} className="hover:text-[#1b3c8a]">
          {agent.name}
        </Link>
        <span>/</span>
        <span className="text-[#010514]">کارمزد پله‌ای</span>
      </nav>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h1 className="text-lg font-bold text-[#010514]">
            کارمزد پله‌ای — {agent.name}
          </h1>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold">
            {summary.periodLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCell
            label="فروش این دوره (تومان)"
            value={faDigits(summary.periodTotal.toLocaleString("en-US"))}
          />
          <SummaryCell
            label="تعداد سفارش پرداخت‌شده"
            value={faDigits(summary.saleCount.toString())}
          />
          <SummaryCell
            label="پلهٔ فعلی"
            value={
              summary.currentTier
                ? `${faDigits(summary.currentRate.toString())}٪`
                : "—"
            }
          />
          <SummaryCell
            label="کارمزد محاسبه‌شده (تومان)"
            value={faDigits(summary.earned.toLocaleString("en-US"))}
            highlight
          />
        </div>

        {summary.nextTier && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
            تا رسیدن به پلهٔ بعدی (
            <span className="font-mono font-bold">
              {faDigits(summary.nextTier.percent.toString())}٪
            </span>
            ) فقط{" "}
            <span className="font-mono font-bold">
              {faDigits(summary.toNextTier.toLocaleString("en-US"))}
            </span>{" "}
            تومان فروش دیگر مانده است.
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="پله‌های کارمزد"
          subtitle="هر پله، حداقل فروش لازم برای ورود به آن پله است. درصد پلهٔ فعلی به کلِ فروش این دوره اعمال می‌شود (از صفر تا هرجا فروخته شده)."
        />
        <div className="p-5">
          <CommissionEditor
            agentId={id}
            initialTiers={agent.commissionTiers ?? []}
            initialPeriod={agent.commissionPeriod ?? "month"}
          />
        </div>
      </Card>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        highlight
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-[#e5eaf5]"
      }`}
    >
      <div className="text-[11px] text-[#010514]/55 font-bold mb-1">
        {label}
      </div>
      <div
        className={`text-base md:text-lg font-extrabold font-mono ${
          highlight ? "text-emerald-700" : "text-[#0e1a3d]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
