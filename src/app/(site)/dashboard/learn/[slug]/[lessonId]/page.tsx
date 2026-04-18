import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import {
  getCourse,
  getLesson,
  getProgress,
  isEnrolled,
  listAttachments,
  listLessons,
} from "@/lib/db";
import { faDigits } from "@/lib/formatting";
import VideoPlayer from "./VideoPlayer";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await getSession();

  const lesson = getLesson(lessonId);
  const course = getCourse(slug);
  if (!lesson || !course || lesson.courseSlug !== slug) notFound();

  const allowPreview = lesson.freePreview === true;
  if (!session && !allowPreview) {
    redirect(`/login?next=/dashboard/learn/${slug}/${lessonId}`);
  }
  if (
    session &&
    !allowPreview &&
    !isEnrolled(session.userId, slug) &&
    !isStaff(session)
  ) {
    redirect(`/courses/${slug}?not_enrolled=1`);
  }

  const lessons = listLessons(slug);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;

  const prog = session ? getProgress(session.userId, lessonId) : undefined;
  const attachments = listAttachments(lessonId);

  return (
    <div className="bg-[#f7fafd] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10">
        <nav className="text-sm text-[#010514]/60 mb-4 flex gap-2">
          <Link href="/dashboard" className="hover:text-[#1b3c8a]">
            داشبورد
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/learn/${slug}`}
            className="hover:text-[#1b3c8a]"
          >
            {course.title}
          </Link>
          <span>/</span>
          <span className="text-[#010514] truncate">{lesson.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div>
            <VideoPlayer
              lessonId={lesson.id}
              videoUrl={lesson.videoUrl}
              initialPositionSec={prog?.positionSec ?? 0}
              completed={prog?.completed ?? false}
              canTrack={!!session}
            />

            <div className="mt-6 bg-white rounded-3xl p-6 border border-[#e5eaf5]">
              <h1 className="text-xl md:text-2xl font-bold text-[#010514] mb-3">
                {lesson.title}
              </h1>
              {lesson.content && (
                <div
                  className="prose prose-sm max-w-none text-[#010514]/80 leading-8"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              )}
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 bg-white rounded-3xl p-6 border border-[#e5eaf5]">
                <h3 className="font-bold text-[#010514] mb-3">فایل‌های ضمیمه</h3>
                <ul className="space-y-2">
                  {attachments.map((a) => (
                    <li key={a.id}>
                      <a
                        href={a.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#f7fafd] hover:bg-[#eef4ff] transition text-sm"
                      >
                        <span className="text-[#1b3c8a]">📎</span>
                        <span className="flex-1 truncate">{a.title}</span>
                        <span className="text-xs text-[#010514]/50">
                          {(a.fileSize / 1024).toFixed(0)} KB
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              {prev ? (
                <Link
                  href={`/dashboard/learn/${slug}/${prev.id}`}
                  className="px-5 py-3 rounded-full bg-white border border-[#e5eaf5] text-[#1b3c8a] font-bold hover:border-[#1b3c8a] transition"
                >
                  → درس قبلی
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/dashboard/learn/${slug}/${next.id}`}
                  className="px-5 py-3 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition"
                >
                  درس بعدی ←
                </Link>
              ) : (
                <Link
                  href={`/dashboard/learn/${slug}`}
                  className="px-5 py-3 rounded-full bg-green-600 text-white font-bold hover:opacity-90 transition"
                >
                  بازگشت به سرفصل‌ها
                </Link>
              )}
            </div>
          </div>

          <aside>
            <div className="bg-white rounded-3xl border border-[#e5eaf5] overflow-hidden sticky top-24">
              <div className="p-5 border-b border-[#eef2f7] font-bold text-[#010514]">
                سرفصل‌های دوره
              </div>
              <ul className="max-h-[70vh] overflow-auto">
                {lessons.map((l) => {
                  const active = l.id === lesson.id;
                  return (
                    <li
                      key={l.id}
                      className="border-t border-[#eef2f7] first:border-t-0"
                    >
                      <Link
                        href={`/dashboard/learn/${slug}/${l.id}`}
                        className={`flex items-start gap-3 p-4 text-sm transition ${
                          active
                            ? "bg-[#eef4ff] text-[#1b3c8a] font-bold"
                            : "hover:bg-[#f7fafd] text-[#010514]"
                        }`}
                      >
                        <span className="text-[#010514]/50 text-xs mt-0.5 shrink-0 font-mono">
                          {faDigits(String(lessons.indexOf(l) + 1).padStart(2, "0"))}
                        </span>
                        <span>{l.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
