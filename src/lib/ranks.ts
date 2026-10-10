// Static rank table (tier numbers match valorant-api competitivetiers of the current episode).
const ICON = (t: number) => `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${t}/smallicon.png`;
const mk = (tier: number, name: string, color: string) => ({ tier, name, color, icon: ICON(tier) });
export const RANKS = [
  mk(0, "Unranked", "#9aa0ad"),
  mk(3, "Iron 1", "#8b8b8b"), mk(4, "Iron 2", "#8b8b8b"), mk(5, "Iron 3", "#8b8b8b"),
  mk(6, "Bronze 1", "#b08a55"), mk(7, "Bronze 2", "#b08a55"), mk(8, "Bronze 3", "#b08a55"),
  mk(9, "Silver 1", "#cfd3dc"), mk(10, "Silver 2", "#cfd3dc"), mk(11, "Silver 3", "#cfd3dc"),
  mk(12, "Gold 1", "#e9c95a"), mk(13, "Gold 2", "#e9c95a"), mk(14, "Gold 3", "#e9c95a"),
  mk(15, "Platinum 1", "#58b4c9"), mk(16, "Platinum 2", "#58b4c9"), mk(17, "Platinum 3", "#58b4c9"),
  mk(18, "Diamond 1", "#c58cff"), mk(19, "Diamond 2", "#c58cff"), mk(20, "Diamond 3", "#c58cff"),
  mk(21, "Ascendant 1", "#4fd6a2"), mk(22, "Ascendant 2", "#4fd6a2"), mk(23, "Ascendant 3", "#4fd6a2"),
  mk(24, "Immortal 1", "#e2567a"), mk(25, "Immortal 2", "#e2567a"), mk(26, "Immortal 3", "#e2567a"),
  mk(27, "Radiant", "#fff4b0"),
];
export const rankByTier = (t: number) => RANKS.find((r) => r.tier === t) ?? RANKS[0];
export const rankByName = (n: string) => RANKS.find((r) => r.name.toLowerCase() === n.toLowerCase()) ?? RANKS[0];
export const RANKED_ONLY = RANKS.filter((r) => r.tier > 0);
