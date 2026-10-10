import "server-only";

export const STATUS_REGIONS = ["ap", "na", "eu", "kr", "br", "latam"] as const;
export type StatusRegion = (typeof STATUS_REGIONS)[number];

export interface StatusEntry {
  id: number; created_at: string; updated_at: string | null; archive_at: string | null;
  titles: { locale: string; content: string }[];
  updates: { id: number; created_at: string; updated_at: string | null; publish: boolean; translations: { locale: string; content: string }[] }[];
  platforms: string[]; maintenance_status?: string; incident_severity?: string;
}
export interface RegionStatus { id: string; name: string; locales: string[]; maintenances: StatusEntry[]; incidents: StatusEntry[] }

export async function getRiotStatus(region: StatusRegion): Promise<RegionStatus | null> {
  try {
    const r = await fetch(`https://valorant.secure.dyn.riotcdn.net/channels/public/x/status/${region}.json`, { next: { revalidate: 120 } });
    if (!r.ok) return null;
    return (await r.json()) as RegionStatus;
  } catch { return null; }
}

export const en = (list: { locale: string; content: string }[]) =>
  (list.find((t) => t.locale === "en_US") || list[0])?.content ?? "";
