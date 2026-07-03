import Link from "@/components/SafeLink";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-[96px] md:text-[128px] font-extrabold leading-none bg-gradient-to-b from-[#1b3c8a] to-[#49bbbd] bg-clip-text text-transparent">
          ۴۰۴
        </div>
        <h1 className="mt-4 text-2xl font-bold text-[#0e1a3d]">
          صفحه پیدا نشد
        </h1>
        <p className="mt-3 text-[#010514]/65 leading-8">
          آدرسی که دنبالش بودید وجود ندارد یا حذف شده است. از منوی بالا به بخش
          مورد نظر برید یا به صفحه اصلی برگردید.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-[#1b3c8a] text-white text-sm font-bold hover:bg-[#0e1a3d] transition"
          >
            بازگشت به خانه
          </Link>
          <Link
            href="/courses"
            className="px-5 py-2.5 rounded-full border border-[#e5eaf5] text-[#1b3c8a] text-sm font-bold hover:border-[#1b3c8a] transition"
          >
            مشاهده دوره‌ها
          </Link>
        </div>
      </div>
    </div>
  );
}
