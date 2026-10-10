/**
 * VALORANT crosshair profile codes: parser, validator, encoder and geometry.
 *
 * A code is "0" followed by key;value pairs. Keys before the first section marker are general
 * settings; "P" starts the primary crosshair, "A" the aim-down-sights crosshair and "S" the
 * sniper scope center dot. Any key that is left out takes the in-game default below.
 */

export type Section = "G" | "P" | "A" | "S";

export const COLORS = [
  { name: "White", hex: "#ffffff" },
  { name: "Green", hex: "#00ff00" },
  { name: "Yellow Green", hex: "#7fff00" },
  { name: "Green Yellow", hex: "#dfff00" },
  { name: "Yellow", hex: "#ffff00" },
  { name: "Cyan", hex: "#00ffff" },
  { name: "Pink", hex: "#ff00ff" },
  { name: "Red", hex: "#ff0000" },
] as const;
export const CUSTOM_COLOR = 8;

type Rule = { kind: "bool" } | { kind: "int"; min: number; max: number } | { kind: "num"; min: number; max: number } | { kind: "hex" };
const bool: Rule = { kind: "bool" };
const int = (min: number, max: number): Rule => ({ kind: "int", min, max });
const num = (min: number, max: number): Rule => ({ kind: "num", min, max });
const hex: Rule = { kind: "hex" };

const LINE_KEYS = (p: "0" | "1", maxOffset: number): Record<string, Rule> => ({
  [`${p}b`]: bool, [`${p}t`]: int(0, 10), [`${p}l`]: int(0, 20), [`${p}v`]: int(0, 20), [`${p}g`]: bool,
  [`${p}o`]: int(0, maxOffset), [`${p}a`]: num(0, 1), [`${p}m`]: bool, [`${p}f`]: bool, [`${p}s`]: num(0, 3), [`${p}e`]: num(0, 3),
});
const CROSSHAIR_KEYS: Record<string, Rule> = {
  c: int(0, 8), u: hex, h: bool, t: int(1, 6), o: num(0, 1), d: bool, z: int(1, 6), a: num(0, 1),
  b: bool, f: bool, s: bool, m: bool,
  ...LINE_KEYS("0", 20), ...LINE_KEYS("1", 40),
};
const SECTION_ORDER: Section[] = ["G", "P", "A", "S"];
const RULES: Record<Section, Record<string, Rule>> = {
  G: { p: bool, s: bool, c: bool },
  P: CROSSHAIR_KEYS,
  A: CROSSHAIR_KEYS,
  S: { b: bool, c: int(0, 8), t: hex, u: hex, d: bool, s: num(0, 4), o: num(0, 1) },
};

export interface Lines { show: boolean; thickness: number; length: number; vLength: number; splitVertical: boolean; offset: number; opacity: number; movementError: boolean; firingError: boolean }
export interface Crosshair {
  color: number; customHex: string | null; outlines: boolean; outlineThickness: number; outlineOpacity: number;
  dot: boolean; dotThickness: number; dotOpacity: number; fade: boolean; inner: Lines; outer: Lines;
}
export interface ParsedCode { primary: Crosshair; ads: Crosshair | null; adsUsesPrimary: boolean; sniper: { color: string; dot: boolean; thickness: number; opacity: number }; general: Record<string, number> }
export type ParseResult = { ok: true; value: ParsedCode } | { ok: false; error: string };

export const DEFAULT_CROSSHAIR: Crosshair = {
  color: 0, customHex: null, outlines: true, outlineThickness: 1, outlineOpacity: 0.5,
  dot: false, dotThickness: 2, dotOpacity: 1, fade: false,
  inner: { show: true, thickness: 2, length: 6, vLength: 6, splitVertical: false, offset: 3, opacity: 0.8, movementError: false, firingError: true },
  outer: { show: true, thickness: 2, length: 2, vLength: 2, splitVertical: false, offset: 10, opacity: 0.35, movementError: true, firingError: true },
};

const clone = (c: Crosshair): Crosshair => ({ ...c, inner: { ...c.inner }, outer: { ...c.outer } });

function applyLines(l: Lines, kv: Record<string, number>, p: "0" | "1") {
  const g = (k: string) => kv[p + k];
  if (g("b") !== undefined) l.show = g("b") === 1;
  if (g("t") !== undefined) l.thickness = g("t");
  if (g("l") !== undefined) l.length = g("l");
  if (g("g") !== undefined) l.splitVertical = g("g") === 1;
  l.vLength = g("v") !== undefined ? g("v") : l.length;
  if (g("o") !== undefined) l.offset = g("o");
  if (g("a") !== undefined) l.opacity = g("a");
  if (g("m") !== undefined) l.movementError = g("m") === 1;
  if (g("f") !== undefined) l.firingError = g("f") === 1;
}

