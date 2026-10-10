"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Img({ src, alt, className, eager }: { src?: string | null; alt: string; className?: string; eager?: boolean }) {
  const [ok, setOk] = useState(true);
  const [loaded, setLoaded] = useState(false);
  if (!src || !ok) return <div className={cn("bg-ink-3", className)} aria-hidden="true" />;
  return (
    <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onLoad={() => setLoaded(true)} onError={() => setOk(false)}
      className={cn("img-fade", loaded && "is-loaded", className)} />
  );
}
