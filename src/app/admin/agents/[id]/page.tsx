import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import {
  computeAgentTieredCommission,
  getAgentStats,
  getCourse,
  getReferralLink,
  getSalesAgent,
  getUser,
  listCourses,
  listOrdersForAgent,
  listReferralLinks,
  listSeminars,
  listUsersReferredByAgent,
} from "@/lib/db";
import { headers } from "next/headers";
import { Card, CardHeader } from "@/components/admin/ui";
import { faDigits, formatPhone } from "@/lib/formatting";
import AgentEditForm from "./AgentEditForm";
import AgentLinksManager, { type LinkDestination } from "./AgentLinksManager";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getSalesAgent(id);
  if (!agent) notFound();

  const stats = getAgentStats(id);
  const orders = listOrdersForAgent(id);
  const tiered = computeAgentTieredCommission(id);
  void tiered;
  const links = listReferralLinks({ agentId: id });
  const referredUsers = listUsersReferredByAgent(id);

  // Proxy-aware origin so the per-link share URL matches what visitors see —
  // same derivation the agent's own dashboard uses.
  const h = await headers();
  const defaultHost =
    process.env.NODE_ENV === "production" ? "namdaracademy.com" : "localhost:3000";
  const host = h.get("x-forwarded-host") || h.get("host") || defaultHost;
  const proto =
    h.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const origin = `${proto}://${host}`;

  // Build the destination dropdown for new links: general pages first, then a
  // product page per published course and seminar. The `value` is the
  // landingPath stored on the link ("" = site root).
  const courses = listCourses({ status: "published" });
  const seminars = listSeminars({ publishedOnly: true });
  const destinations: LinkDestination[] = [
    { value: "", label: "صفحه‌ی اصلی سایت", group: "صفحه‌های عمومی" },
    { value: "/courses", label: "فهرست همه‌ی دوره‌ها", group: "صفحه‌های عمومی" },
    { value: "/seminars", label: "فهرست سمینارها", group: "صفحه‌های عمومی" },
    { value: "/coaching", label: "کوچینگ حضوری", group: "صفحه‌های عمومی" },
    ...courses.map((c) => ({
      value: `/courses/${c.slug}`,
      label: c.title,
      group: "دوره‌ها",
    })),
    ...seminars.map((s) => ({
      value: `/seminars/${s.slug}`,
      label: s.title,
      group: "سمینارها",
    })),
  ];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[#010514]/60 flex gap-2 flex-wrap">
        <Link href="/admin/agents" className="hover:text-[#1b3c8a]">
          کارشناسان فروش
        </Link>
        <span>/</span>
        <span className="text-[#010514]">{agent.name}</span>
      </nav>

      <Card className="p-6 flex items-center gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c4dff] to-[#1b3c8a] text-white font-bold text-xl flex items-center justify-center shrink-0">
          {agent.name.charAt(0)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-lg font-bold text-[#010514]">{agent.name}</h1>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                agent.isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-neutral-100 text-neutral-500 border border-neutral-200"
              }`}
            >
              {agent.isActive ? "فعال" : "غیرفعال"}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs text-[#010514]/60">
            <span className="font-mono font-bold text-[#1b3c8a]" dir="ltr">
              ?ref={agent.referralCode}
            </span>
            {agent.phone && (
              <span className="font-mono" dir="ltr">
                {agent.phone}
              </span>
            )}
            {agent.email && (
              <span className="font-mono" dir="ltr">
                {agent.email}
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="فروش موفق" value={faDigits(stats.totalSales.toString())} />
        <StatCard
          label="در انتظار پرداخت"
          value={faDigits(stats.pendingOrders.toString())}
        />
        <StatCard
          label="گردش (تومان)"
          value={faDigits(stats.totalRevenue.toLocaleString("en-US"))}
        />
        <StatCard
          label="کمیسیون (تومان)"
          value={faDigits(stats.totalCommission.toLocaleString("en-US"))}
          highlight
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="کارمزد پله‌ای"
          subtitle={`${tiered.periodLabel} — کارمزد بر اساس کل فروش این دوره با درصد پلهٔ فعلی محاسبه می‌شود.`}
          right={
            <Link
              href={`/admin/agents/${id}/commission`}
              className="text-xs px-3 py-1.5 rounded-full bg-[#1b3c8a] text-white hover:opacity-90 transition font-bold"
            >
              ویرایش پله‌ها →
            </Link>
          }
        />
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="فروش این دوره (تومان)"
            value={faDigits(tiered.periodTotal.toLocaleString("en-US"))}
          />
          <StatCard
            label="پلهٔ فعلی"
            value={
              tiered.currentTier
                ? `${faDigits(tiered.currentRate.toString())}٪`
                : "—"
            }
          />
          <StatCard
            label="کارمزد دورهٔ جاری (تومان)"
            value={faDigits(tiered.earned.toLocaleString("en-US"))}
            highlight
          />
          <StatCard
            label={
              tiered.nextTier
                ? `تا پلهٔ بعد (${faDigits(tiered.nextTier.percent.toString())}٪)`
                : "وضعیت"
            }
            value={
              tiered.nextTier
                ? faDigits(tiered.toNextTier.toLocaleString("en-US"))
                : tiered.tiers.length > 0
                  ? "در بالاترین پله"
                  : "بدون پله"
            }
          />
        </div>
        {tiered.tiers.length === 0 && (
          <div className="px-5 pb-5">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
              برای این کارشناس هنوز پله‌ای تعریف نشده است. روی «ویرایش پله‌ها»
              کلیک کنید تا جدول پله‌های کارمزد را بسازید.
            </div>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="ویرایش کارشناس" />
        <div className="p-6">
          <AgentEditForm agent={agent} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="لینک‌های کارشناس"
          subtitle={`${faDigits(links.length.toString())} لینک — برای هر کانال یا هر صفحه‌ی محصول یک لینک جدا بسازید`}
        />
        <AgentLinksManager
          agentId={id}
          links={links}
          origin={origin}
          destinations={destinations}
        />
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="مشتریان معرفی‌شده"
          subtitle={`${faDigits(referredUsers.length.toString())} کاربر — همه‌ی کسانی که با لینک‌های این کارشناس ثبت‌نام کرده‌اند`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#fafbfe] text-[#010514]/55 text-[12px] font-bold">
              <tr>
                <th className="text-right p-3">کاربر</th>
                <th className="text-right p-3">از طریق</th>
                <th className="text-right p-3">تاریخ ثبت‌نام</th>
                <th className="text-right p-3">خرید</th>
              </tr>
            </thead>
            <tbody>
              {referredUsers.map((u) => {
                const userOrders = orders.filter((o) => o.userId === u.id);
                const paid = userOrders.filter((o) => o.status === "paid");
                const link = u.referredByLinkId
                  ? getReferralLink(u.referredByLinkId)
                  : undefined;
                const d = u.referredAt ? new Date(u.referredAt) : null;
                return (
                  <tr
                    key={u.id}
                    className="border-t border-[#eef2fb] hover:bg-[#fafbfe] transition"
                  >
                    <td className="p-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-bold text-[#0e1a3d] hover:text-[#1b3c8a] text-[13px]"
                      >
                        {u.name}
                      </Link>
                      <div className="text-[10.5px] text-[#010514]/55 font-mono" dir="ltr">
                        {formatPhone(u.phone)}
                      </div>
                    </td>
                    <td className="p-3">
                      {link ? (
                        <span className="inline-block text-[10.5px] px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold border border-[#dfe9ff]">
                          {link.label}
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-[#010514]/40">—</span>
                      )}
                    </td>
                    <td className="p-3 text-[12px] text-[#010514]/70 font-mono" dir="ltr">
                      {d ? d.toLocaleDateString("fa-IR") : "—"}
                    </td>
                    <td className="p-3 text-[12px] text-[#010514]/85">
                      <span className="font-mono">
                        {faDigits(paid.length.toString())}
                      </span>
                      <span className="text-[10px] text-[#010514]/40">
                        {" "}
                        / {faDigits(userOrders.length.toString())}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {referredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-[#010514]/55 text-sm"
                  >
                    هنوز هیچ کاربری با لینک‌های این کارشناس ثبت‌نام نکرده.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="تاریخچهٔ فروش‌ها"
          subtitle={`${faDigits(orders.length.toString())} سفارش (شامل ناموفق و در انتظار)`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#fafbfe] text-[#010514]/55 text-[12px] font-bold">
              <tr>
                <th className="text-right p-3">تاریخ</th>
                <th className="text-right p-3">خریدار</th>
                <th className="text-right p-3">دوره</th>
                <th className="text-right p-3">مبلغ نهایی</th>
                <th className="text-right p-3">کمیسیون</th>
                <th className="text-right p-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const user = getUser(o.userId);
                const course = getCourse(o.courseSlug);
                const d = new Date(o.paidAt ?? o.createdAt);
                return (
                  <tr
                    key={o.id}
                    className="border-t border-[#eef2fb] hover:bg-[#fafbfe] transition"
                  >
                    <td className="p-3 text-[12px] text-[#010514]/70 font-mono" dir="ltr">
                      {d.toLocaleDateString("fa-IR")}
                    </td>
                    <td className="p-3">
                      {user ? (
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-bold text-[#0e1a3d] hover:text-[#1b3c8a]"
                        >
                          {user.name}
                        </Link>
                      ) : (
                        <span className="text-[#010514]/40">—</span>
                      )}
                    </td>
                    <td className="p-3 text-[#010514]/70">
                      {course?.title ?? o.courseSlug}
                    </td>
                    <td className="p-3 font-mono text-[12px] text-[#010514]/85">
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
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-[#010514]/55 text-sm"
                  >
                    هنوز فروشی با کد رفرال این کارشناس ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
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
  const c = map[status] ?? { label: status, cls: "bg-neutral-100 text-neutral-600 border-neutral-200" };
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${c.cls}`}
    >
      {c.label}
    </span>
  );
}
