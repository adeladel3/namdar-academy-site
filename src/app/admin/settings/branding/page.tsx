import { getSettingsGroup } from "@/lib/db";
import BrandingSettingsForm from "./BrandingSettingsForm";

export const dynamic = "force-dynamic";

export default function BrandingSettingsPage() {
  return <BrandingSettingsForm initial={getSettingsGroup("branding.")} />;
}
