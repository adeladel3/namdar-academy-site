"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Combobox,
  Field,
  Input,
  JalaliDatePicker,
  Modal,
  Select,
  Toggle,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import {
  faDigits,
  formatDate,
  formatToman,
} from "@/lib/formatting";
import type { CourseRecord, DiscountCode } from "@/lib/db";

export default function DiscountsManager({
  discounts,
  courses,
}: {
  discounts: DiscountCode[];
  courses: CourseRecord[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [creating, setCreating] = useState(false);

  async function remove(d: DiscountCode) {
    const ok = await confirm({
      title: "حذف کد",
      message: `کد «${d.code}» حذف شود؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(
      `/api/admin/discounts/${encodeURIComponent(d.code)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      toast("حذف شد", "ok");
      router.refresh();
    }
  }

  async function toggleActive(d: DiscountCode) {
    await fetch(`/api/admin/discounts/${encodeURIComponent(d.code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !d.active }),
    });
    router.refresh();
  }

  return (
    <>
      {dialog}
      <Card>
        <CardHeader
          title={`${faDigits(discounts.length)} کد`}
          right={
            <Button onClick={() => setCreating(true)}>
              <Icon.Plus width={15} height={15} /> کد جدید
            </Button>
          }
        />
        {discounts.length === 0 ? (
          <div className="py-14 text-center text-[#010514]/55 text-sm">
            هنوز کد تخفیفی تعریف نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7fafd] text-[#010514]/65">
                <tr>
                  <th className="text-right p-3">کد</th>
                  <th className="text-right p-3">مقدار</th>
                  <th className="text-right p-3">دامنه</th>
                  <th className="text-right p-3">استفاده</th>
                  <th className="text-right p-3">انقضا</th>
                  <th className="text-right p-3">فعال</th>
                  <th className="text-right p-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => {
                  const course = d.courseSlug
                    ? courses.find((c) => c.slug === d.courseSlug)
                    : null;
                  return (
                    <tr key={d.code} className="border-t border-[#eef2f7]">
                      <td className="p-3">
                        <code className="font-mono font-bold text-[#1b3c8a]">
                          {d.code}
                        </code>
                      </td>
                      <td className="p-3">
                        {d.kind === "percent"
                          ? `${faDigits(d.value)}٪`
                          : formatToman(d.value)}
                      </td>
                      <td className="p-3">
                        {course ? (
                          <span className="text-xs">{course.title}</span>
                        ) : (
                          <span className="text-xs text-[#010514]/55">
                            سراسری
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {faDigits(d.uses)}
                        {d.maxUses ? ` / ${faDigits(d.maxUses)}` : ""}
                      </td>
                      <td className="p-3 text-xs text-[#010514]/65">
                        {d.expiresAt ? formatDate(d.expiresAt) : "—"}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(d)}
                          className={`text-[11px] px-2 py-1 rounded-full font-bold ${
                            d.active
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-200 text-neutral-600"
                          }`}
                        >
                          {d.active ? "فعال" : "غیرفعال"}
                        </button>
                      </td>
                      <td className="p-3 text-left">
                        <button
                          type="button"
                          onClick={() => setEditing(d)}
                          className="text-[#010514]/55 hover:text-[#1b3c8a] p-2 rounded-lg"
                          title="ویرایش"
                        >
                          <Icon.Edit width={14} height={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(d)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                          title="حذف"
                        >
                          <Icon.Trash width={14} height={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <DiscountModal
        open={creating}
        onClose={() => setCreating(false)}
        courses={courses}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <DiscountModal
        open={!!editing}
        onClose={() => setEditing(null)}
        courses={courses}
        discount={editing ?? undefined}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}

function DiscountModal({
  open,
  onClose,
  courses,
  discount,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  courses: CourseRecord[];
  discount?: DiscountCode;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    code: discount?.code ?? "",
    kind: discount?.kind ?? ("percent" as "percent" | "fixed"),
    value: discount?.value ?? 10,
    maxUses: discount?.maxUses ?? 0,
    expiresAt: discount?.expiresAt
      ? new Date(discount.expiresAt).toISOString().split("T")[0]
      : "",
    courseSlug: discount?.courseSlug ?? "",
    active: discount?.active ?? true,
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.code.trim()) {
      toast("کد الزامی است", "err");
      return;
    }
    if (!/^[A-Z0-9-]+$/i.test(form.code)) {
      toast("کد فقط باید حروف انگلیسی، عدد و خط تیره باشد", "err");
      return;
    }
    setBusy(true);
    try {
      const isNew = !discount;
      const res = await fetch(
        isNew
          ? "/api/admin/discounts"
          : `/api/admin/discounts/${encodeURIComponent(discount!.code)}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: form.code.trim().toUpperCase(),
            kind: form.kind,
            value: Number(form.value),
            maxUses: form.maxUses > 0 ? Number(form.maxUses) : undefined,
            expiresAt: form.expiresAt
              ? new Date(form.expiresAt).getTime()
              : undefined,
            courseSlug: form.courseSlug || undefined,
            active: form.active,
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast(d.error ?? "خطا", "err");
        return;
      }
      toast("ذخیره شد", "ok");
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={discount ? "ویرایش کد تخفیف" : "کد تخفیف جدید"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "..." : "ذخیره"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="کد">
          <Input
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
            dir="ltr"
            className="font-mono"
            disabled={!!discount}
          />
        </Field>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="نوع">
            <Select
              value={form.kind}
              onChange={(e) =>
                setForm({
                  ...form,
                  kind: e.target.value as "percent" | "fixed",
                })
              }
            >
              <option value="percent">درصدی (٪)</option>
              <option value="fixed">ثابت (تومان)</option>
            </Select>
          </Field>
          <Field
            label={
              form.kind === "percent"
                ? "درصد تخفیف"
                : "مبلغ تخفیف (تومان)"
            }
          >
            <Input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              dir="ltr"
              className="font-mono"
            />
          </Field>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="حداکثر تعداد استفاده (۰ = نامحدود)">
            <Input
              type="number"
              value={form.maxUses}
              onChange={(e) =>
                setForm({ ...form, maxUses: Number(e.target.value) })
              }
              dir="ltr"
              className="font-mono"
            />
          </Field>
          <Field label="تاریخ انقضا (اختیاری)">
            <JalaliDatePicker
              value={form.expiresAt}
              onChange={(v) => setForm({ ...form, expiresAt: v })}
              placeholder="بدون انقضا"
            />
          </Field>
        </div>
        <Field label="محدود به دوره (اختیاری)">
          <Combobox
            value={form.courseSlug}
            onChange={(v) => setForm({ ...form, courseSlug: v })}
            options={[
              { value: "", label: "سراسری (همه دوره‌ها)" },
              ...courses.map((c) => ({ value: c.slug, label: c.title })),
            ]}
            placeholder="سراسری (همه دوره‌ها)"
          />
        </Field>
        <Toggle
          checked={form.active}
          onChange={(v) => setForm({ ...form, active: v })}
          label="فعال"
        />
      </div>
    </Modal>
  );
}
