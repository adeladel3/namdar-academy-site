import { getSettingsGroup } from "@/lib/db";
import SmsCreditBadge from "./SmsCreditBadge";
import SmsSettingsForm from "./SmsSettingsForm";

export const dynamic = "force-dynamic";

export default function SmsSettingsPage() {
  return (
    <div className="space-y-5">
      <SmsCreditBadge />
      <SmsSettingsForm initial={getSettingsGroup("sms.")} />
    </div>
  );
}
