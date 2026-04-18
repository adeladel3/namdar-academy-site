import { listCategories, listTags } from "@/lib/db";
import CategoriesManager from "./CategoriesManager";
import TagsManager from "./TagsManager";
import Link from "next/link";
import { cx } from "@/lib/cx";

export const dynamic = "force-dynamic";

export default function ContentPage() {
  const categories = listCategories();
  const tags = listTags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          دسته‌بندی و تگ
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          ساختار طبقه‌بندی دوره‌ها و محتوا
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5eaf5] overflow-x-auto">
        <div className="flex items-center min-w-max">
          <TabLink href="/admin/content/categories" active>
            دسته‌بندی‌ها
          </TabLink>
          <TabLink href="/admin/content/tags">تگ‌ها</TabLink>
        </div>
      </div>

      <CategoriesManager categories={categories} />
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "px-5 py-3 text-sm border-b-2",
        active
          ? "text-[#1b3c8a] border-[#1b3c8a] font-bold"
          : "text-[#010514]/65 border-transparent hover:text-[#1b3c8a]"
      )}
    >
      {children}
    </Link>
  );
}
