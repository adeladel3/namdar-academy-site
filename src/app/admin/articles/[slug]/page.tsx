import { notFound } from "next/navigation";
import { getArticle, listArticles } from "@/lib/db";
import ArticleEditor from "./ArticleEditor";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const existing = listArticles();
  const categories = Array.from(
    new Set(existing.map((a) => a.category).filter(Boolean))
  );
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          ویرایش مقاله
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1 font-mono" dir="ltr">
          /{slug}
        </p>
      </div>
      <ArticleEditor article={article} categories={categories} />
    </div>
  );
}
