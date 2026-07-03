import { listStaticPages } from "@/lib/db";
import StaticPagesTable from "./StaticPagesTable";
import { LinkButton } from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export default function AdminStaticPagesPage() {
  const pages = listStaticPages();
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            صفحات ثابت
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            قوانین، راهنمای خرید، معرفی دوره‌ها و دیگر صفحات ثابت سایت
          </p>
        </div>
        <LinkButton href="/admin/static-pages/new">
          <Icon.Plus width={15} height={15} /> صفحه جدید
        </LinkButton>
      </div>
      <StaticPagesTable pages={pages} />
    </div>
  );
}
