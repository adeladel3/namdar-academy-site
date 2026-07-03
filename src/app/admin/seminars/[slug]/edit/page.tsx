import { notFound } from "next/navigation";
import { getSeminar, listUsers } from "@/lib/db";
import SeminarSettingsForm from "./SeminarSettingsForm";

export const dynamic = "force-dynamic";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function SeminarEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const seminar = getSeminar(slug) ?? getSeminar(rawSlug);
  if (!seminar) notFound();
  // معادل منطق صفحه‌ی ادیت دوره: هر کاربر فعال قابل تعیین به‌عنوان پشتیبان است.
  // API صفحه `/api/admin/seminars/[slug]` در زمان ذخیره خودکار مجوز‌های لازم
  // را اعطا می‌کند (grantCourseSupporterPerms).
  const ROLE_RANK: Record<string, number> = {
    admin: 0,
    support: 1,
    instructor: 2,
    sales_agent: 3,
    student: 4,
  };
  const staff = listUsers({ status: "active" })
    .map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      phone: u.phone,
    }))
    .sort((a, b) => {
      const ra = ROLE_RANK[a.role] ?? 9;
      const rb = ROLE_RANK[b.role] ?? 9;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name, "fa");
    });
  return <SeminarSettingsForm seminar={seminar} staff={staff} />;
}
