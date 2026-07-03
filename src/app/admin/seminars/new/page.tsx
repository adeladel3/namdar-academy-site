import Link from "@/components/SafeLink";
import NewSeminarForm from "./NewSeminarForm";

export const dynamic = "force-dynamic";

export default function NewSeminarPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <nav className="text-sm text-[#010514]/60 flex gap-2">
        <Link href="/admin/seminars" className="hover:text-[#1b3c8a]">
          سمینارها
        </Link>
        <span>/</span>
        <span className="text-[#010514]">سمینار جدید</span>
      </nav>

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          ساخت سمینار جدید
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          ابتدا اطلاعات پایه را وارد کنید. تنظیمات تفصیلی و محتوا را پس از
          ایجاد، در تب‌های اختصاصی هر سمینار اضافه می‌کنید.
        </p>
      </div>

      <NewSeminarForm />
    </div>
  );
}
