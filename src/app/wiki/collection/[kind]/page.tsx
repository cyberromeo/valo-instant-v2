import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHead } from "@/components/ui/PageHead";
import { Img } from "@/components/ui/Img";
import { PagedGrid } from "@/components/wiki/PagedGrid";
import { getCurrencies, getGameModes, getLevelBorders, getSeasons, getBuddies, getCards, getSprays, getTitles, getBundles } from "@/lib/valorant-api";
import { fmtDate, num } from "@/lib/utils";

const KINDS: Record<string, { title: string; sub: string; kicker: string }> = {
  cards: { title: "Player Cards", sub: "Every player card. Tap one for the large art.", kicker: "COLLECTION" },
  buddies: { title: "Gun Buddies", sub: "Every charm that hangs off your gun.", kicker: "COLLECTION" },
  sprays: { title: "Sprays", sub: "Every spray. Animated ones play when opened.", kicker: "COLLECTION" },
  titles: { title: "Titles", sub: "Every player title. Tap to copy.", kicker: "COLLECTION" },
  bundles: { title: "Bundles", sub: "Every skin bundle ever sold in the store, newest first.", kicker: "STORE" },
  currency: { title: "Currency", sub: "Everything you spend, earn and upgrade with.", kicker: "ECONOMY" },
  seasons: { title: "Seasons", sub: "Every episode and act since launch, newest first.", kicker: "TIMELINE" },
  modes: { title: "Game Modes", sub: "Every queue and custom mode, with duration and rules.", kicker: "MODES" },
  borders: { title: "Level Borders", sub: "The border your account level earns.", kicker: "PROGRESSION" },
};

export function generateStaticParams() { return Object.keys(KINDS).map((kind) => ({ kind })); }
export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }): Promise<Metadata> { const { kind } = await params; return { title: KINDS[kind]?.title || "Collection" }; }

export default async function CollectionPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const meta = KINDS[kind];
  if (!meta) notFound();
  let kicker = `${meta.kicker}`;
  let body: React.ReactNode = null;

  if (kind === "cards" || kind === "buddies" || kind === "sprays" || kind === "titles" || kind === "bundles") {
    const count = kind === "cards" ? (await getCards()).length : kind === "buddies" ? (await getBuddies()).length : kind === "sprays" ? (await getSprays()).length : kind === "titles" ? (await getTitles()).length : (await getBundles()).length;
    kicker += ` · ${num(count)} ${meta.title.toUpperCase()}`;
    body = <Suspense fallback={<p className="text-sm text-fg-3">Loading…</p>}><PagedGrid kind={kind} /></Suspense>;
  } else if (kind === "currency") {
    const c = await getCurrencies();
    body = (
      <ul className="grid gap-3 sm:grid-cols-3">
        {c.map((x) => (
          <li key={x.uuid} className="card flex items-center gap-4 p-4">
            <Img src={x.largeIcon || x.displayIcon} alt="" className="h-14 w-14 object-contain" />
            <div><p className="font-display text-xl uppercase leading-none">{x.displayName}</p><p className="text-xs text-fg-2">{x.displayNameSingular}</p></div>
          </li>
        ))}
        <li className="card p-4 text-sm text-fg-2 sm:col-span-3">
          <p><b className="text-fg">VP</b> buys skins and the battle pass. <b className="text-fg">Radianite</b> upgrades skins. <b className="text-fg">Kingdom Credits</b> come from playing and unlock agents and agent gear.</p>
        </li>
      </ul>
    );
  } else if (kind === "seasons") {
    const seasons = await getSeasons();
    const now = Date.now();
    const parents = seasons.filter((s) => !s.parentUuid).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    kicker += ` · ${parents.length} CHAPTERS · ${seasons.length - parents.length} ACTS`;
    body = (
      <ul className="grid gap-3">
        {parents.map((p) => {
          const acts = seasons.filter((a) => a.parentUuid === p.uuid).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          return (
            <li key={p.uuid} className="card p-4">
              <div className="flex items-baseline justify-between gap-3"><p className="font-display text-2xl uppercase leading-none">{p.displayName}</p><p className="font-mono text-xs text-fg-3">{fmtDate(p.startTime)} → {fmtDate(p.endTime)}</p></div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {acts.map((a) => {
                  const live = new Date(a.startTime).getTime() <= now && new Date(a.endTime).getTime() > now;
                  const future = new Date(a.startTime).getTime() > now;
                  return <li key={a.uuid} className={`chip ${live ? "chip-on" : future ? "opacity-60" : ""}`}>{live && <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-val" />}{a.displayName} <span className="font-mono text-[10px] text-fg-3">{fmtDate(a.startTime)}</span></li>;
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    );
  } else if (kind === "modes") {
    const modes = await getGameModes();
    body = (
      <ul className="grid gap-3 sm:grid-cols-2">
        {modes.map((m) => (
          <li key={m.uuid} className="card flex gap-4 p-4">
            <Img src={m.displayIcon} alt="" className="h-12 w-12 shrink-0 object-contain invert" />
            <div className="min-w-0">
              <p className="font-display text-xl uppercase leading-none">{m.displayName}</p>
              <p className="mt-1 text-xs text-fg-2">{[m.duration, m.isTeamVoiceAllowed ? "team voice" : "no team voice", m.allowsMatchTimeouts ? "timeouts allowed" : null, m.isMinimapHidden ? "minimap hidden" : null].filter(Boolean).join(" · ")}</p>
              {m.description && <p className="mt-2 text-xs leading-relaxed text-fg-2">{m.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    );
  } else if (kind === "borders") {
    const b = await getLevelBorders();
    body = (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {b.map((x) => (
          <li key={x.uuid} className="card flex flex-col items-center gap-2 p-4 text-center">
            <Img src={x.levelNumberAppearance} alt="" className="h-16 w-auto object-contain" />
            <p className="text-sm font-bold">Level {x.startingLevel}+</p>
            <Img src={x.smallPlayerCardAppearance} alt="" className="h-10 w-auto object-contain" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <PageHead kicker={kicker} title={meta.title} sub={meta.sub} back={{ href: "/wiki", label: "Wiki" }} />
      {body}
    </>
  );
}