function build(kv: Record<string, number>, hexes: Record<string, string>): Crosshair {
  const c = clone(DEFAULT_CROSSHAIR);
  if (kv.c !== undefined) c.color = kv.c;
  if (hexes.u) c.customHex = hexes.u;
  if (kv.h !== undefined) c.outlines = kv.h === 1;
  if (kv.t !== undefined) c.outlineThickness = kv.t;
  if (kv.o !== undefined) c.outlineOpacity = kv.o;
  if (kv.d !== undefined) c.dot = kv.d === 1;
  if (kv.z !== undefined) c.dotThickness = kv.z;
  if (kv.a !== undefined) c.dotOpacity = kv.a;
  if (kv.f !== undefined) c.fade = kv.f === 1;
  applyLines(c.inner, kv, "0");
  applyLines(c.outer, kv, "1");
  return c;
}

/** Parse and validate a crosshair code. Anything the game would not accept is rejected with a reason. */
export function parseCode(input: string): ParseResult {
  const code = input.trim().replace(/;+$/, "");
  if (!code) return { ok: false, error: "Empty code" };
  const tok = code.split(";");
  if (tok[0] !== "0") return { ok: false, error: "Codes start with 0" };
  const data: Record<Section, { kv: Record<string, number>; hex: Record<string, string>; seen: boolean }> = {
    G: { kv: {}, hex: {}, seen: true }, P: { kv: {}, hex: {}, seen: false }, A: { kv: {}, hex: {}, seen: false }, S: { kv: {}, hex: {}, seen: false },
  };
  let sec: Section = "G";
  const order: Section[] = ["G"];
  let i = 1;
  while (i < tok.length) {
    const k = tok[i];
    if (k === "P" || k === "A" || k === "S") {
      if (data[k].seen) return { ok: false, error: `Section ${k} appears twice` };
      if (SECTION_ORDER.indexOf(k) < SECTION_ORDER.indexOf(order[order.length - 1])) return { ok: false, error: `Section ${k} is out of order` };
      data[k].seen = true; order.push(k); sec = k; i += 1; continue;
    }
    const rule = RULES[sec][k];
    if (!rule) return { ok: false, error: `Unknown setting “${k}”${sec === "G" ? "" : ` in section ${sec}`}` };
    if (i + 1 >= tok.length) return { ok: false, error: `Setting “${k}” has no value` };
    const v = tok[i + 1];
    if (k in data[sec].kv || k in data[sec].hex) return { ok: false, error: `Setting “${k}” is repeated` };
    if (rule.kind === "hex") {
      if (!/^[0-9a-fA-F]{8}$/.test(v)) return { ok: false, error: `“${k}” needs an 8-digit colour` };
      data[sec].hex[k] = v.toUpperCase();
    } else {
      if (!/^-?\d+(\.\d+)?$/.test(v)) return { ok: false, error: `“${k}” has a bad value “${v}”` };
      const n = Number(v);
      if (rule.kind === "bool" && n !== 0 && n !== 1) return { ok: false, error: `“${k}” must be 0 or 1` };
      if (rule.kind === "int" && (!Number.isInteger(n) || n < rule.min || n > rule.max)) return { ok: false, error: `“${k}” must be a whole number from ${rule.min} to ${rule.max}` };
      if (rule.kind === "num" && (n < rule.min || n > rule.max)) return { ok: false, error: `“${k}” must be between ${rule.min} and ${rule.max}` };
      data[sec].kv[k] = n;
    }
    i += 2;
  }
  const primary = build(data.P.kv, data.P.hex);
  const ads = data.A.seen ? build(data.A.kv, data.A.hex) : null;
  const S = data.S;
  const sHex = S.hex.t || S.hex.u;
  const sColor = S.kv.c === CUSTOM_COLOR || (S.kv.c === undefined && sHex) ? "#" + (sHex || "FF0000FF").slice(0, 6) : COLORS[S.kv.c ?? 7]?.hex ?? "#ff0000";
  return {
    ok: true,
    value: {
      primary, ads, adsUsesPrimary: data.G.kv.s === 1,
      sniper: { color: sColor.toLowerCase(), dot: S.kv.d !== 0, thickness: S.kv.s ?? 1, opacity: S.kv.o ?? 0.75 },
      general: data.G.kv,
    },
  };
}

