"use client";

import SettingsForm from "../SettingsForm";
import { Field, Input, Textarea } from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";

const TRADING_RESULT_DEFAULTS = [
  "+۳۸٪ بازدهی سه‌ماهه",
  "۲ پیپ میانگین استاپ",
  "+۲۰۰ ریوارد ماهانه",
  "۶ ماه + پیوسته در سود",
];

const FUNDING_RESULT_DEFAULTS = [
  "+$۱۰۰٬۰۰۰ سرمایه دریافتی",
  "۲ Phase تأیید‌شده",
  "صندوق نامدار $۵۰K",
  "Pass در ۴ هفته",
];

const tradingResultFields = TRADING_RESULT_DEFAULTS.flatMap((d, i) => {
  const n = i + 1;
  return [
    {
      key: `tradingResult${n}Image`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field
          label={`نتیجه معاملاتی ${n} — تصویر`}
          hint="نسبت پیشنهادی ۹:۱۶ (اسکرین‌شات حساب/چارت)."
        >
          <MediaPicker
            kind="image"
            recommended={{
              width: 1080,
              height: 1920,
              aspectRatio: "9:16",
              maxSizeKB: 600,
              formats: ["JPG", "PNG", "WebP"],
              description:
                "اسکرین‌شات عمودی از حساب یا چارت فارغ‌التحصیل — در گالری نتایج معاملاتی نمایش داده می‌شود.",
            }}
            value={String(v ?? "")}
            onChange={(url) => set(url)}
          />
        </Field>
      ),
    },
    {
      key: `tradingResult${n}Caption`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field label={`نتیجه معاملاتی ${n} — کپشن`}>
          <Input
            value={String(v ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={d}
          />
        </Field>
      ),
    },
  ];
});

const fundingResultFields = FUNDING_RESULT_DEFAULTS.flatMap((d, i) => {
  const n = i + 1;
  return [
    {
      key: `fundingResult${n}Image`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field
          label={`نتیجه جذب سرمایه ${n} — تصویر`}
          hint="نسبت پیشنهادی ۹:۱۶ (گواهی Funded / صندوق)."
        >
          <MediaPicker
            kind="image"
            recommended={{
              width: 1080,
              height: 1920,
              aspectRatio: "9:16",
              maxSizeKB: 600,
              formats: ["JPG", "PNG", "WebP"],
              description:
                "تصویر گواهی Funded یا صندوق — در گالری نتایج جذب سرمایه نمایش داده می‌شود.",
            }}
            value={String(v ?? "")}
            onChange={(url) => set(url)}
          />
        </Field>
      ),
    },
    {
      key: `fundingResult${n}Caption`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field label={`نتیجه جذب سرمایه ${n} — کپشن`}>
          <Input
            value={String(v ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={d}
          />
        </Field>
      ),
    },
  ];
});

const VIDEO_TESTIMONIAL_DEFAULTS = [
  { name: "علیرضا میرزایی", role: "فارغ‌التحصیل دوره ۱۴۰۳" },
  { name: "مریم قاسم‌زاده", role: "تریدر حرفه‌ای فارکس" },
  { name: "محمد شریفی", role: "مدیر سرمایه — صندوق نامدار" },
  { name: "سارا رضایی", role: "تریدر فول‌تایم کریپتو" },
];

// کارت‌های «ویژگی‌های کلیدی دوره» — سمت راست بخش مزیت‌های طلایی.
const BENEFIT_DEFAULTS = [
  {
    title: "سیستم تحلیلی منسجم MON",
    body: "متدولوژی اختصاصی نامدار بر پایهٔ ICT و چهارچوبی یکپارچه برای تصمیم‌گیری.",
  },
  {
    title: "بومی‌سازی برای بازار ایران",
    body: "آموزش‌ها بر اساس تجربه معامله‌گران ایرانی و واقعیت دسترسی به بروکرها.",
  },
  {
    title: "روان‌شناسی + تصمیم‌گیری",
    body: "توجه همزمان به تحلیل تکنیکال، روان‌شناسی و فرایند تصمیم‌گیری حرفه‌ای.",
  },
];

