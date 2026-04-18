import { listCourses, listDiscounts } from "@/lib/db";
import DiscountsManager from "./DiscountsManager";

export const dynamic = "force-dynamic";

export default function AdminDiscountsPage() {
  const discounts = listDiscounts();
  const courses = listCourses();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          کدهای تخفیف
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          ایجاد و مدیریت کوپن‌های درصدی یا ثابت، سراسری یا محدود به یک دوره.
        </p>
      </div>
      <DiscountsManager discounts={discounts} courses={courses} />
    </div>
  );
}
