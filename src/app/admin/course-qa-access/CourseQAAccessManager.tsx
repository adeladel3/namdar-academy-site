"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Modal,
  Textarea,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";

type Grant = {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  courseSlug: string;
  courseTitle: string;
  grantedAt: number;
  note?: string;
};

type CourseOption = { slug: string; title: string };
type UserOption = { id: string; name: string; phone: string };

export default function CourseQAAccessManager({
  grants,
  courses,
  users,
}: {
  grants: Grant[];
  courses: CourseOption[];
  users: UserOption[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [creating, setCreating] = useState(false);

  async function remove(g: Grant) {
    const ok = await confirm({
      title: "حذف دسترسی",
      message: `دسترسی پنل پرسش‌وپاسخ دوره «${g.courseTitle}» از کاربر «${g.userName}» حذف شود؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/course-qa-access/${g.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast("دسترسی حذف شد", "ok");
      router.refresh();
    } else {
      toast("خطا در حذف", "err");
    }
  }

  return (
    <>
      {dialog}
      <Card>
        <CardHeader
          title={`${grants.length.toLocaleString("fa-IR")} دسترسی دستی`}
          right={
            <Button onClick={() => setCreating(true)}>
              <Icon.Plus width={15} height={15} /> اعطای دسترسی جدید
            </Button>
          }
        />
        {grants.length === 0 ? (
          <div className="py-14 px-6 text-center text-sm">
            <div className="text-[#010514]/55 mb-2">
              هنوز هیچ دسترسی دستی ثبت نشده است.
            </div>
            <div className="text-[#010514]/45 text-xs">
              یادآوری: کاربران دوره‌خریده بدون نیاز به این صفحه به پنل
              پرسش‌وپاسخ دوره‌شان دسترسی دارند.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#eef2f7]">
            {grants.map((g) => (
              <div key={g.id} className="flex items-center gap-4 p-4">
                <span className="w-11 h-11 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold flex items-center justify-center shrink-0">
                  {g.userName.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#010514]">
                    {g.userName}
                    <span className="text-xs text-[#010514]/55 font-normal mr-2 font-mono">
                      · {g.userPhone}
                    </span>
                  </div>
                  <div className="text-xs text-[#010514]/65 mt-0.5">
                    دوره: <span className="font-bold">{g.courseTitle}</span>
                  </div>
                  {g.note && (
                    <div className="text-[11px] text-[#010514]/50 mt-1">
                      یادداشت: {g.note}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-[#010514]/45 shrink-0">
                  {new Intl.DateTimeFormat("fa-IR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }).format(new Date(g.grantedAt))}
                </div>
                <button
                  type="button"
                  onClick={() => remove(g)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                  title="حذف دسترسی"
                >
                  <Icon.Trash width={14} height={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <NewGrantModal
        open={creating}
        onClose={() => setCreating(false)}
        users={users}
        courses={courses}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
    </>
  );
}

function NewGrantModal({
  open,
  onClose,
  users,
  courses,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  users: UserOption[];
  courses: CourseOption[];
  onSaved: () => void;
}) {
  const [userQuery, setUserQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users.slice(0, 8);
    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.id.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [userQuery, users]);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  async function save() {
    if (!selectedUserId || !courseSlug) {
      toast("کاربر و دوره را انتخاب کنید", "err");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/course-qa-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, courseSlug, note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "خطا در ذخیره", "err");
        return;
      }
      toast("دسترسی اعطا شد", "ok");
      setSelectedUserId("");
      setCourseSlug("");
      setNote("");
      setUserQuery("");
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="اعطای دسترسی پنل پرسش‌وپاسخ"
      width="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "..." : "اعطای دسترسی"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label="کاربر"
          hint="نام یا شماره موبایل کاربر را جستجو کنید."
        >
          {selectedUser ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#eef4ff] border border-[#1b3c8a]/15">
              <div className="flex-1">
                <div className="font-bold text-sm">{selectedUser.name}</div>
                <div className="text-xs text-[#010514]/55 font-mono">
                  {selectedUser.phone}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserId("")}
                className="text-xs text-[#1b3c8a] font-bold hover:underline"
              >
                تغییر
              </button>
            </div>
          ) : (
            <>
              <Input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="نام یا شماره موبایل..."
              />
              {filteredUsers.length > 0 && (
                <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-[#eef2f7] divide-y divide-[#eef2f7]">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUserId(u.id)}
                      className="w-full text-right px-3 py-2 hover:bg-[#eef4ff] transition flex items-center gap-3"
                    >
                      <span className="w-8 h-8 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold flex items-center justify-center text-sm shrink-0">
                        {u.name.charAt(0)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-[#010514]/55 font-mono">
                          {u.phone}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {filteredUsers.length === 0 && userQuery.trim() && (
                <div className="mt-2 text-xs text-[#010514]/55 text-center py-3">
                  کاربری یافت نشد.
                </div>
              )}
            </>
          )}
        </Field>

        <Field label="دوره">
          <select
            value={courseSlug}
            onChange={(e) => setCourseSlug(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#eef2f7] bg-white text-sm"
          >
            <option value="">— انتخاب دوره —</option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="یادداشت (اختیاری)"
          hint="مثلاً: «دسترسی موقت برای پاسخ سوالات قبل از خرید»"
        >
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
