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
  useConfirm,
  cx,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import MediaPicker from "@/components/admin/MediaPicker";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type {
  AttachmentRecord,
  ChapterRecord,
  LessonRecord,
} from "@/lib/db";
import { faDigits, formatSeconds } from "@/lib/formatting";

type LessonWithAttachments = LessonRecord & { attachments: AttachmentRecord[] };
type ChapterNode = { chapter: ChapterRecord; lessons: LessonWithAttachments[] };

type DragTarget =
  | { type: "chapter"; id: string }
  | { type: "lesson"; chapterId: string; id: string }
  | null;

export default function CurriculumBuilder({
  slug,
  data,
}: {
  slug: string;
  data: ChapterNode[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [nodes, setNodes] = useState<ChapterNode[]>(data);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingLesson, setEditingLesson] =
    useState<LessonWithAttachments | null>(null);
  const [dragging, setDragging] = useState<DragTarget>(null);

  function toggleExp(id: string) {
    const s = new Set(expanded);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setExpanded(s);
  }

  // --- Chapter actions ---

  async function addChapter() {
    const title = prompt("عنوان فصل جدید");
    if (!title || !title.trim()) return;
    const res = await fetch(
      `/api/admin/courses/${encodeURIComponent(slug)}/chapters`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      }
    );
    if (res.ok) {
      const d = await res.json();
      const newChapter: ChapterRecord = {
        id: d.id,
        courseSlug: slug,
        title: title.trim(),
        order: nodes.length,
      };
      setNodes([...nodes, { chapter: newChapter, lessons: [] }]);
      toast("فصل اضافه شد", "ok");
    } else {
      toast("خطا در ایجاد فصل", "err");
    }
  }

  async function renameChapter(chapter: ChapterRecord) {
    const title = prompt("عنوان جدید", chapter.title);
    if (!title || title.trim() === chapter.title) return;
    const res = await fetch(
      `/api/admin/chapters/${encodeURIComponent(chapter.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      }
    );
    if (res.ok) {
      setNodes(
        nodes.map((n) =>
          n.chapter.id === chapter.id
            ? { ...n, chapter: { ...n.chapter, title: title.trim() } }
            : n
        )
      );
      toast("تغییر اعمال شد", "ok");
    }
  }

  async function deleteChapter(chapter: ChapterRecord) {
    const ok = await confirm({
      title: "حذف فصل",
      message: `فصل "${chapter.title}" و همه درس‌های آن حذف می‌شود. مطمئن هستید؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(
      `/api/admin/chapters/${encodeURIComponent(chapter.id)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setNodes(nodes.filter((n) => n.chapter.id !== chapter.id));
      toast("فصل حذف شد", "ok");
    }
  }

  async function addLesson(chapterId: string) {
    const title = prompt("عنوان درس جدید");
    if (!title || !title.trim()) return;
    const res = await fetch(
      `/api/admin/chapters/${encodeURIComponent(chapterId)}/lessons`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      }
    );
    if (res.ok) {
      const d = await res.json();
      setNodes(
        nodes.map((n) =>
          n.chapter.id === chapterId
            ? {
                ...n,
                lessons: [
                  ...n.lessons,
                  {
                    id: d.id,
                    chapterId,
                    courseSlug: slug,
                    title: title.trim(),
                    order: n.lessons.length,
                    videoDurationSec: 0,
                    freePreview: false,
                    attachments: [],
                  },
                ],
              }
            : n
        )
      );
      setExpanded((s) => new Set([...s, chapterId]));
      toast("درس اضافه شد", "ok");
    }
  }

  async function deleteLesson(lesson: LessonWithAttachments) {
    const ok = await confirm({
      title: "حذف درس",
      message: `درس "${lesson.title}" حذف شود؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(
      `/api/admin/lessons/${encodeURIComponent(lesson.id)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setNodes(
        nodes.map((n) =>
          n.chapter.id === lesson.chapterId
            ? { ...n, lessons: n.lessons.filter((l) => l.id !== lesson.id) }
            : n
        )
      );
      toast("درس حذف شد", "ok");
    }
  }

  async function saveLesson(patch: Partial<LessonWithAttachments>) {
    if (!editingLesson) return;
    const res = await fetch(
      `/api/admin/lessons/${encodeURIComponent(editingLesson.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: patch.title,
          content: patch.content,
          videoUrl: patch.videoUrl,
          videoDurationSec: patch.videoDurationSec,
          freePreview: patch.freePreview,
        }),
      }
    );
    if (res.ok) {
      const merged: LessonWithAttachments = {
        ...editingLesson,
        ...patch,
      } as LessonWithAttachments;
      setNodes(
        nodes.map((n) =>
          n.chapter.id === editingLesson.chapterId
            ? {
                ...n,
                lessons: n.lessons.map((l) =>
                  l.id === editingLesson.id ? merged : l
                ),
              }
            : n
        )
      );
      setEditingLesson(merged);
      toast("تغییرات ذخیره شد", "ok");
    } else {
      toast("خطا در ذخیره", "err");
    }
  }

  // --- Drag & drop ---

  function onDragStart(t: DragTarget) {
    return () => setDragging(t);
  }

  function onDropChapter(targetChapterId: string) {
    return async (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragging || dragging.type !== "chapter") return;
      if (dragging.id === targetChapterId) return;
      const srcIdx = nodes.findIndex((n) => n.chapter.id === dragging.id);
      const tgtIdx = nodes.findIndex((n) => n.chapter.id === targetChapterId);
      if (srcIdx < 0 || tgtIdx < 0) return;
      const copy = [...nodes];
      const [moved] = copy.splice(srcIdx, 1);
      copy.splice(tgtIdx, 0, moved);
      setNodes(copy);
      setDragging(null);
      await fetch(
        `/api/admin/courses/${encodeURIComponent(slug)}/chapters/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: copy.map((n, i) => ({ id: n.chapter.id, order: i })),
          }),
        }
      );
    };
  }

  function onDropLesson(chapterId: string, targetLessonId: string) {
    return async (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragging || dragging.type !== "lesson") return;
      if (dragging.chapterId !== chapterId) return;
      if (dragging.id === targetLessonId) return;
      const cIdx = nodes.findIndex((n) => n.chapter.id === chapterId);
      if (cIdx < 0) return;
      const lessons = [...nodes[cIdx].lessons];
      const sIdx = lessons.findIndex((l) => l.id === dragging.id);
      const tIdx = lessons.findIndex((l) => l.id === targetLessonId);
      if (sIdx < 0 || tIdx < 0) return;
      const [moved] = lessons.splice(sIdx, 1);
      lessons.splice(tIdx, 0, moved);
      const updated = [...nodes];
      updated[cIdx] = { ...updated[cIdx], lessons };
      setNodes(updated);
      setDragging(null);
      await fetch(
        `/api/admin/chapters/${encodeURIComponent(chapterId)}/lessons/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: lessons.map((l, i) => ({ id: l.id, order: i })),
          }),
        }
      );
    };
  }

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  // --- Render ---

  const totalLessons = nodes.reduce((s, n) => s + n.lessons.length, 0);

  return (
    <>
      {dialog}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-[#010514]/65">
            {faDigits(nodes.length)} فصل · {faDigits(totalLessons)} درس
          </div>
          <Button onClick={addChapter} variant="primary">
            <Icon.Plus width={16} height={16} /> فصل جدید
          </Button>
        </div>

        {nodes.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="font-bold mb-2">هنوز فصلی اضافه نشده</div>
            <p className="text-sm text-[#010514]/55 mb-5">
              برای شروع، اولین فصل دوره را ایجاد کنید.
            </p>
            <Button onClick={addChapter}>افزودن فصل</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {nodes.map((n) => {
              const isExpanded = expanded.has(n.chapter.id);
              return (
                <Card
                  key={n.chapter.id}
                  className={cx(
                    "transition",
                    dragging?.type === "chapter" && dragging.id === n.chapter.id
                      ? "opacity-50"
                      : ""
                  )}
                >
                  <div
                    className="flex items-center gap-2 p-4"
                    draggable
                    onDragStart={onDragStart({ type: "chapter", id: n.chapter.id })}
                    onDragOver={allowDrop}
                    onDrop={onDropChapter(n.chapter.id)}
                  >
                    <button
                      type="button"
                      className="p-1 text-[#010514]/40 cursor-grab"
                      title="کشیدن برای جابه‌جایی"
                    >
                      <Icon.Drag width={16} height={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExp(n.chapter.id)}
                      className="p-1 text-[#010514]/55"
                    >
                      {isExpanded ? (
                        <Icon.ChevronDown width={16} height={16} />
                      ) : (
                        <Icon.ChevronLeft width={16} height={16} />
                      )}
                    </button>
                    <div
                      className="flex-1 font-bold text-[#010514] cursor-pointer"
                      onClick={() => toggleExp(n.chapter.id)}
                    >
                      {n.chapter.title}
                      <span className="text-xs text-[#010514]/45 mr-3 font-normal">
                        {faDigits(n.lessons.length)} درس
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => renameChapter(n.chapter)}
                      className="p-2 text-[#010514]/55 hover:text-[#1b3c8a] rounded-lg hover:bg-[#f7fafd]"
                      title="تغییر نام"
                    >
                      <Icon.Edit width={15} height={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => addLesson(n.chapter.id)}
                      className="p-2 text-[#1b3c8a] rounded-lg hover:bg-[#eef4ff]"
                      title="افزودن درس"
                    >
                      <Icon.Plus width={15} height={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChapter(n.chapter)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="حذف فصل"
                    >
                      <Icon.Trash width={15} height={15} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[#eef2f7] bg-[#f7fafd]">
                      {n.lessons.length === 0 ? (
                        <div className="p-6 text-center text-sm text-[#010514]/55">
                          هنوز درسی در این فصل نیست.
                          <button
                            type="button"
                            onClick={() => addLesson(n.chapter.id)}
                            className="mr-2 text-[#1b3c8a] font-bold hover:underline"
                          >
                            اولین درس را اضافه کنید
                          </button>
                        </div>
                      ) : (
                        <ul>
                          {n.lessons.map((l) => (
                            <li
                              key={l.id}
                              className={cx(
                                "flex items-center gap-2 p-3 border-t border-[#eef2f7] first:border-t-0 transition",
                                dragging?.type === "lesson" &&
                                  dragging.id === l.id &&
                                  "opacity-40"
                              )}
                              draggable
                              onDragStart={onDragStart({
                                type: "lesson",
                                chapterId: n.chapter.id,
                                id: l.id,
                              })}
                              onDragOver={allowDrop}
                              onDrop={onDropLesson(n.chapter.id, l.id)}
                            >
                              <span className="p-1 text-[#010514]/40 cursor-grab">
                                <Icon.Drag width={14} height={14} />
                              </span>
                              <span
                                className={cx(
                                  "w-2 h-2 rounded-full shrink-0",
                                  l.videoUrl ? "bg-green-500" : "bg-[#e5eaf5]"
                                )}
                                title={l.videoUrl ? "ویدیو موجود" : "بدون ویدیو"}
                              />
                              <span className="flex-1 truncate text-sm text-[#010514]">
                                {l.title}
                              </span>
                              {l.videoDurationSec > 0 && (
                                <span
                                  className="text-[11px] font-mono text-[#010514]/55"
                                  dir="ltr"
                                >
                                  {formatSeconds(l.videoDurationSec)}
                                </span>
                              )}
                              {l.freePreview && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7cf5a]/30 text-[#7a5600]">
                                  پیش‌نمایش
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => setEditingLesson(l)}
                                className="p-1.5 text-[#010514]/55 hover:text-[#1b3c8a] hover:bg-white rounded-lg"
                                title="ویرایش"
                              >
                                <Icon.Edit width={14} height={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteLesson(l)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                title="حذف"
                              >
                                <Icon.Trash width={14} height={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {editingLesson && (
        <LessonDrawer
          lesson={editingLesson}
          onClose={() => setEditingLesson(null)}
          onSave={saveLesson}
          onUploadAttachment={async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            const up = await fetch("/api/admin/media/upload", {
              method: "POST",
              body: fd,
            });
            if (!up.ok) {
              toast("بارگذاری ناموفق", "err");
              return;
            }
            const mj = await up.json();
            const att = await fetch(
              `/api/admin/lessons/${encodeURIComponent(
                editingLesson.id
              )}/attachments`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: file.name,
                  fileUrl: mj.url,
                  fileSize: file.size,
                  mimeType: file.type,
                }),
              }
            );
            if (att.ok) {
              const aj = await att.json();
              const updated = {
                ...editingLesson,
                attachments: [...editingLesson.attachments, aj.attachment],
              };
              setEditingLesson(updated);
              setNodes(
                nodes.map((n) =>
                  n.chapter.id === editingLesson.chapterId
                    ? {
                        ...n,
                        lessons: n.lessons.map((l) =>
                          l.id === editingLesson.id ? updated : l
                        ),
                      }
                    : n
                )
              );
              toast("ضمیمه اضافه شد", "ok");
            }
          }}
          onRemoveAttachment={async (id) => {
            const r = await fetch(
              `/api/admin/attachments/${encodeURIComponent(id)}`,
              { method: "DELETE" }
            );
            if (r.ok) {
              const updated = {
                ...editingLesson,
                attachments: editingLesson.attachments.filter((a) => a.id !== id),
              };
              setEditingLesson(updated);
              setNodes(
                nodes.map((n) =>
                  n.chapter.id === editingLesson.chapterId
                    ? {
                        ...n,
                        lessons: n.lessons.map((l) =>
                          l.id === editingLesson.id ? updated : l
                        ),
                      }
                    : n
                )
              );
              toast("ضمیمه حذف شد", "ok");
            }
          }}
        />
      )}

      <div className="flex items-center justify-end">
        <Button variant="secondary" onClick={() => router.refresh()}>
          بارگذاری مجدد
        </Button>
      </div>
    </>
  );
}

function LessonDrawer({
  lesson,
  onClose,
  onSave,
  onUploadAttachment,
  onRemoveAttachment,
}: {
  lesson: LessonWithAttachments;
  onClose: () => void;
  onSave: (patch: Partial<LessonWithAttachments>) => Promise<void>;
  onUploadAttachment: (file: File) => Promise<void>;
  onRemoveAttachment: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: lesson.title,
    content: lesson.content ?? "",
    videoUrl: lesson.videoUrl ?? "",
    videoDurationSec: lesson.videoDurationSec,
    freePreview: lesson.freePreview,
  });
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    await onSave({
      ...form,
      videoUrl: form.videoUrl || undefined,
      content: form.content || undefined,
    });
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mr-auto w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#eef2f7] p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-[#010514]">ویرایش درس</h3>
            <p className="text-xs text-[#010514]/55 mt-0.5">{lesson.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[#f7fafd] text-[#010514]/55 text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          <Field label="عنوان درس" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>

          <Field label="آدرس ویدیو">
            <MediaPicker
              kind="video"
              value={form.videoUrl}
              onChange={(url) => setForm({ ...form, videoUrl: url })}
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="مدت ویدیو (ثانیه)">
              <Input
                type="number"
                value={form.videoDurationSec}
                onChange={(e) =>
                  setForm({ ...form, videoDurationSec: Number(e.target.value) })
                }
                dir="ltr"
                className="font-mono"
              />
            </Field>
            <Field label="پیش‌نمایش رایگان">
              <Toggle
                checked={form.freePreview}
                onChange={(v) => setForm({ ...form, freePreview: v })}
                label="قابل مشاهده بدون خرید"
              />
            </Field>
          </div>

          <Field label="یادداشت / متن درس (اختیاری)">
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
            />
          </Field>

          <div>
            <div className="text-xs text-[#010514]/70 font-medium mb-2">
              فایل‌های ضمیمه
            </div>
            <ul className="space-y-2 mb-3">
              {lesson.attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f7fafd] text-sm"
                >
                  <Icon.Folder width={14} height={14} className="text-[#1b3c8a]" />
                  <span className="flex-1 truncate">{a.title}</span>
                  <span className="text-[11px] text-[#010514]/55">
                    {(a.fileSize / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(a.id)}
                    className="text-red-600 text-xs hover:underline"
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>
            <label className="inline-flex items-center gap-2 text-sm text-[#1b3c8a] font-bold cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadAttachment(f);
                }}
              />
              <Icon.Upload width={15} height={15} /> افزودن ضمیمه
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#eef2f7] p-5 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            بستن
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "در حال ذخیره..." : "ذخیره درس"}
          </Button>
        </div>
      </div>
    </div>
  );
}
