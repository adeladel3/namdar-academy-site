import { NextResponse } from "next/server";
import { requirePerm } from "@/lib/admin-guard";
import { getSeminar, reorderSeminarBlocks } from "@/lib/db";

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

  let body: { orderMap?: Record<string, number> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.orderMap) return NextResponse.json({ error: "orderMap لازم است" }, { status: 400 });

  const ok = reorderSeminarBlocks(seminar.slug, namespace, body.orderMap);
  return NextResponse.json({ ok });
}
