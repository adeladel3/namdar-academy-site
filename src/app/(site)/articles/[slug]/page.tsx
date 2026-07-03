import type { Metadata } from "next";
import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getArticle, listArticles } from "@/lib/db";
import { faDigits, formatDate } from "@/lib/formatting";
import ShareButtons from "@/components/ShareButtons";
import { absUrl, articleJsonLd, breadcrumbJsonLd, SITE } from "@/lib/seo";

export function generateStaticParams() {
  return listArticles({ publishedOnly: true }).map((a) => ({ slug: a.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "مقاله پیدا نشد" };

  // Prefer admin-supplied SEO overrides; fall back to the display fields so
  // articles without SEO tuning still get sensible meta tags.
  const title = article.seoTitle?.trim() || article.title;
  const description =
    article.metaDescription?.trim() ||
    article.excerpt ||
    article.content?.replace(/<[^>]+>/g, "").slice(0, 160) ||
    SITE.description;
  const image = article.ogImage?.trim()
    ? absUrl(article.ogImage)
    : article.coverImage
      ? absUrl(article.coverImage)
      : SITE.ogImage;
  const canonical =
    article.canonicalUrl?.trim() || `/articles/${slug}`;

  return {
    title,
    description,
    keywords: article.tags && article.tags.length > 0 ? article.tags : undefined,
    authors: article.authorName ? [{ name: article.authorName }] : undefined,
    alternates: { canonical },
    robots: article.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/articles/${slug}`,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      modifiedTime: article.updatedAt
        ? new Date(article.updatedAt).toISOString()
        : undefined,
      authors: article.authorName ? [article.authorName] : undefined,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || !article.published) notFound();

  const related = listArticles({
    publishedOnly: true,
    category: article.category,
  })
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  const jsonLd = [
    articleJsonLd({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      coverImage: article.ogImage || article.coverImage,
      authorName: article.authorName || null,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    }),
    breadcrumbJsonLd([
      { name: "خانه", url: "/" },
      { name: "مقالات", url: "/articles" },
      { name: article.title, url: `/articles/${article.slug}` },
    ]),
  ];

  return (
    <article className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-gradient-to-l from-[#0f1f4a] via-[#1b3c8a] to-[#136cb5] text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-[900px] mx-auto">
          <nav className="text-white/70 text-sm mb-5 flex gap-2">
            <Link href="/" className="hover:text-white">خانه</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-white">مقالات</Link>
          </nav>
          <Link
            href={`/articles?category=${encodeURIComponent(article.category)}`}
            className="inline-block px-3 py-1 rounded-full bg-white/15 text-sm mb-4 hover:bg-white/25 transition"
          >
            {article.category}
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-white/75">
            <span>
              {formatDate(article.publishedAt ?? article.createdAt)}
            </span>
            <span>•</span>
            <span>{faDigits(article.readMinutes)} دقیقه مطالعه</span>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-8 -mt-10 md:-mt-12 mb-12">
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl bg-[#e5eaf5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-8 pb-16">
        <p className="text-lg text-[#010514]/70 leading-8 mb-8 pb-8 border-b border-[#eef2f7]">
          {article.excerpt}
        </p>

        <div
          className="prose prose-lg max-w-none text-[#010514]/85 leading-[2] whitespace-pre-line"
          dangerouslySetInnerHTML={
            article.content.includes("<")
              ? { __html: article.content }
              : undefined
          }
        >
          {article.content.includes("<") ? undefined : article.content}
        </div>

        <div className="mt-10 pt-6 border-t border-[#eef2f7]">
          <h3 className="font-bold text-[#010514] mb-3">
            این مقاله را با دیگران به اشتراک بگذارید
          </h3>
          <ShareButtons title={article.title} path={`/articles/${slug}`} />
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

      {related.length > 0 && (
        <section className="bg-[#f7fafd] py-14 px-4 md:px-8">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#010514] mb-6">
              مقالات مرتبط
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/articles/${r.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition border border-[#e5eaf5]"
                >
                  <div className="relative aspect-[16/9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.coverImage}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#010514] line-clamp-2 group-hover:text-[#136cb5] transition">
                      {r.title}
                    </h3>
                    <p className="text-xs text-[#010514]/55 mt-2">
                      {formatDate(r.publishedAt ?? r.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
