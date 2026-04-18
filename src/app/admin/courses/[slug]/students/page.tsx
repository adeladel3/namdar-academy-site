import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCourse,
  getUser,
  listEnrollmentRecordsForCourse,
  listLessons,
  listProgressForCourse,
} from "@/lib/db";
import StudentsTable, { type StudentRow } from "./StudentsTable";
import { Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CourseStudentsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const enrollments = listEnrollmentRecordsForCourse(slug);
  const lessons = listLessons(slug);

  const rows: StudentRow[] = enrollments.map((e) => {
    const user = getUser(e.userId);
    const progress = listProgressForCourse(e.userId, slug);
    const completed = progress.filter((p) => p.completed).length;
    const last = progress.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)[0];
    return {
      id: e.id,
      userId: e.userId,
      name: user?.name ?? "—",
      phone: user?.phone ?? "—",
      enrolledAt: e.enrolledAt,
      source: e.source,
      completedLessons: completed,
      totalLessons: lessons.length,
      lastActivityAt: last?.lastWatchedAt ?? null,
    };
  });

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <Card className="p-14 text-center text-[#010514]/55">
          <div className="font-bold text-[#010514] mb-1">دانش‌پذیری یافت نشد</div>
          <p className="text-sm">هنوز کاربری در این دوره ثبت‌نام نکرده است.</p>
        </Card>
      ) : (
        <StudentsTable rows={rows} />
      )}
      <div className="text-xs text-[#010514]/45 text-center">
        برای اعطای دسترسی به کاربر جدید، از{" "}
        <Link
          href="/admin/users"
          className="text-[#1b3c8a] font-bold hover:underline"
        >
          صفحه کاربران
        </Link>{" "}
        یک کاربر را باز کنید.
      </div>
    </div>
  );
}
