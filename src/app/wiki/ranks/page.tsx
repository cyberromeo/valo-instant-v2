import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Img } from "@/components/ui/Img";
import { getTiers } from "@/lib/valorant-api";

export const metadata: Metadata = { title: "Ranks" };

export default async function RanksPage() {
  const tiers = await getTiers();
  const groups = [...new Set(tiers.map((t) => t.divisionName))].filter((d) => d !== "UNRANKED").map((d) => ({ d, items: tiers.filter((t) => t.divisionName === d) }));
  return (
    <>
      <PageHead kicker={`COMPETITIVE · ${tiers.length - 1} TIERS`} title="Ranks" sub="From Iron to Radiant: the full competitive ladder of the current act. Immortal and Radiant are placed by rank rating against the region's leaderboard." back={{ href: "/wiki", label: "Wiki" }} />
      <ul className="grid gap-3">
        {groups.map((g) => (
          <li key={g.d} className="card p-4" style={{ borderLeft: `4px solid #${g.items[0].color.slice(0, 6)}` }}>
            <p className="font-display text-2xl uppercase leading-none" style={{ color: `#${g.items[0].color.slice(0, 6)}` }}>{g.items[0].divisionName.charAt(0) + g.items[0].divisionName.slice(1).toLowerCase()}</p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {g.items.map((t) => (
                <li key={t.tier} className="flex items-center gap-2 rounded-xl border border-line bg-ink-3 px-3 py-2 text-sm font-semibold">
                  <Img src={t.largeIcon || t.smallIcon} alt="" className="h-9 w-9 object-contain" />{t.tierName.charAt(0) + t.tierName.slice(1).toLowerCase()}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <section className="card mt-6 p-4 text-sm text-fg-2">
        <p className="kicker mb-2">HOW IT WORKS</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Five placement games unlock a rank; each win or loss moves your rank rating (RR) inside the tier, 100 RR promotes.</li>
          <li>Iron through Diamond queue with ranks up to five apart in a duo or trio. Ascendant and above have tighter limits; five-stacks of any rank can play together with reduced RR.</li>
          <li>Immortal 1–3 and Radiant are sorted by RR on the regional leaderboard: Radiant is the top 500 of each region.</li>
        </ul>
      </section>
    </>
  );
}
