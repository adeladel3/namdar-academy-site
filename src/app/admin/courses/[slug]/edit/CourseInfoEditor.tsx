"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toEnglishDigits } from "@/lib/formatting";
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Textarea,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import TagPicker from "@/components/admin/TagPicker";
import MediaPicker from "@/components/admin/MediaPicker";
import type { CategoryRecord, CourseRecord, TagRecord } from "@/lib/db";

export default function CourseInfoEditor({
  course,
  categories,
  tags,
  staff = [],
}: {
  course: CourseRecord;
  categories: CategoryRecord[];
  tags: TagRecord[];
  staff?: { id: string; name: string; role: string; phone?: string }[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [busy, setBusy] = useState(false);
  const [supporterQuery, setSupporterQuery] = useState("");
  // وقتی کاربر تایپ می‌کند، از /api/admin/users/search نتیجه می‌گیریم. این
  // برای پیدا کردن کاربری که در لیست اولیه‌ی staff (نقش‌های کارمندی) نیست
  // لازم است — مثلاً یک دانش‌پذیر که می‌خواهیم پشتیبان دوره‌اش کنیم.
  const [supporterSearchResults, setSupporterSearchResults] = useState<
    { id: string; name: string; role: string; phone?: string }[]
  >([]);
  const [supporterSearching, setSupporterSearching] = useState(false);
  const [form, setForm] = useState({
    title: course.title,
    shortDesc: course.shortDesc,
    longDesc: course.longDesc,
    previewImage: course.previewImage,
    previewVideoUrl: course.previewVideoUrl ?? "",
    categoryId: course.categoryId ?? "",
    tagIds: course.tagIds,
    level: course.level,
    instructor: course.instructor,
    badge: course.badge ?? "",
    accentColor: course.accentColor ?? "",
    bannerTitle: course.bannerTitle ?? "",
    landingSlot:
      typeof course.landingSlot === "number" ? String(course.landingSlot) : "",
    externalHref: course.externalHref ?? "",
    supportAdminIds: course.supportAdminIds ?? [],
    agentCommissionPercent:
      typeof course.agentCommissionPercent === "number"
        ? String(course.agentCommissionPercent)
        : "",
    accessDurationDays:
      typeof course.accessDurationDays === "number"
        ? String(course.accessDurationDays)
        : "",
    hideStudentsCount: !!course.hideStudentsCount,
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // جست‌وجوی سرور-سمت پشتیبان: کوئری را نرمالایز می‌کنیم (اعداد فارسی →
  // انگلیسی) و بعد از ۳۰۰ms سکوت، به API می‌زنیم. این هم بار شبکه را کم
  // می‌کند هم اجازه می‌دهد کاربر کل کاربران (نه فقط staff اولیه) را پیدا
  // کند. زیر دو کاراکتر اصلاً درخواست نمی‌فرستیم تا گردش بیهوده روی DB
  // نیفتد.
  useEffect(() => {
    const normalized = toEnglishDigits(supporterQuery).trim();
    if (normalized.length < 2) {
      setSupporterSearchResults([]);
      setSupporterSearching(false);
      return;
    }
    setSupporterSearching(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/users/search?q=${encodeURIComponent(normalized)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) {
          setSupporterSearchResults([]);
          return;
        }
        const data = await res.json();
        setSupporterSearchResults(
          Array.isArray(data.users) ? data.users : []
        );
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setSupporterSearchResults([]);
        }
      } finally {
        setSupporterSearching(false);
      }
    }, 300);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [supporterQuery]);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          shortDesc: form.shortDesc,
          longDesc: form.longDesc,
          previewImage: form.previewImage,
          previewVideoUrl: form.previewVideoUrl || undefined,
          categoryId: form.categoryId || null,
          tagIds: form.tagIds,
          level: form.level,
          instructor: form.instructor,
          badge: form.badge || null,
          accentColor: form.accentColor || null,
          bannerTitle: form.bannerTitle || null,
          landingSlot:
            form.landingSlot === "" ? null : Number(form.landingSlot),
          externalHref: form.externalHref.trim() || null,
          supportAdminIds: form.supportAdminIds,
          agentCommissionPercent:
            form.agentCommissionPercent === ""
              ? null
              : Number(form.agentCommissionPercent),
          accessDurationDays:
            form.accessDurationDays === ""
              ? null
              : Number(form.accessDurationDays),
          hideStudentsCount: form.hideStudentsCount,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast(d.error ?? "خطا در ذخیره", "err");
        return;
      }
      toast("تغییرات ذخیره شد", "ok");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "حذف دوره",
      message: `آیا از حذف دوره "${course.title}" مطمئن هستید؟ این عمل همه فصل‌ها، درس‌ها و ثبت‌نام‌ها را پاک می‌کند و قابل بازگشت نیست.`,
      confirmText: "حذف کامل",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    await fetch(`/api/admin/courses/${course.slug}`, { method: "DELETE" });
    toast("دوره حذف شد", "ok");
    router.push("/admin/courses");
  }

  return (
    <>
      {dialog}
      <div className="space-y-6">
        <Card className="p-6 space-y-5">
          <h2 className="font-bold text-[#010514]">اطلاعات پایه</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="عنوان" required>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>
            <Field label="مدرس" required>
              <Input
                value={form.instructor}
                onChange={(e) => update("instructor", e.target.value)}
              />
            </Field>
          </div>

          <Field label="توضیح کوتاه" required>
            <Textarea
              rows={2}
              value={form.shortDesc}
              onChange={(e) => update("shortDesc", e.target.value)}
            />
          </Field>

          <Field label="توضیح کامل (ویرایشگر محتوا)">
            <RichTextEditor
              value={form.longDesc}
              onChange={(html) => update("longDesc", html)}
            />
          </Field>

          <div className="grid md:grid-cols-3 gap-4">
            <Field label="دسته‌بندی">
              <Select
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
              >
                <option value="">بدون دسته</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="سطح">
              <Select
                value={form.level}
                onChange={(e) =>
                  update(
                    "level",
                    e.target.value as "beginner" | "intermediate" | "advanced"
                  )
                }
              >
                <option value="beginner">مقدماتی</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">پیشرفته</option>
              </Select>
            </Field>
            <Field label="برچسب ویژه (مثل «ویژه» یا «پرفروش»)">
              <Input
                value={form.badge}
                onChange={(e) => update("badge", e.target.value)}
                placeholder="اختیاری"
              />
            </Field>
          </div>

          <Field
            label="مخفی کردن تعداد دانش‌پذیران"
            hint="اگه فعال باشه، عدد دانش‌پذیران نه روی صفحه‌ی این دوره دیده می‌شه نه روی کارت دوره توو فهرست. عدد واقعی توو پنل ادمین همیشه نمایش داده می‌شه."
          >
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.hideStudentsCount}
                onChange={(e) => update("hideStudentsCount", e.target.checked)}
                className="w-4 h-4 accent-[#1b3c8a]"
              />
              <span className="text-sm text-[#010514]">
                {form.hideStudentsCount
                  ? "عدد دانش‌پذیران مخفی است"
                  : "عدد دانش‌پذیران در صفحه‌ی عمومی نمایش داده می‌شود"}
              </span>
            </label>
          </Field>

          <Field label="تگ‌ها">
            <TagPicker
              allTags={tags}
              value={form.tagIds}
              onChange={(ids) => update("tagIds", ids)}
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="رنگ شاخص دوره" hint="روی نوار لندینگ و قاب جزئیات استفاده می‌شود">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.accentColor || "#1b3c8a"}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="h-10 w-14 rounded-lg border border-[#e5eaf5] cursor-pointer bg-white"
                  aria-label="انتخاب رنگ"
                />
                <Input
                  value={form.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  placeholder="#1b3c8a"
                  dir="ltr"
                  className="font-mono text-sm"
                />
                {form.accentColor && (
                  <button
                    type="button"
                    onClick={() => update("accentColor", "")}
                    className="text-xs text-[#010514]/50 hover:text-rose-600 shrink-0"
                  >
                    پاک کن
                  </button>
                )}
              </div>
            </Field>
            <Field label="عنوان نوار لندینگ" hint="اگه نوشته نشه، از عنوان دوره استفاده می‌شود">
              <Input
                value={form.bannerTitle}
                onChange={(e) => update("bannerTitle", e.target.value)}
                placeholder="مثل «دوره\nتکنوفاند»"
              />
            </Field>
          </div>

          <Field
            label="جایگاه در نوار اصلی لندینگ"
            hint="۷ جایگاه در نوار اصلی لندینگ هست. انتخاب هر جایگاه، دوره‌ی قبلی همان جایگاه را خودکار خالی می‌کند."
          >
            <Select
              value={form.landingSlot}
              onChange={(e) => update("landingSlot", e.target.value)}
            >
              <option value="">نمایش داده نشود</option>
              <option value="0">جایگاه ۱ (سمت راست)</option>
              <option value="1">جایگاه ۲</option>
              <option value="2">جایگاه ۳</option>
              <option value="3">جایگاه ۴</option>
              <option value="4">جایگاه ۵</option>
              <option value="5">جایگاه ۶</option>
              <option value="6">جایگاه ۷ (سمت چپ)</option>
            </Select>
          </Field>

          <Field
            label="آدرس اختصاصی این دوره"
            hint="اگر این دوره صفحه‌ی اختصاصی خودش را دارد (مثل /coaching برای MON)، آن را اینجا بگذار تا کلیک روی کارت، کاربر را مستقیم به همان صفحه ببرد. خالی = همان صفحه‌ی پیش‌فرض /courses/اسلاگ."
          >
            <Input
              dir="ltr"
              className="font-mono text-sm"
              value={form.externalHref}
              onChange={(e) => update("externalHref", e.target.value)}
              placeholder="/coaching"
            />
          </Field>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-[#010514]">رسانه معرفی</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="تصویر preview" required>
              <MediaPicker
                kind="image"
                recommended={{
                  width: 1200,
                  height: 675,
                  maxSizeKB: 600,
                  formats: ["JPG", "PNG", "WebP"],
                  description:
                    "تصویر کاور دوره که در کارت و لیست دوره‌ها دیده می‌شود.",
                }}
                value={form.previewImage}
                onChange={(url) => update("previewImage", url)}
              />
            </Field>
            <Field label="ویدیو معرفی (URL)" hint="mp4 یا m3u8 — اختیاری">
              <Input
                dir="ltr"
                className="font-mono text-sm"
                value={form.previewVideoUrl}
                onChange={(e) => update("previewVideoUrl", e.target.value)}
                placeholder="https://cdn.namdar.academy/preview.mp4"
              />
            </Field>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="font-bold text-[#010514]">پشتیبان‌های این دوره</h2>
            <p className="text-[12.5px] text-[#010514]/60 mt-1 leading-7">
              کاربرانی که اینجا انتخاب می‌کنید، تیکت‌های مربوط به این دوره را در
              پنل ادمین خودشان می‌بینند و وقتی یک کاربر این دوره را در تیکت
              انتخاب کند، تیکت اتوماتیک به نفر اول لیست ارجاع می‌شود. هر کاربر
              فعال (حتی منتور یا دانش‌پذیر) را می‌توانید پشتیبان کنید؛ مجوز ورود
              به پنل و پاسخ به تیکت‌ها به‌طور خودکار اعطا می‌شود.
            </p>
          </div>
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
                            update(
                              "supportAdminIds",
                              form.supportAdminIds.filter((x) => x !== id)
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
                  const normalized = toEnglishDigits(supporterQuery).trim();
                  // بدون کوئری: لیست اولیه‌ی staff (نقش‌های کارمندی +
                  // پشتیبان‌های فعلی) را کامل نشان بده. این لیست در سرور
                  // محدود شده پس کوچک است.
                  // با کوئری: نتیجه‌ی سرور را نشان بده. تا وقتی debounce
                  // تمام نشده supporterSearching=true است.
                  if (normalized.length < 2) {
                    if (staff.length === 0) {
                      return (
                        <div className="p-4 text-[12.5px] text-[#010514]/55 text-center">
                          کاربر کارمندی فعالی یافت نشد.
                        </div>
                      );
                    }
                  }
                  const filtered =
                    normalized.length >= 2 ? supporterSearchResults : staff;
                  if (normalized.length >= 2 && supporterSearching) {
                    return (
                      <div className="p-4 text-[12.5px] text-[#010514]/55 text-center">
                        در حال جست‌وجو…
                      </div>
                    );
                  }
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
                          update(
                            "supportAdminIds",
                            active
                              ? form.supportAdminIds.filter((id) => id !== s.id)
                              : [...form.supportAdminIds, s.id]
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
              {!supporterQuery.trim() && (
                <div className="text-[11.5px] text-[#010514]/50 text-center leading-7">
                  لیست بالا شامل ادمین‌ها، پشتیبان‌ها، منتورها و کارشناسان
                  فروش است. برای پشتیبان‌کردن یک دانش‌پذیر، نام یا شماره‌اش
                  را در باکس جست‌وجو وارد کنید.
                </div>
              )}
            </>
          )}
        </Card>

        <Card className="p-6 space-y-5">
          <div>
            <h2 className="font-bold text-[#010514]">فروش و دسترسی</h2>
            <p className="text-[12.5px] text-[#010514]/60 mt-1 leading-7">
              تنظیمات کمیسیون کارشناسان فروش و طول دسترسی به محتوای دوره
              برای دانش‌پذیر.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="درصد کمیسیون کارشناس فروش"
              hint="بین ۰ تا ۱۰۰. خالی = بدون کمیسیون. روی خرید فقط با کد رفرال اعمال می‌شود."
            >
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={form.agentCommissionPercent}
                onChange={(e) =>
                  update("agentCommissionPercent", e.target.value)
                }
                placeholder="مثلاً 10"
                dir="ltr"
                className="font-mono"
              />
            </Field>
            <Field
              label="طول دسترسی به دوره (روز)"
              hint="مثلاً 126 برای 18 هفته MON. خالی = دسترسی نامحدود."
            >
              <Input
                type="number"
                min={1}
                max={36500}
                step={1}
                value={form.accessDurationDays}
                onChange={(e) =>
                  update("accessDurationDays", e.target.value)
                }
                placeholder="مثلاً 365"
                dir="ltr"
                className="font-mono"
              />
            </Field>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button variant="danger" onClick={remove} disabled={busy}>
            حذف دوره
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => router.refresh()}
              disabled={busy}
            >
              انصراف
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
