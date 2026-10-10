"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Img({ src, alt, className, eager }: { src?: string | null; alt: string; className?: string; eager?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [ok, setOk] = useState(true);
  const [loaded, setLoaded] = useState(false);
  // An image that finished loading before hydration never fires onLoad; read .complete once mounted.
  useEffect(() => { const el = ref.current; if (el && el.complete) { if (el.naturalWidth > 0) setLoaded(true); else if (src) setOk(false); } }, [src]);
  if (!src || !ok) return <div className={cn("bg-ink-3", className)} aria-hidden="true" />;
  return (
    <img ref={ref} src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onLoad={() => setLoaded(true)} onError={() => setOk(false)}
      className={cn("img-fade", loaded && "is-loaded", className)} />
  );
}
