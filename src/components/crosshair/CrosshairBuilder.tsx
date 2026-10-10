"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, RotateCcw } from "lucide-react";
import { COLORS, CUSTOM_COLOR, DEFAULT_CROSSHAIR, cloneCrosshair, encode, parseCode, type Crosshair, type Lines } from "@/lib/crosshair";
import { cn } from "@/lib/utils";
import { CrosshairScene } from "./CrosshairArt";
import { BACKGROUNDS } from "./backgrounds";
import { copyText } from "./copy";
import { useToast } from "./Toast";

function Slider({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-semibold text-fg-2"><span>{label}</span><span className="font-mono text-fg">{Math.round(value * 1000) / 1000}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1.5 w-full accent-[#ff4655]" />
    </label>
  );
}
function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 py-1 text-sm font-semibold">
      <span>{label}</span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full border transition", on ? "border-val bg-val" : "border-line bg-ink-4")}>
        <span className={cn("absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all", on ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}

export function CrosshairBuilder() {
  const params = useSearchParams();
  const [c, setC] = useState<Crosshair>(() => cloneCrosshair(DEFAULT_CROSSHAIR));
  const [bg, setBg] = useState("ascent");
  const [paste, setPaste] = useState("");
  const [pasteErr, setPasteErr] = useState("");
  const [hexIn, setHexIn] = useState("FFFFFF");
  const toast = useToast();

  useEffect(() => {
    const code = params.get("code");
    if (code) { const r = parseCode(code); if (r.ok) { setC(r.value.primary); setHexIn((r.value.primary.customHex || "FFFFFFFF").slice(0, 6)); } }
    const saved = localStorage.getItem("xhair-bg"); if (saved && BACKGROUNDS.some((b) => b.key === saved)) setBg(saved);
  }, [params]);

  const code = useMemo(() => encode(c), [c]);
  const set = (patch: Partial<Crosshair>) => setC((p) => ({ ...p, ...patch }));
  const setLines = (k: "inner" | "outer", patch: Partial<Lines>) => setC((p) => ({ ...p, [k]: { ...p[k], ...patch } }));
  const load = () => {
    const r = parseCode(paste);
    if (!r.ok) { setPasteErr(`That code doesn't work: ${r.error}.`); return; }
    setPasteErr(""); setC(r.value.primary); setHexIn((r.value.primary.customHex || "FFFFFFFF").slice(0, 6)); toast.show("Loaded");
  };
  const copy = async () => { const ok = await copyText(code); toast.show(ok ? "Copied" : "Couldn't copy, select the code instead"); };

  const lineControls = (k: "inner" | "outer", title: string) => {
    const l = c[k];
    return (
      <section className="card p-4">
        <Toggle label={title} on={l.show} onChange={(v) => setLines(k, { show: v })} />
        {l.show && (
          <div className="mt-3 space-y-3">
            <Slider label="Opacity" value={l.opacity} min={0} max={1} step={0.05} onChange={(v) => setLines(k, { opacity: v })} />
            <Slider label="Length" value={l.length} min={0} max={20} onChange={(v) => setLines(k, { length: v, vLength: l.splitVertical ? l.vLength : v })} />
            <Toggle label="Separate vertical length" on={l.splitVertical} onChange={(v) => setLines(k, { splitVertical: v, vLength: l.length })} />
            {l.splitVertical && <Slider label="Vertical length" value={l.vLength} min={0} max={20} onChange={(v) => setLines(k, { vLength: v })} />}
            <Slider label="Thickness" value={l.thickness} min={0} max={10} onChange={(v) => setLines(k, { thickness: v })} />
            <Slider label="Offset" value={l.offset} min={0} max={k === "inner" ? 20 : 40} onChange={(v) => setLines(k, { offset: v })} />
            <Toggle label="Movement error" on={l.movementError} onChange={(v) => setLines(k, { movementError: v })} />
            <Toggle label="Firing error" on={l.firingError} onChange={(v) => setLines(k, { firingError: v })} />
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] [&>*]:min-w-0">
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="card relative aspect-[16/10] w-full overflow-hidden">
          <CrosshairScene c={c} uid="builder" bg={bg} size={360} scale={4} priority />
        </div>
        <div className="mt-3 scroll-x" role="group" aria-label="Background">
          {BACKGROUNDS.map((b) => <button key={b.key} type="button" onClick={() => setBg(b.key)} className={cn("chip", bg === b.key && "chip-on")} aria-pressed={bg === b.key}>{b.label}</button>)}
        </div>
        <div className="card mt-3 p-4">
          <p className="label">Your code</p>
          <p className="select-all break-all rounded-xl border border-line bg-ink-3 p-3 font-mono text-[13px] leading-relaxed">{code}</p>
          {code === "0" && <p className="mt-2 text-xs text-fg-3">That&apos;s the game&apos;s default crosshair. Change anything and the code grows.</p>}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={copy} className="btn-primary flex-1"><Copy size={16} /> Copy code</button>
            <button type="button" onClick={() => { setC(cloneCrosshair(DEFAULT_CROSSHAIR)); setHexIn("FFFFFF"); }} className="btn-ghost" aria-label="Start over"><RotateCcw size={16} /> Reset</button>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <section className="card p-4">
          <p className="label">Start from a code</p>
          <div className="flex gap-2">
            <input value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste any crosshair code" className="input font-mono" aria-label="Paste a crosshair code" />
            <button type="button" onClick={load} className="btn-ghost shrink-0">Load</button>
          </div>
          {pasteErr && <p className="mt-2 text-xs text-val">{pasteErr}</p>}
        </section>
        <section className="card p-4">
          <p className="label">Colour</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((col, i) => (
              <button key={col.name} type="button" onClick={() => set({ color: i })} className={cn("chip", c.color === i && "chip-on")} aria-pressed={c.color === i}>
                <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: col.hex }} /> {col.name}
              </button>
            ))}
            <button type="button" onClick={() => set({ color: CUSTOM_COLOR, customHex: `${hexIn}FF`.toUpperCase() })} className={cn("chip", c.color === CUSTOM_COLOR && "chip-on")} aria-pressed={c.color === CUSTOM_COLOR}>Custom</button>
          </div>
          {c.color === CUSTOM_COLOR && (
            <div className="mt-3 flex items-center gap-2">
              <input type="color" value={`#${/^[0-9a-fA-F]{6}$/.test(hexIn) ? hexIn : "FFFFFF"}`} onChange={(e) => { const h = e.target.value.slice(1).toUpperCase(); setHexIn(h); set({ customHex: `${h}FF` }); }} className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-ink-3" aria-label="Pick a colour" />
              <input value={hexIn} maxLength={6} onChange={(e) => { const h = e.target.value.replace(/[^0-9a-fA-F]/g, "").toUpperCase(); setHexIn(h); if (h.length === 6) set({ customHex: `${h}FF` }); }} className="input max-w-[140px] font-mono uppercase" aria-label="Hex colour" />
            </div>
          )}
          <div className="mt-4 space-y-3 border-t border-line pt-3">
            <Toggle label="Outlines" on={c.outlines} onChange={(v) => set({ outlines: v })} />
            {c.outlines && <><Slider label="Outline opacity" value={c.outlineOpacity} min={0} max={1} step={0.05} onChange={(v) => set({ outlineOpacity: v })} /><Slider label="Outline thickness" value={c.outlineThickness} min={1} max={6} onChange={(v) => set({ outlineThickness: v })} /></>}
            <Toggle label="Center dot" on={c.dot} onChange={(v) => set({ dot: v })} />
            {c.dot && <><Slider label="Center dot opacity" value={c.dotOpacity} min={0} max={1} step={0.05} onChange={(v) => set({ dotOpacity: v })} /><Slider label="Center dot thickness" value={c.dotThickness} min={1} max={6} onChange={(v) => set({ dotThickness: v })} /></>}
          </div>
        </section>
        {lineControls("inner", "Inner lines")}
        {lineControls("outer", "Outer lines")}
      </div>
      {toast.node}
    </div>
  );
}
