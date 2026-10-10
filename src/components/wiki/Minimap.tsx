"use client";
import { useMemo, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type C = { name: string; region: string; x: number; y: number };

export function Minimap({ src, callouts }: { src: string; callouts: C[] }) {
  const [show, setShow] = useState(true);
  const [region, setRegion] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const regions = useMemo(() => [...new Set(callouts.map((c) => c.region))], [callouts]);
  const Map = ({ big }: { big?: boolean }) => (
    <div className={cn("relative mx-auto aspect-square w-full overflow-hidden rounded-2xl border border-line bg-ink-2", big ? "max-w-[min(92vw,92vh)]" : "max-w-2xl")}>
      <img src={src} alt="Minimap" className="h-full w-full object-contain" />
      {show && callouts.map((c, i) => (
        <span key={i} className="callout" data-dim={region ? String(region !== c.region) : "false"} data-hot={region ? String(region === c.region) : "false"} style={{ left: `${(c.x * 100).toFixed(2)}%`, top: `${(c.y * 100).toFixed(2)}%`, fontSize: big ? 12 : undefined }}>{c.name}</span>
      ))}
    </div>
  );
  return (
    <div className="card p-3 sm:p-4">
      {callouts.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShow((s) => !s)} className={cn("chip", show && "chip-on")}>Callouts {show ? "on" : "off"}</button>
          <button type="button" onClick={() => setRegion(null)} className={cn("chip", !region && "chip-on")}>All areas</button>
          {regions.map((r) => <button key={r} type="button" onClick={() => setRegion(region === r ? null : r)} className={cn("chip", region === r && "chip-on")}>{r}</button>)}
          <button type="button" onClick={() => setFull(true)} className="chip ml-auto"><Maximize2 size={12} /> Full screen</button>
        </div>
      )}
      <Map />
      {regions.length > 0 && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {regions.map((r) => (
            <li key={r} className="rounded-xl border border-line bg-ink-3 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-teal">{r}</p>
              <p className="mt-1 text-xs leading-relaxed text-fg-2">{callouts.filter((c) => c.region === r).map((c) => c.name).sort().join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}
      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3" onClick={() => setFull(false)} role="dialog" aria-modal="true" aria-label="Minimap full screen">
          <div onClick={(e) => e.stopPropagation()} className="w-full"><Map big /></div>
          <button type="button" onClick={() => setFull(false)} className="absolute right-4 top-4 rounded-full bg-ink/80 p-2" aria-label="Close"><X size={20} /></button>
        </div>
      )}
    </div>
  );
}
