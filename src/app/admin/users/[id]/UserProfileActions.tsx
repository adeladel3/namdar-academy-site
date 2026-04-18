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
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import type { CourseRecord, UserRecord } from "@/lib/db";
import { USER_ROLE_LABELS } from "@/lib/formatting";

export default function UserProfileActions({
  user,
  courses,
}: {
  user: UserRecord;
  courses: CourseRecord[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editOpen, setEditOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);

  async function setRole(role: UserRecord["role"]) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const d = await res.json();
    if (!res.ok) {
      toast(d.error ?? "خطا", "err");
      return;
    }
    toast(`نقش کاربر به «${USER_ROLE_LABELS[role]}» تغییر کرد`, "ok");
    router.refresh();
  }

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
          <div className="px-3 py-2 text-[11px] text-[#010514]/55 border-b border-[#eef2f7]">
            تغییر نقش
          </div>
          {(["admin", "support", "student"] as const).map((r) => (
            <DropdownItem
              key={r}
              onClick={() => setRole(r)}
            >
              {user.role === r ? "● " : "  "}
              {USER_ROLE_LABELS[r]}
            </DropdownItem>
          ))}
          <div className="border-t border-[#eef2f7] mt-1 pt-1">
            <DropdownItem
              danger={user.status === "active"}
              onClick={toggleStatus}
            >
              {user.status === "active" ? "غیرفعال‌سازی" : "فعال‌سازی"}
            </DropdownItem>
          </div>
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
