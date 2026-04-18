import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/db";
import {
  COURSE_STATUS_COLORS,
  COURSE_STATUS_LABELS,
  formatToman,
} from "@/lib/formatting";
import CourseTabs from "./CourseTabs";

export const dynamic = "force-dynamic";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function CourseEditLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const course = getCourse(slug) ?? getCourse(rawSlug);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[#010514]/60 flex gap-2">
        <Link href="/admin/courses" className="hover:text-[#1b3c8a]">
          دوره‌ها
        </Link>
        <span>/</span>
        <span className="text-[#010514] truncate">{course.title}</span>
      </nav>

      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-6 flex items-start gap-5 flex-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.previewImage}
          alt={course.title}
          className="w-32 h-20 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${COURSE_STATUS_COLORS[course.status]}`}
            >
              {COURSE_STATUS_LABELS[course.status]}
            </span>
            <span className="text-xs text-[#010514]/50 font-mono" dir="ltr">
              /{course.slug}
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-[#010514] truncate">
            {course.title}
          </h1>
          <p className="text-xs text-[#010514]/55 mt-1 line-clamp-1">
            {course.shortDesc}
          </p>
        </div>
        <div className="text-left">
          <div className="text-[11px] text-[#010514]/55">قیمت فعلی</div>
          <div className="text-lg font-bold text-[#1b3c8a]">
            {course.isFree
              ? "رایگان"
              : formatToman(course.discountPrice ?? course.price)}
          </div>
        </div>
      </div>

      <CourseTabs slug={slug} />

      <div>{children}</div>
    </div>
  );
}
