import { getSettingsGroup } from "@/lib/db";
import SiteSettingsForm from "./SiteSettingsForm";

export const dynamic = "force-dynamic";

export default function SiteSettingsPage() {
  return <SiteSettingsForm initial={getSettingsGroup("site.")} />;
}
