import { listAllOrders, getUser, getCourse } from "@/lib/db";
import OrdersTable, { type OrderRow } from "./OrdersTable";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const orders = listAllOrders();
  const rows: OrderRow[] = orders.map((o) => {
    const u = getUser(o.userId);
    const c = getCourse(o.courseSlug);
    return {
      id: o.id,
      userName: u?.name ?? "—",
      userId: o.userId,
      phone: u?.phone ?? "—",
      courseTitle: c?.title ?? o.courseSlug,
      finalAmount: o.finalAmount,
      status: o.status,
      refNum: o.refNum,
      createdAt: o.createdAt,
      paidAt: o.paidAt,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          مدیریت سفارش‌ها
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          مشاهده، فیلتر، استرداد و ثبت دستی سفارش‌ها
        </p>
      </div>
      <OrdersTable rows={rows} />
    </div>
  );
}
