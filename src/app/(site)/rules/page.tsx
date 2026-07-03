import { redirect } from "next/navigation";

// alias قدیمی — هر لینک به /rules را به صفحه‌ی قوانین واقعی منتقل می‌کنیم.
export default function RulesPage() {
  redirect("/terms");
}
