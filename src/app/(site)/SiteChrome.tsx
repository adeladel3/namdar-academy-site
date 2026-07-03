import SiteHeader from "@/components/SiteHeader";
import { getSession } from "@/lib/auth";

export async function SiteChromeHeader() {
  const session = await getSession();
  return (
    <SiteHeader
      session={
        session
          ? { name: session.name, role: session.role }
          : null
      }
    />
  );
}
