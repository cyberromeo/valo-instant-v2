import type { Metadata } from "next";
import { getAgents } from "@/lib/valorant-api";
import { PartyDashboard } from "@/components/party/PartyDashboard";

export const metadata: Metadata = { title: "Party finder" };

export default async function PartyPage() {
  const agents = (await getAgents()).map((a) => ({ id: a.uuid, name: a.displayName, role: a.role?.displayName || "", icon: a.displayIcon, roleIcon: a.role?.displayIcon || "" }));
  const roles = [...new Map(agents.filter((a) => a.role).map((a) => [a.role, a.roleIcon])).entries()].map(([name, icon]) => ({ name, icon }));
  return <PartyDashboard agents={agents} roles={roles} />;
}
