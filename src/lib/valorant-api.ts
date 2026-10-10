import "server-only";
import type {
  Agent, Buddy, Bundle, Ceremony, CompetitiveTierSet, ContentTier, Contract, Currency, GameEvent, GameMap, GameMode,
  LevelBorder, PlayerCard, PlayerTitle, Season, Skin, Tier, VersionInfo, Weapon,
} from "@/types/valorant";
import { enumLabel, slug } from "./utils";

export const API = "https://valorant-api.com/v1";
const TTL = 60 * 60 * 1000; // one hour, in memory per server instance

type Entry = { at: number; value: Promise<unknown> };
const g = globalThis as unknown as { __valoCache?: Map<string, Entry> };
const cache = (g.__valoCache ??= new Map());

export async function api<T>(path: string): Promise<T> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.value as Promise<T>;
  const value = fetch(API + path, { cache: "no-store", headers: { "User-Agent": "valo-instant-v2" } })
    .then(async (r) => {
      if (!r.ok) throw new Error(`valorant-api ${path} → HTTP ${r.status}`);
      const j = await r.json();
      return j.data as T;
    })
    .catch((e) => { cache.delete(path); throw e; });
  cache.set(path, { at: Date.now(), value });
  return value as Promise<T>;
}

export const WEAPON_ORDER = ["Sidearm", "SMG", "Shotgun", "Rifle", "Sniper", "Heavy", "Melee"];
export const WEAPON_LABEL: Record<string, string> = { Sidearm: "Sidearms", SMG: "SMGs", Shotgun: "Shotguns", Rifle: "Rifles", Sniper: "Snipers", Heavy: "Machine Guns", Melee: "Melee" };
export const ROLE_ORDER = ["Duelist", "Initiator", "Controller", "Sentinel"];
export const SLOT_KEY: Record<string, string> = { Grenade: "C", Ability1: "Q", Ability2: "E", Ultimate: "X", Passive: "P" };
export const SLOT_ORDER = ["Grenade", "Ability1", "Ability2", "Ultimate", "Passive"];

export async function getAgents(): Promise<Agent[]> {
  const d = await api<Agent[]>("/agents?isPlayableCharacter=true");
  const seen = new Set<string>();
  return d
    .filter((a) => !seen.has(a.displayName) && seen.add(a.displayName))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((a) => ({ ...a, slug: slug(a.displayName), abilities: [...a.abilities].sort((x, y) => SLOT_ORDER.indexOf(x.slot) - SLOT_ORDER.indexOf(y.slot)) }));
}
export async function getAgent(s: string) { return (await getAgents()).find((a) => a.slug === s) ?? null; }

export async function getWeapons(): Promise<Weapon[]> {
  const d = await api<Weapon[]>("/weapons");
  return d
    .map((w) => ({
      ...w,
      slug: slug(w.displayName),
      cat: enumLabel(w.category),
      skins: (w.skins || []).filter((s) => s.displayName && !/random favorite/i.test(s.displayName)),
    }))
    .sort((a, b) => WEAPON_ORDER.indexOf(a.cat) - WEAPON_ORDER.indexOf(b.cat) || (a.shopData?.cost ?? 0) - (b.shopData?.cost ?? 0));
}
export async function getWeapon(s: string) { return (await getWeapons()).find((w) => w.slug === s) ?? null; }

export async function getMaps(): Promise<GameMap[]> {
  const d = await api<GameMap[]>("/maps");
  const seen = new Set<string>();
  return d
    .filter((m) => m.displayName !== "The Range" && m.displayName !== "Basic Training" && !seen.has(m.displayName) && seen.add(m.displayName))
    .map((m) => ({ ...m, slug: slug(m.displayName), competitive: !!(m.tacticalDescription && /site/i.test(m.tacticalDescription)) }))
    .sort((a, b) => Number(b.competitive) - Number(a.competitive) || a.displayName.localeCompare(b.displayName));
}
export async function getMap(s: string) { return (await getMaps()).find((m) => m.slug === s) ?? null; }

export async function getTiers(): Promise<Tier[]> {
  const sets = await api<CompetitiveTierSet[]>("/competitivetiers");
  const latest = sets[sets.length - 1];
  return latest.tiers.filter((t) => !/unused/i.test(t.tierName));
}
export const getGameModes = () => api<GameMode[]>("/gamemodes").then((d) => d.filter((m) => m.displayIcon));
export const getCards = () => api<PlayerCard[]>("/playercards").then((d) => d.filter((c) => c.displayIcon || c.largeArt).reverse());
export const getBuddies = () => api<Buddy[]>("/buddies").then((d) => d.filter((b) => b.displayIcon).reverse());
export const getSprays = () => api<Spray[]>("/sprays").then((d) => d.filter((s) => (s.fullTransparentIcon || s.displayIcon) && !s.isNullSpray).reverse());
export const getTitles = () => api<PlayerTitle[]>("/playertitles").then((d) => d.filter((t) => t.titleText).reverse());
export const getCurrencies = () => api<Currency[]>("/currencies");
export const getContentTiers = () => api<ContentTier[]>("/contenttiers").then((d) => [...d].sort((a, b) => a.rank - b.rank));
export const getSeasons = () => api<Season[]>("/seasons");
export const getVersion = () => api<VersionInfo>("/version");
export const getBundles = () => api<Bundle[]>("/bundles").then((d) => d.filter((b) => b.displayIcon).reverse());
export const getLevelBorders = () => api<LevelBorder[]>("/levelborders").then((d) => [...d].sort((a, b) => a.startingLevel - b.startingLevel));
export const getContracts = () => api<Contract[]>("/contracts");
export const getCeremonies = () => api<Ceremony[]>("/ceremonies");
export const getEvents = () => api<GameEvent[]>("/events");

import type { Spray } from "@/types/valorant";

export async function currentAct() {
  const seasons = await getSeasons();
  const now = Date.now();
  const acts = seasons.filter((s) => s.parentUuid);
  const live = acts.find((a) => new Date(a.startTime).getTime() <= now && new Date(a.endTime).getTime() > now) ?? acts[acts.length - 1];
  const parent = seasons.find((s) => s.uuid === live?.parentUuid) ?? null;
  const daysLeft = live ? Math.max(0, Math.ceil((new Date(live.endTime).getTime() - now) / 86400000)) : 0;
  return { act: live ?? null, parent, daysLeft };
}

export function skinThumb(sk: Skin) {
  return sk.displayIcon || sk.chromas?.[0]?.displayIcon || sk.chromas?.[0]?.fullRender || sk.levels?.[0]?.displayIcon || null;
}
