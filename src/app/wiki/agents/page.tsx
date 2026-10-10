import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { getAgents, ROLE_ORDER } from "@/lib/valorant-api";
import { AgentGrid } from "@/components/wiki/AgentGrid";

export const metadata: Metadata = { title: "Agents" };

export default async function AgentsPage() {
  const agents = await getAgents();
  const roles = ROLE_ORDER.filter((r) => agents.some((a) => a.role?.displayName === r));
  const slim = agents.map((a) => ({ slug: a.slug, name: a.displayName, role: a.role?.displayName || "", icon: a.displayIcon, bust: a.bustPortrait || a.fullPortrait, colors: a.backgroundGradientColors, abilities: a.abilities.map((x) => x.displayName) }));
  return (
    <>
      <PageHead kicker={`${agents.length} AGENTS · ${roles.length} ROLES`} title="Agents" sub="Pick a role, tap an agent, read every ability." back={{ href: "/wiki", label: "Wiki" }} />
      <AgentGrid agents={slim} roles={roles} />
    </>
  );
}
