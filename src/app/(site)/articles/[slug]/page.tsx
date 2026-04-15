import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, findArticle } from "@/data/articles";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  return (
    <article className="bg-white">
      <div className="bg-gradient-to-l from-[#0f1f4a] via-[#1b3c8a] to-[#136cb5] text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-[900px] mx-auto">
          <nav className="text-white/70 text-sm mb-5 flex gap-2">
            <Link href="/" className="hover:text-white">خانه</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-white">مقالات</Link>
          </nav>
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-sm mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-white/75">
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readMinutes} دقیقه مطالعه</span>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-8 -mt-10 md:-mt-12 mb-12">
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl bg-[#e5eaf5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-8 pb-16">
        <div className="prose prose-lg max-w-none text-[#010514]/85 leading-[2] whitespace-pre-line">
          {article.content}
        </div>

        <div className="mt-12 pt-8 border-t border-[#e5eaf5] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link
            href="/articles"
            className="text-[#1b3c8a] font-bold hover:underline"
          >
            → بازگشت به لیست مقالات
          </Link>
          <Link
            href="/courses"
            className="px-6 py-3 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition"
          >
            مشاهده دوره‌ها
          </Link>
        </div>
      </div>
    </article>
  );
}
