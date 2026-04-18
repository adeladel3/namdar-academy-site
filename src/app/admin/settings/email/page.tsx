import { getSettingsGroup } from "@/lib/db";
import EmailSettingsForm from "./EmailSettingsForm";

export const dynamic = "force-dynamic";

export default function EmailSettingsPage() {
  return <EmailSettingsForm initial={getSettingsGroup("email.")} />;
}
