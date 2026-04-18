import { listArticles } from "@/lib/db";
import ArticleEditor from "../[slug]/ArticleEditor";

export default function NewArticlePage() {
  const existing = listArticles();
  const categories = Array.from(
    new Set(existing.map((a) => a.category).filter(Boolean))
  );
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          مقاله جدید
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          محتوای آموزشی و تحلیل‌های بلاگ
        </p>
      </div>
      <ArticleEditor categories={categories} />
    </div>
  );
}
