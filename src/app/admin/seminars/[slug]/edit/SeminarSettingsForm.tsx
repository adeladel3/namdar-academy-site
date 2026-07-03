"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
  Toggle,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { toEnglishDigits } from "@/lib/formatting";
import { resolveUploadUrl } from "@/lib/upload-url";
import type { SeminarRecord } from "@/lib/db";

/**
 * فیلد URL با دکمه‌ی آپلود مستقیم.
 *
 * فایل را از همین فرم به /api/admin/media/upload می‌فرستد، آدرس فایل ذخیره‌شده
 * را در همان فیلد URL پر می‌کند و یک پیش‌نمایش کوچک کنار فیلد می‌گذارد تا
 * مدیر مطمئن باشد چه چیزی آپلود شده. پارامتر `kind` صرفاً برای محدود کردن
 * picker در input[type=file] است؛ بک‌اند MIME را خودش با isAllowedMime
 * اعتبارسنجی می‌کند.
 */
function MediaUploadField({
  label,
  hint,
  helper,
  value,
  onChange,
  kind,
}: {
  label: string;
  /** Inline hint shown by Field component itself. */
  hint?: string;
  /** Longer prose under the input — used to explain *where* on the public
   *  page this asset shows up. */
  helper: string;
  value: string;
  onChange: (next: string) => void;
  kind: "image" | "video";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "آپلود ناموفق بود");
      onChange(data.url);
      toast("فایل آپلود و آدرسش در فیلد گذاشته شد", "ok");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطای ناشناخته";
      toast(msg, "err");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const accept = kind === "image" ? "image/*" : "video/*";

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        <div className="flex items-stretch gap-2">
          <div className="flex-1 min-w-0">
            <Input
              dir="ltr"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/uploads/..."
            />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 rounded-xl bg-[#1b3c8a] text-white text-[12.5px] font-bold hover:opacity-95 disabled:opacity-60 transition"
          >
            {uploading ? (
              <span>در حال آپلود...</span>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                آپلود فایل
              </>
            )}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="shrink-0 inline-flex items-center justify-center w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
              aria-label="پاک کردن"
              title="پاک کردن"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* پیش‌نمایش کوچک تا مدیر مطمئن بشه فایل درست رو در فیلد درست گذاشته */}
        {value && (
          <div className="rounded-xl bg-[#f4f7fc] border border-[#e5eaf5] overflow-hidden">
            {kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveUploadUrl(value)}
                alt=""
                className="w-full max-h-[160px] object-contain bg-[#0e1a3d]/5"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <video
                src={resolveUploadUrl(value)}
                controls
                preload="metadata"
                className="w-full max-h-[160px] bg-black"
              />
            )}
          </div>
        )}

        <p className="text-[11.5px] text-[#0e1a3d]/65 leading-6">
          {helper}
        </p>
      </div>
    </Field>
  );
}

type Form = {
  title: string;
  shortTitle: string;
  shortDesc: string;
  longDesc: string;
  status: SeminarRecord["status"];
  price: string;
  discountPrice: string;
  allowPurchase: boolean;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  capacity: string;
  showCapacityCounter: boolean;
  heroImage: string;
  heroVideoUrl: string;
  instructorName: string;
  instructorBio: string;
  instructorImage: string;
  instructorTagline: string;
  instructorStatsRaw: string;
  supportPhone: string;
  supportTelegram: string;
  heroEyebrow: string;
  heroSubtitle: string;
  heroPromise: string;
  painPointsTitle: string;
  painPointsRaw: string;
  beforeAfterTitle: string;
  beforeAfterRaw: string;
  finalCtaTitle: string;
  finalCtaDescription: string;
  supportAdminIds: string[];
};

type StaffOption = { id: string; name: string; role: string; phone?: string };

