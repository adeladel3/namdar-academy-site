"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="px-5 py-2 rounded-full border border-[#e5eaf5] text-[#010514]/75 hover:border-red-400 hover:text-red-600 transition text-sm font-medium disabled:opacity-60"
    >
      {loading ? "..." : "خروج"}
    </button>
  );
}
