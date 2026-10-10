import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { Img } from "@/components/ui/Img";
import { getWeapons, WEAPON_LABEL, WEAPON_ORDER } from "@/lib/valorant-api";
import { num } from "@/lib/utils";

export const metadata: Metadata = { title: "Arsenal" };

export default async function WeaponsPage() {
  const weapons = await getWeapons();
  const skins = weapons.reduce((n, w) => n + w.skins.length, 0);
  const groups = WEAPON_ORDER.map((c) => ({ c, label: WEAPON_LABEL[c] || c, items: weapons.filter((w) => w.cat === c) })).filter((g) => g.items.length);
  return (
    <>
      <PageHead kicker={`${weapons.length} WEAPONS · ${num(skins)} SKINS`} title="Arsenal" sub="Every gun by class with cost and fire rate. Tap one for handling stats, damage by range and every skin." back={{ href: "/wiki", label: "Wiki" }} />
      <div className="scroll-x mb-5 sm:mx-0 sm:px-0">
        {groups.map((g) => <a key={g.c} href={`#${g.c.toLowerCase()}`} className="chip">{g.label}</a>)}
      </div>
      {groups.map((g) => (
        <section key={g.c} id={g.c.toLowerCase()} className="mb-8 scroll-mt-20">
          <h2 className="h2 mb-3">{g.label}</h2>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {g.items.map((w) => (
              <li key={w.uuid}>
                <Link href={`/wiki/weapons/${w.slug}`} className="card group flex h-full flex-col gap-2 p-3 hover:border-line-2">
                  <div className="flex h-20 items-center justify-center"><Img src={w.displayIcon} alt={w.displayName} className="max-h-16 w-auto object-contain transition group-hover:scale-105" /></div>
                  <div className="mt-auto">
                    <p className="font-display text-xl uppercase leading-none">{w.displayName}</p>
                    <p className="text-xs text-fg-2">{w.shopData ? `${num(w.shopData.cost)} credits` : "Free"}{w.weaponStats ? ` · ${w.weaponStats.fireRate} rounds/s` : ""} · {w.skins.length} skins</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
