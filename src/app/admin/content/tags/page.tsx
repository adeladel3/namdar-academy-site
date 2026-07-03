import Link from "@/components/SafeLink";
import { listTags } from "@/lib/db";
import TagsManager from "../categories/TagsManager";
import { cx } from "@/lib/cx";

export const dynamic = "force-dynamic";

export default function TagsPage() {
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
          <Link
            href="/admin/content/categories"
            className={cx(
              "px-5 py-3 text-sm border-b-2 text-[#010514]/65 border-transparent hover:text-[#1b3c8a]"
            )}
          >
            دسته‌بندی‌ها
          </Link>
          <Link
            href="/admin/content/tags"
            className={cx(
              "px-5 py-3 text-sm border-b-2 text-[#1b3c8a] border-[#1b3c8a] font-bold"
            )}
          >
            تگ‌ها
          </Link>
        </div>
      </div>

      <TagsManager tags={tags} />
    </div>
  );
}
