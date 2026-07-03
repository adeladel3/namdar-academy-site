import Link from "@/components/SafeLink";
import { getCourse, listOrdersByUser } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  faDigits,
  formatDateTime,
  formatToman,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

const METHOD_LABELS: Record<string, string> = {
  sep: "درگاه سامان",
  manual: "ثبت دستی",
  grant: "اهدایی",
};

export default async function OrdersPage() {
  const session = (await getSession())!;
  const orders = listOrdersByUser(session.userId);

  const totalPaid = orders
    .filter((o) => o.status === "paid")
    .reduce((s, o) => s + o.finalAmount, 0);

  return (
    <div className="max-w-[1180px] mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-[#0e1a3d]">
          تاریخچهٔ سفارش‌ها
        </h1>
        <p className="text-[#0e1a3d]/60 text-[14px] mt-1.5">
          {orders.length > 0
            ? `${faDigits(orders.length)} سفارش ثبت شده`
            : "هنوز سفارشی ثبت نشده."}
        </p>
      </header>

      {orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <SummaryCard
            label="سفارش‌های موفق"
            value={faDigits(
              orders.filter((o) => o.status === "paid").length
            )}
            tint="green"
          />
          <SummaryCard
            label="سفارش ناموفق / منتظر"
            value={faDigits(
              orders.filter(
                (o) => o.status === "failed" || o.status === "pending"
              ).length
            )}
            tint="amber"
          />
          <SummaryCard
            label="مجموع پرداختی"
            value={formatToman(totalPaid)}
            tint="navy"
            wide
          />
        </div>
      )}

      {orders.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5]">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h3 className="font-extrabold text-[#0e1a3d] text-[16px] mb-1.5">
            سفارشی وجود ندارد
          </h3>
          <p className="text-[13px] text-[#0e1a3d]/60 mb-5 max-w-sm mx-auto leading-7">
            هنوز دوره‌ای خریداری نکرده‌اید.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1b3c8a] text-white font-extrabold text-[14px] hover:opacity-95 transition"
          >
            مشاهدهٔ دوره‌ها
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-3xl overflow-hidden border border-[#e5eaf5]">
            <table className="w-full text-sm">
              <thead className="bg-[#f7fafd] text-[#0e1a3d]/65 text-[12.5px]">
                <tr>
                  <th className="text-right p-4 font-extrabold">دوره</th>
                  <th className="text-right p-4 font-extrabold">مبلغ</th>
                  <th className="text-right p-4 font-extrabold">وضعیت</th>
                  <th className="text-right p-4 font-extrabold">روش پرداخت</th>
                  <th className="text-right p-4 font-extrabold">کد پیگیری</th>
                  <th className="text-right p-4 font-extrabold">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const course = getCourse(o.courseSlug);
                  return (
                    <tr
                      key={o.id}
                      className="border-t border-[#eef2f7] hover:bg-[#f9fbfe] transition"
                    >
                      <td className="p-4">
                        <div className="font-extrabold text-[#0e1a3d]">
                          {course?.title ?? o.courseSlug}
                        </div>
                      </td>
                      <td className="p-4 font-extrabold text-[#0e1a3d] tabular-nums">
                        {formatToman(o.finalAmount)}
                        {o.discountAmount > 0 && (
                          <div className="text-[11px] font-medium text-emerald-600 mt-0.5">
                            {formatToman(o.discountAmount)} تخفیف
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold ${ORDER_STATUS_COLORS[o.status]}`}
                        >
                          {ORDER_STATUS_LABELS[o.status]}
                        </span>
                      </td>
                      <td className="p-4 text-[12.5px] text-[#0e1a3d]/70">
                        {METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod}
                      </td>
                      <td className="p-4 font-mono text-[11.5px] text-[#0e1a3d]/70" dir="ltr">
                        {o.refNum ?? "—"}
                      </td>
                      <td className="p-4 text-[12px] text-[#0e1a3d]/60 whitespace-nowrap">
                        {formatDateTime(o.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map((o) => {
              const course = getCourse(o.courseSlug);
              return (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl border border-[#e5eaf5] p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="font-extrabold text-[#0e1a3d] text-[14px] leading-snug flex-1 min-w-0">
                      {course?.title ?? o.courseSlug}
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 rounded-full text-[10.5px] font-extrabold ${ORDER_STATUS_COLORS[o.status]}`}
                    >
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-[12px]">
                    <MobileRow label="مبلغ نهایی">
                      <span className="font-extrabold text-[#0e1a3d] tabular-nums">
                        {formatToman(o.finalAmount)}
                      </span>
                    </MobileRow>
                    <MobileRow label="روش پرداخت">
                      {METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod}
                    </MobileRow>
                    {o.discountAmount > 0 && (
                      <MobileRow label="تخفیف">
                        <span className="text-emerald-600 font-bold tabular-nums">
                          {formatToman(o.discountAmount)}
                        </span>
                      </MobileRow>
                    )}
                    {o.refNum && (
                      <MobileRow label="کد پیگیری">
                        <span className="font-mono text-[11px]" dir="ltr">
                          {o.refNum}
                        </span>
                      </MobileRow>
                    )}
                    <MobileRow label="تاریخ" full>
                      <span className="text-[#0e1a3d]/60">
                        {formatDateTime(o.createdAt)}
                      </span>
                    </MobileRow>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tint,
  wide = false,
}: {
  label: string;
  value: string;
  tint: "green" | "amber" | "navy";
  wide?: boolean;
}) {
  const tintMap = {
    green: "border-[#cfeedc] bg-[#eef8f2]",
    amber: "border-[#f5e1a1] bg-[#fdf4d4]",
    navy: "border-[#dbe7fb] bg-[#eaf1fc]",
  }[tint];
  return (
    <div
      className={`rounded-2xl border p-4 ${tintMap} ${wide ? "col-span-2 md:col-span-1" : ""}`}
    >
      <div className="text-[11.5px] text-[#0e1a3d]/60 font-bold mb-1">
        {label}
      </div>
      <div className="text-[18px] md:text-xl font-black text-[#0e1a3d] tabular-nums">
        {value}
      </div>
    </div>
  );
}

function MobileRow({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="text-[10.5px] text-[#0e1a3d]/50 mb-0.5 font-bold">
        {label}
      </div>
      <div className="text-[#0e1a3d]">{children}</div>
    </div>
  );
}
