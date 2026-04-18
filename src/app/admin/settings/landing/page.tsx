import { getSettingsGroup } from "@/lib/db";
import LandingSettingsForm from "./LandingSettingsForm";

export const dynamic = "force-dynamic";

export default function LandingSettingsPage() {
  return <LandingSettingsForm initial={getSettingsGroup("landing.")} />;
}
