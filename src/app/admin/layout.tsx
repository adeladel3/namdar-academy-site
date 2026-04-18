import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { ToastContainer } from "@/components/admin/ui";

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

  return (
    <div className="min-h-screen bg-[#f5f7fb]" dir="rtl">
      <div className="flex">
        <div className="hidden lg:block fixed top-0 right-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex-1 lg:mr-72 min-h-screen flex flex-col">
          <Topbar session={session} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
