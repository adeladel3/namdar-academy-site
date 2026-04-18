import { listFaqs } from "@/lib/db";
import FaqsManager from "./FaqsManager";

export const dynamic = "force-dynamic";

export default function AdminFaqsPage() {
  const faqs = listFaqs();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          سوالات متداول
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          مدیریت سوال‌های عمومی سایت
        </p>
      </div>
      <FaqsManager faqs={faqs} />
    </div>
  );
}
