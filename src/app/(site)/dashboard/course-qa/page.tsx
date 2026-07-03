import Link from "@/components/SafeLink";
import { getSession } from "@/lib/auth";
import {
  getCourse,
  isEnrolled,
  listQAAccessibleCourseSlugs,
  listTicketsForUser,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "پرسش‌وپاسخ دوره‌ها — پنل کاربری",
};

export default async function CourseQADashboardPage() {
  const session = (await getSession())!;
  const accessibleSlugs = listQAAccessibleCourseSlugs(session.userId);
  const allTickets = listTicketsForUser(session.userId);

  const cards = accessibleSlugs
    .map((slug) => {
      const course = getCourse(slug);
      if (!course) return null;
      const courseTickets = allTickets.filter(
        (t) => t.relatedCourseSlug === slug
      );
      const openCount = courseTickets.filter(
        (t) => t.status !== "solved" && t.status !== "closed"
      ).length;
      const unreadCount = courseTickets.reduce(
        (s, t) => s + (t.unreadForUser || 0),
        0
      );
      return {
        slug,
        title: course.title,
        coverImage: course.previewImage,
        accessSource: isEnrolled(session.userId, slug)
          ? ("enrolled" as const)
          : ("granted" as const),
        ticketCount: courseTickets.length,
        openCount,
        unreadCount,
        latestTicketId: courseTickets[0]?.id,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-[#0e1a3d]">
          پرسش‌وپاسخ دوره‌ها
        </h1>
        <p className="text-[#0e1a3d]/60 text-[14px] mt-1.5 leading-7">
          برای هر دوره‌ای که در آن ثبت‌نام کرده‌اید، یک پنل اختصاصی برای
          پرسش و پاسخ با مدرس و تیم پشتیبانی فعال است. سوال‌های مرتبط با
          محتوای آموزشی را اینجا مطرح کنید.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[#0e1a3d]/15 bg-[#f8fafd] p-10 text-center">
          <div className="text-5xl mb-3">؟</div>
          <h2 className="font-bold text-lg text-[#0e1a3d] mb-2">
            هنوز پنل پرسش‌وپاسخی برای شما فعال نیست
          </h2>
          <p className="text-sm text-[#0e1a3d]/60 leading-7 max-w-md mx-auto">
            پس از خرید هر دوره، پنل اختصاصی پرسش‌وپاسخ آن دوره به‌صورت
            خودکار اینجا اضافه می‌شود.
          </p>
          <Link
            href="/courses"
            className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-[#1b3c8a] text-white text-sm font-bold hover:opacity-90"
          >
            مشاهده دوره‌ها
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => (
            <article
              key={c.slug}
              className="rounded-3xl border border-[#0e1a3d]/10 bg-white p-5 hover:shadow-lg transition"
            >
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#eef2f9] to-[#dbe3f2] flex items-center justify-center">
                  {c.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={c.coverImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-[#1b3c8a]/30">
                      ؟
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Yekan_Bakh:Bold',sans-serif] font-extrabold text-[#0e1a3d] text-base leading-tight">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {c.accessSource === "enrolled" ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                        ثبت‌نام شده
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        دسترسی پشتیبانی
                      </span>
                    )}
                    {c.openCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                        {c.openCount.toLocaleString("fa-IR")} باز
                      </span>
                    )}
                    {c.unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                        {c.unreadCount.toLocaleString("fa-IR")} پیام جدید
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5">
                <Link
                  href={`/dashboard/tickets/new?course=${encodeURIComponent(c.slug)}`}
                  className="flex-1 text-center px-4 py-2.5 rounded-xl bg-[#1b3c8a] text-white text-sm font-bold hover:opacity-90 transition"
                >
                  + طرح سوال جدید
                </Link>
                {c.ticketCount > 0 && (
                  <Link
                    href={
                      c.latestTicketId
                        ? `/dashboard/tickets/${c.latestTicketId}`
                        : "/dashboard/tickets"
                    }
                    className="px-4 py-2.5 rounded-xl border border-[#0e1a3d]/15 text-[#0e1a3d] text-sm font-bold hover:bg-[#f8fafd] transition"
                  >
                    سوال‌های قبلی ({c.ticketCount.toLocaleString("fa-IR")})
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
