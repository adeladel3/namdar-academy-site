/**
 * Centralized SEO helpers: site-wide identity and structured-data builders.
 *
 * All URLs are absolute — search engines and social platforms (OpenGraph,
 * Twitter, Schema.org) require absolute URLs. Relative paths silently break
 * in shared tweets, og:image fetches, and JSON-LD validators.
 */

export const SITE = {
  name: "نامدار آکادمی",
  nameEn: "Namdar Academy",
  tagline: "مرجع آموزش ترید و سرمایه‌گذاری",
  description:
    "نامدار آکادمی؛ مرجع تخصصی آموزش ترید، سرمایه‌گذاری و بازارهای مالی در ایران — بیش از ۱۶ سال تجربه و یک میلیون کاربر فارسی‌زبان با تدریس استاد امیرحسین نام‌آور.",
  locale: "fa_IR",
  /**
   * Canonical URL of the site. The NEXT_PUBLIC_SITE_URL env var must be set
   * in production to the real domain (e.g. https://namdaracademy.ir) so
   * canonical links and OG tags resolve correctly.
   */
  url: (() => {
    const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
    if (raw && !/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(raw)) {
      return raw.replace(/\/$/, "");
    }
    // در پروداکشن نباید لینک‌های canonical/og:image/JSON-LD به localhost
    // بنشینند — این هم برای SEO فاجعه است هم باعث می‌شود ربات‌ها سعی کنند
    // به localhost درخواست بفرستند. fallback روی دامنه‌ی رسمی.
    if (process.env.NODE_ENV === "production") return "https://namdaracademy.com";
    return raw.replace(/\/$/, "") || "http://localhost:3000";
  })(),
  ogImage: "/figma/headerpic.svg",
  twitter: "@namdar_academy",
} as const;

export function absUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${p}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE.name,
    alternateName: SITE.nameEn,
    url: SITE.url,
    logo: absUrl("/figma/headerpic.svg"),
    description: SITE.description,
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "fa-IR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/courses?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.url),
    })),
  };
}

export function courseJsonLd(c: {
  slug: string;
  title: string;
  shortDesc: string;
  previewImage?: string | null;
  price: number;
  isFree: boolean;
  instructor?: string | null;
  studentsCount?: number | null;
  rating?: { avg: number; count: number } | null;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.title,
    description: c.shortDesc,
    url: absUrl(`/courses/${c.slug}`),
    inLanguage: "fa-IR",
    provider: {
      "@type": "EducationalOrganization",
      name: SITE.name,
      url: SITE.url,
    },
    offers: {
      "@type": "Offer",
      price: c.isFree ? 0 : c.price,
      priceCurrency: "IRT",
      availability: "https://schema.org/InStock",
      url: absUrl(`/courses/${c.slug}`),
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      inLanguage: "fa-IR",
    },
  };
  if (c.previewImage) data.image = absUrl(c.previewImage);
  if (c.instructor) {
    data.instructor = { "@type": "Person", name: c.instructor };
  }
  if (c.rating && c.rating.count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: c.rating.avg.toFixed(1),
      reviewCount: c.rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return data;
}

export function articleJsonLd(a: {
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  publishedAt?: number | null;
  updatedAt?: number | null;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.excerpt ?? a.title,
    url: absUrl(`/articles/${a.slug}`),
    inLanguage: "fa-IR",
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: absUrl("/figma/headerpic.svg"),
      },
    },
    mainEntityOfPage: absUrl(`/articles/${a.slug}`),
  };
  if (a.coverImage) {
    data.image = absUrl(a.coverImage);
  }
  if (a.authorName) {
    data.author = { "@type": "Person", name: a.authorName };
  }
  if (a.publishedAt) {
    data.datePublished = new Date(a.publishedAt).toISOString();
  }
  if (a.updatedAt) {
    data.dateModified = new Date(a.updatedAt).toISOString();
  }
  return data;
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
