import { getSession } from "@/lib/auth";
import { getUser } from "@/lib/db";
import ProfileForm from "./ProfileForm";
import TwoFactorPanel from "./TwoFactorPanel";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = (await getSession())!;
  const user = getUser(session.userId);

  if (!user) {
    return (
      <div className="max-w-[860px] mx-auto p-6">
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[14px]">
          کاربر در پایگاه داده یافت نشد. لطفاً دوباره وارد شوید.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-[#0e1a3d]">
          پروفایل من
        </h1>
        <p className="text-[#0e1a3d]/60 text-[14px] mt-1.5">
          اطلاعات شخصی و تماس خود را مدیریت کنید.
        </p>
      </header>

      <ProfileForm
        initial={{
          name: user.name ?? "",
          email: user.email ?? "",
          avatar: user.avatar ?? "",
          phone: user.phone,
          createdAt: user.createdAt,
        }}
      />

      <TwoFactorPanel initiallyEnabled={!!user.twoFactorEnabled} />
    </div>
  );
}