const benefitCardFields = BENEFIT_DEFAULTS.flatMap((d, i) => {
  const n = i + 1;
  return [
    {
      key: `benefit${n}Title`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field label={`کارت ویژگی ${n} — عنوان`}>
          <Input
            value={String(v ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={d.title}
          />
        </Field>
      ),
    },
    {
      key: `benefit${n}Body`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field label={`کارت ویژگی ${n} — متن`}>
          <Textarea
            rows={2}
            value={String(v ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={d.body}
          />
        </Field>
      ),
    },
  ];
});

// شش کارت بخش «محتوای پشتیبان MON» — اطراف کره مرکزی.
const PILLAR_DEFAULTS = [
  {
    title: "منتور خصوصی MON",
    body: "ارتباط مستقیم با مهندس نام‌آور برای رفع اشکال تخصصی",
  },
  {
    title: "پشتیبان هوشمند AI",
    body: "پاسخ‌گویی هوشمند ۲۴/۷ به سوالات معامله‌گری",
  },
  {
    title: "کانال تحلیلی ویژه",
    body: "تحلیل روزانه بازارهای فارکس و کریپتو از تیم MON",
  },
  {
    title: "کامیونیتی Discord",
    body: "تعامل ۲۴ساعته با هم‌دوره‌ای‌ها و تریدرهای فارغ‌التحصیل",
  },
  {
    title: "فایل‌های آموزشی",
    body: "جزوات، چک‌لیست، نقشه ذهنی و خلاصهٔ هر جلسه",
  },
  {
    title: "تمرین و بک‌تست هفتگی",
    body: "تمرین‌های هفته‌به‌هفته با بازخورد مستقیم منتور",
  },
];

const pillarCardFields = PILLAR_DEFAULTS.flatMap((d, i) => {
  const n = i + 1;
  return [
    {
      key: `pillar${n}Title`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field label={`کارت پشتیبانی ${n} — عنوان`}>
          <Input
            value={String(v ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={d.title}
          />
        </Field>
      ),
    },
    {
      key: `pillar${n}Body`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field label={`کارت پشتیبانی ${n} — متن`}>
          <Textarea
            rows={2}
            value={String(v ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={d.body}
          />
        </Field>
      ),
    },
  ];
});

const videoTestimonialFields = VIDEO_TESTIMONIAL_DEFAULTS.flatMap((d, i) => {
  const n = i + 1;
  return [
    {
      key: `videoTestimonial${n}Name`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field label={`نظر ویدیویی ${n} — نام`}>
          <Input
            value={String(v ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={d.name}
          />
        </Field>
      ),
    },
    {
      key: `videoTestimonial${n}Role`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field label={`نظر ویدیویی ${n} — نقش/سمت`}>
          <Input
            value={String(v ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={d.role}
          />
        </Field>
      ),
    },
    {
      key: `videoTestimonial${n}Poster`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field
          label={`نظر ویدیویی ${n} — تصویر پیش‌نمایش`}
          hint="نسبت پیشنهادی ۹:۱۶ (پرتره/Shorts)."
        >
          <MediaPicker
            kind="image"
            recommended={{
              width: 1080,
              height: 1920,
              aspectRatio: "9:16",
              maxSizeKB: 500,
              formats: ["JPG", "PNG", "WebP"],
              description:
                "پوستر عمودی ویدیو نظر فارغ‌التحصیل — فریم ابتدایی که قبل از پخش ویدیو نمایش داده می‌شود.",
            }}
            value={String(v ?? "")}
            onChange={(url) => set(url)}
          />
        </Field>
      ),
    },
    {
      key: `videoTestimonial${n}Url`,
      render: (v: unknown, set: (v: unknown) => void) => (
        <Field label={`نظر ویدیویی ${n} — فایل ویدیو`}>
          <MediaPicker
            kind="video"
            recommended={{
              maxSizeKB: 200 * 1024,
              formats: ["MP4", "WEBM"],
              description:
                "ویدیو نظر فارغ‌التحصیل به صورت عمودی (Shorts) — در بخش نظرات ویدیویی کوچینگ MON پخش می‌شود.",
            }}
            value={String(v ?? "")}
            onChange={(url) => set(url)}
          />
        </Field>
      ),
    },
  ];
});

export default function CoachingSettingsForm({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  return (
    <SettingsForm
      group="coaching"
      title="صفحه کوچینگ MON"
      description="بنر کلاس/سمینار، معرفی دوره و ویدیوی توضیحات مهندس نام‌آور در صفحه کوچینگ MON."
      initial={initial}
      fields={[
        {
          key: "bannerImageUrl",
          render: (v, set) => (
            <Field
              label="تصویر بنر کلاس / سالن سمینار"
              hint="نسبت پیشنهادی ۱۶:۵ (مثلاً ۱۶۰۰×۵۰۰ پیکسل)."
            >
              <MediaPicker
                kind="image"
                recommended={{
                  width: 1600,
                  height: 500,
                  aspectRatio: "16:5",
                  maxSizeKB: 1200,
                  formats: ["JPG", "WebP"],
                  description:
                    "بنر عریض بالای صفحه کوچینگ MON — تصویر کلاس درس یا سالن سمینار نامدار آکادمی.",
                }}
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        },
        {
          key: "bannerCaption",
          render: (v, set) => (
            <Field
              label="کپشن بنر"
              hint="متن کوتاهی که روی بنر نمایش داده می‌شود."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="کلاس درس و سالن سمینار نامدار آکادمی"
              />
            </Field>
          ),
        },
        {
          key: "introTitle",
          render: (v, set) => (
            <Field
              label="عنوان معرفی دوره"
              hint="بالای بخش متن معرفی نمایش داده می‌شود."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="معرفی دوره کوچینگ MON"
              />
            </Field>
          ),
        },
        {
          key: "introParagraph1",
          render: (v, set) => (
            <Field label="پاراگراف اول معرفی">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="دوره کوچینگ MON در نامدار آکادمی با نگاه مدرن و پیشرفته ..."
              />
            </Field>
          ),
        },
        {
          key: "introParagraph2",
          render: (v, set) => (
            <Field label="پاراگراف دوم معرفی">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="در MON متدولوژی اختصاصی نامدار به‌عنوان یکی از مهم‌ترین لایه‌های تحلیلی ..."
              />
            </Field>
          ),
        },
        {
          key: "introParagraph3",
          render: (v, set) => (
            <Field
              label="پاراگراف سوم معرفی"
              hint="اختیاری — اگر خالی بماند نمایش داده نمی‌شود."
            >
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="جمع‌بندی یا پیام پایانی معرفی دوره ..."
              />
            </Field>
          ),
        },
        {
          key: "introVideoUrl",
          render: (v, set) => (
            <Field
              label="ویدیوی توضیحات مهندس نام‌آور"
              hint="فایل mp4/webm — توضیحات اختصاصی استاد در خصوص دوره MON."
            >
              <MediaPicker
                kind="video"
                recommended={{
                  maxSizeKB: 200 * 1024,
                  formats: ["MP4", "WEBM"],
                  description:
                    "ویدیوی توضیحات مهندس نام‌آور در خصوص دوره کوچینگ MON.",
                }}
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        },
        {
          key: "introVideoPoster",
          render: (v, set) => (
            <Field
              label="تصویر پیش‌نمایش ویدیو"
              hint="فریم ابتدایی که قبل از پخش ویدیو نشان داده می‌شود."
            >
              <MediaPicker
                kind="image"
                recommended={{
                  width: 1920,
                  height: 1080,
                  aspectRatio: "16:9",
                  maxSizeKB: 1200,
                  formats: ["JPG", "WebP"],
                  description:
                    "فریم ابتدایی (پوستر) ویدیوی توضیحات مهندس نام‌آور در صفحه کوچینگ MON.",
                }}
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        },
        {
          key: "introVideoCaption",
          render: (v, set) => (
            <Field label="کپشن زیر ویدیو">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="توضیحات مهندس نام‌آور در خصوص MON"
              />
            </Field>
          ),
        },
        {
          key: "curriculumTitle",
          render: (v, set) => (
            <Field
              label="عنوان بخش سرفصل‌ها"
              hint="بالای بخش «۶ سرفصل کلیدی» نمایش داده می‌شود."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="ریز محتوای سرفصل‌های کوچینگ MON"
              />
            </Field>
          ),
        },
        {
          key: "curriculumDesc",
          render: (v, set) => (
            <Field
              label="توضیح کوتاه بخش سرفصل‌ها"
              hint="یک پاراگراف زیر عنوان."
            >
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="سرفصل‌های MON به صورت مرحله‌به‌مرحله طراحی شده‌اند ..."
              />
            </Field>
          ),
        },
        {
          key: "supportEyebrow",
          render: (v, set) => (
            <Field
              label="ابرو (eyebrow) بخش پشتیبانی"
              hint="متن کوتاه بین دو خط طلایی زیر عنوان."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="برنامه‌ریزی هفته به هفته"
              />
            </Field>
          ),
        },
        {
          key: "supportTitle",
          render: (v, set) => (
            <Field label="عنوان بخش پشتیبانی">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="محتوای پشتیبانی کوچینگ MON"
              />
            </Field>
          ),
        },
        {
          key: "supportDesc",
          render: (v, set) => (
            <Field label="توضیح بخش پشتیبانی">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="در دورهٔ کوچینگ MON پشتیبانی بخشی از ساختار آموزشی است ..."
              />
            </Field>
          ),
        },
        {
          key: "benefitsEyebrow",
          render: (v, set) => (
            <Field label="ابرو بخش مزیت‌های طلایی">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="ویژگی‌های کلیدی دوره"
              />
            </Field>
          ),
        },
        {
          key: "benefitsTitle",
          render: (v, set) => (
            <Field label="عنوان بخش مزیت‌های طلایی">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="مزیت‌های طلایی کوچینگ MON"
              />
            </Field>
          ),
        },
        {
          key: "benefitsDesc",
          render: (v, set) => (
            <Field
              label="توضیح بخش مزیت‌های طلایی"
              hint="برای شکستن خط (رفتن جمله بعدی به سطر پایین) کلید Enter را بزنید."
            >
              <Textarea
                rows={4}
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder={
                  "دورهٔ MON طوری طراحی شده تا پاسخ‌گوی نیاز معامله‌گران جدی باشد، نه صرفاً علاقه‌مندان آموزش سطحی.\nدر ادامه به مهم‌ترین ویژگی‌های کلیدی این دوره اشاره می‌کنیم."
                }
              />
            </Field>
          ),
        },
        {
          key: "benefitsInstructorPhoto",
          render: (v, set) => (
            <Field
              label="عکس استاد در بخش مزیت‌ها"
              hint="نسبت پیشنهادی پرتره ۳:۴."
            >
              <MediaPicker
                kind="image"
                recommended={{
                  width: 900,
                  height: 1200,
                  aspectRatio: "3:4",
                  maxSizeKB: 500,
                  formats: ["JPG", "PNG", "WebP"],
                  description:
                    "عکس پرتره استاد که روی کارت مرکزی بخش مزیت‌های طلایی نمایش داده می‌شود.",
                }}
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        },
        {
          key: "benefitsInstructorName",
          render: (v, set) => (
            <Field label="نام استاد (روی کارت مرکزی)">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="مهندس امیرحسین نام‌آور"
              />
            </Field>
          ),
        },
        {
          key: "benefitsInstructorRole",
          render: (v, set) => (
            <Field label="نقش/سمت استاد">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="بنیان‌گذار متدولوژی MON"
              />
            </Field>
          ),
        },
        // سه کارت ویژگی‌های کلیدی (سمت راست بخش مزیت‌های طلایی) — قابل
        // ویرایش بدون نیاز به دست‌کاری کد.
        ...benefitCardFields,
        // شش کارت بخش «محتوای پشتیبان MON» — اطراف کره مرکزی.
        ...pillarCardFields,
        {
          key: "keyAchievementsEyebrow",
          render: (v, set) => (
            <Field
              label="ابرو بخش دستاوردهای کلیدی"
              hint="گوشهٔ بالا-چپ بخش، با تراکینگ زیاد."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="SEASON 04 · LIVE"
              />
            </Field>
          ),
        },
        {
          key: "keyAchievementsTitle",
          render: (v, set) => (
            <Field label="عنوان بخش دستاوردهای کلیدی">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="دستاوردهای کلیدی فارغ‌التحصیلان MON"
              />
            </Field>
          ),
        },
        {
          key: "keyAchievementsDesc",
          render: (v, set) => (
            <Field label="توضیح بخش دستاوردهای کلیدی">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="اعداد واقعی از سه شاخص تعیین‌کنندهٔ موفقیت ..."
              />
            </Field>
          ),
        },
        {
          key: "bookingEyebrow",
          render: (v, set) => (
            <Field label="ابرو بخش ثبت‌نام">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="ثبت‌نام آنلاین"
              />
            </Field>
          ),
        },
        {
          key: "bookingTitle",
          render: (v, set) => (
            <Field label="عنوان بخش ثبت‌نام">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="ثبت‌نام در کوچینگ MON"
              />
            </Field>
          ),
        },
        {
          key: "bookingDesc",
          render: (v, set) => (
            <Field label="توضیح بخش ثبت‌نام">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="تعداد ظرفیت‌های هر دوره محدود است ..."
              />
            </Field>
          ),
        },
        {
          key: "bookingPrice",
          render: (v, set) => (
            <Field
              label="مبلغ سرمایه‌گذاری"
              hint="عدد را با ارقام فارسی و جداکنندهٔ هزارگان وارد کنید (مثلاً ۲۹٬۹۹۰٬۰۰۰)."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="۲۹٬۹۹۰٬۰۰۰"
              />
            </Field>
          ),
        },
        {
          key: "bookingPriceUnit",
          render: (v, set) => (
            <Field label="واحد مبلغ">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="تومان"
              />
            </Field>
          ),
        },
        {
          key: "bookingPriceNote",
          render: (v, set) => (
            <Field
              label="یادداشت زیر مبلغ"
              hint="مثلاً اشاره به امکان پرداخت اقساطی."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="امکان پرداخت اقساطی متناسب با شرایط شما"
              />
            </Field>
          ),
        },
        // بخش پایانی صفحه کوچینگ — کنار فرم «درخواست ثبت‌نام در MON».
        // پاراگراف و سه گزینه bullet. اگر bullet خالی بماند، نمایش داده نمی‌شود.
        {
          key: "registerHeading",
          render: (v, set) => (
            <Field label="عنوان بخش ثبت‌نام">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="آماده تبدیل شدن به تریدر حرفه‌ای هستید؟"
              />
            </Field>
          ),
        },
        {
          key: "registerLead",
          render: (v, set) => (
            <Field
              label="پاراگراف معرفی بخش ثبت‌نام"
              hint="چند خط درباره ظرفیت و مراحل پذیرش."
            >
              <Textarea
                rows={3}
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="تعداد ظرفیت‌های هر دوره محدود است. برای ثبت‌نام، فرم را پر کنید — تیم پذیرش در ۴۸ ساعت آینده با شما تماس خواهد گرفت."
              />
            </Field>
          ),
        },
        {
          key: "registerBullet1",
          render: (v, set) => (
            <Field
              label="گزینه bullet ۱"
              hint="اولین تیک سبز کنار فرم ثبت‌نام."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="مصاحبه رایگان تعیین سطح"
              />
            </Field>
          ),
        },
        {
          key: "registerBullet2",
          render: (v, set) => (
            <Field
              label="گزینه bullet ۲ (اختیاری)"
              hint="اگر خالی بماند نمایش داده نمی‌شود."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="مثلاً: پشتیبانی اختصاصی تا پایان دوره"
              />
            </Field>
          ),
        },
        {
          key: "registerBullet3",
          render: (v, set) => (
            <Field
              label="گزینه bullet ۳ (اختیاری)"
              hint="اگر خالی بماند نمایش داده نمی‌شود."
            >
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="مثلاً: دسترسی مادام‌العمر به کامیونیتی"
              />
            </Field>
          ),
        },
        {
          key: "videoTestimonialsEyebrow",
          render: (v, set) => (
            <Field label="ابرو بخش نظرات ویدیویی">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="تجربه فارغ‌التحصیلان MON"
              />
            </Field>
          ),
        },
        {
          key: "videoTestimonialsTitle",
          render: (v, set) => (
            <Field label="عنوان بخش نظرات ویدیویی">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="نظر شرکت‌کنندگان قبلی کوچینگ MON"
              />
            </Field>
          ),
        },
        {
          key: "videoTestimonialsDesc",
          render: (v, set) => (
            <Field label="توضیح بخش نظرات ویدیویی">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="روایت مستقیم چهار تن از فارغ‌التحصیلان موفق ..."
              />
            </Field>
          ),
        },
        ...videoTestimonialFields,
        {
          key: "tradingResultsEyebrow",
          render: (v, set) => (
            <Field label="ابرو بخش نتایج معاملاتی">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="گزارش عملکرد فارغ‌التحصیلان"
              />
            </Field>
          ),
        },
        {
          key: "tradingResultsTitle",
          render: (v, set) => (
            <Field label="عنوان بخش نتایج معاملاتی">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="نتایج معاملاتی شرکت‌کنندگان قبلی کوچینگ MON"
              />
            </Field>
          ),
        },
        {
          key: "tradingResultsDesc",
          render: (v, set) => (
            <Field label="توضیح بخش نتایج معاملاتی">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="اسکرین‌شات‌های واقعی از حساب‌های فارغ‌التحصیلان MON ..."
              />
            </Field>
          ),
        },
        ...tradingResultFields,
        {
          key: "fundingResultsEyebrow",
          render: (v, set) => (
            <Field label="ابرو بخش جذب سرمایه">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="مسیر جذب سرمایه"
              />
            </Field>
          ),
        },
        {
          key: "fundingResultsTitle",
          render: (v, set) => (
            <Field label="عنوان بخش جذب سرمایه">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="نتایج جذب سرمایه شرکت‌کنندگان قبلی کوچینگ MON"
              />
            </Field>
          ),
        },
        {
          key: "fundingResultsDesc",
          render: (v, set) => (
            <Field label="توضیح بخش جذب سرمایه">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="گواهی‌های Funded و سرمایه‌های تأمین‌شده ..."
              />
            </Field>
          ),
        },
        ...fundingResultFields,
        {
          key: "methodFaqEyebrow",
          render: (v, set) => (
            <Field label="ابرو بخش سوالات متداول">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="هر آنچه قبل از ثبت‌نام باید بدانید"
              />
            </Field>
          ),
        },
        {
          key: "methodFaqTitle",
          render: (v, set) => (
            <Field label="عنوان بخش سوالات متداول">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="سوالات متداول روش MON"
              />
            </Field>
          ),
        },
        {
          key: "methodFaqDesc",
          render: (v, set) => (
            <Field label="توضیح بخش سوالات متداول">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="پاسخ مهم‌ترین سوالاتی که دانش‌پذیران دربارهٔ متدولوژی پرسیده‌اند ..."
              />
            </Field>
          ),
        },
        {
          key: "meetEyebrow",
          render: (v, set) => (
            <Field label="ابرو بخش معرفی مدرس">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="مدرس و تریدر بازارهای مالی"
              />
            </Field>
          ),
        },
        {
          key: "meetTitle",
          render: (v, set) => (
            <Field label="عنوان بخش معرفی مدرس">
              <Input
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="معرفی مدرس دوره — جناب مهندس امیرحسین نام‌آور"
              />
            </Field>
          ),
        },
        {
          key: "meetBio1",
          render: (v, set) => (
            <Field label="پاراگراف اول بیوگرافی">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="مهندس امیرحسین نام‌آور، بنیان‌گذار نامدار آکادمی، با بیش از دو دهه ..."
              />
            </Field>
          ),
        },
        {
          key: "meetBio2",
          render: (v, set) => (
            <Field label="پاراگراف دوم بیوگرافی">
              <Textarea
                value={String(v ?? "")}
                onChange={(e) => set(e.target.value)}
                placeholder="رویکرد سیستماتیک، نگاه عمیق به ساختار بازار ..."
              />
            </Field>
          ),
        },
        {
          key: "meetPhoto",
          render: (v, set) => (
            <Field
              label="عکس مدرس در بخش معرفی"
              hint="نسبت پیشنهادی پرتره ۳:۴."
            >
              <MediaPicker
                kind="image"
                recommended={{
                  width: 900,
                  height: 1200,
                  aspectRatio: "3:4",
                  maxSizeKB: 500,
                  formats: ["JPG", "PNG", "WebP"],
                  description:
                    "عکس پرتره مدرس در بخش «معرفی مدرس دوره» صفحه کوچینگ MON.",
                }}
                value={String(v ?? "")}
                onChange={(url) => set(url)}
              />
            </Field>
          ),
        },
      ]}
    />
  );
}
