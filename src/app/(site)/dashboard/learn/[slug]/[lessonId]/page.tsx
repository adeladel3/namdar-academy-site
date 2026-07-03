import Link from "@/components/SafeLink";
import { notFound, redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import {
  getCourse,
  getLesson,
  isEnrolled,
  listAttachments,
  listLessons,
  listProgressForCourse,
  upsertProgress,
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

  // دوره اسپات‌پلیر: پخش‌کننده داخلی ندارد، به صفحه کد لایسنس هدایت کن.
  if (course.spotPlayerCourseId?.trim()) {
    redirect(`/dashboard/license/${slug}`);
  }

  const allowPreview = lesson.freePreview === true;
  if (!session && !allowPreview) {
    redirect(`/login?next=/dashboard/learn/${slug}/${lessonId}`);
  }
  const staff = session ? isStaff(session) : false;
  if (session && !allowPreview && !isEnrolled(session.userId, slug) && !staff) {
    redirect(`/courses/${slug}?not_enrolled=1`);
  }

  const lessons = listLessons(slug);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;

  let progress = session ? listProgressForCourse(session.userId, slug) : [];
  let prog = progress.find((p) => p.lessonId === lessonId);

  // Video-less lessons have nothing to watch, so visiting one counts as
  // completion — for students only. Staff (admin/support) keep video-less
  // lessons "incomplete" so they can QA the student lock UI, and rely on
  // their bypass to navigate freely.
  if (session && !staff && !lesson.videoUrl && !prog?.completed) {
    const now = Date.now();
    upsertProgress({
      userId: session.userId,
      lessonId,
      courseSlug: slug,
      positionSec: 0,
      maxPositionSec: 0,
      watchedSec: prog?.watchedSec ?? 0,
      watchCount: prog?.watchCount ?? 1,
      completed: true,
      firstWatchedAt: prog?.firstWatchedAt ?? now,
      lastWatchedAt: now,
    });
    progress = listProgressForCourse(session.userId, slug);
    prog = progress.find((p) => p.lessonId === lessonId);
  }

  const completedIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId)
  );
  const attachments = listAttachments(lessonId);

  // Strict rule: a lesson is unlocked only when every previous lesson is
  // completed. Free-preview lessons are an exception. Admins/support see the
  // same visual locks as students (so they can QA the flow), but can still
  // click through locked items (enforcement is scoped to the access check
  // below, not the sidebar rendering).
  const isUnlocked = (i: number) => {
    const l = lessons[i];
    if (l.freePreview) return true;
    for (let j = 0; j < i; j++) {
      if (!completedIds.has(lessons[j].id)) return false;
    }
    return true;
  };

  const currentUnlocked = idx >= 0 ? isUnlocked(idx) : true;
  const blockerIdx = !currentUnlocked
    ? lessons.findIndex((l, i) => i < idx && !completedIds.has(l.id))
    : -1;
  const blocker = blockerIdx >= 0 ? lessons[blockerIdx] : null;

  // Enforce the gate for non-staff only: show the locked state page.
  const enforceLock = !currentUnlocked && !staff;

  const currentCompleted = prog?.completed ?? false;
  const currentHasVideo = !!lesson.videoUrl;
  const nextButtonEnabled = staff || !currentHasVideo || currentCompleted;

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
            {enforceLock && blocker ? (
              <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 md:p-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-2xl mb-4">
                  🔒
                </div>
                <h1 className="text-lg md:text-xl font-bold text-[#010514] mb-2">
                  این درس هنوز قفل است
                </h1>
                <p className="text-[#010514]/75 leading-8 mb-5">
                  برای دسترسی به درس «{lesson.title}» ابتدا باید ویدیوی درس شمارهٔ{" "}
                  <span className="font-bold">
                    {faDigits(String(blockerIdx + 1).padStart(2, "0"))}
                  </span>{" "}
                  «<span className="font-bold">{blocker.title}</span>» را به‌طور
                  کامل (۱۰۰٪) تماشا کنید.
                </p>
                <Link
                  href={`/dashboard/learn/${slug}/${blocker.id}`}
                  className="inline-block px-6 py-3 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition"
                >
                  برو به درس شمارهٔ{" "}
                  {faDigits(String(blockerIdx + 1).padStart(2, "0"))} ←
                </Link>
              </div>
            ) : (
              <>
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
                    <h3 className="font-bold text-[#010514] mb-3">
                      فایل‌های ضمیمه
                    </h3>
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

                {next && !nextButtonEnabled && (
                  <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-[#010514]/80 leading-7">
                    <span className="inline-flex items-center gap-2 font-bold text-amber-900 mb-1">
                      <span>🔒</span> درس بعدی قفل است
                    </span>
                    <div>
                      برای باز شدن درس «
                      <span className="font-bold">{next.title}</span>» ابتدا
                      ویدیوی همین درس (شمارهٔ{" "}
                      {faDigits(String(idx + 1).padStart(2, "0"))} «{lesson.title}
                      ») را به‌طور کامل ۱۰۰٪ تماشا کنید.
                    </div>
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
                    nextButtonEnabled ? (
                      <Link
                        href={`/dashboard/learn/${slug}/${next.id}`}
                        className="px-5 py-3 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition"
                      >
                        درس بعدی ←
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="برای باز شدن درس بعدی، ابتدا ویدیوی این درس را ۱۰۰٪ تماشا کنید."
                        className="px-5 py-3 rounded-full bg-[#e5eaf5] text-[#010514]/45 font-bold cursor-not-allowed inline-flex items-center gap-2"
                      >
                        <span>🔒</span>
                        <span>درس بعدی ←</span>
                      </button>
                    )
                  ) : (
                    <Link
                      href={`/dashboard/learn/${slug}`}
                      className="px-5 py-3 rounded-full bg-green-600 text-white font-bold hover:opacity-90 transition"
                    >
                      بازگشت به سرفصل‌ها
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>

          <aside>
            <div className="bg-white rounded-3xl border border-[#e5eaf5] overflow-hidden sticky top-24">
              <div className="p-5 border-b border-[#eef2f7] font-bold text-[#010514]">
                سرفصل‌های دوره
              </div>
              <ul className="max-h-[70vh] overflow-auto">
                {lessons.map((l, i) => {
                  const active = l.id === lesson.id;
                  const unlocked = isUnlocked(i);
                  const done = completedIds.has(l.id);
                  const num = faDigits(String(i + 1).padStart(2, "0"));
                  // For a locked row, the specific blocker is the first
                  // prior lesson that isn't yet completed — usually the
                  // immediate previous one. Name it in the tooltip.
                  const rowBlockerIdx = unlocked
                    ? -1
                    : lessons.findIndex(
                        (p, j) => j < i && !completedIds.has(p.id)
                      );
                  const rowBlocker =
                    rowBlockerIdx >= 0 ? lessons[rowBlockerIdx] : null;
                  const lockTitle = rowBlocker
                    ? `برای باز شدن این درس، ابتدا ویدیوی «${rowBlocker.title}» را ۱۰۰٪ تماشا کنید.`
                    : "این درس هنوز قفل است.";
                  const rowBase = "flex items-start gap-3 p-4 text-sm transition";
                  const rowClass = !unlocked
                    ? `${rowBase} text-[#010514]/45 bg-[#f7fafd] ${staff ? "hover:bg-[#eef4ff] cursor-pointer" : "cursor-not-allowed"}`
                    : active
                      ? `${rowBase} bg-[#eef4ff] text-[#1b3c8a] font-bold`
                      : `${rowBase} hover:bg-[#f7fafd] text-[#010514]`;
                  const content = (
                    <>
                      <span className="text-[#010514]/50 text-xs mt-0.5 shrink-0 font-mono">
                        {num}
                      </span>
                      <span className="flex-1">{l.title}</span>
                      {!unlocked ? (
                        <span
                          className="text-[#010514]/55 text-base shrink-0"
                          aria-label="قفل"
                        >
                          🔒
                        </span>
                      ) : done ? (
                        <span
                          className="text-green-700 text-base shrink-0"
                          aria-label="کامل شده"
                        >
                          ✓
                        </span>
                      ) : null}
                    </>
                  );
                  // Staff can still click through locked rows so they can QA
                  // the downstream pages; students cannot.
                  const clickable = unlocked || staff;
                  return (
                    <li
                      key={l.id}
                      className="border-t border-[#eef2f7] first:border-t-0"
                    >
                      {clickable ? (
                        <Link
                          href={`/dashboard/learn/${slug}/${l.id}`}
                          className={rowClass}
                          title={!unlocked ? lockTitle : undefined}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div
                          className={rowClass}
                          title={lockTitle}
                          aria-disabled="true"
                        >
                          {content}
                        </div>
                      )}
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
