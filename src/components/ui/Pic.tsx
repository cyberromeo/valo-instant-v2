import Image from "next/image";
import { cn } from "@/lib/utils";

const optimizable = (src: string) => src.startsWith("https://media.valorant-api.com/");

/** Optimized remote image for the handful of large art files (agent portraits, map splashes). Fills its positioned parent. */
export function Pic({ src, alt, className, sizes, priority, quality }: { src?: string | null; alt: string; className?: string; sizes: string; priority?: boolean; quality?: number }) {
  if (!src) return <div className={cn("bg-ink-3", className)} aria-hidden="true" />;
  if (!optimizable(src)) return <img src={src} alt={alt} className={cn("absolute inset-0 h-full w-full", className)} />;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={quality ?? 70} className={className} />;
}

/** Optimized fixed-size icon (agent icons are 400 KB PNGs at source). Falls back to a plain img for other hosts. */
export function Icon({ src, alt, size, className }: { src?: string | null; alt: string; size: number; className?: string }) {
  if (!src) return <span className={cn("inline-block bg-ink-3", className)} style={{ width: size, height: size }} aria-hidden="true" />;
  if (!optimizable(src)) return <img src={src} alt={alt} width={size} height={size} className={className} />;
  return <Image src={src} alt={alt} width={size} height={size} quality={70} className={className} />;
}
