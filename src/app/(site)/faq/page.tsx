import { listFaqs } from "@/lib/db";
import Link from "@/components/SafeLink";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "سوالات متداول — نامدار آکادمی",
};

export default function FaqPage() {
  const faqs = listFaqs({ publishedOnly: true });

  return (
    <div className="bg-[#f7fafd] min-h-screen py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-[#010514] mb-3">
            سوالات متداول
          </h1>
          <p className="text-[#010514]/60 max-w-2xl mx-auto">
            پاسخ پرتکرارترین سوال‌هایی که از ما پرسیده می‌شود.
          </p>
        </div>

        {faqs.length === 0 ? (
          <div className="p-14 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5]">
            <p className="text-[#010514]/55 mb-5">
              هنوز سوالی ثبت نشده است.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition"
            >
              از ما بپرسید
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.id}
                className="group bg-white rounded-2xl border border-[#e5eaf5] overflow-hidden"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between p-6 hover:bg-[#f7fafd] transition">
                  <span className="font-bold text-[#010514] text-lg">
                    {f.question}
                  </span>
                  <span className="text-[#1b3c8a] transition group-open:rotate-45 shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <div
                  className="px-6 pb-6 pt-0 text-[#010514]/75 leading-8"
                  dangerouslySetInnerHTML={{ __html: f.answer }}
                />
              </details>
            ))}
          </div>
        )}

        <div className="mt-12 p-6 md:p-8 bg-white rounded-3xl border border-[#e5eaf5] flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">
              سوال شما در لیست نبود؟
            </h3>
            <p className="text-sm text-[#010514]/60">
              تیم پشتیبانی ما آماده پاسخگویی است.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition whitespace-nowrap"
          >
            تماس با ما ←
          </Link>
        </div>
      </div>
    </div>
  );
}
