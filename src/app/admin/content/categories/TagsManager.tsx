"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Modal,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import type { TagRecord } from "@/lib/db";

export default function TagsManager({ tags }: { tags: TagRecord[] }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [creating, setCreating] = useState(false);

  async function remove(t: TagRecord) {
    const ok = await confirm({
      title: "حذف تگ",
      message: `تگ "${t.name}" حذف شود؟ از روی دوره‌های مرتبط هم برداشته می‌شود.`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/tags/${t.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("تگ حذف شد", "ok");
      router.refresh();
    }
  }

  return (
    <>
      {dialog}
      <Card>
        <CardHeader
          title="تگ‌ها"
          right={
            <Button onClick={() => setCreating(true)}>
              <Icon.Plus width={15} height={15} /> تگ جدید
            </Button>
          }
        />
        {tags.length === 0 ? (
          <div className="py-10 text-center text-[#010514]/55 text-sm">
            هنوز تگی تعریف نشده است.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-5">
            {tags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eef4ff] text-[#1b3c8a] text-xs font-bold"
              >
                {t.name}
                <button
                  type="button"
                  onClick={() => remove(t)}
                  className="text-[#1b3c8a]/55 hover:text-red-600 transition"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      <CreateTagModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
    </>
  );
}

function CreateTagModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) {
      toast("نام الزامی است", "err");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        toast("تگ اضافه شد", "ok");
        setName("");
        onSaved();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تگ جدید"
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
      <Field label="نام تگ">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
    </Modal>
  );
}
