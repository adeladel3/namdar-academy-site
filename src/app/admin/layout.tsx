import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import Sidebar, { type SidebarSection } from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { ToastContainer } from "@/components/admin/ui";
import { getAdminSections } from "@/lib/admin-sections";
import { can } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "پنل مدیریت — نامدار آکادمی",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!isStaff(session)) redirect("/dashboard");

  // فیلتر sections بر اساس دسترسی: هر بخش یک "first action" دارد که حداقل
  // مجوز لازم برای *دیدن* اون بخش در سایدبار است. اگر کاربر این مجوز را
  // نداشته باشد (مثلاً منتوری که فقط permission `ticket.*` بهش داده شده)،
  // بخش از سایدبار حذف می‌شود تا فقط بخش‌های مجاز نمایش داده شوند.
  //
  // ادمین چون از طریق `roleDefaultPerms("admin")` تمام اکشن‌ها را دارد،
  // همه‌ی بخش‌ها را همیشه می‌بیند.
  const allSections = getAdminSections();
  const visibleSections = allSections.filter((s) => {
    const firstAction = s.actions[0];
    return firstAction ? can(session, firstAction) : true;
  });

  // اگر کاربر staff است ولی هیچ بخشی برایش قابل مشاهده نیست (سشن کهنه یا
  // دسترسی صفر)، به داشبورد کاربری ریدایرکت کن تا توی صفحه‌ی خالی گیر نکند.
  if (visibleSections.length === 0) redirect("/dashboard");

  // Project the server-only registry down to the plain shape the client
  // Sidebar expects (no React components, no regex objects). The Sidebar
  // re-hydrates `matchPattern` with `new RegExp` and resolves `iconName`
  // through an ICON_MAP.
  const sections: SidebarSection[] = visibleSections.map((s) => ({
    key: s.key,
    label: s.label,
    href: s.href,
    iconName: s.iconName,
    matchPattern: s.matchPattern,
    autoDiscovered: s.autoDiscovered,
  }));

  return (
    <div className="min-h-screen bg-[#f5f7fb]" dir="rtl">
      <div className="flex">
        <div className="hidden lg:block fixed top-0 right-0 h-screen">
          <Sidebar sections={sections} />
        </div>
        <div className="flex-1 lg:mr-72 min-h-screen flex flex-col">
          <Topbar session={session} sections={sections} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
