import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUser } from "@/lib/db";
import {
  USER_ROLE_COLORS,
  USER_ROLE_LABELS,
  formatPhone,
} from "@/lib/formatting";
import { Card, CardHeader } from "@/components/admin/ui";
import {
  getActionLabel,
  permissionSource,
  roleDefaultPerms,
  type AdminAction,
} from "@/lib/rbac";
import { getAdminSections } from "@/lib/admin-sections";
import PermissionsMatrix from "./PermissionsMatrix";
import TicketScopeEditor from "./TicketScopeEditor";

export const dynamic = "force-dynamic";

export default async function UserPermissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = getUser(id);
  if (!user) notFound();

  const session = await getSession();
  const viewer = session ? getUser(session.userId) : null;
  const viewerIsSuperAdmin = !!viewer?.isSuperAdmin;

  const grants = (user.permissionGrants ?? []) as AdminAction[];
  const denies = (user.permissionDenies ?? []) as AdminAction[];

  // Drive the matrix from the admin-sections registry so newly-added admin
  // folders (auto-discovered from the filesystem) automatically get a row
  // here without needing a manual edit to rbac.ts. Each section becomes a
  // group; its `actions` array becomes the rows in that group.
  const sections = getAdminSections();
  const groups = sections.map((s) => ({
    key: s.key,
    label: s.autoDiscovered ? `${s.label} (تازه‌کشف‌شده)` : s.label,
    items: s.actions.map((a) => {
      const src = permissionSource(user.role, grants, denies, a);
      return {
        action: a,
        label: getActionLabel(a),
        allowed: src.allowed,
        source: src.source,
        defaultAllowed: roleDefaultPerms(user.role).includes(a),
      };
    }),
  }));

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[#010514]/60 flex gap-2 flex-wrap">
        <Link href="/admin/users" className="hover:text-[#1b3c8a]">
          کاربران
        </Link>
        <span>/</span>
        <Link href={`/admin/users/${id}`} className="hover:text-[#1b3c8a]">
          {user.name}
        </Link>
        <span>/</span>
        <span className="text-[#010514]">دسترسی‌ها</span>
      </nav>

      <Card className="p-6 flex items-center gap-4 flex-wrap">
        <span className="w-14 h-14 rounded-full bg-gradient-to-br from-[#136cb5] to-[#49bbbd] text-white font-bold text-xl flex items-center justify-center shrink-0">
          {user.name.charAt(0)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-lg font-bold text-[#010514]">{user.name}</h1>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${USER_ROLE_COLORS[user.role]}`}
            >
              {USER_ROLE_LABELS[user.role]}
            </span>
          </div>
          <div className="text-xs text-[#010514]/60 font-mono" dir="ltr">
            {formatPhone(user.phone)}
          </div>
        </div>
        <Link
          href={`/admin/users/${id}`}
          className="text-xs text-[#1b3c8a] hover:underline"
        >
          بازگشت به پروفایل →
        </Link>
      </Card>

      <Card className="p-4 border-r-4 border-r-[#136cb5] bg-[#f0f7ff]">
        <p className="text-sm text-[#010514]/80 leading-7">
          سوییچ کنار هر دسترسی را باز یا بسته کنید. اگر نتیجه با پیش‌فرض نقش
          فرق داشته باشد، به‌صورت <span className="font-bold text-amber-800">override</span>{" "}
          ثبت می‌شود و با دکمهٔ <span className="font-bold">↻ پیش‌فرض</span> قابل
          برگشت است. برای تغییرات گروهی از دکمه‌های بالای هر بخش استفاده کنید.
        </p>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="ماتریس دسترسی‌ها"
          subtitle="تغییرات بلافاصله اعمال می‌شود."
        />
        <PermissionsMatrix userId={id} groups={groups} role={user.role} />
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="دامنه دسترسی به تیکت‌ها"
          subtitle="تعیین می‌کند این کاربر کدام تیکت‌ها را در پنل ادمین می‌بیند."
        />
        <div className="p-5">
          <TicketScopeEditor
            userId={id}
            initial={{
              isSuperAdmin: !!user.isSuperAdmin,
              isSeniorSupport: !!user.isSeniorSupport,
              categories: user.ticketCategoryScope ?? [],
            }}
            canEdit={viewerIsSuperAdmin}
          />
        </div>
      </Card>
    </div>
  );
}
