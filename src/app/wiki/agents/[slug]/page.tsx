import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAgents } from "@/lib/valorant-api";
import { AbilityTabs } from "@/components/wiki/AbilityTabs";
import { Img } from "@/components/ui/Img";
import { ArrowLeft, ArrowRight } from "lucide-react";

export async function generateStaticParams() { return (await getAgents()).map((a) => ({ slug: a.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const a = (await getAgents()).find((x) => x.slug === slug);
  return { title: a ? `${a.displayName} · Agents` : "Agent" };
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agents = await getAgents();
  const i = agents.findIndex((a) => a.slug === slug);
  if (i < 0) notFound();
  const a = agents[i];
  const prev = agents[(i - 1 + agents.length) % agents.length];
  const next = agents[(i + 1) % agents.length];
  const mates = agents.filter((x) => x.role?.uuid === a.role?.uuid && x.uuid !== a.uuid);
  const c = (k: number) => `#${a.backgroundGradientColors?.[k]?.slice(0, 6) || "1f232c"}`;
  return (
    <article className="animate-rise">
      <Link href="/wiki/agents" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-fg-2 hover:text-fg"><ArrowLeft size={14} /> Agents</Link>
      <section className="card relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c(0)}66, ${c(1)}33 40%, #0a0b0f 90%)` }}>
        {a.background && <img src={a.background} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen" />}
        <div className="relative grid gap-4 p-5 md:grid-cols-[1fr_auto] md:p-8">
          <div className="min-w-0">
            <p className="kicker mb-2">{a.role?.displayName || "Agent"} · {a.developerName}</p>
            <h1 className="font-display text-5xl uppercase leading-[.9] sm:text-7xl">{a.displayName}</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-2">{a.description}</p>
            {a.role && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-ink/60 p-3">
                <Img src={a.role.displayIcon} alt="" className="h-8 w-8 shrink-0 invert" />
                <div><p className="text-sm font-bold">{a.role.displayName}</p><p className="text-xs text-fg-2">{a.role.description}</p></div>
              </div>
            )}
          </div>
          <div className="relative mx-auto -mb-5 h-[320px] w-full max-w-[280px] md:-mb-8 md:h-[440px] md:w-[360px] md:max-w-none">
            <Img src={a.fullPortrait} alt={a.displayName} className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,.6)]" eager />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <p className="kicker mb-1">LOADOUT</p>
        <h2 className="h2 mb-4">Abilities</h2>
        <AbilityTabs abilities={a.abilities} />
      </section>

      {mates.length > 0 && (
        <section className="mt-8">
          <p className="kicker mb-1">SAME ROLE</p>
          <h2 className="h2 mb-4">Other {a.role?.displayName}s</h2>
          <ul className="scroll-x">
            {mates.map((m) => (
              <li key={m.uuid} className="shrink-0">
                <Link href={`/wiki/agents/${m.slug}`} className="flex w-24 flex-col items-center gap-2 rounded-xl border border-line bg-ink-2 p-2 text-center text-xs font-semibold hover:border-line-2">
                  <Img src={m.displayIcon} alt="" className="h-14 w-14 rounded-lg" />{m.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm font-semibold">
        <Link href={`/wiki/agents/${prev.slug}`} className="btn-ghost"><ArrowLeft size={16} /> {prev.displayName}</Link>
        <Link href={`/wiki/agents/${next.slug}`} className="btn-ghost">{next.displayName} <ArrowRight size={16} /></Link>
      </nav>
    </article>
  );
}
