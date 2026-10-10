import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, SlidersHorizontal } from "lucide-react";
import { PageHead } from "@/components/ui/PageHead";
import { CrosshairDetail } from "@/components/crosshair/CrosshairDetail";
import { CrosshairSvg } from "@/components/crosshair/CrosshairArt";
import { COLORS, CUSTOM_COLOR, parseCode, type Crosshair } from "@/lib/crosshair";
import { CAT_LABEL, CHECKED_ON, CROSSHAIRS, getCrosshair, subtitle } from "@/lib/crosshair-library";
import { fmtDate } from "@/lib/utils";

export const dynamicParams = false;
export function generateStaticParams() { return CROSSHAIRS.map((x) => ({ id: x.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const x = getCrosshair((await params).id);
  if (!x) return { title: "Crosshair" };
  return { title: `${x.name} crosshair`, description: `${x.name}${x.team ? ` (${x.team})` : ""} Valorant crosshair code with a live preview: ${x.code}` };
}

const onOff = (b: boolean) => (b ? "On" : "Off");
const pct = (n: number) => `${Math.round(n * 1000) / 1000}`;

function Rows({ c }: { c: Crosshair }) {
  const color = c.color === CUSTOM_COLOR ? `Custom #${(c.customHex || "FFFFFFFF").slice(0, 6)}` : COLORS[c.color]?.name ?? "White";
  const groups: [string, [string, string][]][] = [
    ["General", [["Colour", color], ["Outlines", c.outlines ? `On · ${c.outlineThickness} px · ${pct(c.outlineOpacity)}` : "Off"], ["Center dot", c.dot ? `On · ${c.dotThickness} px · ${pct(c.dotOpacity)}` : "Off"]]],
    ["Inner lines", c.inner.show ? [["Opacity", pct(c.inner.opacity)], ["Length", c.inner.splitVertical ? `${c.inner.length} × ${c.inner.vLength}` : `${c.inner.length}`], ["Thickness", `${c.inner.thickness}`], ["Offset", `${c.inner.offset}`], ["Movement error", onOff(c.inner.movementError)], ["Firing error", onOff(c.inner.firingError)]] : [["Show", "Off"]]],
    ["Outer lines", c.outer.show ? [["Opacity", pct(c.outer.opacity)], ["Length", c.outer.splitVertical ? `${c.outer.length} × ${c.outer.vLength}` : `${c.outer.length}`], ["Thickness", `${c.outer.thickness}`], ["Offset", `${c.outer.offset}`], ["Movement error", onOff(c.outer.movementError)], ["Firing error", onOff(c.outer.firingError)]] : [["Show", "Off"]]],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {groups.map(([g, rows]) => (
        <div key={g} className="card p-4">
          <p className="label">{g}</p>
          <dl className="space-y-1.5 text-sm">
            {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-fg-2">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
          </dl>
        </div>
      ))}
    </div>
  );
}

export default async function CrosshairPage({ params }: { params: Promise<{ id: string }> }) {
  const x = getCrosshair((await params).id);
  if (!x) notFound();
  const r = parseCode(x.code);
  if (!r.ok) notFound();
  const { primary, ads } = r.value;
  const related = CROSSHAIRS.filter((y) => y.id !== x.id && (x.cat === "pro" ? y.cat === "pro" && x.team && y.team === x.team && !/free agent|retired|content creator/i.test(x.team) : y.cat === x.cat)).slice(0, 6);
  return (
    <>
      <PageHead back={{ href: "/crosshairs", label: "All crosshairs" }} kicker={x.cat === "pro" ? "PRO CROSSHAIR" : CAT_LABEL[x.cat].toUpperCase()} title={x.name} sub={x.cat === "pro" ? subtitle(x) : null} />
      <CrosshairDetail c={primary} ads={ads} id={x.id} name={x.name} code={x.code} />
      <h2 className="h2 mb-3 mt-8">Settings</h2>
      <Rows c={primary} />
      <div className="mt-4 flex flex-col gap-2 text-xs text-fg-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Source: <a href={x.src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-fg-2 underline-offset-2 hover:underline">{x.srcName} <ExternalLink size={12} /></a>
          {x.updated ? ` · their page updated ${fmtDate(x.updated)}` : ""} · code checked {fmtDate(CHECKED_ON)}
        </p>
        <Link href={`/crosshairs/build?code=${encodeURIComponent(x.code)}`} className="btn-ghost"><SlidersHorizontal size={14} /> Edit in the builder</Link>
      </div>
      {related.length > 0 && (
        <>
          <h2 className="h2 mb-3 mt-8">{x.cat === "pro" ? `More from ${x.team}` : `More ${CAT_LABEL[x.cat].toLowerCase()}s`}</h2>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {related.map((y) => {
              const p = parseCode(y.code);
              return (
                <li key={y.id}>
                  <Link href={`/crosshairs/${y.id}`} className="card block overflow-hidden hover:border-line-2">
                    <div className="grid aspect-square place-items-center bg-[#2a2d34]">{p.ok && <CrosshairSvg c={p.value.primary} uid={`r-${y.id}`} size={90} />}</div>
                    <p className="break-words px-2 py-1.5 text-[11px] font-semibold leading-tight">{y.name}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
