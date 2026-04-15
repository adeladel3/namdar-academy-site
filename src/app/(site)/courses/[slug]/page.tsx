import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES, findCourse, formatToman } from "@/data/courses";
import EnrollButton from "./EnrollButton";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = findCourse(slug);
  if (!course) notFound();

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
                  سطح {course.level}
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

              <div className="flex flex-wrap gap-6 mt-8 text-sm">
                <div>
                  <div className="text-white/60">مدرس</div>
                  <div className="font-bold mt-1">{course.instructor}</div>
                </div>
                <div>
                  <div className="text-white/60">مدت دوره</div>
                  <div className="font-bold mt-1">{course.duration}</div>
                </div>
                <div>
                  <div className="text-white/60">تعداد درس</div>
                  <div className="font-bold mt-1">
                    {course.lessons.toLocaleString("fa-IR")}
                  </div>
                </div>
                <div>
                  <div className="text-white/60">دانش‌پذیران</div>
                  <div className="font-bold mt-1">
                    {course.students.toLocaleString("fa-IR")}
                  </div>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-white text-[#010514] rounded-3xl shadow-2xl overflow-hidden">
                <div className="relative aspect-video bg-[#e5eaf5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-5">
                    <div className="text-xs text-[#010514]/60 mb-1">
                      قیمت دوره
                    </div>
                    <div className="text-3xl font-bold text-[#1b3c8a]">
                      {formatToman(course.price)}
                    </div>
                  </div>
                  <EnrollButton course={course} />
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
              {course.chapters.map((ch, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-2xl border border-[#e5eaf5] overflow-hidden"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between p-5 hover:bg-[#f7fafd] transition">
                    <span className="font-bold text-[#010514]">
                      {ch.title}
                    </span>
                    <span className="text-[#1b3c8a] text-sm group-open:rotate-180 transition">
                      ▼
                    </span>
                  </summary>
                  <ul className="px-5 pb-5 space-y-2 text-sm text-[#010514]/75">
                    {ch.lessons.map((l, j) => (
                      <li key={j} className="flex items-center gap-3 py-2 border-t border-[#eef2f7]">
                        <span className="w-6 h-6 rounded-full bg-[#eef4ff] text-[#1b3c8a] text-xs font-bold flex items-center justify-center">
                          {(j + 1).toLocaleString("fa-IR")}
                        </span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl p-6 border border-[#e5eaf5]">
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
        </aside>
      </div>
    </div>
  );
}
