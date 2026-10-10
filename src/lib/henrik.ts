import "server-only";

export const HENRIK_BASE = "https://api.henrikdev.xyz/valorant";
export const henrikConfigured = () => !!process.env.HENRIK_API_KEY;

async function henrik<T>(path: string): Promise<{ status: number; data: T | null; error?: string }> {
  if (!henrikConfigured()) return { status: 0, data: null, error: "Rank lookup is not connected on this server yet." };
  try {
    const r = await fetch(HENRIK_BASE + path, { headers: { Authorization: process.env.HENRIK_API_KEY!, "User-Agent": "valo-instant-v2" }, next: { revalidate: 300 } });
    const j = await r.json().catch(() => null);
    if (!r.ok) return { status: r.status, data: null, error: j?.errors?.[0]?.message || `Lookup failed (${r.status})` };
    return { status: r.status, data: j.data as T };
  } catch (e) { return { status: 0, data: null, error: (e as Error).message }; }
}

export interface HenrikAccount { puuid: string; region: string; account_level: number; name: string; tag: string; card: { small: string; large: string; wide: string } }
export interface HenrikMMR { currenttier: number; currenttierpatched: string; images: { small: string; large: string }; ranking_in_tier: number; mmr_change_to_last_game: number; elo: number }
export interface HenrikLeaderboardRow { PlayerCardID: string; TitleID: string; IsBanned: boolean; IsAnonymized: boolean; puuid: string; gameName: string; tagLine: string; leaderboardRank: number; rankedRating: number; numberOfWins: number; competitiveTier: number }

export const getAccount = (name: string, tag: string) => henrik<HenrikAccount>(`/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
export const getMMR = (region: string, name: string, tag: string) => henrik<HenrikMMR>(`/v2/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
export const getLeaderboard = (region: string, size = 50) => henrik<{ players: HenrikLeaderboardRow[] }>(`/v3/leaderboard/${region}/pc?size=${size}`);
