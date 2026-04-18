import { getSettingsGroup } from "@/lib/db";
import SmsSettingsForm from "./SmsSettingsForm";

export const dynamic = "force-dynamic";

export default function SmsSettingsPage() {
  return <SmsSettingsForm initial={getSettingsGroup("sms.")} />;
}
