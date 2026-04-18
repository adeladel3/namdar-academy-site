import { getSettingsGroup } from "@/lib/db";
import PaymentSettingsForm from "./PaymentSettingsForm";

export const dynamic = "force-dynamic";

export default function PaymentSettingsPage() {
  return <PaymentSettingsForm initial={getSettingsGroup("payment.")} />;
}
