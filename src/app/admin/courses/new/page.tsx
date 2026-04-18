import { listCategories } from "@/lib/db";
import NewCourseWizard from "./NewCourseWizard";

export default function NewCoursePage() {
  const categories = listCategories();
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          ایجاد دوره جدید
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          اطلاعات اولیه را وارد کنید. پس از ذخیره می‌توانید سرفصل‌ها و ویدیوها
          را اضافه کنید.
        </p>
      </div>
      <NewCourseWizard categories={categories} />
    </div>
  );
}
