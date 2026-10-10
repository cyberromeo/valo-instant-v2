import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Pic } from "@/components/ui/Pic";
import { getAgents, getMaps, getTiers, getVersion, getWeapons } from "@/lib/valorant-api";
import { num } from "@/lib/utils";

export const metadata: Metadata = { title: "Wiki" };

export default async function WikiHome() {
  const [agents, weapons, maps, tiers, version] = await Promise.all([getAgents(), getWeapons(), getMaps(), getTiers(), getVersion()]);
  const skins = weapons.reduce((n, w) => n + w.skins.length, 0);
  const jett = agents.find((a) => a.displayName === "Jett") ?? agents[0];
  const ascent = maps.find((m) => m.displayName === "Ascent") ?? maps[0];
  const vandal = weapons.find((w) => w.displayName === "Vandal") ?? weapons[0];
  const tiles = [
    { href: "/wiki/agents", title: "Agents", sub: `${agents.length} agents · every ability`, img: jett.fullPortrait, tall: true },
    { href: "/wiki/weapons", title: "Arsenal", sub: `${weapons.length} weapons · ${num(skins)} skins`, img: vandal.displayIcon, contain: true },
    { href: "/wiki/maps", title: "Maps", sub: `${maps.length} maps · callouts`, img: ascent.splash },
    { href: "/wiki/ranks", title: "Ranks", sub: `${tiers.length} tiers, Iron to Radiant`, img: tiers[tiers.length - 1]?.largeIcon, contain: true },
    { href: "/wiki/collection/cards", title: "Player Cards", sub: "every card, large art" },
    { href: "/wiki/collection/buddies", title: "Gun Buddies", sub: "every charm" },
    { href: "/wiki/collection/sprays", title: "Sprays", sub: "animated ones play" },
    { href: "/wiki/collection/titles", title: "Titles", sub: "tap to copy" },
    { href: "/wiki/collection/bundles", title: "Bundles", sub: "every skin bundle" },
    { href: "/wiki/collection/seasons", title: "Seasons", sub: "episodes & acts" },
    { href: "/wiki/collection/modes", title: "Game Modes", sub: "rules & durations" },
    { href: "/wiki/collection/currency", title: "Currency", sub: "VP, RP, KC" },
    { href: "/wiki/collection/borders", title: "Level Borders", sub: "account levels" },
    { href: "/crosshairs", title: "Crosshairs", sub: "pro codes, live previews" },
    { href: "/wiki/trainer", title: "Aim Trainer", sub: "Shoot the Blind, 30 s", accent: true },
  ];
  return (
    <>
      <PageHead kicker={`PATCH ${version.version.split(".").slice(0, 2).join(".")} · ${num(skins)} SKINS`} title="The whole game" sub="Agents, weapons, skins, maps with callouts, ranks and the full collection, straight from the game files and updated every patch." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className={`card group relative overflow-hidden p-4 transition hover:border-line-2 ${t.tall ? "row-span-2 min-h-[260px]" : "min-h-[116px]"} ${t.accent ? "border-val/50 bg-val/10" : ""}`}>
            {t.img && <Pic src={t.img} alt="" sizes="(min-width: 768px) 25vw, 50vw" className={`pointer-events-none opacity-60 transition group-hover:scale-105 ${t.contain ? "object-contain p-6" : "object-cover"}`} />}
            <div className="relative flex h-full flex-col justify-end">
              <span className="h2 drop-shadow">{t.title}</span>
              <span className="text-xs text-fg-2">{t.sub}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
