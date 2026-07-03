import Link from "@/components/SafeLink";
import { listArticles } from "@/lib/db";
import ArticlesTable from "./ArticlesTable";
import { LinkButton } from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";

export const dynamic = "force-dynamic";

export default function AdminArticlesPage() {
  const articles = listArticles();
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            مقالات
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            مدیریت محتوای بلاگ و آموزش‌ها
          </p>
        </div>
        <LinkButton href="/admin/articles/new">
          <Icon.Plus width={15} height={15} /> مقاله جدید
        </LinkButton>
      </div>
      <ArticlesTable articles={articles} />
    </div>
  );
}
