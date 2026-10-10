export type Mode = "competitive" | "unrated" | "swiftplay" | "premier" | "deathmatch" | "spikerush";
export type Platform = "pc" | "console";
export type SlotStatus = "open" | "filled" | "locked";
export type Restriction = { type: "any" | "role" | "agent"; value?: string; displayName?: string; iconUrl?: string };

export interface LobbySlot {
  index: number;                // 0 = host
  status: SlotStatus;
  userId?: string | null;
  userName?: string | null;     // Riot ID "Name#TAG" or display name
  userAvatarUrl?: string | null;
  userRankTier?: number | null;
  restriction?: Restriction | null;
}

export interface Lobby {
  id: string;
  platform: Platform;
  region: string;               // "AP" | "NA" | ...
  server: string;               // "Mumbai"
  mode: Mode;
  hostId: string;
  hostName: string;
  hostAvatarUrl?: string | null;
  hostRankTier: number;         // 0 = unranked
  micRequired: boolean;
  minRank: number;
  maxRank: number;
  partyCode?: string | null;
  note?: string | null;
  status: "open" | "full" | "closed";
  memberCount: number;
  maxMembers: number;
  slots: LobbySlot[];
  memberIds: string[];          // every uid in the party, for security rules and "my party" queries
  createdAt: number;            // epoch ms
  expiresAt: number;            // epoch ms (lobbies vanish after this)
}

export interface Profile {
  uid: string;
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
  riotName?: string | null;
  riotTag?: string | null;
  puuid?: string | null;
  region: string;
  rankTier: number;             // 0..27 from competitivetiers
  rankName: string;
  rankIconUrl?: string | null;
  accountLevel?: number | null;
  playerCardUrl?: string | null;
  rankVerified: boolean;        // true when it came from a live lookup, false when self-set
  updatedAt: number;
}

export const MODES: { id: Mode; label: string; short: string; size: number; ranked: boolean }[] = [
  { id: "competitive", label: "Competitive", short: "Comp", size: 5, ranked: true },
  { id: "premier", label: "Premier", short: "Premier", size: 5, ranked: true },
  { id: "unrated", label: "Unrated", short: "Unrated", size: 5, ranked: false },
  { id: "swiftplay", label: "Swift Play", short: "Swift", size: 5, ranked: false },
  { id: "spikerush", label: "Spike Rush", short: "Spike", size: 5, ranked: false },
  { id: "deathmatch", label: "Deathmatch", short: "DM", size: 5, ranked: false },
];

export const LOBBY_TTL_MS = 60 * 60 * 1000; // one hour, same as the old app's promise
