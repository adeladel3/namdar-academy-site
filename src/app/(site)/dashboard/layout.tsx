import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { getSalesAgentByPhone, listTicketsForUser } from "@/lib/db";
import DashboardShell from "./DashboardShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "پنل کاربری — نامدار آکادمی",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  const userTickets = listTicketsForUser(session.userId);
  const unreadTickets = userTickets.reduce(
    (s, t) => s + (t.unreadForUser > 0 ? 1 : 0),
    0
  );

  // Self-service agent dashboard: any user whose phone is registered as an
  // active sales agent gets the extra nav item. No separate login flow.
  const agent = getSalesAgentByPhone(session.phone);
  const isAgent = !!agent && agent.isActive;

  return (
    <DashboardShell
      session={{
        name: session.name,
        phone: session.phone,
        role: session.role,
      }}
      isStaffUser={isStaff(session)}
      isAgent={isAgent}
      ticketUnread={unreadTickets}
    >
      {children}
    </DashboardShell>
  );
}
