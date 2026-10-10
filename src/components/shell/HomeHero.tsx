import Link from "next/link";
import { Img } from "@/components/ui/Img";

export function HomeHero({ agent, patch, act, daysLeft }: { agent: { name: string; role: string; portrait: string | null; slug: string; colors: string[] }; patch: string; act: string; daysLeft: number }) {
  const c = (k: number) => `#${agent.colors?.[k]?.slice(0, 6) || "1f232c"}`;
  return (
    <section className="card relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${c(0)}55, ${c(1)}22 45%, #0a0b0f 95%)` }}>
      <div className="relative grid min-h-[300px] grid-cols-[1fr_140px] gap-2 p-5 sm:grid-cols-[1fr_260px] sm:p-8">
        <div className="z-10 flex flex-col justify-end">
          <p className="kicker mb-2">PATCH {patch}{act ? ` · ${act.toUpperCase()}` : ""}</p>
          <h1 className="font-display text-5xl uppercase leading-[.9] sm:text-7xl">Valo <span className="text-val">Instant</span></h1>
          <p className="mt-3 max-w-md text-sm text-fg-2">Find a Valorant party in seconds, and read the whole game: agents, weapons, {" "}skins, maps with callouts, ranks and more.</p>
          {daysLeft > 0 && <p className="mt-2 text-xs font-semibold text-teal">{daysLeft} day{daysLeft === 1 ? "" : "s"} left in the act</p>}
          <div className="mt-4 flex flex-wrap gap-2"><Link href="/party" className="btn-primary">Find a party</Link><Link href="/wiki" className="btn-ghost">Open the wiki</Link></div>
        </div>
        <Link href={`/wiki/agents/${agent.slug}`} className="relative -mb-5 -mr-5 sm:-mb-8 sm:-mr-8" aria-label={`Featured agent ${agent.name}`}>
          <Img src={agent.portrait} alt="" className="absolute inset-0 h-full w-full object-cover object-top sm:object-contain sm:object-bottom" eager />
          <span className="absolute bottom-6 right-6 rounded-full bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase text-fg-2 sm:bottom-10 sm:right-10">{agent.name} · {agent.role}</span>
        </Link>
      </div>
    </section>
  );
}
