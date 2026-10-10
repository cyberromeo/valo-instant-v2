"use client";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import type { Crosshair } from "@/lib/crosshair";
import { cn } from "@/lib/utils";
import { CrosshairScene } from "./CrosshairArt";
import { BACKGROUNDS } from "./backgrounds";
import { copyText } from "./copy";
import { useToast } from "./Toast";

const ZOOMS: { key: string; label: string; v: number | "fit" }[] = [
  { key: "fit", label: "Zoomed", v: "fit" }, { key: "1", label: "Real size", v: 1 }, { key: "2", label: "2×", v: 2 }, { key: "4", label: "4×", v: 4 },
];

export function CrosshairDetail({ c, ads, id, name, code }: { c: Crosshair; ads: Crosshair | null; id: string; name: string; code: string }) {
  const [bg, setBg] = useState("ascent");
  const [zoom, setZoom] = useState("fit");
  const [view, setView] = useState<"primary" | "ads">("primary");
  const toast = useToast();
  useEffect(() => { const saved = localStorage.getItem("xhair-bg"); if (saved && BACKGROUNDS.some((b) => b.key === saved)) setBg(saved); }, []);
  const pickBg = (k: string) => { setBg(k); try { localStorage.setItem("xhair-bg", k); } catch {} };
  const shown = view === "ads" && ads ? ads : c;
  const copy = async () => { const ok = await copyText(code); toast.show(ok ? "Copied" : "Couldn't copy, select the code instead"); };
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
      <div>
        <div className="card relative aspect-[16/10] w-full overflow-hidden">
          <CrosshairScene c={shown} uid={`d-${id}-${view}`} bg={bg} size={360} scale={ZOOMS.find((z) => z.key === zoom)!.v} priority />
          {zoom === "1" && <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white/90">As it looks on a 1080p screen</span>}
        </div>
        <div className="mt-3 scroll-x" role="group" aria-label="Background">
          {BACKGROUNDS.map((b) => <button key={b.key} type="button" onClick={() => pickBg(b.key)} className={cn("chip", bg === b.key && "chip-on")} aria-pressed={bg === b.key}>{b.label}</button>)}
        </div>
        <div className="mt-2 scroll-x" role="group" aria-label="Zoom">
          {ZOOMS.map((z) => <button key={z.key} type="button" onClick={() => setZoom(z.key)} className={cn("chip", zoom === z.key && "chip-on")} aria-pressed={zoom === z.key}>{z.label}</button>)}
          {ads && (
            <>
              <span className="mx-1 w-px shrink-0 bg-line" aria-hidden="true" />
              <button type="button" onClick={() => setView("primary")} className={cn("chip", view === "primary" && "chip-on")}>Primary</button>
              <button type="button" onClick={() => setView("ads")} className={cn("chip", view === "ads" && "chip-on")}>Aiming down sights</button>
            </>
          )}
        </div>
      </div>
      <div className="card p-4">
        <p className="label">Crosshair code</p>
        <p className="select-all break-all rounded-xl border border-line bg-ink-3 p-3 font-mono text-[13px] leading-relaxed text-fg">{code}</p>
        <button type="button" onClick={copy} className="btn-primary mt-3 w-full" aria-label={`Copy ${name}'s crosshair code`}><Copy size={16} /> Copy code</button>
        <p className="mt-3 text-xs text-fg-2">In game: Settings → Crosshair → Import profile code, paste, done.</p>
      </div>
      {toast.node}
    </div>
  );
}
