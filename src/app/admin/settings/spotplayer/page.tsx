import { getSettingsGroup } from "@/lib/db";
import SpotPlayerSettingsForm from "./SpotPlayerSettingsForm";

export const dynamic = "force-dynamic";

export default function SpotPlayerSettingsPage() {
  return (
    <div className="space-y-5">
      <SpotPlayerSettingsForm initial={getSettingsGroup("spotplayer.")} />
    </div>
  );
}
