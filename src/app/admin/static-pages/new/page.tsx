import StaticPageEditor from "../[slug]/StaticPageEditor";

export default function NewStaticPagePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          صفحه ثابت جدید
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          قوانین، راهنما، معرفی یا هر صفحه اطلاع‌رسانی دیگر
        </p>
      </div>
      <StaticPageEditor />
    </div>
  );
}
