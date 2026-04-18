import Link from "next/link";
import { listCategories, listCourses } from "@/lib/db";
import CoursesTable from "./CoursesTable";
import { Icon } from "@/components/admin/Icons";
import { LinkButton } from "@/components/admin/ui";

export default function AdminCoursesPage() {
  const courses = listCourses();
  const categories = listCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            مدیریت دوره‌ها
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            ایجاد، ویرایش و مدیریت ساختار دوره‌های آموزشی
          </p>
        </div>
        <LinkButton href="/admin/courses/new" variant="primary">
          <Icon.Plus width={16} height={16} />
          دوره جدید
        </LinkButton>
      </div>

      <CoursesTable courses={courses} categories={categories} />

      <div className="text-xs text-[#010514]/45 text-center">
        برای مدیریت دسته‌بندی‌ها و برچسب‌ها به{" "}
        <Link
          href="/admin/content/categories"
          className="text-[#1b3c8a] font-bold hover:underline"
        >
          بخش محتوا
        </Link>{" "}
        مراجعه کنید.
      </div>
    </div>
  );
}
