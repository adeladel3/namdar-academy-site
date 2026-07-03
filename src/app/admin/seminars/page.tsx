import Link from "@/components/SafeLink";
import { listSeminarRegistrationsBySeminar, listSeminars } from "@/lib/db";
import { Card, CardHeader, Empty, LinkButton } from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import {
  faDigits,
  formatRelative,
  formatToman,
} from "@/lib/formatting";

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

export default function AdminSeminarsPage() {
  const seminars = listSeminars();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            مدیریت سمینارهای حضوری
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            ایجاد و مدیریت سمینارها، محتوای لندینگ و پنل خریداران
          </p>
        </div>
        <LinkButton href="/admin/seminars/new" variant="primary">
          <Icon.Plus width={16} height={16} />
          سمینار جدید
        </LinkButton>
      </div>

      {seminars.length === 0 ? (
        <Empty
          title="هنوز سمیناری ساخته نشده"
          description="اولین سمینار حضوری خود را با کلیک روی دکمه‌ی بالا بسازید."
        />
      ) : (
        <Card>
          <CardHeader title="فهرست سمینارها" subtitle={`${faDigits(seminars.length)} سمینار`} />
          <ul className="divide-y divide-[#eef2f7]">
            {seminars.map((s) => {
              const registrations = listSeminarRegistrationsBySeminar(s.slug);
              return (
                <li key={s.slug} className="px-5 py-4 hover:bg-[#f7fafd] transition">
                  <Link
                    href={`/admin/seminars/${encodeURIComponent(s.slug)}`}
                    className="flex items-center gap-4"
                  >
                    {s.heroImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.heroImage}
                        alt=""
                        className="w-20 h-14 rounded-xl object-cover shrink-0 bg-[#eef4ff]"
                      />
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] shrink-0 flex items-center justify-center text-white">
                        <Icon.Ticket width={22} height={22} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            STATUS_COLORS[s.status] ?? STATUS_COLORS.draft
                          }`}
                        >
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                        {!s.allowPurchase && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            فروش غیرفعال
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-[#010514] truncate">
                        {s.title}
                      </h3>
                      <p className="text-xs text-[#010514]/55 mt-1 line-clamp-1">
                        {s.shortDesc}
                      </p>
                    </div>
                    <div className="text-left text-xs space-y-1 shrink-0 hidden sm:block">
                      <div>
                        <span className="text-[#010514]/55">قیمت: </span>
                        <span className="font-bold text-[#1b3c8a]">
                          {formatToman(s.discountPrice ?? s.price)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#010514]/55">ثبت‌نام: </span>
                        <span className="font-bold">
                          {faDigits(registrations.length)}
                          {s.capacity ? ` / ${faDigits(s.capacity)}` : ""}
                        </span>
                      </div>
                      <div className="text-[#010514]/55">
                        {formatRelative(s.updatedAt)}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
