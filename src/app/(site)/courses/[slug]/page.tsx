import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCourse,
  getCourseRating,
  isEnrolled,
  listChapters,
  listCourses,
  listLessons,
  listLessonsByChapter,
} from "@/lib/db";
import { getSession, isStaff } from "@/lib/auth";
import {
  LEVEL_LABELS,
  faDigits,
  formatMinutes,
  formatToman,
} from "@/lib/formatting";
import EnrollButton from "./EnrollButton";
import CourseReviewsSection from "@/components/CourseReviewsSection";
import ShareButtons from "@/components/ShareButtons";
import RelatedCourses from "@/components/RelatedCourses";
import PreviewVideoButton from "@/components/PreviewVideoButton";

export function generateStaticParams() {
  return listCourses().map((c) => ({ slug: c.slug }));
}

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const chapters = listChapters(slug);
  const allLessons = listLessons(slug);
  const totalMinutes = Math.ceil(
    allLessons.reduce((s, l) => s + l.videoDurationSec, 0) / 60
  );
  const rating = getCourseRating(slug);
  const session = await getSession();
  const userEnrolled = session ? isEnrolled(session.userId, slug) : false;
  const canReview = !!(session && (userEnrolled || isStaff(session)));

  return (
    <div className="bg-[#f7fafd] min-h-screen">
      <div className="bg-gradient-to-l from-[#0f1f4a] via-[#1b3c8a] to-[#136cb5] text-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <nav className="text-white/70 text-sm mb-6 flex gap-2">
            <Link href="/" className="hover:text-white">خانه</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-white">دوره‌ها</Link>
            <span>/</span>
            <span className="text-white">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm">
                  سطح {LEVEL_LABELS[course.level]}
                </span>
                {course.badge && (
                  <span className="px-3 py-1 rounded-full bg-[#f7cf5a] text-[#2d1c03] text-sm font-bold">
                    {course.badge}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-white/85 text-lg leading-relaxed max-w-2xl">
                {course.shortDesc}
              </p>

              {rating.count > 0 && (
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/10">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={
                          i <= Math.round(rating.avg) ? "#f7cf5a" : "#ffffff40"
                        }
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold">
                    {faDigits(rating.avg.toFixed(1))}
                  </span>
                  <span className="text-xs text-white/70">
                    ({faDigits(rating.count)} نظر)
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-6 mt-8 text-sm">
                <div>
                  <div className="text-white/60">مدرس</div>
                  <div className="font-bold mt-1">{course.instructor}</div>
                </div>
                <div>
                  <div className="text-white/60">مدت دوره</div>
                  <div className="font-bold mt-1">
                    {totalMinutes > 0 ? formatMinutes(totalMinutes) : "در حال تدوین"}
                  </div>
                </div>
                <div>
                  <div className="text-white/60">تعداد درس</div>
                  <div className="font-bold mt-1">
                    {faDigits(allLessons.length)}
                  </div>
                </div>
                <div>
                  <div className="text-white/60">دانش‌پذیران</div>
                  <div className="font-bold mt-1">
                    {faDigits(course.studentsCount)}
                  </div>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-white text-[#010514] rounded-3xl shadow-2xl overflow-hidden">
                <div className="relative aspect-video bg-[#e5eaf5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.previewImage}
                    alt=""
                    aria-hidden
                    className="w-full h-full object-cover"
                  />
                  {course.previewVideoUrl && (
                    <PreviewVideoButton
                      videoUrl={course.previewVideoUrl}
                      title={course.title}
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-5">
                    <div className="text-xs text-[#010514]/60 mb-1">
                      قیمت دوره
                    </div>
                    {course.isFree ? (
                      <div className="text-3xl font-bold text-green-700">رایگان</div>
                    ) : course.discountPrice ? (
                      <div>
                        <div className="text-sm text-[#010514]/50 line-through">
                          {formatToman(course.price)}
                        </div>
                        <div className="text-3xl font-bold text-[#1b3c8a]">
                          {formatToman(course.discountPrice)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-[#1b3c8a]">
                        {formatToman(course.price)}
                      </div>
                    )}
                  </div>
                  {course.allowPurchase ? (
                    <EnrollButton course={course} />
                  ) : (
                    <div className="text-center py-3 rounded-full bg-neutral-100 text-[#010514]/55">
                      این دوره در حال حاضر قابل خرید نیست
                    </div>
                  )}
                  <ul className="mt-6 space-y-3 text-sm text-[#010514]/75">
                    <li className="flex gap-2">
                      <span className="text-[#49bbbd]">✓</span> دسترسی مادام‌العمر
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#49bbbd]">✓</span> پشتیبانی ۲۴ ساعته
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#49bbbd]">✓</span> گواهی پایان دوره
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#49bbbd]">✓</span> به‌روزرسانی دائمی محتوا
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-[#010514] mb-4">
              درباره این دوره
            </h2>
            <p className="text-[#010514]/75 leading-[2] whitespace-pre-line">
              {course.longDesc}
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-[#010514] mb-5">
              سرفصل‌ها
            </h2>
            <div className="space-y-4">
              {chapters.map((ch) => {
                const lessons = listLessonsByChapter(ch.id);
                return (
                  <details
                    key={ch.id}
                    className="group bg-white rounded-2xl border border-[#e5eaf5] overflow-hidden"
                  >
                    <summary className="cursor-pointer list-none flex items-center justify-between p-5 hover:bg-[#f7fafd] transition">
                      <div>
                        <span className="font-bold text-[#010514]">
                          {ch.title}
                        </span>
                        <span className="text-xs text-[#010514]/55 mr-3">
                          ({faDigits(lessons.length)} درس)
                        </span>
                      </div>
                      <span className="text-[#1b3c8a] text-sm group-open:rotate-180 transition">
                        ▼
                      </span>
                    </summary>
                    <ul className="px-5 pb-5 space-y-2 text-sm text-[#010514]/75">
                      {lessons.map((l, j) => (
                        <li
                          key={l.id}
                          className="flex items-center gap-3 py-2 border-t border-[#eef2f7]"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#eef4ff] text-[#1b3c8a] text-xs font-bold flex items-center justify-center">
                            {faDigits(j + 1)}
                          </span>
                          <span className="flex-1">{l.title}</span>
                          {l.freePreview && (
                            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                              پیش‌نمایش رایگان
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                );
              })}
            </div>
          </section>

          <CourseReviewsSection
            courseSlug={slug}
            canReview={canReview}
            authenticated={!!session}
          />
        </div>

        <aside className="lg:col-span-1 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#e5eaf5]">
              <h3 className="font-bold text-[#010514] mb-4">اشتراک‌گذاری</h3>
              <ShareButtons title={course.title} path={`/courses/${slug}`} />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#e5eaf5]">
              <h3 className="font-bold text-[#010514] mb-4">سوال دارید؟</h3>
              <p className="text-sm text-[#010514]/70 mb-5 leading-relaxed">
                برای مشاوره رایگان و اطلاعات بیشتر درباره‌ی این دوره، با ما در
                تماس باشید.
              </p>
              <Link
                href="/contact"
                className="w-full block text-center py-3 rounded-full border-2 border-[#1b3c8a] text-[#1b3c8a] font-bold hover:bg-[#1b3c8a] hover:text-white transition"
              >
                تماس با پشتیبانی
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <RelatedCourses currentSlug={slug} categoryId={course.categoryId} />
    </div>
  );
}
