import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getMaps } from "@/lib/valorant-api";
import { Minimap } from "@/components/wiki/Minimap";
import { Img } from "@/components/ui/Img";

export async function generateStaticParams() { return (await getMaps()).map((m) => ({ slug: m.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const m = (await getMaps()).find((x) => x.slug === slug);
  return { title: m ? `${m.displayName} · Maps` : "Map" };
}

export default async function MapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const maps = await getMaps();
  const m = maps.find((x) => x.slug === slug);
  if (!m) notFound();
  const callouts = (m.callouts || [])
    .map((c) => ({ name: c.regionName, region: c.superRegionName, x: c.location.y * m.xMultiplier + m.xScalarToAdd, y: c.location.x * m.yMultiplier + m.yScalarToAdd }))
    .filter((c) => c.x > 0 && c.x < 1 && c.y > 0 && c.y < 1);
  const others = maps.filter((x) => x.uuid !== m.uuid && x.competitive === m.competitive);
  return (
    <article className="animate-rise">
      <Link href="/wiki/maps" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-fg-2 hover:text-fg"><ArrowLeft size={14} /> Maps</Link>
      <section className="card relative overflow-hidden">
        <Img src={m.splash} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" eager />
        <div className="relative bg-gradient-to-t from-ink via-ink/70 to-transparent p-5 pt-28 md:p-8 md:pt-40">
          <p className="kicker mb-1">{m.competitive ? "COMPETITIVE POOL" : "MODE MAP"} · {m.coordinates || "Classified"}</p>
          <h1 className="font-display text-5xl uppercase leading-[.9] sm:text-7xl">{m.displayName}</h1>
          {m.tacticalDescription && <p className="mt-2 text-sm font-semibold text-teal">{m.tacticalDescription}</p>}
          {m.narrativeDescription && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-2">{m.narrativeDescription}</p>}
        </div>
      </section>
      {m.displayIcon ? (
        <section className="mt-6">
          <p className="kicker mb-1">TACTICAL VIEW</p>
          <h2 className="h2 mb-4">Minimap{callouts.length ? " & callouts" : ""}</h2>
          <Minimap src={m.displayIcon} callouts={callouts} />
        </section>
      ) : <p className="mt-6 text-sm text-fg-2">No minimap is published for this map.</p>}
      {others.length > 0 && (
        <section className="mt-8">
          <p className="kicker mb-1">MORE MAPS</p>
          <ul className="scroll-x">
            {others.map((o) => (
              <li key={o.uuid} className="shrink-0">
                <Link href={`/wiki/maps/${o.slug}`} className="block w-40 overflow-hidden rounded-xl border border-line bg-ink-2 hover:border-line-2">
                  <Img src={o.listViewIcon || o.splash} alt="" className="h-20 w-full object-cover" />
                  <p className="p-2 text-xs font-semibold">{o.displayName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
