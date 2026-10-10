import Link from "next/link";
import { ArrowRight, Radio, Users } from "lucide-react";
import { currentAct, getAgents, getMaps, getVersion, getWeapons } from "@/lib/valorant-api";
import { getRiotStatus } from "@/lib/riot-status";
import { getEsportsNews } from "@/lib/news";
import { Img } from "@/components/ui/Img";
import { num } from "@/lib/utils";
import { HomeHero } from "@/components/shell/HomeHero";

export const revalidate = 300;

export default async function Home() {
  const [agents, maps, weapons, version, act, ap, news] = await Promise.all([getAgents(), getMaps(), getWeapons(), getVersion(), currentAct(), getRiotStatus("ap"), getEsportsNews(4)]);
  const featured = agents[new Date().getUTCDate() % agents.length];
  const pool = maps.filter((m) => m.competitive);
  const skins = weapons.reduce((n, w) => n + w.skins.length, 0);
  const incidents = ap?.incidents?.length ?? 0;
  return (
    <div className="animate-rise">
      <HomeHero agent={{ name: featured.displayName, role: featured.role?.displayName || "", portrait: featured.fullPortrait, slug: featured.slug, colors: featured.backgroundGradientColors }} patch={version.version.split(".").slice(0, 2).join(".")} act={act.act ? `${act.parent?.displayName || ""} · ${act.act.displayName}` : ""} daysLeft={act.daysLeft} />

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link href="/party" className="card col-span-2 flex items-center gap-4 border-val/40 bg-val/10 p-4 md:col-span-2">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-val text-white"><Users /></span>
          <span className="min-w-0"><span className="block font-display text-2xl uppercase leading-none">Find a party</span><span className="block text-xs text-fg-2">Live parties by region, mode, rank and agent. Copy a code, join in game.</span></span>
          <ArrowRight className="ml-auto shrink-0 text-val" />
        </Link>
        <Link href="/status" className="card flex items-center gap-3 p-4">
          <span className={`h-3 w-3 shrink-0 rounded-full ${incidents ? "bg-val" : "bg-teal animate-pulseDot"}`} />
          <span className="min-w-0"><span className="block text-sm font-bold">Servers</span><span className="block truncate text-xs text-fg-2">{ap ? (incidents ? `${incidents} incident in AP` : "AP all normal") : "Status unavailable"}</span></span>
        </Link>
        <Link href="/news" className="card flex items-center gap-3 p-4">
          <Radio className="shrink-0 text-teal" />
          <span className="min-w-0"><span className="block text-sm font-bold">Esports</span><span className="block truncate text-xs text-fg-2">{news[0]?.title || "Latest news"}</span></span>
        </Link>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between"><div><p className="kicker">{pool.length} MAPS IN ROTATION</p><h2 className="h2">Map pool</h2></div><Link href="/wiki/maps" className="text-xs font-bold text-val">All maps</Link></div>
        <ul className="scroll-x">
          {pool.map((m) => (
            <li key={m.uuid} className="shrink-0">
              <Link href={`/wiki/maps/${m.slug}`} className="block w-44 overflow-hidden rounded-xl border border-line bg-ink-2 hover:border-line-2">
                <Img src={m.listViewIcon || m.splash} alt="" className="h-24 w-full object-cover" />
                <p className="p-2 text-xs font-bold">{m.displayName}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between"><div><p className="kicker">{agents.length} AGENTS</p><h2 className="h2">Agents</h2></div><Link href="/wiki/agents" className="text-xs font-bold text-val">All agents</Link></div>
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
          {agents.map((a) => (
            <li key={a.uuid}><Link href={`/wiki/agents/${a.slug}`} className="block overflow-hidden rounded-xl border border-line bg-ink-2 hover:border-val" title={a.displayName}><Img src={a.displayIcon} alt={a.displayName} className="aspect-square w-full" /></Link></li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { href: "/wiki/weapons", t: "Arsenal", s: `${weapons.length} weapons · ${num(skins)} skins` },
          { href: "/wiki/ranks", t: "Ranks", s: "Iron to Radiant" },
          { href: "/wiki/collection/cards", t: "Collection", s: "cards, buddies, sprays, titles" },
          { href: "/wiki/trainer", t: "Aim trainer", s: "Shoot the Blind" },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="card p-4 hover:border-line-2"><span className="block font-display text-xl uppercase leading-none">{x.t}</span><span className="block text-xs text-fg-2">{x.s}</span></Link>
        ))}
      </section>

      {news.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between"><div><p className="kicker">ESPORTS</p><h2 className="h2">Headlines</h2></div><Link href="/news" className="text-xs font-bold text-val">More</Link></div>
          <ul className="grid gap-2 sm:grid-cols-2">{news.map((n) => <li key={n.link}><a href={n.link} target="_blank" rel="noreferrer" className="card block p-3 text-sm font-semibold leading-snug hover:border-line-2">{n.title}</a></li>)}</ul>
        </section>
      )}
    </div>
  );
}
