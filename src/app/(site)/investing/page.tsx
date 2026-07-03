import type { Metadata } from "next";
import { listCourses } from "@/lib/db";
import { COURSES } from "@/data/courses";
import CoursesGrid, { type CourseCardData } from "../courses/CoursesGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سرمایه‌گذاری و مشاوره",
  description:
    "خدمات سرمایه‌گذاری و مشاوره تخصصی نامدار آکادمی — Investing Hub و پلتفرم‌های چنددارایی برای مدیریت هوشمند سرمایه.",
  alternates: { canonical: "/investing" },
  openGraph: {
    title: "سرمایه‌گذاری و مشاوره — نامدار آکادمی",
    description:
      "خدمات سرمایه‌گذاری و مشاوره تخصصی — پلتفرم‌های چنددارایی و مدیریت هوشمند سرمایه.",
    url: "/investing",
    type: "website",
  },
};

const INVESTING_SLUGS = new Set(["investing-hub"]);

export default async function InvestingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const records = listCourses().filter((r) => INVESTING_SLUGS.has(r.slug));

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
