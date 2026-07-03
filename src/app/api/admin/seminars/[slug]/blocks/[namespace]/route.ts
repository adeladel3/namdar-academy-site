import { NextResponse } from "next/server";
import { requirePerm } from "@/lib/admin-guard";
import {
  deleteSeminarBlock,
  generateId,
  getSeminar,
  logAudit,
  upsertSeminarBlock,
  type SeminarContentBlock,
  type SeminarMediaKind,
} from "@/lib/db";

const VALID_KINDS: SeminarMediaKind[] = ["image", "video", "file", "link", "embed"];

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function parseNamespace(ns: string): "landing" | "member" | null {
  if (ns === "landing" || ns === "member") return ns;
  return null;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string; namespace: string }> }
) {
  const guard = await requirePerm("seminar.manageContent", req);
  if (!guard.ok) return guard.response;
  const { slug, namespace: rawNs } = await ctx.params;
  const namespace = parseNamespace(rawNs);
  if (!namespace) {
    return NextResponse.json({ error: "namespace نامعتبر" }, { status: 400 });
  }
  const seminar = getSeminar(slug) ?? getSeminar(safeDecode(slug));
  if (!seminar) return NextResponse.json({ error: "سمینار پیدا نشد" }, { status: 404 });

  let body: {
    id?: string;
    kind?: string;
    title?: string;
    description?: string;
    url?: string;
    posterUrl?: string;
    order?: number;
    visible?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const kind = (body.kind ?? "") as SeminarMediaKind;
  if (!VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "نوع بلوک نامعتبر" }, { status: 400 });
  }
  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "عنوان بلوک الزامی است" }, { status: 400 });
  }

  const now = Date.now();
  const list =
    namespace === "landing" ? seminar.landingBlocks ?? [] : seminar.memberBlocks ?? [];
  const existing = body.id ? list.find((b) => b.id === body.id) : undefined;
  const block: SeminarContentBlock = {
    id: existing?.id ?? body.id ?? generateId("sb"),
    kind,
    title,
    description: body.description?.trim() || undefined,
    url: body.url?.trim() || undefined,
    posterUrl: body.posterUrl?.trim() || undefined,
    order:
      typeof body.order === "number"
        ? body.order
        : existing?.order ?? list.length,
    visible: body.visible !== false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  upsertSeminarBlock(seminar.slug, namespace, block);
  logAudit({
    actorId: guard.session.userId,
    action: existing ? "seminar.block.edit" : "seminar.block.create",
    targetType: "seminar-block",
    targetId: `${seminar.slug}/${namespace}/${block.id}`,
    metadata: { title: block.title, kind: block.kind },
  });

  return NextResponse.json({ block });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ slug: string; namespace: string }> }
) {
  const guard = await requirePerm("seminar.manageContent", req);
  if (!guard.ok) return guard.response;
  const { slug, namespace: rawNs } = await ctx.params;
  const namespace = parseNamespace(rawNs);
  if (!namespace) {
    return NextResponse.json({ error: "namespace نامعتبر" }, { status: 400 });
  }
  const seminar = getSeminar(slug) ?? getSeminar(safeDecode(slug));
  if (!seminar) return NextResponse.json({ error: "سمینار پیدا نشد" }, { status: 404 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id لازم است" }, { status: 400 });

  const ok = deleteSeminarBlock(seminar.slug, namespace, id);
  logAudit({
    actorId: guard.session.userId,
    action: "seminar.block.delete",
    targetType: "seminar-block",
    targetId: `${seminar.slug}/${namespace}/${id}`,
  });
  return NextResponse.json({ ok });
}
