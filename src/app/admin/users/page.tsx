import { listUsers } from "@/lib/db";
import UsersTable from "./UsersTable";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  const users = listUsers();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          مدیریت کاربران
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          جستجو، فیلتر و مدیریت نقش و وضعیت کاربران
        </p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
