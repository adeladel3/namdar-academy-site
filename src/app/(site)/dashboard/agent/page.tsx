import { headers } from "next/headers";
import Link from "@/components/SafeLink";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getAgentStats,
  getCourse,
  getReferralLink,
  getSalesAgentByPhone,
  getUser,
  listOrdersForAgent,
  listReferralLinks,
  listUsersReferredByAgent,
} from "@/lib/db";
import { faDigits } from "@/lib/formatting";
import AgentClients, { type AgentClientRow } from "./AgentClients";
import AgentLinks from "./AgentLinks";
import AgentTabs from "./AgentTabs";
import CopyReferralLink from "./CopyReferralLink";

export const dynamic = "force-dynamic";

export default async function AgentDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/agent");

  const agent = getSalesAgentByPhone(session.phone);
  if (!agent || !agent.isActive) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-[#e5eaf5] p-8 md:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#0e1a3d] mb-2">
            داشبورد کارشناس فعال نیست
          </h2>
          <p className="text-sm text-[#0e1a3d]/60 leading-7 max-w-md mx-auto">
            این پنل فقط برای کارشناسان فروش فعال است. اگر همکار فروش نامدار
            آکادمی هستید، با ادمین تماس بگیرید تا شماره‌ی موبایل شما را در
            سیستم ثبت کند.
          </p>
        </div>
      </div>
    );
  }

  const stats = getAgentStats(agent.id);
  const orders = listOrdersForAgent(agent.id);
  const recent = orders.slice(0, 50);
  const links = listReferralLinks({ agentId: agent.id });
  const referredUsers = listUsersReferredByAgent(agent.id);

  // Compute the origin for link sharing. headers() gives us the proxy-aware
  // host the visitor sees, which is what the agent should share — not
  // whatever the server thinks of itself internally.
  const h = await headers();
  const defaultHost =
    process.env.NODE_ENV === "production" ? "namdaracademy.com" : "localhost:3000";
  const host = h.get("x-forwarded-host") || h.get("host") || defaultHost;
  const proto =
    h.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const origin = `${proto}://${host}`;

  // Per-client aggregates: number of orders, paid orders, total spent,
  // commission earned by this agent from that specific client.
  const clientRows: AgentClientRow[] = referredUsers.map((u) => {
    const userOrders = orders.filter((o) => o.userId === u.id);
    const paid = userOrders.filter((o) => o.status === "paid");
    const link = u.referredByLinkId
      ? getReferralLink(u.referredByLinkId)
      : undefined;
    return {
      userId: u.id,
      name: u.name,
      phone: u.phone,
      referredAt: u.referredAt ?? null,
      linkLabel: link?.label ?? null,
      totalOrders: userOrders.length,
      paidOrders: paid.length,
      totalSpent: paid.reduce((s, o) => s + o.finalAmount, 0),
      totalCommission: paid.reduce((s, o) => s + (o.commissionAmount ?? 0), 0),
    };
  });

  const overview = (
    <div className="space-y-5">
      <CopyReferralLink code={agent.referralCode} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="فروش موفق"
          value={faDigits(stats.totalSales.toString())}
        />
        <Stat
          label="در انتظار پرداخت"
          value={faDigits(stats.pendingOrders.toString())}
        />
        <Stat
          label="گردش (تومان)"
          value={faDigits(stats.totalRevenue.toLocaleString("en-US"))}
        />
        <Stat
          label="کمیسیون (تومان)"
          value={faDigits(stats.totalCommission.toLocaleString("en-US"))}
          highlight
        />
      </div>

      <div className="bg-white rounded-3xl border border-[#e5eaf5] overflow-hidden">
        <div className="p-5 border-b border-[#eef2fb]">
          <h2 className="font-extrabold text-[#0e1a3d]">
            تاریخچهٔ فروش‌ها
          </h2>
          <p className="text-xs text-[#0e1a3d]/55 mt-0.5">
            ۵۰ سفارش اخیر — شامل پرداخت‌شده، در انتظار و ناموفق
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#fafbfe] text-[#0e1a3d]/55 text-[12px] font-bold">
              <tr>
                <th className="text-right p-3">تاریخ</th>
                <th className="text-right p-3">خریدار</th>
                <th className="text-right p-3">دوره</th>
                <th className="text-right p-3">مبلغ</th>
                <th className="text-right p-3">کمیسیون</th>
                <th className="text-right p-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => {
                const user = getUser(o.userId);
                const course = getCourse(o.courseSlug);
                const d = new Date(o.paidAt ?? o.createdAt);
                return (
                  <tr
                    key={o.id}
                    className="border-t border-[#eef2fb] hover:bg-[#fafbfe] transition"
                  >
                    <td className="p-3 text-[12px] text-[#0e1a3d]/70 font-mono" dir="ltr">
                      {d.toLocaleDateString("fa-IR")}
                    </td>
                    <td className="p-3 font-bold text-[#0e1a3d] text-[13px]">
                      {user?.name ?? "—"}
                    </td>
                    <td className="p-3 text-[#0e1a3d]/70 text-[13px]">
                      {course?.title ?? o.courseSlug}
                    </td>
                    <td className="p-3 font-mono text-[12px] text-[#0e1a3d]/85">
                      {faDigits(o.finalAmount.toLocaleString("en-US"))}
                    </td>
                    <td className="p-3 font-mono text-[12px] text-emerald-700 font-bold">
                      {o.commissionAmount
                        ? faDigits(o.commissionAmount.toLocaleString("en-US"))
                        : "—"}
                    </td>
                    <td className="p-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-[#0e1a3d]/55 text-sm"
                  >
                    هنوز فروشی با کد رفرال شما ثبت نشده. در تب «لینک‌ها» لینک
                    خود را کپی کن و برای مشتری بفرست.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-[#0e1a3d]">
          داشبورد کارشناس فروش
        </h1>
        <p className="text-sm text-[#0e1a3d]/60 mt-1">
          {agent.name} — کد رفرال:{" "}
          <span className="font-mono font-bold text-[#1b3c8a]" dir="ltr">
            {agent.referralCode}
          </span>
        </p>
      </div>

      <AgentTabs
        overview={overview}
        links={<AgentLinks links={links} origin={origin} />}
        clients={<AgentClients rows={clientRows} />}
      />

      <div className="text-xs text-[#0e1a3d]/45 text-center">
        برای سؤال درباره‌ی کمیسیون یا تسویه، از{" "}
        <Link
          href="/dashboard/tickets/new"
          className="text-[#1b3c8a] font-bold hover:underline"
        >
          ثبت تیکت
        </Link>{" "}
        استفاده کنید.
      </div>
    </div>
  );
}

function Stat({
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
      <div className="text-[11px] text-[#0e1a3d]/55 font-bold mb-1">
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

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "پرداخت‌شده", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    pending: { label: "در انتظار", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    failed: { label: "ناموفق", cls: "bg-rose-50 text-rose-600 border-rose-200" },
    refunded: { label: "مسترد", cls: "bg-neutral-100 text-neutral-600 border-neutral-200" },
    partial_refund: {
      label: "استرداد جزئی",
      cls: "bg-orange-50 text-orange-700 border-orange-200",
    },
  };
  const c =
    map[status] ?? {
      label: status,
      cls: "bg-neutral-100 text-neutral-600 border-neutral-200",
    };
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${c.cls}`}
    >
      {c.label}
    </span>
  );
}
