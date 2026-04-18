"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  Field,
  Input,
  Toggle,
  toast,
} from "@/components/admin/ui";
import {
  COURSE_STATUS_COLORS,
  COURSE_STATUS_LABELS,
  formatToman,
} from "@/lib/formatting";
import type { CourseRecord } from "@/lib/db";

export default function PricingEditor({ course }: { course: CourseRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    price: course.price,
    discountPrice: course.discountPrice ?? 0,
    isFree: course.isFree,
    allowPurchase: course.allowPurchase,
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const finalPrice = form.isFree
    ? 0
    : form.discountPrice > 0 && form.discountPrice < form.price
    ? form.discountPrice
    : form.price;
  const savingPercent =
    !form.isFree && form.discountPrice > 0 && form.discountPrice < form.price
      ? Math.round(
          ((form.price - form.discountPrice) / form.price) * 100
        )
      : 0;

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(form.price) || 0,
          discountPrice: form.discountPrice > 0 ? Number(form.discountPrice) : null,
          isFree: form.isFree,
          allowPurchase: form.allowPurchase,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "خطا در ذخیره", "err");
        return;
      }
      toast("قیمت‌ها ذخیره شد", "ok");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function transition(action: "publish" | "unpublish" | "archive") {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.slug}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json();
        toast(d.error ?? "خطا", "err");
        return;
      }
      toast("انجام شد", "ok");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6 space-y-5">
        <h2 className="font-bold text-[#010514]">قیمت‌گذاری</h2>

        <div className="p-4 rounded-2xl bg-[#f7fafd] space-y-3">
          <Toggle
            checked={form.isFree}
            onChange={(v) => update("isFree", v)}
            label="دوره رایگان"
            description="در صورت فعال بودن، دکمه خرید نمایش داده نمی‌شود و کاربران می‌توانند مستقیماً ثبت‌نام کنند."
          />
          <Toggle
            checked={form.allowPurchase}
            onChange={(v) => update("allowPurchase", v)}
            label="قابل خرید بودن"
            description="در صورت غیرفعال بودن، کاربران نمی‌توانند خرید کنند (ولی صفحه دوره قابل مشاهده است)."
          />
        </div>

        {!form.isFree && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="قیمت اصلی (تومان)" required>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value))}
                dir="ltr"
                className="font-mono text-lg"
              />
            </Field>
            <Field
              label="قیمت با تخفیف (تومان)"
              hint="اگر خالی بگذارید، تخفیفی اعمال نمی‌شود"
            >
              <Input
                type="number"
                value={form.discountPrice}
                onChange={(e) =>
                  update("discountPrice", Number(e.target.value))
                }
                dir="ltr"
                className="font-mono text-lg"
              />
            </Field>
          </div>
        )}

        <div className="pt-4 border-t border-[#eef2f7] flex items-center justify-between">
          <div className="text-sm">
            <span className="text-[#010514]/55">قیمت نهایی فروش: </span>
            <span className="font-bold text-[#1b3c8a] text-lg">
              {form.isFree ? "رایگان" : formatToman(finalPrice)}
            </span>
            {savingPercent > 0 && (
              <span className="mr-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                {savingPercent}٪ تخفیف
              </span>
            )}
          </div>
          <Button onClick={save} disabled={busy}>
            {busy ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-[#010514]">وضعیت انتشار</h2>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${COURSE_STATUS_COLORS[course.status]}`}
          >
            {COURSE_STATUS_LABELS[course.status]}
          </span>
        </div>

        <div className="text-sm text-[#010514]/70 leading-7">
          <p className="mb-2">
            <b>پیش‌نویس:</b> دوره در سایت دیده نمی‌شود و قابل خرید نیست.
          </p>
          <p className="mb-2">
            <b>منتشر شده:</b> دوره در فهرست عمومی نمایش داده می‌شود.
          </p>
          <p>
            <b>بایگانی:</b> دسترسی خریداران حفظ می‌ماند ولی در فهرست عمومی
            نمایش داده نمی‌شود.
          </p>
        </div>

        <div className="pt-4 border-t border-[#eef2f7] space-y-2">
          {course.status !== "published" && (
            <Button
              variant="success"
              className="w-full"
              onClick={() => transition("publish")}
              disabled={busy}
            >
              انتشار دوره
            </Button>
          )}
          {course.status === "published" && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => transition("unpublish")}
              disabled={busy}
            >
              لغو انتشار (به پیش‌نویس)
            </Button>
          )}
          {course.status !== "archived" && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => transition("archive")}
              disabled={busy}
            >
              بایگانی دوره
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
