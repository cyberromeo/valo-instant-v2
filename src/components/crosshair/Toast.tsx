"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: string) => { setMsg(m); if (t.current) clearTimeout(t.current); t.current = setTimeout(() => setMsg(null), 1600); }, []);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  const node = msg ? (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4" style={{ bottom: "calc(var(--sab) + 84px)" }}>
      <div className="flex items-center gap-2 rounded-full border border-teal/40 bg-ink-2/95 px-4 py-2 text-sm font-semibold text-fg shadow-card backdrop-blur"><Check size={16} className="text-teal" /> {msg}</div>
    </div>
  ) : null;
  return { show, node };
}
