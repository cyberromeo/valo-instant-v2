import { colorOf, geometry, type Crosshair } from "@/lib/crosshair";
import { bgByKey } from "./backgrounds";

/**
 * Draws a crosshair exactly from its settings: colour, outlines, inner/outer lines and centre dot.
 * One game pixel (at 1080p) is drawn as `scale` screen pixels; "fit" picks the largest whole zoom that fits.
 */
export function CrosshairSvg({ c, uid, size, scale = "fit", fill = false, maxZoom = 8, className }: { c: Crosshair; uid: string; size: number; scale?: number | "fit"; fill?: boolean; maxZoom?: number; className?: string }) {
  const { parts, outline, extent } = geometry(c);
  const z = scale === "fit" ? Math.max(1, Math.min(maxZoom, Math.floor((size * 0.4) / extent))) : scale;
  const half = size / 2 / z;
  const { hex, alpha } = colorOf(c);
  const id = `xm-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const vis = parts.filter((p) => p.rect.w > 0 && p.rect.h > 0);
  return (
    <svg viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`} width={fill ? "100%" : size} height={fill ? "100%" : size} className={className} shapeRendering="crispEdges" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {outline > 0 && c.outlineOpacity > 0 && (
        <>
          <defs>
            <mask id={id} maskUnits="userSpaceOnUse" x={-half} y={-half} width={half * 2} height={half * 2}>
              <rect x={-half} y={-half} width={half * 2} height={half * 2} fill="#fff" />
              {vis.map((p, i) => <rect key={i} x={p.rect.x} y={p.rect.y} width={p.rect.w} height={p.rect.h} fill="#000" />)}
            </mask>
          </defs>
          <g mask={`url(#${id})`} opacity={c.outlineOpacity} fill="#000">
            {vis.map((p, i) => <rect key={i} x={p.rect.x - outline} y={p.rect.y - outline} width={p.rect.w + outline * 2} height={p.rect.h + outline * 2} />)}
          </g>
        </>
      )}
      {vis.map((p, i) => p.opacity * alpha > 0 && <rect key={i} x={p.rect.x} y={p.rect.y} width={p.rect.w} height={p.rect.h} fill={hex} fillOpacity={p.opacity * alpha} />)}
    </svg>
  );
}

/** A crosshair over an in-game backdrop. Fills its positioned parent. */
export function CrosshairScene({ c, uid, bg, size, scale = "fit", maxZoom, priority }: { c: Crosshair; uid: string; bg: string; size: number; scale?: number | "fit"; maxZoom?: number; priority?: boolean }) {
  const b = bgByKey(bg);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: b.color || "#15171c" }}>
      {b.src && <img src={b.src} alt="" loading={priority ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 grid place-items-center">
        <CrosshairSvg c={c} uid={uid} size={size} scale={scale} maxZoom={maxZoom} />
      </div>
    </div>
  );
}
