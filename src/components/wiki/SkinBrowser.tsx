"use client";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { cn } from "@/lib/utils";

type Chroma = { id: string; name: string; img: string | null; swatch: string | null; video: string | null };
type Level = { id: string; name: string; item: string | null; video: string | null };
type Skin = { id: string; name: string; tier: string | null; icon: string | null; wallpaper: string | null; chromas: Chroma[]; levels: Level[] };
type Tier = { id: string; name: string; label: string; color: string; icon: string };

export function SkinBrowser({ weapon, skins, tiers, initial }: { weapon: string; skins: Skin[]; tiers: Tier[]; initial: string | null }) {
  const [tier, setTier] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Skin | null>(() => skins.find((s) => s.id === initial) || null);
  const [shown, setShown] = useState(48);
  const tierOf = (id: string | null) => tiers.find((t) => t.id === id);
  const list = useMemo(() => skins.filter((s) => (tier === "all" || s.tier === tier) && (!q || s.name.toLowerCase().includes(q.toLowerCase()))), [skins, tier, q]);
  useEffect(() => setShown(48), [tier, q]);
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="scroll-x sm:mx-0 sm:px-0">
          <button type="button" onClick={() => setTier("all")} className={cn("chip", tier === "all" && "chip-on")}>All editions</button>
          {tiers.map((t) => <button key={t.id} type="button" onClick={() => setTier(t.id)} className={cn("chip", tier === t.id && "chip-on")} style={tier === t.id ? { borderColor: t.color } : undefined}><img src={t.icon} alt="" className="h-3.5 w-3.5" />{t.label.replace(" Edition", "")}</button>)}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${weapon} skins`} className="input sm:ml-auto sm:max-w-xs" aria-label="Search skins" />
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.slice(0, shown).map((s) => {
          const t = tierOf(s.tier);
          return (
            <li key={s.id}>
              <button type="button" onClick={() => setOpen(s)} className="card flex h-full w-full flex-col gap-2 p-3 text-left hover:border-line-2" style={t ? { borderBottomColor: t.color } : undefined}>
                <div className="flex h-16 items-center justify-center"><Img src={s.icon} alt="" className="max-h-14 w-auto object-contain" /></div>
                <p className="mt-auto text-sm font-semibold leading-tight">{s.name}</p>
                <p className="text-[11px] text-fg-3">{t ? t.label : "Standard"}{s.chromas.length > 1 ? ` · ${s.chromas.length} variants` : ""}</p>
              </button>
            </li>
          );
        })}
      </ul>
      {shown < list.length && <div className="mt-4 text-center"><button type="button" className="btn-ghost" onClick={() => setShown((n) => n + 48)}>Show more ({list.length - shown} left)</button></div>}
      {list.length === 0 && <p className="py-10 text-center text-sm text-fg-3">No skin matches that.</p>}
      {open && <SkinSheet skin={open} tier={tierOf(open.tier)} onClose={() => setOpen(null)} />}
    </>
  );
}

function SkinSheet({ skin, tier, onClose }: { skin: Skin; tier?: Tier; onClose: () => void }) {
  const [ci, setCi] = useState(0);
  const chroma = skin.chromas[ci] || skin.chromas[0];
  const video = chroma?.video || skin.levels.map((l) => l.video).filter(Boolean).pop() || null;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={skin.name}>
      <div className="card max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-b-none sm:rounded-2xl animate-rise" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {skin.wallpaper && <img src={skin.wallpaper} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30" />}
          <div className="relative flex h-56 items-center justify-center p-6"><Img src={chroma?.img || skin.icon} alt={skin.name} className="max-h-full w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,.7)]" eager /></div>
          <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-full bg-ink/80 p-2" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-5">
          <p className="kicker mb-1" style={tier ? { color: tier.color } : undefined}>{tier ? tier.label : "Standard"}</p>
          <h3 className="h2">{skin.name}</h3>
          {skin.chromas.length > 1 && (
            <div className="mt-4">
              <p className="label">{skin.chromas.length} variants</p>
              <div className="flex flex-wrap gap-2">
                {skin.chromas.map((c, i) => (
                  <button key={c.id} type="button" onClick={() => setCi(i)} className={cn("h-10 w-10 overflow-hidden rounded-lg border-2 border-line bg-ink-3", i === ci && "border-val")} aria-label={c.name} title={c.name}>
                    {c.swatch ? <img src={c.swatch} alt="" className="h-full w-full object-cover" /> : <span className="font-mono text-xs">{i + 1}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {skin.levels.length > 1 && (
            <div className="mt-4">
              <p className="label">{skin.levels.length} upgrade levels</p>
              <ul className="flex flex-wrap gap-2 text-xs">{skin.levels.map((l, i) => <li key={l.id} className="chip">Lv {i + 1}{l.item ? ` · ${l.item}` : ""}</li>)}</ul>
            </div>
          )}
          {video && (
            <div className="mt-4">
              <p className="label">In-game preview</p>
              <video key={video} src={video} controls playsInline preload="metadata" className="w-full rounded-xl border border-line bg-black" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
