import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getContentTiers, getWeapons, skinThumb } from "@/lib/valorant-api";
import { enumLabel, num } from "@/lib/utils";
import { Img } from "@/components/ui/Img";
import { SkinBrowser } from "@/components/wiki/SkinBrowser";

export async function generateStaticParams() { return (await getWeapons()).map((w) => ({ slug: w.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const w = (await getWeapons()).find((x) => x.slug === slug);
  return { title: w ? `${w.displayName} · Arsenal` : "Weapon" };
}

function Stat({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs"><span className="text-fg-2">{label}</span><span className="font-mono font-semibold">{value}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-4"><div className="h-full rounded-full bg-val" style={{ width: `${Math.max(2, Math.min(100, pct))}%` }} /></div>
    </div>
  );
}

export default async function WeaponPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ skin?: string }> }) {
  const { slug } = await params;
  const { skin } = await searchParams;
  const [weapons, tiers] = await Promise.all([getWeapons(), getContentTiers()]);
  const w = weapons.find((x) => x.slug === slug);
  if (!w) notFound();
  const s = w.weaponStats;
  const skins = w.skins.map((sk) => ({
    id: sk.uuid, name: sk.displayName, tier: sk.contentTierUuid, icon: skinThumb(sk), wallpaper: sk.wallpaper,
    chromas: (sk.chromas || []).filter((c) => c.fullRender || c.displayIcon).map((c) => ({ id: c.uuid, name: c.displayName, img: c.fullRender || c.displayIcon, swatch: c.swatch, video: c.streamedVideo })),
    levels: (sk.levels || []).map((l) => ({ id: l.uuid, name: l.displayName, item: l.levelItem ? enumLabel(l.levelItem) : null, video: l.streamedVideo })),
  }));
  const tierList = tiers.map((t) => ({ id: t.uuid, name: t.devName, label: t.displayName, color: `#${t.highlightColor.slice(0, 6)}`, icon: t.displayIcon }));
  return (
    <article className="animate-rise">
      <Link href="/wiki/weapons" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-fg-2 hover:text-fg"><ArrowLeft size={14} /> Arsenal</Link>
      <section className="card grid gap-5 p-5 md:grid-cols-2 md:p-8">
        <div>
          <p className="kicker mb-1">{w.cat} · {w.shopData ? `${num(w.shopData.cost)} credits` : "Free"}</p>
          <h1 className="font-display text-5xl uppercase leading-[.9] sm:text-7xl">{w.displayName}</h1>
          <div className="my-5 flex h-28 items-center"><Img src={w.displayIcon} alt="" className="max-h-28 w-auto object-contain" eager /></div>
          {s && (
            <div className="grid gap-3">
              <Stat label="Fire rate" value={`${s.fireRate} / s`} pct={(s.fireRate / 16) * 100} />
              <Stat label="Magazine" value={`${s.magazineSize}`} pct={(s.magazineSize / 100) * 100} />
              <Stat label="Reload" value={`${s.reloadTimeSeconds} s`} pct={(s.reloadTimeSeconds / 5) * 100} />
              <Stat label="Equip" value={`${s.equipTimeSeconds} s`} pct={(s.equipTimeSeconds / 1.5) * 100} />
              <Stat label="Run speed" value={`${Math.round(s.runSpeedMultiplier * 100)}%`} pct={s.runSpeedMultiplier * 100} />
              <Stat label="First shot spread" value={`${s.firstBulletAccuracy}`} pct={(s.firstBulletAccuracy / 1.2) * 100} />
            </div>
          )}
          {s && (
            <ul className="mt-4 flex flex-wrap gap-2 text-xs">
              <li className="chip">Wall pen: {enumLabel(s.wallPenetration)}</li>
              {s.fireMode && <li className="chip">{enumLabel(s.fireMode)}</li>}
              {s.altFireType && <li className="chip">Alt: {enumLabel(s.altFireType)}</li>}
              {s.feature && <li className="chip">{enumLabel(s.feature)}</li>}
              {s.adsStats && <li className="chip">ADS {s.adsStats.zoomMultiplier}× · {s.adsStats.fireRate}/s</li>}
              {s.shotgunPelletCount > 1 && <li className="chip">{s.shotgunPelletCount} pellets</li>}
            </ul>
          )}
        </div>
        <div>
          <p className="kicker mb-1">DAMAGE BY RANGE</p>
          {s?.damageRanges?.length ? (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-fg-3"><th className="py-2 font-semibold">Range</th><th className="py-2 font-semibold">Head</th><th className="py-2 font-semibold">Body</th><th className="py-2 font-semibold">Legs</th></tr></thead>
              <tbody>
                {s.damageRanges.map((d) => (
                  <tr key={d.rangeStartMeters} className="border-t border-line">
                    <td className="py-2 font-mono text-xs">{d.rangeStartMeters}–{d.rangeEndMeters} m</td>
                    <td className="py-2 font-mono font-bold text-val">{Math.round(d.headDamage)}</td>
                    <td className="py-2 font-mono">{Math.round(d.bodyDamage)}</td>
                    <td className="py-2 font-mono text-fg-2">{Math.round(d.legDamage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-fg-2">Melee: 50 damage, 75 in the back. No range table for a knife.</p>}
          {w.shopData && <p className="mt-4 text-xs text-fg-3">Shop category: {w.shopData.categoryText}.</p>}
        </div>
      </section>

      <section className="mt-6">
        <p className="kicker mb-1">{skins.length} SKINS</p>
        <h2 className="h2 mb-4">Skins</h2>
        <SkinBrowser weapon={w.displayName} skins={skins} tiers={tierList} initial={skin || null} />
      </section>
    </article>
  );
}
