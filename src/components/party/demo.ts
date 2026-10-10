import { VALORANT_REGIONS, type RegionKey } from "@/lib/constants";
import { MODES, type Lobby, type LobbySlot } from "@/types/lobby";
import type { AgentLite } from "./types";

const NAMES = ["Phantom#AP1", "Viperella#0101", "SpikeDaddy#TN", "Jett Main#PLZ", "Omen Flick#007", "SageMommy#HEAL", "RezBoi#1337", "KayoKnife#444"];

export function demoLobbies(region: RegionKey, agents: AgentLite[]): Lobby[] {
  const servers = VALORANT_REGIONS[region].servers;
  const now = Date.now();
  return NAMES.map((n, i) => {
    const mode = MODES[i % 4].id;
    const slots: LobbySlot[] = Array.from({ length: 5 }, (_, k) => {
      if (k === 0) return { index: 0, status: "filled", userId: `demo-${i}`, userName: n, userRankTier: 9 + i * 2 };
      if (k < 2 + (i % 3)) return { index: k, status: "filled", userId: `demo-${i}-${k}`, userName: NAMES[(i + k) % NAMES.length], userRankTier: 8 + i };
      const a = agents[(i * 3 + k) % agents.length];
      return { index: k, status: "open", restriction: k % 2 ? { type: "agent", value: a?.id, displayName: a?.name, iconUrl: a?.icon } : { type: "role", value: a?.role, displayName: a?.role, iconUrl: a?.roleIcon } };
    });
    const members = slots.filter((s) => s.status === "filled").length;
    return {
      id: `demo-${i}`, platform: "pc", region, server: servers[i % servers.length], mode, hostId: `demo-${i}`, hostName: n, hostRankTier: 9 + i * 2,
      micRequired: i % 2 === 0, minRank: 6 + i, maxRank: 20 + (i % 5), partyCode: `VAL${100 + i * 7}`, note: i % 3 === 0 ? "Chill comp, no toxicity please" : null,
      status: "open", memberCount: members, maxMembers: 5, slots, memberIds: [], createdAt: now - i * 4 * 60000, expiresAt: now + 3600000,
    };
  });
}
