import Link from "next/link";
import { listArticles } from "@/lib/db";
import ArticlesFilter from "./ArticlesFilter";
import { faDigits, formatDate } from "@/lib/formatting";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "مقالات | نامدار آکادمی",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const articles = listArticles({
    publishedOnly: true,
    category: sp.category,
    q: sp.q,
  });
  const allArticles = listArticles({ publishedOnly: true });
  const categories = Array.from(
    new Set(allArticles.map((a) => a.category))
  ).filter(Boolean);

  return (
    <div className="bg-[#f7fafd] py-10 md:py-16 px-4 md:px-8 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-[#010514] mb-3">
            مقالات نامدار آکادمی
          </h1>
          <p className="text-[#010514]/65 max-w-2xl mx-auto">
            آخرین تحلیل‌ها، آموزش‌ها و اخبار دنیای ترید و سرمایه‌گذاری.
          </p>
        </div>

        <ArticlesFilter
          categories={categories}
          activeCategory={sp.category ?? ""}
          initialQuery={sp.q ?? ""}
        />

        {articles.length === 0 ? (
          <div className="text-center py-20 text-[#010514]/60">
            مقاله‌ای مطابق با جستجوی شما یافت نشد.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl hover:-translate-y-1 transition border border-[#e5eaf5]"
              >
                <div className="relative aspect-[16/9] bg-gradient-to-br from-[#136cb5] to-[#49bbbd] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.coverImage}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[#1b3c8a] text-xs font-bold">
                    {a.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-[#010514]/55 mb-3">
                    <span>
                      {formatDate(a.publishedAt ?? a.createdAt)}
                    </span>
                    <span>•</span>
                    <span>{faDigits(a.readMinutes)} دقیقه مطالعه</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#010514] mb-2 line-clamp-2 group-hover:text-[#136cb5] transition">
                    {a.title}
                  </h2>
                  <p className="text-sm text-[#010514]/65 line-clamp-2">
                    {a.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[#1b3c8a] text-sm font-bold group-hover:gap-2 transition-all">
                    ادامه مطلب <span>←</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
