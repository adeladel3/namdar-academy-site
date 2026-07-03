import { notFound } from "next/navigation";
import { getCourse, getUser, listCategories, listTags, listUsers } from "@/lib/db";
import CourseInfoEditor from "./CourseInfoEditor";

export const dynamic = "force-dynamic";

export default async function CourseEditInfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const categories = listCategories();
  const tags = listTags();
  // لیست اولیه‌ی پیکر پشتیبان فقط نقش‌های کارمندی است (ادمین، پشتیبان،
  // منتور، کارشناس فروش) — این‌ها معمولاً چند ده‌تا هستند و در یک بسته‌ی
  // سبک به کلاینت می‌رسند. قبلاً کل کاربران فعال (۱۳۰هزار+) به‌عنوان prop
  // ارسال می‌شد که هم پایان‌بار را سنگین می‌کرد و هم فیلتر کلاینتی روی
  // اعداد فارسی کار نمی‌کرد. برای پیدا کردن یک دانش‌پذیر یا هر کاربر دیگر،
  // کامپوننت در حین تایپ از /api/admin/users/search کمک می‌گیرد.
  // پشتیبان‌های قبلاً انتخاب‌شده هر نقشی که باشند باید در لیست باشند تا
  // نمایش داده شوند و قابل حذف هم باشند.
  const SUPPORTER_ELIGIBLE_ROLES = new Set([
    "admin",
    "support",
    "instructor",
    "sales_agent",
  ]);
  const ROLE_RANK: Record<string, number> = {
    admin: 0,
    support: 1,
    instructor: 2,
    sales_agent: 3,
    student: 4,
  };
  const staffPool = listUsers({ status: "active" }).filter((u) =>
    SUPPORTER_ELIGIBLE_ROLES.has(u.role)
  );
  const selectedSet = new Set(course.supportAdminIds ?? []);
  for (const id of selectedSet) {
    if (!staffPool.some((u) => u.id === id)) {
      const extra = getUser(id);
      if (extra && extra.status === "active") staffPool.push(extra);
    }
  }
  const staff = staffPool
    .map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      phone: u.phone,
    }))
    .sort((a, b) => {
      const ra = ROLE_RANK[a.role] ?? 9;
      const rb = ROLE_RANK[b.role] ?? 9;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name, "fa");
    });

  return (
    <CourseInfoEditor
      course={course}
      categories={categories}
      tags={tags}
      staff={staff}
    />
  );
}
