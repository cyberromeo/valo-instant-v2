"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Copy, X } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { cn } from "@/lib/utils";

type Item = { id: string; name: string; icon?: string | null; large?: string | null; wide?: string | null; gif?: string | null; sub?: string | null; desc?: string | null; cat?: string | null };
type Kind = "cards" | "buddies" | "sprays" | "titles" | "bundles";

export function PagedGrid({ kind }: { kind: Kind }) {
  const params = useSearchParams();
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState(params.get("q") || "");
  const [shown, setShown] = useState(60);
  const [open, setOpen] = useState<Item | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/wiki/collection?kind=${kind}`).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setItems).catch((e) => setErr(e.message));
  }, [kind]);
  const list = useMemo(() => (items || []).filter((i) => !q || i.name?.toLowerCase().includes(q.toLowerCase()) || i.sub?.toLowerCase().includes(q.toLowerCase())), [items, q]);
  useEffect(() => setShown(60), [q]);

  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); setCopied(t); setTimeout(() => setCopied(null), 1400); } catch {} };

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className="input max-w-sm" aria-label="Search" />
        <span className="text-xs text-fg-3">{items ? `${list.length.toLocaleString()} shown` : "Loading…"}</span>
      </div>
      {err && <p className="text-sm text-val">Could not load this list ({err}). Pull to refresh.</p>}
      {!items && !err && <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 18 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-ink-3" />)}</div>}
      {items && kind === "titles" && (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, shown).map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => copy(t.name)} className="card flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:border-line-2">
                <span><span className="block text-sm font-semibold">{t.name}</span>{t.sub && <span className="block text-xs text-fg-3">{t.sub}</span>}</span>
                {copied === t.name ? <Check size={16} className="text-teal" /> : <Copy size={16} className="text-fg-3" />}
              </button>
            </li>
          ))}
        </ul>
      )}
      {items && kind === "bundles" && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, shown).map((b) => (
            <li key={b.id} className="card overflow-hidden">
              <Img src={b.icon} alt="" className="aspect-video w-full object-cover" />
              <div className="p-3"><p className="text-sm font-bold">{b.name}</p>{b.sub && <p className="text-xs text-fg-3">{b.sub}</p>}{b.desc && <p className="mt-1 line-clamp-3 text-xs text-fg-2">{b.desc}</p>}</div>
            </li>
          ))}
        </ul>
      )}
      {items && (kind === "cards" || kind === "buddies" || kind === "sprays") && (
        <ul className={cn("grid gap-3", kind === "cards" ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6" : "grid-cols-3 sm:grid-cols-5 lg:grid-cols-8")}>
          {list.slice(0, shown).map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setOpen(c)} className="card block w-full overflow-hidden text-left hover:border-line-2">
                <Img src={c.icon} alt={c.name} className={cn("w-full object-contain bg-ink-3", kind === "cards" ? "aspect-square object-cover" : "aspect-square p-2")} />
                <p className="truncate px-2 py-1.5 text-[11px] font-semibold" title={c.name}>{c.name}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
      {items && shown < list.length && <div className="mt-5 text-center"><button type="button" className="btn-ghost" onClick={() => setShown((n) => n + 120)}>Show more ({(list.length - shown).toLocaleString()} left)</button></div>}
      {items && list.length === 0 && <p className="py-10 text-center text-sm text-fg-3">Nothing matches “{q}”.</p>}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.name}>
          <div className="w-full max-w-md text-center" onClick={(e) => e.stopPropagation()}>
            <Img src={kind === "cards" ? open.large || open.icon : open.gif || open.icon} alt={open.name} className={cn("mx-auto max-h-[70dvh] w-auto rounded-2xl object-contain", kind !== "cards" && "bg-ink-2 p-6")} eager />
            <p className="mt-3 text-base font-bold">{open.name}</p>
            {kind === "cards" && open.wide && <Img src={open.wide} alt="" className="mt-3 w-full rounded-xl" />}
          </div>
          <button type="button" onClick={() => setOpen(null)} className="absolute right-4 top-4 rounded-full bg-ink/80 p-2" aria-label="Close"><X size={20} /></button>
        </div>
      )}
    </>
  );
}
