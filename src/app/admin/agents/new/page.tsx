import Link from "@/components/SafeLink";
import { Card } from "@/components/admin/ui";
import NewAgentForm from "./NewAgentForm";

export const dynamic = "force-dynamic";

export default function NewAgentPage() {
  return (
    <div className="space-y-6">
      <nav className="text-sm text-[#010514]/60 flex gap-2 flex-wrap">
        <Link href="/admin/agents" className="hover:text-[#1b3c8a]">
          کارشناسان فروش
        </Link>
        <span>/</span>
        <span className="text-[#010514]">کارشناس جدید</span>
      </nav>

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          ثبت کارشناس فروش جدید
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          کد رفرال باید یکتا، با حروف لاتین، عدد و خط تیره باشد (مثل
          MONA10، SALE-ALI). با همین کد، لینک رفرال ساخته می‌شود.
        </p>
      </div>

      <Card className="p-6">
        <NewAgentForm />
      </Card>
    </div>
  );
}
