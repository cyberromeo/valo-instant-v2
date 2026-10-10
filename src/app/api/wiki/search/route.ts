import { NextResponse } from "next/server";
import { getAgents, getBuddies, getCards, getMaps, getSprays, getTitles, getWeapons, SLOT_KEY, skinThumb } from "@/lib/valorant-api";

export const revalidate = 3600;

export interface SearchItem { t: string; n: string; h: string; s?: string; i?: string | null }

const PAGES: [string, string][] = [
  ["Party finder", "/party"], ["Agents", "/wiki/agents"], ["Arsenal", "/wiki/weapons"], ["Maps", "/wiki/maps"], ["Ranks", "/wiki/ranks"],
  ["Player Cards", "/wiki/collection/cards"], ["Gun Buddies", "/wiki/collection/buddies"], ["Sprays", "/wiki/collection/sprays"],
  ["Titles", "/wiki/collection/titles"], ["Currency", "/wiki/collection/currency"], ["Seasons", "/wiki/collection/seasons"],
  ["Bundles", "/wiki/collection/bundles"], ["Game Modes", "/wiki/collection/modes"], ["Level Borders", "/wiki/collection/borders"],
  ["Aim Trainer", "/wiki/trainer"], ["Server Status", "/status"], ["Esports News", "/news"], ["How to use", "/party/how-to"],
];

export async function GET() {
  const [agents, weapons, maps, cards, buddies, sprays, titles] = await Promise.all([getAgents(), getWeapons(), getMaps(), getCards(), getBuddies(), getSprays(), getTitles()]);
  const out: SearchItem[] = [];
  PAGES.forEach(([n, h]) => out.push({ t: "Pages", n, h, s: "Section" }));
  agents.forEach((a) => {
    out.push({ t: "Agents", n: a.displayName, h: `/wiki/agents/${a.slug}`, s: a.role?.displayName, i: a.displayIcon });
    a.abilities.forEach((ab) => ab.displayName && out.push({ t: "Abilities", n: ab.displayName, h: `/wiki/agents/${a.slug}`, s: `${a.displayName} · ${SLOT_KEY[ab.slot] || ""}`, i: ab.displayIcon }));
  });
  weapons.forEach((w) => {
    out.push({ t: "Weapons", n: w.displayName, h: `/wiki/weapons/${w.slug}`, s: w.cat, i: w.displayIcon });
    w.skins.forEach((s) => out.push({ t: "Skins", n: s.displayName, h: `/wiki/weapons/${w.slug}?skin=${s.uuid}`, s: w.displayName, i: skinThumb(s) }));
  });
  maps.forEach((m) => out.push({ t: "Maps", n: m.displayName, h: `/wiki/maps/${m.slug}`, s: m.coordinates || "", i: m.displayIcon }));
  cards.forEach((c) => out.push({ t: "Player Cards", n: c.displayName, h: `/wiki/collection/cards?q=${encodeURIComponent(c.displayName)}`, i: c.smallArt || c.displayIcon }));
  buddies.forEach((b) => out.push({ t: "Buddies", n: b.displayName, h: `/wiki/collection/buddies?q=${encodeURIComponent(b.displayName)}`, i: b.displayIcon }));
  sprays.forEach((s) => out.push({ t: "Sprays", n: s.displayName, h: `/wiki/collection/sprays?q=${encodeURIComponent(s.displayName)}`, i: s.displayIcon }));
  titles.forEach((t) => t.titleText && out.push({ t: "Titles", n: t.titleText, h: `/wiki/collection/titles?q=${encodeURIComponent(t.titleText)}`, s: t.displayName?.replace(/ Title$/, "") || "" }));
  return NextResponse.json(out, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
