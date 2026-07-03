import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getSeminar } from "@/lib/db";
import { formatToman } from "@/lib/formatting";
import SeminarTabs from "./SeminarTabs";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "پیش‌نویس",
  published: "منتشر شده",
  archived: "آرشیو",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  archived: "bg-slate-100 text-slate-600 border border-slate-200",
};

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function SeminarAdminLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  // برخی مرورگرها مسیر فارسی را encode می‌فرستند و برخی نمی‌فرستند؛ هر دو
  // شکل را بپذیریم تا کاربر در ادمین به notFound نخورد.
  const seminar = getSeminar(slug) ?? getSeminar(rawSlug);
  if (!seminar) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[#010514]/60 flex gap-2">
        <Link href="/admin/seminars" className="hover:text-[#1b3c8a]">
          سمینارها
        </Link>
        <span>/</span>
        <span className="text-[#010514] truncate">{seminar.title}</span>
      </nav>

      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-6 flex items-start gap-5 flex-wrap">
        {seminar.heroImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={seminar.heroImage}
            alt={seminar.title}
            className="w-32 h-20 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-32 h-20 rounded-xl bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] shrink-0 flex items-center justify-center text-white font-extrabold">
            سمینار
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                STATUS_COLORS[seminar.status] ?? STATUS_COLORS.draft
              }`}
            >
              {STATUS_LABELS[seminar.status] ?? seminar.status}
            </span>
            <span className="text-xs text-[#010514]/50 font-mono" dir="ltr">
              /seminars/{seminar.slug}
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-[#010514] truncate">
            {seminar.title}
          </h1>
          <p className="text-xs text-[#010514]/55 mt-1 line-clamp-1">
            {seminar.shortDesc}
          </p>
        </div>
        <div className="text-left">
          <div className="text-[11px] text-[#010514]/55">قیمت ثبت‌نام</div>
          <div className="text-lg font-bold text-[#1b3c8a]">
            {formatToman(seminar.discountPrice ?? seminar.price)}
          </div>
        </div>
      </div>

      <SeminarTabs slug={slug} />

      <div>{children}</div>
    </div>
  );
}
