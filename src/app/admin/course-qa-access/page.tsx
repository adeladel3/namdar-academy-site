import {
  getCourse,
  getUser,
  listCourses,
  listManualQAAccessRecords,
  listUsers,
} from "@/lib/db";
import CourseQAAccessManager from "./CourseQAAccessManager";

export const dynamic = "force-dynamic";

export default function AdminCourseQAAccessPage() {
  const manualGrants = listManualQAAccessRecords();
  const courses = listCourses();
  const users = listUsers();

  // Enrich grants with user + course display fields so the manager has
  // everything in one pass (avoid N+1 lookups in the client component).
  const enriched = manualGrants
    .map((g) => {
      const u = getUser(g.userId);
      const c = getCourse(g.courseSlug);
      if (!u || !c) return null;
      return {
        id: g.id,
        userId: g.userId,
        userName: u.name,
        userPhone: u.phone,
        courseSlug: g.courseSlug,
        courseTitle: c.title,
        grantedAt: g.grantedAt,
        note: g.note,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div className="space-y-6">
      {/* Hero/explainer — این بخش عمداً پررنگ است تا ادمین گم نشود و
          بداند این صفحه دقیقاً چه کاری می‌کند. */}
      <div className="rounded-2xl border-2 border-[#1b3c8a] bg-gradient-to-l from-[#eef4ff] to-white p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1b3c8a] text-white flex items-center justify-center text-2xl shrink-0">
            ؟
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-[#010514]">
              پنل پرسش‌وپاسخ دوره‌ها
            </h1>
            <p className="text-sm text-[#010514]/75 mt-2 leading-7">
              این صفحه برای زمانی است که می‌خواهید به یک کاربر، بدون اینکه
              دوره را برایش فعال کنید (یعنی محتوای دوره برایش باز شود)،
              دسترسی به پنل پرسش‌وپاسخ یک دوره خاص بدهید.
            </p>
            <ul className="text-sm text-[#010514]/70 mt-3 space-y-1.5 list-disc pr-5 leading-7">
              <li>
                <strong>به‌صورت خودکار:</strong> هر کاربری که یک دوره را
                <em> خرید کند یا برایش grant شود</em>، پنل پرسش‌وپاسخ آن
                دوره برایش فعال می‌شود. نیازی به کار دستی نیست.
              </li>
              <li>
                <strong>به‌صورت دستی (همین صفحه):</strong> اگر می‌خواهید
                به کاربری فقط امکان پرسیدن سوال در پنل پرسش‌وپاسخ یک دوره
                را بدهید (بدون اینکه به محتوای دوره دسترسی پیدا کند)، از
                دکمه‌ی «اعطای دسترسی جدید» استفاده کنید.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <CourseQAAccessManager
        grants={enriched}
        courses={courses.map((c) => ({ slug: c.slug, title: c.title }))}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          phone: u.phone,
        }))}
      />
    </div>
  );
}
