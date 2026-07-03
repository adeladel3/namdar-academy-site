import Link from "@/components/SafeLink";
import { listCourses } from "@/lib/db";
import { courseDetailHref } from "@/lib/course-links";
import { LEVEL_LABELS, faDigits, formatToman } from "@/lib/formatting";

export default function RelatedCourses({
  currentSlug,
  categoryId,
}: {
  currentSlug: string;
  categoryId?: string;
}) {
  const all = listCourses({ status: "published" }).filter(
    (c) => c.slug !== currentSlug
  );
  // Prefer same category; if fewer than 3, fill with latest others.
  const sameCategory = categoryId
    ? all.filter((c) => c.categoryId === categoryId)
    : [];
  const picked = [...sameCategory];
  for (const c of all) {
    if (picked.length >= 3) break;
    if (!picked.find((p) => p.slug === c.slug)) picked.push(c);
  }
  const related = picked.slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-[#010514] mb-6">
        دوره‌های پیشنهادی
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {related.map((c) => (
          <Link
            key={c.slug}
            href={courseDetailHref(c.slug)}
            className="group bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl hover:-translate-y-1 transition border border-[#e5eaf5]"
          >
            <div className="relative aspect-video bg-gradient-to-br from-[#136cb5] to-[#49bbbd] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.previewImage}
                alt=""
                aria-hidden
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs">
                {LEVEL_LABELS[c.level]}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-[#010514] mb-2 line-clamp-1 group-hover:text-[#136cb5] transition">
                {c.title}
              </h3>
              <p className="text-sm text-[#010514]/60 line-clamp-2 mb-4 min-h-[2.5rem]">
                {c.shortDesc}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#e5eaf5]">
                <div className="text-[#1b3c8a] font-bold">
                  {c.isFree
                    ? "رایگان"
                    : formatToman(c.discountPrice ?? c.price)}
                </div>
                <span className="text-xs text-[#010514]/55">
                  {faDigits(c.studentsCount)} دانش‌پذیر
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
