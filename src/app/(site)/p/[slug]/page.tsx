import type { Metadata } from "next";
import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getStaticPage, listStaticPages } from "@/lib/db";
import { formatDate } from "@/lib/formatting";
import LegacyHtml from "@/components/LegacyHtml";

export function generateStaticParams() {
  return listStaticPages({ publishedOnly: true }).map((p) => ({ slug: p.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getStaticPage(slug);
  if (!page || !page.published) return {};
  return {
    title: `${page.title} | نامدار آکادمی`,
    description: page.summary || undefined,
  };
}

export default async function StaticPageDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getStaticPage(slug);
  if (!page || !page.published) notFound();

  return (
    <article className="bg-white">
      <div className="bg-gradient-to-l from-[#0f1f4a] via-[#1b3c8a] to-[#136cb5] text-white py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-[900px] mx-auto">
          <nav className="text-white/70 text-sm mb-5 flex gap-2">
            <Link href="/" className="hover:text-white">
              خانه
            </Link>
            <span>/</span>
            <span className="text-white/90">{page.title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {page.title}
          </h1>
          {page.summary && (
            <p className="text-base md:text-lg text-white/80 leading-[2] max-w-[760px]">
              {page.summary}
            </p>
          )}
          <div className="flex items-center gap-3 text-[12.5px] text-white/60 mt-5">
            <span>آخرین به‌روزرسانی:</span>
            <span>{formatDate(page.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* LegacyHtml: runtime innerHTML + script re-insertion. Lets admin
            HTML with <script>/<style> (e.g. the calculator page) actually
            work, and avoids React's "script tag while rendering" warning. */}
        <LegacyHtml
          html={page.body}
          className={[
            "prose prose-lg max-w-none text-[#010514]/85",
            "prose-p:leading-[2] prose-p:text-justify prose-p:text-[#010514]/80",
            "prose-headings:text-[#0e1a3d] prose-headings:font-extrabold prose-headings:tracking-tight",
            "prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-[#eef2f7]",
            "prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-[#1b3c8a]",
            "prose-strong:text-[#0e1a3d] prose-strong:font-bold",
            "prose-a:text-[#1b3c8a] prose-a:no-underline hover:prose-a:underline",
            "prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 prose-li:leading-8",
            "prose-li:marker:text-[#1b3c8a] prose-li:marker:font-bold",
            "prose-blockquote:border-r-4 prose-blockquote:border-r-[#1b3c8a]/30 prose-blockquote:border-l-0 prose-blockquote:bg-[#f7fafd] prose-blockquote:rounded-lg prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-[#0e1a3d]/80",
            "prose-img:rounded-xl prose-img:shadow-md",
            "prose-hr:border-[#eef2f7]",
          ].join(" ")}
        />
      </div>
    </article>
  );
}
