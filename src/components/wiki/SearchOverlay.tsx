"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Img } from "@/components/ui/Img";

type Item = { t: string; n: string; h: string; s?: string; i?: string | null };
let indexPromise: Promise<Item[]> | null = null;
const loadIndex = () => (indexPromise ??= fetch("/api/wiki/search").then((r) => r.json()).catch(() => { indexPromise = null; return []; }));

const TYPE_ORDER = ["Pages", "Agents", "Abilities", "Maps", "Weapons", "Skins", "Player Cards", "Buddies", "Sprays", "Titles"];

export function SearchButton() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA")) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost h-9 px-3" aria-label="Search the wiki" onMouseEnter={() => loadIndex()}>
        <Search size={16} /> <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-line px-1 font-mono text-[10px] text-fg-3 lg:inline">⌘K</kbd>
      </button>
      {open && <SearchOverlay onClose={() => setOpen(false)} />}
    </>
  );
}

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { loadIndex().then(setItems); ref.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const results = useMemo(() => {
    if (!items) return [];
    const s = q.trim().toLowerCase();
    if (!s) return items.filter((i) => i.t === "Pages" || i.t === "Agents").slice(0, 30);
    const scored = items.map((it) => {
      const n = it.n.toLowerCase();
      let score = 0;
      if (n === s) score = 100; else if (n.startsWith(s)) score = 60; else if (n.includes(s)) score = 30; else if ((it.s || "").toLowerCase().includes(s)) score = 10;
      return { it, score };
    }).filter((x) => x.score > 0);
    scored.sort((a, b) => b.score - a.score || TYPE_ORDER.indexOf(a.it.t) - TYPE_ORDER.indexOf(b.it.t));
    return scored.slice(0, 60).map((x) => x.it);
  }, [items, q]);

  useEffect(() => setSel(0), [q]);

  const go = (it: Item) => { onClose(); router.push(it.h); };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-3 pt-[12vh] backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Search">
      <div className="card w-full max-w-xl overflow-hidden animate-rise" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={18} className="text-fg-3" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Agents, abilities, weapons, skins, maps, cards…" className="h-12 flex-1 bg-transparent text-base outline-none placeholder:text-fg-3"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              if (e.key === "Enter" && results[sel]) go(results[sel]);
            }} />
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-fg-3 hover:text-fg" aria-label="Close search"><X size={18} /></button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto p-2">
          {!items && <li className="px-3 py-6 text-center text-sm text-fg-3">Loading the index…</li>}
          {items && results.length === 0 && <li className="px-3 py-6 text-center text-sm text-fg-3">Nothing matches “{q}”.</li>}
          {results.map((it, i) => (
            <li key={it.h + it.n + i}>
              <button type="button" onClick={() => go(it)} onMouseEnter={() => setSel(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${i === sel ? "bg-ink-3" : ""}`}>
                {it.i ? <Img src={it.i} alt="" className="h-8 w-8 shrink-0 rounded-md object-contain" /> : <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-ink-4 font-mono text-[10px] text-fg-3">{it.t.slice(0, 2).toUpperCase()}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{it.n}</span>
                  <span className="block truncate text-xs text-fg-3">{it.t}{it.s ? ` · ${it.s}` : ""}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
