import { listCourses } from "@/lib/db";
import { COURSES } from "@/data/courses";
import CoursesGrid, { type CourseCardData } from "./CoursesGrid";

export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const records = listCourses();

  // Merge DB record with seed data so UI has lesson count + duration string
  // that db.courses strips out. The seed is authoritative for presentation.
  const bySlug = new Map(COURSES.map((c) => [c.slug, c]));

  const cards: CourseCardData[] = records.map((r) => {
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
      badge: r.badge,
      status: r.status,
      createdAt: r.createdAt,
      publishedAt: r.publishedAt,
      duration: seed?.duration ?? "",
      lessons: seed?.lessons ?? 0,
    };
  });

  return <CoursesGrid courses={cards} initialQuery={sp.q ?? ""} />;
}
