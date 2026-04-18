import { getSettingsGroup } from "@/lib/db";
import ChatSettingsForm from "./ChatSettingsForm";

export const dynamic = "force-dynamic";

export default function ChatSettingsPage() {
  return <ChatSettingsForm initial={getSettingsGroup("chat.")} />;
}
