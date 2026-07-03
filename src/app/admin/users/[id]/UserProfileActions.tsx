"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  Field,
  Input,
  Modal,
  Select,
  Toggle,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import type { CourseRecord, UserRecord } from "@/lib/db";
import { USER_ROLE_LABELS } from "@/lib/formatting";

export default function UserProfileActions({
  user,
  courses,
  viewerIsSuperAdmin,
  viewerIsAdmin,
}: {
  user: UserRecord;
  courses: CourseRecord[];
  viewerIsSuperAdmin: boolean;
  viewerIsAdmin: boolean;
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editOpen, setEditOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  async function toggleStatus() {
    if (user.status === "active") {
      const ok = await confirm({
        title: "غیرفعال‌سازی کاربر",
        message: `آیا از غیرفعال کردن ${user.name} مطمئن هستید؟ این کاربر نمی‌تواند لاگین کند.`,
        confirmText: "غیرفعال کن",
        danger: true,
      });
      if (!ok) return;
      const reason = prompt("دلیل (اختیاری)") || undefined;
      const res = await fetch(`/api/admin/users/${user.id}/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast("کاربر غیرفعال شد", "ok");
        router.refresh();
      }
    } else {
      const res = await fetch(`/api/admin/users/${user.id}/enable`, {
        method: "POST",
      });
      if (res.ok) {
        toast("کاربر فعال شد", "ok");
        router.refresh();
      }
    }
  }

  return (
    <>
      {dialog}
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Icon.Edit width={15} height={15} /> ویرایش
        </Button>
        <Button variant="secondary" onClick={() => setRoleOpen(true)}>
          <Icon.Users width={15} height={15} /> تغییر نقش
        </Button>
        <Button variant="primary" onClick={() => setGrantOpen(true)}>
          <Icon.Plus width={15} height={15} /> اعطای دوره
        </Button>
        <Dropdown
          align="left"
          trigger={
            <button
              type="button"
              className="px-3 py-2 rounded-full bg-white border border-[#e5eaf5] text-[#010514]/60 hover:border-[#1b3c8a]"
              title="عملیات بیشتر"
            >
              ⋮
            </button>
          }
        >
          <DropdownItem
            danger={user.status === "active"}
            onClick={toggleStatus}
          >
            {user.status === "active" ? "غیرفعال‌سازی" : "فعال‌سازی"}
          </DropdownItem>
        </Dropdown>
      </div>

      <EditUserModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        onSaved={() => {
          setEditOpen(false);
          router.refresh();
        }}
      />

      <ChangeRoleModal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        user={user}
        viewerIsSuperAdmin={viewerIsSuperAdmin}
        viewerIsAdmin={viewerIsAdmin}
        onSaved={() => {
          setRoleOpen(false);
          router.refresh();
        }}
      />

      <GrantCourseModal
        open={grantOpen}
        onClose={() => setGrantOpen(false)}
        userId={user.id}
        courses={courses}
        onGranted={() => {
          setGrantOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

function EditUserModal({
  open,
  onClose,
  user,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  user: UserRecord;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email ?? "",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
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
      title="ویرایش کاربر"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="نام کامل">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="ایمیل (اختیاری)">
          <Input
            type="email"
            dir="ltr"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
}

const TICKET_CATEGORIES: { value: string; label: string }[] = [
  { value: "technical", label: "فنی" },
  { value: "billing", label: "مالی" },
  { value: "course", label: "دوره" },
  { value: "account", label: "حساب کاربری" },
  { value: "other", label: "سایر" },
];

function ChangeRoleModal({
  open,
  onClose,
  user,
  viewerIsSuperAdmin,
  viewerIsAdmin,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  user: UserRecord;
  viewerIsSuperAdmin: boolean;
  viewerIsAdmin: boolean;
  onSaved: () => void;
}) {
  const [role, setRole] = useState<UserRecord["role"]>(user.role);
  const [isSuperAdmin, setIsSuperAdmin] = useState(!!user.isSuperAdmin);
  const [isSeniorSupport, setIsSeniorSupport] = useState(
    !!user.isSeniorSupport,
  );
  const [scope, setScope] = useState<string[]>(user.ticketCategoryScope ?? []);
  const [busy, setBusy] = useState(false);

  function toggleScope(value: string) {
    if (!viewerIsSuperAdmin) return;
    setScope((s) =>
      s.includes(value) ? s.filter((v) => v !== value) : [...s, value],
    );
  }

  async function save() {
    setBusy(true);
    try {
      const body: Record<string, unknown> = {};
      // Why: API می‌گه فقط admin می‌تونه نقش را تغییر دهد. اگر کاربر فعلی
      // admin نیست، اصلاً role را در body نگذار تا API بقیه‌ی فیلدها را
      // پردازش کند (اگر سوپر ادمین است) یا 200 خالی برگرداند.
      if (viewerIsAdmin && role !== user.role) {
        body.role = role;
      }
      // فیلدهای scope فقط وقتی فرستاده می‌شوند که viewer سوپر ادمین باشد.
      // در غیر این صورت، API با 403 پاسخ می‌داد (مسیر wantsScopeChange) و
      // کل ذخیره fail می‌شد.
      if (viewerIsSuperAdmin) {
        body.isSuperAdmin = isSuperAdmin;
        body.isSeniorSupport = isSeniorSupport;
        body.ticketCategoryScope = scope;
      }

      if (Object.keys(body).length === 0) {
        toast("تغییری برای ذخیره وجود ندارد", "err");
        return;
      }

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) {
        toast(d.error ?? "خطا در ذخیره", "err");
        return;
      }
      toast("نقش و دسترسی‌ها به‌روزرسانی شد", "ok");
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  // وقتی modal بسته/باز می‌شود مقادیر را با وضعیت فعلی کاربر هم‌گام کنیم
  // تا تغییرات قبلی روی form منعکس شده باشند.
  function handleClose() {
    setRole(user.role);
    setIsSuperAdmin(!!user.isSuperAdmin);
    setIsSeniorSupport(!!user.isSeniorSupport);
    setScope(user.ticketCategoryScope ?? []);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="تغییر نقش کاربر"
      width="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={busy}>
            انصراف
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field
          label="نقش پایه"
          hint={
            viewerIsAdmin
              ? "مدیر دسترسی کامل دارد. پشتیبان فقط بخش‌های مربوط به محدوده‌اش را می‌بیند. مدرس و دانش‌پذیر دسترسی پنل ادمین ندارند مگر اینکه دسترسی گرانولار اضافه شود."
              : "فقط مدیر می‌تواند نقش پایه‌ی کاربر را تغییر دهد."
          }
        >
          <Select
            value={role}
            disabled={!viewerIsAdmin}
            onChange={(e) => setRole(e.target.value as UserRecord["role"])}
          >
            <option value="student">{USER_ROLE_LABELS.student}</option>
            <option value="instructor">{USER_ROLE_LABELS.instructor}</option>
            <option value="support">{USER_ROLE_LABELS.support}</option>
            <option value="admin">{USER_ROLE_LABELS.admin}</option>
          </Select>
        </Field>

        <div className="rounded-2xl border border-[#e5eaf5] bg-[#f7fafd] p-4 space-y-3">
          <h4 className="font-bold text-[#010514] text-sm">دسترسی تیکت‌ها</h4>
          <p className="text-[12px] text-[#010514]/65 leading-7">
            این تنظیمات مشخص می‌کند کاربر چه تیکت‌هایی را در پنل ادمین می‌بیند.
            {viewerIsSuperAdmin
              ? " فقط سوپر ادمین می‌تواند این فیلدها را تغییر دهد."
              : " فقط سوپر ادمین می‌تواند این فیلدها را تغییر دهد — شما این دسترسی را ندارید و فیلدها به صورت فقط‌خواندنی نمایش داده می‌شوند."}
          </p>

          <Toggle
            checked={isSuperAdmin}
            onChange={viewerIsSuperAdmin ? setIsSuperAdmin : () => {}}
            disabled={!viewerIsSuperAdmin}
            label="سوپر ادمین"
            description="همه‌ی تیکت‌های سیستم را می‌بیند، بدون محدودیت دسته یا دوره."
          />
          <Toggle
            checked={isSeniorSupport}
            onChange={viewerIsSuperAdmin ? setIsSeniorSupport : () => {}}
            disabled={!viewerIsSuperAdmin}
            label="پشتیبان ارشد"
            description="همه‌ی تیکت‌ها را می‌بیند ولی دسترسی سوپر ادمین ندارد."
          />

          <div>
            <div className="text-[12.5px] text-[#010514]/75 font-bold mb-2">
              دامنه‌ی دسته‌بندی تیکت‌ها
            </div>
            <p className="text-[11px] text-[#010514]/55 leading-6 mb-2">
              فقط تیکت‌های با این دسته‌ها برای کاربر قابل مشاهده خواهند بود.
              (در کنار تیکت‌های مربوط به دوره/سمیناری که در آن پشتیبان است.)
            </p>
            <div className="flex flex-wrap gap-2">
              {TICKET_CATEGORIES.map((c) => {
                const active = scope.includes(c.value);
                return (
                  <button
                    type="button"
                    key={c.value}
                    disabled={!viewerIsSuperAdmin}
                    onClick={() => toggleScope(c.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold transition ${
                      active
                        ? "bg-[#1b3c8a] text-white border-[#1b3c8a]"
                        : "bg-white text-[#010514]/75 border-[#e3e9f4] hover:border-[#bcd9f4]"
                    } ${!viewerIsSuperAdmin ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {active && (
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
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function GrantCourseModal({
  open,
  onClose,
  userId,
  courses,
  onGranted,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  courses: CourseRecord[];
  onGranted: () => void;
}) {
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);

  async function grant() {
    if (!slug) {
      toast("یک دوره انتخاب کنید", "err");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/grant-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast(d.error ?? "خطا", "err");
        return;
      }
      toast("دوره اعطا شد", "ok");
      onGranted();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="اعطای دوره رایگان"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
          <Button onClick={grant} disabled={busy || !slug}>
            {busy ? "..." : "اعطای دسترسی"}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[#010514]/70 leading-7 mb-4">
        با اعطای دوره، کاربر بدون نیاز به پرداخت به محتوای دوره دسترسی پیدا
        می‌کند.
      </p>
      <Field label="انتخاب دوره">
        <Select value={slug} onChange={(e) => setSlug(e.target.value)}>
          <option value="">— انتخاب کنید —</option>
          {courses.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </Select>
      </Field>
    </Modal>
  );
}
