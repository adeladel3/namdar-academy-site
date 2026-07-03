import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getCourse, getOrder, getUser } from "@/lib/db";
import { Card, CardHeader } from "@/components/admin/ui";
import OrderActions from "./OrderActions";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  formatDateTime,
  formatPhone,
  formatToman,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  const user = getUser(order.userId);
  const course = getCourse(order.courseSlug);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[#010514]/60 flex gap-2">
        <Link href="/admin/orders" className="hover:text-[#1b3c8a]">
          سفارش‌ها
        </Link>
        <span>/</span>
        <span className="text-[#010514] font-mono" dir="ltr">
          {id.slice(0, 8)}
        </span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="جزئیات سفارش"
            subtitle={formatDateTime(order.createdAt)}
            right={
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[order.status]}`}
              >
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            }
          />
          <div className="p-6 space-y-5">
            <Row label="شناسه سفارش">
              <span className="font-mono" dir="ltr">
                {order.id}
              </span>
            </Row>
            <Row label="کاربر">
              {user ? (
                <Link
                  href={`/admin/users/${user.id}`}
                  className="hover:text-[#1b3c8a]"
                >
                  <div className="font-bold">{user.name}</div>
                  <div
                    className="text-xs text-[#010514]/55 font-mono"
                    dir="ltr"
                  >
                    {formatPhone(user.phone)}
                  </div>
                </Link>
              ) : (
                <span className="text-[#010514]/55">—</span>
              )}
            </Row>
            <Row label="دوره">
              {course ? (
                <Link
                  href={`/admin/courses/${course.slug}`}
                  className="hover:text-[#1b3c8a] font-bold"
                >
                  {course.title}
                </Link>
              ) : (
                <span>{order.courseSlug}</span>
              )}
            </Row>
            <div className="border-t border-[#eef2f7] pt-5">
              <Row label="قیمت اصلی">{formatToman(order.amount)}</Row>
              {order.discountAmount > 0 && (
                <Row label="تخفیف">
                  <span className="text-green-700">
                    - {formatToman(order.discountAmount)}
                  </span>
                </Row>
              )}
              <Row label="مبلغ نهایی">
                <span className="font-bold text-[#1b3c8a] text-lg">
                  {formatToman(order.finalAmount)}
                </span>
              </Row>
              {order.refundAmount && (
                <Row label="مبلغ مسترد شده">
                  <span className="text-red-600">
                    - {formatToman(order.refundAmount)}
                  </span>
                </Row>
              )}
            </div>
            <div className="border-t border-[#eef2f7] pt-5">
              <Row label="روش پرداخت">
                {order.paymentMethod === "sep"
                  ? "درگاه سامان (سپ)"
                  : order.paymentMethod === "manual"
                  ? "دستی"
                  : "اعطا شده"}
              </Row>
              <Row label="کد پیگیری">
                <span className="font-mono text-xs" dir="ltr">
                  {order.refNum ?? "—"}
                </span>
              </Row>
              <Row label="Authority / TraceNo">
                <span className="font-mono text-xs" dir="ltr">
                  {order.authority ?? "—"}
                </span>
              </Row>
              {order.paidAt && (
                <Row label="تاریخ پرداخت">{formatDateTime(order.paidAt)}</Row>
              )}
              {order.refundedAt && (
                <Row label="تاریخ استرداد">
                  {formatDateTime(order.refundedAt)}
                </Row>
              )}
              {order.refundReason && (
                <Row label="دلیل استرداد">{order.refundReason}</Row>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="عملیات" />
          <div className="p-5">
            <OrderActions order={order} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-[#010514]/55 shrink-0">{label}</span>
      <span className="text-left">{children}</span>
    </div>
  );
}
