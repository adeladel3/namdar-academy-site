"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import SyllabusIcon, {
  SYLLABUS_ICON_OPTIONS,
} from "@/components/SyllabusIcon";
import type {
  CourseRecord,
  SyllabusIconKey,
  SyllabusSection,
} from "@/lib/db";

function newSection(): SyllabusSection {
  return {
    id: `s_${Math.random().toString(36).slice(2, 10)}`,
    title: "",
    iconKey: "star",
    bullets: [""],
  };
}

export default function SyllabusEditor({ course }: { course: CourseRecord }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [sections, setSections] = useState<SyllabusSection[]>(
    course.syllabusSections && course.syllabusSections.length > 0
      ? course.syllabusSections
      : []
  );
  const [busy, setBusy] = useState(false);

  function updateSection(i: number, patch: Partial<SyllabusSection>) {
    setSections((arr) =>
      arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );
  }

  function move(i: number, dir: -1 | 1) {
    setSections((arr) => {
      const next = [...arr];
      const j = i + dir;
      if (j < 0 || j >= next.length) return arr;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function removeSection(i: number) {
    const ok = await confirm({
      title: "حذف سکشن",
      message: `سکشن «${sections[i].title || "بدون عنوان"}» حذف شود؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    setSections((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function save() {
    setBusy(true);
    try {
      // پاک‌سازی bullet های خالی و سکشن‌های بدون عنوان قبل از ذخیره. کاربر
      // می‌تواند ردیف خالی موقتی برای تایپ بسازد ولی نهایتاً به DB نرود.
      const cleaned = sections
        .map((s) => ({
          ...s,
          title: s.title.trim(),
          bullets: s.bullets.map((b) => b.trim()).filter(Boolean),
        }))
        .filter((s) => s.title.length > 0);

      const res = await fetch(`/api/admin/courses/${course.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syllabusSections: cleaned }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast(d.error ?? "ذخیره ناموفق", "err");
        return;
      }
      toast("سرفصل تفصیلی ذخیره شد", "ok");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {dialog}
      <Card>
        <CardHeader
          title="سرفصل تفصیلی صفحه دوره"
          subtitle="این سکشن‌ها در صفحه‌ی عمومی دوره (مثلاً /coaching برای MON) به‌صورت کارت‌های آکاردئونی نمایش داده می‌شوند. اگر این لیست خالی بماند، صفحه از مقدار پیش‌فرض خودش استفاده می‌کند."
          right={
            <Button
              onClick={() => setSections((arr) => [...arr, newSection()])}
              variant="secondary"
            >
              <Icon.Plus width={14} height={14} />
              افزودن سکشن
            </Button>
          }
        />
        <div className="p-4 space-y-4">
          {sections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e5eaf5] p-8 text-center text-sm text-[#010514]/55">
              هنوز سکشنی اضافه نشده. روی «افزودن سکشن» کلیک کنید تا اولین کارت
              سرفصل ساخته شود.
            </div>
          ) : (
            sections.map((s, i) => (
              <div
                key={s.id}
                className="rounded-2xl border border-[#e5eaf5] bg-[#fafcff] p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#f7cf5a]/20 border border-[#f7cf5a]/40 text-[#7a5a08] flex items-center justify-center shrink-0">
                    <SyllabusIcon iconKey={s.iconKey} />
                  </div>
                  <div className="flex-1 grid md:grid-cols-[1fr_220px] gap-3">
                    <Field label={`عنوان سکشن ${i + 1}`}>
                      <Input
                        value={s.title}
                        onChange={(e) =>
                          updateSection(i, { title: e.target.value })
                        }
                        placeholder="مثلاً: روان‌شناسی معامله‌گری حرفه‌ای"
                      />
                    </Field>
                    <Field label="آیکن">
                      <Select
                        value={s.iconKey}
                        onChange={(e) =>
                          updateSection(i, {
                            iconKey: e.target.value as SyllabusIconKey,
                          })
                        }
                      >
                        {SYLLABUS_ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="w-8 h-8 rounded-lg text-[#010514]/55 hover:text-[#1b3c8a] hover:bg-white disabled:opacity-30 transition flex items-center justify-center"
                      title="انتقال به بالا"
                    >
                      <Icon.ChevronUp width={14} height={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === sections.length - 1}
                      className="w-8 h-8 rounded-lg text-[#010514]/55 hover:text-[#1b3c8a] hover:bg-white disabled:opacity-30 transition flex items-center justify-center"
                      title="انتقال به پایین"
                    >
                      <Icon.ChevronDown width={14} height={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(i)}
                      className="w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-50 transition flex items-center justify-center"
                      title="حذف سکشن"
                    >
                      <Icon.Trash width={14} height={14} />
                    </button>
                  </div>
                </div>

                <Field
                  label="موارد (هر سطر یک bullet)"
                  hint="حداکثر ۱۲ سطر؛ هر سطر تا ۲۰۰ کاراکتر."
                >
                  <Textarea
                    rows={Math.max(3, s.bullets.length)}
                    value={s.bullets.join("\n")}
                    onChange={(e) => {
                      const lines = e.target.value.split("\n");
                      updateSection(i, { bullets: lines });
                    }}
                    placeholder={"ساختار بازار و تغییر فاز بازیگران بزرگ\nOrder block، Breaker block و Mitigation\n..."}
                  />
                </Field>
              </div>
            ))
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#eef2f7] mt-4">
            <p className="text-xs text-[#010514]/55">
              تعداد سکشن‌ها: {sections.length} (سقف ۲۰)
            </p>
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
      </Card>
    </>
  );
}
