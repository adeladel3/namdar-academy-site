import Link from "@/components/SafeLink";
import { getSession } from "@/lib/auth";
import {
  getCourse,
  listOrdersByUser,
  listQAAccessibleCourseSlugs,
} from "@/lib/db";
import { formatDate, formatToman } from "@/lib/formatting";
import NewTicketForm from "./NewTicketForm";

export const dynamic = "force-dynamic";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const session = (await getSession())!;
  const sp = await searchParams;
  // دوره‌هایی که کاربر یا enrolled است یا ادمین فقط دسترسی Q&A به او داده.
  const accessibleSlugs = listQAAccessibleCourseSlugs(session.userId);
  const courses = accessibleSlugs
    .map((slug) => getCourse(slug))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map((c) => ({ slug: c.slug, title: c.title }));

  // اگر از طریق دکمه «سوال جدید» در یکی از کارت‌های پرسش‌وپاسخ آمده،
  // دوره‌اش پیش‌انتخاب می‌شود.
  const preselect =
    sp.course && accessibleSlugs.includes(sp.course) ? sp.course : undefined;

  const orders = listOrdersByUser(session.userId)
    .slice(0, 20)
    .map((o) => {
      const c = getCourse(o.courseSlug);
      const title = c?.title ?? o.courseSlug;
      return {
        id: o.id,
        label: `${title} — ${formatToman(o.finalAmount)} (${formatDate(o.createdAt)})`,
      };
    });

  return (
    <div className="max-w-[860px] mx-auto">
      <div className="mb-6 md:mb-8">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0e1a3d]/65 hover:text-[#1b3c8a] transition mb-3"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          بازگشت به تیکت‌ها
        </Link>
        <h1 className="text-2xl md:text-3xl font-black text-[#0e1a3d]">
          ثبت تیکت جدید
        </h1>
        <p className="text-[#0e1a3d]/60 text-[14px] mt-1.5 leading-7">
          موضوع خود را به‌دقت توضیح دهید تا تیم پشتیبانی بتواند سریع‌تر پاسخ دهد.
        </p>
      </div>

      <NewTicketForm
        courses={courses}
        orders={orders}
        preselectCourseSlug={preselect}
      />
    </div>
  );
}
