import { getSettingsGroup } from "@/lib/db";
import CoachingSettingsForm from "./CoachingSettingsForm";

export const dynamic = "force-dynamic";

export default function CoachingSettingsPage() {
  return <CoachingSettingsForm initial={getSettingsGroup("coaching.")} />;
}