/** The fill colour of a crosshair as #rrggbb plus its alpha (custom colours carry one). */
export function colorOf(c: Crosshair): { hex: string; alpha: number } {
  if (c.color === CUSTOM_COLOR) {
    const h = c.customHex || "FFFFFFFF";
    return { hex: ("#" + h.slice(0, 6)).toLowerCase(), alpha: parseInt(h.slice(6, 8) || "FF", 16) / 255 };
  }
  return { hex: COLORS[c.color]?.hex ?? "#ffffff", alpha: 1 };
}

/** A broad colour family for filtering. */
export function colorFamily(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d < 0.12) return l > 0.6 ? "White" : l < 0.25 ? "Black" : "Gray";
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 15 || h >= 335) return "Red";
  if (h < 45) return "Orange";
  if (h < 75) return "Yellow";
  if (h < 160) return "Green";
  if (h < 200) return "Cyan";
  if (h < 255) return "Blue";
  if (h < 290) return "Purple";
  return "Pink";
}

export interface Rect { x: number; y: number; w: number; h: number }
export interface Part { rect: Rect; opacity: number }
/** Geometry in screen pixels at 1080p, centred on (0, 0). Lines run outward from their offset. */
export function geometry(c: Crosshair): { parts: Part[]; outline: number; extent: number } {
  const parts: Part[] = [];
  const lines = (l: Lines) => {
    if (!l.show || l.thickness <= 0) return;
    const t = l.thickness, o = l.offset, h = l.length, v = l.splitVertical ? l.vLength : l.length;
    if (h > 0) {
      parts.push({ rect: { x: o, y: -t / 2, w: h, h: t }, opacity: l.opacity });
      parts.push({ rect: { x: -o - h, y: -t / 2, w: h, h: t }, opacity: l.opacity });
    }
    if (v > 0) {
      parts.push({ rect: { x: -t / 2, y: o, w: t, h: v }, opacity: l.opacity });
      parts.push({ rect: { x: -t / 2, y: -o - v, w: t, h: v }, opacity: l.opacity });
    }
  };
  lines(c.outer);
  lines(c.inner);
  if (c.dot) parts.push({ rect: { x: -c.dotThickness / 2, y: -c.dotThickness / 2, w: c.dotThickness, h: c.dotThickness }, opacity: c.dotOpacity });
  const outline = c.outlines ? c.outlineThickness : 0;
  let extent = 1;
  for (const p of parts) {
    const r = p.rect;
    extent = Math.max(extent, Math.abs(r.x) + outline, Math.abs(r.x + r.w) + outline, Math.abs(r.y) + outline, Math.abs(r.y + r.h) + outline);
  }
  return { parts, outline, extent };
}

const fmt = (n: number) => String(Math.round(n * 1000) / 1000);

/** Encode a crosshair back to a primary-only code, writing only what differs from the defaults (the way the game exports). */
export function encode(c: Crosshair): string {
  const d = DEFAULT_CROSSHAIR;
  const out: string[] = ["0", "P"];
  const put = (k: string, v: number | string, def: number | string) => { if (v !== def) out.push(k, typeof v === "number" ? fmt(v) : v); };
  const b = (x: boolean) => (x ? 1 : 0);
  put("c", c.color, d.color);
  if (c.color === CUSTOM_COLOR) out.push("u", (c.customHex || "FFFFFFFF").toUpperCase());
  put("h", b(c.outlines), b(d.outlines));
  put("t", c.outlineThickness, d.outlineThickness);
  put("o", c.outlineOpacity, d.outlineOpacity);
  put("d", b(c.dot), b(d.dot));
  put("z", c.dotThickness, d.dotThickness);
  put("a", c.dotOpacity, d.dotOpacity);
  put("f", b(c.fade), b(d.fade));
  const lines = (l: Lines, dl: Lines, p: string) => {
    put(p + "b", b(l.show), b(dl.show));
    put(p + "t", l.thickness, dl.thickness);
    put(p + "l", l.length, dl.length);
    if (l.splitVertical) { out.push(p + "v", fmt(l.vLength)); out.push(p + "g", "1"); }
    put(p + "o", l.offset, dl.offset);
    put(p + "a", l.opacity, dl.opacity);
    put(p + "m", b(l.movementError), b(dl.movementError));
    put(p + "f", b(l.firingError), b(dl.firingError));
  };
  lines(c.inner, d.inner, "0");
  lines(c.outer, d.outer, "1");
  if (out.length === 2) return "0";
  return out.join(";");
}

export { clone as cloneCrosshair };
