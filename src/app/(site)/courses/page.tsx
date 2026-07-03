import type { Metadata } from "next";
import { listCourses, listSeminars, listSeminarRegistrationsBySeminar } from "@/lib/db";
import { COURSES } from "@/data/courses";
import CoursesGrid, { type CourseCardData } from "./CoursesGrid";
import BackToTop from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "دوره‌ها و سمینارهای نامدار آکادمی",
  description:
    "همه‌ی محصولات نامدار آکادمی در یک نگاه: دوره‌های آنلاین ترید و سرمایه‌گذاری از مقدماتی تا پیشرفته، در کنار سمینارهای حضوری استاد امیرحسین نام‌آور.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "دوره‌ها و سمینارهای نامدار آکادمی",
    description:
      "همه‌ی محصولات نامدار آکادمی در یک نگاه: دوره‌های آنلاین ترید و سرمایه‌گذاری در کنار سمینارهای حضوری.",
    url: "/courses",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function formatSeminarDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const records = listCourses().filter((r) => r.slug !== "investing-hub");

  // Merge DB record with seed data so UI has lesson count + duration string
  // that db.courses strips out. The seed is authoritative for presentation.
  const bySlug = new Map(COURSES.map((c) => [c.slug, c]));

  const courseCards: CourseCardData[] = records.map((r) => {
    const seed = bySlug.get(r.slug);
    return {
      slug: r.slug,
      title: r.title,
      shortDesc: r.shortDesc,
      previewImage: r.previewImage,
      level: r.level,
      price: r.price,
      discountPrice: r.discountPrice,
      isFree: r.isFree,
      instructor: r.instructor,
      studentsCount: r.studentsCount,
      hideStudentsCount: r.hideStudentsCount,
      badge: r.badge,
      status: r.status,
      createdAt: r.createdAt,
      publishedAt: r.publishedAt,
      duration: seed?.duration ?? "",
      lessons: seed?.lessons ?? 0,
      kind: "course",
    };
  });

  // سمینارهای منتشرشده — به همان مدل کارت تبدیل می‌شوند تا در همین گرید
  // محصولات کنار دوره‌ها نمایش داده شوند. لینک کارت به /seminars/<slug> می‌رود
  // و چیپ «سمینار حضوری» جای چیپ سطح را می‌گیرد.
  const seminarCards: CourseCardData[] = listSeminars({ publishedOnly: true }).map(
    (s) => {
      const registrationsCount = listSeminarRegistrationsBySeminar(s.slug).length;
      return {
        slug: s.slug,
        title: s.title,
        shortDesc: s.shortDesc,
        previewImage: s.heroImage ?? "",
        // سمینارها سطح ندارند، ولی نوع TS نیاز به مقدار دارد. این مقدار
        // برای سمینارها هرگز رندر نمی‌شود (با شرط kind === "seminar").
        level: "intermediate",
        price: s.price,
        discountPrice: s.discountPrice,
        isFree: false,
        instructor: s.instructorName ?? "استاد امیرحسین نام‌آور",
        studentsCount: registrationsCount,
        badge: undefined,
        status: s.status,
        createdAt: s.createdAt,
        publishedAt: s.publishedAt,
        duration: formatSeminarDate(s.eventDate),
        lessons: 0,
        kind: "seminar",
        detailHref: `/seminars/${encodeURIComponent(s.slug)}`,
        venueName: s.venueName,
      };
    },
  );

  const cards: CourseCardData[] = [...seminarCards, ...courseCards];

  return (
    <>
      <CoursesGrid courses={cards} initialQuery={sp.q ?? ""} />
      <BackToTop />
    </>
  );
}