function pick(s: SeminarRecord): Form {
  return {
    title: s.title,
    shortTitle: s.shortTitle ?? "",
    shortDesc: s.shortDesc,
    longDesc: s.longDesc ?? "",
    status: s.status,
    price: String(s.price),
    discountPrice: s.discountPrice ? String(s.discountPrice) : "",
    allowPurchase: s.allowPurchase,
    eventDate: s.eventDate ?? "",
    venueName: s.venueName ?? "",
    venueAddress: s.venueAddress ?? "",
    venueMapUrl: s.venueMapUrl ?? "",
    capacity: s.capacity ? String(s.capacity) : "",
    showCapacityCounter: s.showCapacityCounter,
    heroImage: s.heroImage ?? "",
    heroVideoUrl: s.heroVideoUrl ?? "",
    instructorName: s.instructorName ?? "",
    instructorBio: s.instructorBio ?? "",
    instructorImage: s.instructorImage ?? "",
    instructorTagline: s.instructorTagline ?? "",
    instructorStatsRaw: (s.instructorStats ?? []).join("\n"),
    supportPhone: s.supportPhone ?? "",
    supportTelegram: s.supportTelegram ?? "",
    heroEyebrow: s.heroEyebrow ?? "",
    heroSubtitle: s.heroSubtitle ?? "",
    heroPromise: s.heroPromise ?? "",
    painPointsTitle: s.painPointsTitle ?? "",
    painPointsRaw: (s.painPoints ?? []).join("\n"),
    beforeAfterTitle: s.beforeAfterTitle ?? "",
    beforeAfterRaw: (s.beforeAfter ?? [])
      .map((r) => `${r.before} | ${r.after}`)
      .join("\n"),
    finalCtaTitle: s.finalCtaTitle ?? "",
    finalCtaDescription: s.finalCtaDescription ?? "",
    supportAdminIds: s.supportAdminIds ?? [],
  };
}

function parseLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBeforeAfterRows(raw: string): { before: string; after: string }[] {
  return parseLines(raw)
    .map((line) => {
      const [before, after] = line.split("|").map((p) => p.trim());
      if (!before || !after) return null;
      return { before, after };
    })
    .filter((r): r is { before: string; after: string } => !!r);
}

