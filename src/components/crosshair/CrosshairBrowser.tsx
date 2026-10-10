"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Search } from "lucide-react";
import { parseCode } from "@/lib/crosshair";
import { type XCat, type XItem, subtitle } from "@/lib/crosshair-library";
import { cn } from "@/lib/utils";
import { CrosshairScene } from "./CrosshairArt";
import { BACKGROUNDS } from "./backgrounds";
import { copyText } from "./copy";
import { useToast } from "./Toast";

const TYPES: { key: "all" | XCat; label: string }[] = [
  { key: "all", label: "All" }, { key: "pro", label: "Pros" }, { key: "style", label: "Styles" }, { key: "fun", label: "Fun" },
];

export function CrosshairBrowser({ items, families, swatches }: { items: XItem[]; families: string[]; swatches: Record<string, string> }) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [type, setType] = useState<"all" | XCat>((["pro", "style", "fun"].includes(params.get("type") || "") ? params.get("type") : "all") as "all" | XCat);
  const [fam, setFam] = useState<string | null>(null);
  const [bg, setBg] = useState("ascent");
  const [shown, setShown] = useState(48);
  const toast = useToast();

  useEffect(() => { const saved = localStorage.getItem("xhair-bg"); if (saved && BACKGROUNDS.some((b) => b.key === saved)) setBg(saved); }, []);
  const pickBg = (k: string) => { setBg(k); try { localStorage.setItem("xhair-bg", k); } catch {} };

  const parsed = useMemo(() => new Map(items.map((x) => { const r = parseCode(x.code); return [x.id, r.ok ? r.value.primary : null]; })), [items]);
  const counts = useMemo(() => ({ all: items.length, pro: items.filter((x) => x.cat === "pro").length, style: items.filter((x) => x.cat === "style").length, fun: items.filter((x) => x.cat === "fun").length }), [items]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((x) => (type === "all" || x.cat === type) && (!fam || x.family === fam) && (!s || x.name.toLowerCase().includes(s) || (x.team || "").toLowerCase().includes(s)));
  }, [items, q, type, fam]);
  useEffect(() => setShown(48), [q, type, fam]);

  const copy = async (x: XItem) => { const ok = await copyText(x.code); toast.show(ok ? `Copied ${x.name}'s code` : "Couldn't copy, long-press the code instead"); };

  return (
    <>
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative block md:max-w-sm md:flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a player, team or style" className="input pl-9" aria-label="Search crosshairs" type="search" />
        </label>
        <div className="scroll-x md:mx-0 md:px-0">
          {TYPES.map((t) => (
            <button key={t.key} type="button" onClick={() => setType(t.key)} className={cn("chip", type === t.key && "chip-on")} aria-pressed={type === t.key}>
              {t.label} <span className="text-fg-3">{counts[t.key]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-3 scroll-x" role="group" aria-label="Colour">
        <button type="button" onClick={() => setFam(null)} className={cn("chip", !fam && "chip-on")} aria-pressed={!fam}>Any colour</button>
        {families.map((f) => (
          <button key={f} type="button" onClick={() => setFam(fam === f ? null : f)} className={cn("chip", fam === f && "chip-on")} aria-pressed={fam === f}>
            <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: swatches[f] }} /> {f}
          </button>
        ))}
      </div>
      <div className="mb-4 scroll-x items-center" role="group" aria-label="Preview background">
        <span className="shrink-0 self-center text-[11px] font-semibold uppercase tracking-[.18em] text-fg-3">Backdrop</span>
        {BACKGROUNDS.map((b) => (
          <button key={b.key} type="button" onClick={() => pickBg(b.key)} className={cn("chip", bg === b.key && "chip-on")} aria-pressed={bg === b.key}>{b.label}</button>
        ))}
      </div>
      <p className="mb-3 text-xs text-fg-3">{list.length === items.length ? `${items.length} crosshairs` : `${list.length} of ${items.length} crosshairs`} · tap one for a bigger preview</p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.slice(0, shown).map((x) => {
          const c = parsed.get(x.id);
          return (
            <li key={x.id} className="card flex flex-col overflow-hidden">
              <Link href={`/crosshairs/${x.id}`} className="group block flex-1">
                <div className="relative aspect-[4/3] w-full">
                  {c && <CrosshairScene c={c} uid={`g-${x.id}`} bg={bg} size={140} maxZoom={5} />}
                </div>
                <div className="px-3 pb-2 pt-2.5">
                  <p className="break-words text-sm font-bold leading-tight group-hover:text-val">{x.name}</p>
                  <p className="mt-0.5 break-words text-xs text-fg-3">{subtitle(x)}</p>
                </div>
              </Link>
              <button type="button" onClick={() => copy(x)} className="mx-3 mb-3 mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-ink-3 py-2 text-xs font-semibold text-fg hover:border-val hover:text-val active:scale-[.98]" aria-label={`Copy ${x.name}'s crosshair code`}>
                <Copy size={14} /> Copy code
              </button>
            </li>
          );
        })}
      </ul>
      {shown < list.length && <div className="mt-5 text-center"><button type="button" className="btn-ghost" onClick={() => setShown((n) => n + 96)}>Show more ({list.length - shown} left)</button></div>}
      {list.length === 0 && <p className="py-10 text-center text-sm text-fg-3">No crosshair matches that. Try another name or clear the colour.</p>}
      {toast.node}
    </>
  );
}
