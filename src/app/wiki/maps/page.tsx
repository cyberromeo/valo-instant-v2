import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Img } from "@/components/ui/Img";
import { getMaps } from "@/lib/valorant-api";

export const metadata: Metadata = { title: "Maps" };

export default async function MapsPage() {
  const maps = await getMaps();
  const comp = maps.filter((m) => m.competitive);
  const other = maps.filter((m) => !m.competitive);
  const Grid = ({ items }: { items: typeof maps }) => (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => (
        <li key={m.uuid}>
          <Link href={`/wiki/maps/${m.slug}`} className="card group relative block aspect-[16/9] overflow-hidden">
            <Img src={m.splash} alt="" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/60 to-transparent p-3 pt-10">
              <p className="font-display text-2xl uppercase leading-none">{m.displayName}</p>
              <p className="text-xs text-fg-2">{m.coordinates || "Classified"}{m.callouts?.length ? ` · ${m.callouts.length} callouts` : ""}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      <PageHead kicker={`${maps.length} MAPS`} title="Maps" sub="Every battleground. Tap one for its minimap with every callout plotted." back={{ href: "/wiki", label: "Wiki" }} />
      <h2 className="h2 mb-3">Competitive pool</h2>
      <Grid items={comp} />
      {other.length > 0 && <><h2 className="h2 mb-3 mt-8">Mode maps</h2><Grid items={other} /></>}
    </>
  );
}