export default function SeminarSettingsForm({
  seminar,
  staff = [],
}: {
  seminar: SeminarRecord;
  staff?: StaffOption[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [form, setForm] = useState<Form>(pick(seminar));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [supporterQuery, setSupporterQuery] = useState("");

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const priceNum = Number(toEnglishDigits(form.price).replace(/[^\d]/g, ""));
      const discountNum = form.discountPrice
        ? Number(toEnglishDigits(form.discountPrice).replace(/[^\d]/g, ""))
        : undefined;
      const capacityNum = form.capacity
        ? Number(toEnglishDigits(form.capacity).replace(/[^\d]/g, ""))
        : undefined;

      const res = await fetch(
        `/api/admin/seminars/${encodeURIComponent(seminar.slug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            shortTitle: form.shortTitle.trim() || undefined,
            shortDesc: form.shortDesc.trim(),
            longDesc: form.longDesc,
            status: form.status,
            price: priceNum,
            discountPrice: discountNum,
            allowPurchase: form.allowPurchase,
            eventDate: form.eventDate || undefined,
            venueName: form.venueName.trim() || undefined,
            venueAddress: form.venueAddress.trim() || undefined,
            venueMapUrl: form.venueMapUrl.trim() || undefined,
            capacity: capacityNum,
            showCapacityCounter: form.showCapacityCounter,
            heroImage: form.heroImage.trim() || undefined,
            heroVideoUrl: form.heroVideoUrl.trim() || undefined,
            instructorName: form.instructorName.trim() || undefined,
            instructorBio: form.instructorBio.trim() || undefined,
            instructorImage: form.instructorImage.trim() || undefined,
            instructorTagline: form.instructorTagline.trim() || undefined,
            instructorStats: parseLines(form.instructorStatsRaw),
            supportPhone: form.supportPhone.trim() || undefined,
            supportTelegram: form.supportTelegram.trim() || undefined,
            heroEyebrow: form.heroEyebrow.trim() || undefined,
            heroSubtitle: form.heroSubtitle.trim() || undefined,
            heroPromise: form.heroPromise.trim() || undefined,
            painPointsTitle: form.painPointsTitle.trim() || undefined,
            painPoints: parseLines(form.painPointsRaw),
            beforeAfterTitle: form.beforeAfterTitle.trim() || undefined,
            beforeAfter: parseBeforeAfterRows(form.beforeAfterRaw),
            finalCtaTitle: form.finalCtaTitle.trim() || undefined,
            finalCtaDescription: form.finalCtaDescription.trim() || undefined,
            supportAdminIds: form.supportAdminIds,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره‌ی تنظیمات");
      toast("تنظیمات سمینار ذخیره شد", "ok");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطای ناشناخته";
      toast(msg, "err");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "حذف سمینار",
      message:
        "آیا از حذف این سمینار مطمئنید؟ ثبت‌نام‌های ثبت‌شده‌ی قبلی حفظ می‌شوند ولی صفحه‌ی لندینگ و محتوای آن از دسترس خارج می‌شود.",
      confirmText: "حذف کنم",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/seminars/${encodeURIComponent(seminar.slug)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در حذف");
      toast("سمینار حذف شد", "ok");
      router.push("/admin/seminars");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطای ناشناخته";
      toast(msg, "err");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {dialog}

      <Card>
        <CardHeader title="اطلاعات پایه" subtitle="عنوان، توضیح، وضعیت انتشار" />
        <div className="p-6 grid md:grid-cols-2 gap-5">
          <Field label="عنوان سمینار" required>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="عنوان کوتاه" hint="در کارت‌های لیست استفاده می‌شود">
            <Input
              value={form.shortTitle}
              onChange={(e) => set("shortTitle", e.target.value)}
            />
          </Field>
          <Field label="توضیح کوتاه" required>
            <Textarea
              rows={3}
              value={form.shortDesc}
              onChange={(e) => set("shortDesc", e.target.value)}
            />
          </Field>
          <Field label="توضیح بلند" hint="می‌توانید HTML بنویسید">
            <Textarea
              rows={6}
              value={form.longDesc}
              onChange={(e) => set("longDesc", e.target.value)}
            />
          </Field>
          <Field label="وضعیت">
            <Select
              value={form.status}
              onChange={(e) => set("status", e.target.value as Form["status"])}
            >
              <option value="draft">پیش‌نویس</option>
              <option value="published">منتشر شده</option>
              <option value="archived">آرشیو</option>
            </Select>
          </Field>
          <div className="flex items-center">
            <Toggle
              checked={form.allowPurchase}
              onChange={(v) => set("allowPurchase", v)}
              label="فروش فعال است؟"
              description="اگر خاموش باشد دکمه‌ی رزرو در صفحه‌ی لندینگ غیرفعال می‌شود."
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="قیمت و ظرفیت" />
        <div className="p-6 grid md:grid-cols-2 gap-5">
          <Field label="قیمت اصلی (تومان)" required>
            <Input
              dir="ltr"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </Field>
          <Field label="قیمت با تخفیف (اختیاری)">
            <Input
              dir="ltr"
              inputMode="numeric"
              value={form.discountPrice}
              onChange={(e) => set("discountPrice", e.target.value)}
            />
          </Field>
          <Field label="ظرفیت کل صندلی‌ها">
            <Input
              dir="ltr"
              inputMode="numeric"
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
            />
          </Field>
          <div className="flex items-center">
            <Toggle
              checked={form.showCapacityCounter}
              onChange={(v) => set("showCapacityCounter", v)}
              label="شمارنده‌ی ظرفیت در صفحه نمایش داده شود؟"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="تاریخ و مکان برگزاری" />
        <div className="p-6 grid md:grid-cols-2 gap-5">
          <Field label="تاریخ و ساعت (ISO)" hint="مثال: 2026-06-11T18:00:00+03:30">
            <Input
              dir="ltr"
              value={form.eventDate}
              onChange={(e) => set("eventDate", e.target.value)}
            />
          </Field>
          <Field label="نام مکان">
            <Input
              value={form.venueName}
              onChange={(e) => set("venueName", e.target.value)}
            />
          </Field>
          <Field label="آدرس کامل">
            <Textarea
              rows={2}
              value={form.venueAddress}
              onChange={(e) => set("venueAddress", e.target.value)}
            />
          </Field>
          <Field label="لینک نقشه (Google / Neshan)">
            <Input
              dir="ltr"
              value={form.venueMapUrl}
              onChange={(e) => set("venueMapUrl", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="هیرو لندینگ"
          subtitle="عنوان‌ها و متن‌های بالای صفحه — درست بالای ویدیو"
        />
        <div className="p-6 grid md:grid-cols-2 gap-5">
          <Field label="خط بالای عنوان (eyebrow)">
            <Input
              value={form.heroEyebrow}
              onChange={(e) => set("heroEyebrow", e.target.value)}
            />
          </Field>
          <Field label="زیرعنوان معرفی">
            <Input
              value={form.heroSubtitle}
              onChange={(e) => set("heroSubtitle", e.target.value)}
            />
          </Field>
          <Field label="پاراگراف معرفی (متن وعده)">
            <Textarea
              rows={3}
              value={form.heroPromise}
              onChange={(e) => set("heroPromise", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="سؤالات pain point"
          subtitle="بخش «اگر حداقل دو پاسخ مهمه…» — هر سؤال در یک خط"
        />
        <div className="p-6 space-y-5">
          <Field label="عنوان بخش">
            <Input
              value={form.painPointsTitle}
              onChange={(e) => set("painPointsTitle", e.target.value)}
            />
          </Field>
          <Field
            label="فهرست سؤالات (هر خط یک سؤال)"
            hint="پیشنهاد ۶ سؤال — مثل PDF"
          >
            <Textarea
              rows={7}
              value={form.painPointsRaw}
              onChange={(e) => set("painPointsRaw", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="بخش قبل / بعد"
          subtitle="هر ردیف به شکل: قبل | بعد"
        />
        <div className="p-6 space-y-5">
          <Field label="عنوان بخش">
            <Input
              value={form.beforeAfterTitle}
              onChange={(e) => set("beforeAfterTitle", e.target.value)}
            />
          </Field>
          <Field
            label="ردیف‌های مقایسه"
            hint="هر خط: متن قبل | متن بعد — جداکننده‌ی | (پایپ) لازم است"
          >
            <Textarea
              rows={5}
              dir="rtl"
              value={form.beforeAfterRaw}
              onChange={(e) => set("beforeAfterRaw", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="CTA نهایی"
          subtitle="بخش پایان صفحه — قبل از دکمه‌ی رزرو"
        />
        <div className="p-6 grid md:grid-cols-2 gap-5">
          <Field label="عنوان">
            <Input
              value={form.finalCtaTitle}
              onChange={(e) => set("finalCtaTitle", e.target.value)}
            />
          </Field>
          <Field label="توضیح کوتاه">
            <Textarea
              rows={3}
              value={form.finalCtaDescription}
              onChange={(e) => set("finalCtaDescription", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="رسانه‌های صفحه‌ی لندینگ"
          subtitle="هر فایل را مستقیم از همین‌جا آپلود کنید. زیر هر فیلد توضیح داده شده دقیقاً کجای صفحه ظاهر می‌شود تا اشتباه آپلود نشود."
        />

        <div className="px-6 pt-5">
          <div className="rounded-2xl bg-[#fff8e1] border border-[#f0d989] px-4 py-3 text-[12.5px] text-[#6b4f0a] leading-7">
            هر فایل را در فیلد مخصوص خودش بگذارید — جابه‌جا آپلود کردن باعث می‌شود
            کاربر در صفحه‌ی عمومی، عکس مدرس را در جای ویدیو ببیند یا برعکس.
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <MediaUploadField
            label="① عکس پس‌زمینه‌ی ویدیو (تصویر هیرو)"
            kind="image"
            value={form.heroImage}
            onChange={(v) => set("heroImage", v)}
            helper={
              "این عکس، پشت دکمه‌ی پلی در بالای صفحه‌ی عمومی سمینار (همان کادر مشکی بزرگ بعد از تیتر) نمایش داده می‌شود — تا وقتی بازدیدکننده روی پلی نزده است. کادر افقی است (16:9 پیشنهاد می‌شود)."
            }
          />

          <MediaUploadField
            label="② ویدیوی معرفی سمینار (پشت پلی)"
            kind="video"
            value={form.heroVideoUrl}
            onChange={(v) => set("heroVideoUrl", v)}
            helper={
              "این ویدیو وقتی پخش می‌شود که بازدیدکننده‌ی صفحه‌ی عمومی سمینار روی دکمه‌ی پلی همان کادر بالا کلیک کند. فرمت‌های mp4 / webm / mov پشتیبانی می‌شوند."
            }
          />

          <Field label="③ نام مدرس" hint="در بخش «معرفی مدرس» داخل لندینگ چاپ می‌شود">
            <Input
              value={form.instructorName}
              onChange={(e) => set("instructorName", e.target.value)}
            />
          </Field>

          <MediaUploadField
            label="④ عکس مدرس (پرتره)"
            kind="image"
            value={form.instructorImage}
            onChange={(v) => set("instructorImage", v)}
            helper={
              "این عکس در بخش «معرفی مدرس» در میانه‌ی صفحه‌ی عمومی سمینار کنار نام، شعار و آمار مدرس نمایش داده می‌شود. حالت مربعی یا پرتره (نسبت ۱:۱ یا ۴:۵) بهترین نتیجه را می‌دهد."
            }
          />

          <Field label="⑤ معرفی کوتاه مدرس" hint="چند جمله — زیر نام مدرس در همان بخش">
            <Textarea
              rows={3}
              value={form.instructorBio}
              onChange={(e) => set("instructorBio", e.target.value)}
            />
          </Field>

          <Field
            label="⑥ شعار مدرس (نقل قول)"
            hint="مثلاً: هدف من انتقال اطلاعات نیست…"
          >
            <Textarea
              rows={2}
              value={form.instructorTagline}
              onChange={(e) => set("instructorTagline", e.target.value)}
            />
          </Field>

          <Field
            label="⑦ آمار مدرس (هر خط یک مورد)"
            hint="مثلاً: بیش از ۱ میلیون دانش‌پذیر…"
          >
            <Textarea
              rows={4}
              value={form.instructorStatsRaw}
              onChange={(e) => set("instructorStatsRaw", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="پشتیبان‌های این سمینار"
          subtitle="هر کاربر فعال می‌تواند پشتیبان این سمینار شود"
        />
        <div className="p-6 space-y-4">
          <p className="text-[12.5px] text-[#010514]/60 leading-7">
            کاربرانی که اینجا انتخاب می‌کنید، تیکت‌های مربوط به این سمینار را در
            پنل ادمین خودشان می‌بینند و وقتی یک کاربر این سمینار را در تیکت
            انتخاب کند، تیکت اتوماتیک به نفر اول لیست ارجاع می‌شود. مجوز ورود به
            پنل و پاسخ به تیکت‌ها به‌طور خودکار اعطا می‌شود.
          </p>
          {staff.length === 0 ? (
            <div className="text-[12.5px] text-[#010514]/60">
              هیچ کاربر فعالی در سیستم ثبت نشده است.
            </div>
          ) : (
            <>
              {form.supportAdminIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.supportAdminIds.map((id, idx) => {
                    const s = staff.find((x) => x.id === id);
                    const label = s?.name ?? "(کاربر حذف‌شده)";
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b3c8a] text-white text-[12.5px] font-bold"
                      >
                        {idx === 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                            ارجاع پیش‌فرض
                          </span>
                        )}
                        {label}
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "supportAdminIds",
                              form.supportAdminIds.filter((x) => x !== id),
                            )
                          }
                          className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center"
                          aria-label="حذف"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 6l12 12M18 6l-12 12" />
                          </svg>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
              <Input
                placeholder="جست‌وجو با نام یا شماره موبایل…"
                value={supporterQuery}
                onChange={(e) => setSupporterQuery(e.target.value)}
              />
              <div className="max-h-80 overflow-y-auto rounded-xl border border-[#e3e9f4] divide-y divide-[#eef2f8]">
                {(() => {
                  const q = supporterQuery.trim().toLowerCase();
                  const filtered = q
                    ? staff.filter(
                        (s) =>
                          s.name.toLowerCase().includes(q) ||
                          (s.phone ?? "").includes(q),
                      )
                    : staff.slice(0, 30);
                  if (filtered.length === 0) {
                    return (
                      <div className="p-4 text-[12.5px] text-[#010514]/55 text-center">
                        کاربری یافت نشد.
                      </div>
                    );
                  }
                  const ROLE_LABEL: Record<string, string> = {
                    admin: "ادمین",
                    support: "پشتیبان",
                    instructor: "منتور",
                    sales_agent: "کارشناس فروش",
                    student: "دانش‌پذیر",
                  };
                  return filtered.map((s) => {
                    const active = form.supportAdminIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() =>
                          set(
                            "supportAdminIds",
                            active
                              ? form.supportAdminIds.filter(
                                  (id) => id !== s.id,
                                )
                              : [...form.supportAdminIds, s.id],
                          )
                        }
                        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-right transition ${
                          active
                            ? "bg-[#eaf1fc]"
                            : "bg-white hover:bg-[#f7fafd]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                              active
                                ? "bg-[#1b3c8a] border-[#1b3c8a]"
                                : "bg-white border-[#cbd5e6]"
                            }`}
                          >
                            {active && (
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-[#010514] truncate">
                              {s.name}
                            </div>
                            {s.phone && (
                              <div
                                className="text-[11px] font-mono text-[#010514]/55"
                                dir="ltr"
                              >
                                {s.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                            s.role === "admin"
                              ? "bg-[#1b3c8a]/10 text-[#1b3c8a]"
                              : "bg-[#f4f7fc] text-[#010514]/60"
                          }`}
                        >
                          {ROLE_LABEL[s.role] ?? s.role}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
              {!supporterQuery.trim() && staff.length > 30 && (
                <div className="text-[11.5px] text-[#010514]/50 text-center">
                  {staff.length - 30} کاربر دیگر — برای دیدن، نام یا شماره را
                  جست‌وجو کنید.
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="تماس برای پشتیبانی" subtitle="برای نمایش در پنل خریداران" />
        <div className="p-6 grid md:grid-cols-2 gap-5">
          <Field label="تلفن پشتیبانی">
            <Input
              dir="ltr"
              value={form.supportPhone}
              onChange={(e) => set("supportPhone", e.target.value)}
            />
          </Field>
          <Field label="آیدی تلگرام پشتیبانی">
            <Input
              dir="ltr"
              value={form.supportTelegram}
              onChange={(e) => set("supportTelegram", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-[#eef2f7]">
        <Button variant="danger" onClick={remove} disabled={deleting || saving}>
          {deleting ? "در حال حذف..." : "حذف سمینار"}
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setForm(pick(seminar))}
            disabled={saving || deleting}
          >
            بازنشانی
          </Button>
          <Button onClick={save} disabled={saving || deleting}>
            {saving ? "در حال ذخیره..." : "ذخیره‌ی تنظیمات"}
          </Button>
        </div>
      </div>
    </div>
  );
}
