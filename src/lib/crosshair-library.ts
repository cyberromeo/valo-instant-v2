import data from "@/data/crosshairs.json";
import { colorFamily, colorOf, parseCode, type Crosshair } from "@/lib/crosshair";

export type XCat = "pro" | "style" | "fun";
export interface XRaw { id: string; name: string; cat: XCat; code: string; src: string; srcName: string; team?: string; updated?: string }
export interface XItem extends XRaw { family: string; hex: string }

export const CHECKED_ON = data.checked;
export const CAT_LABEL: Record<XCat, string> = { pro: "Pro player", style: "Classic style", fun: "Fun & meme" };

const raw = data.items as XRaw[];

export const CROSSHAIRS: XItem[] = raw.flatMap((x) => {
  const r = parseCode(x.code);
  if (!r.ok) return [];
  const { hex } = colorOf(r.value.primary);
  return [{ ...x, hex, family: colorFamily(hex) }];
});

export const FAMILIES = ["White", "Cyan", "Green", "Yellow", "Red", "Pink", "Purple", "Blue", "Orange", "Black", "Gray"].filter((f) => CROSSHAIRS.some((x) => x.family === f));

export const FAMILY_SWATCH: Record<string, string> = {
  White: "#ffffff", Cyan: "#00ffff", Green: "#00ff00", Yellow: "#ffff00", Red: "#ff0000", Pink: "#ff00ff", Purple: "#9b5cff", Blue: "#3b82f6", Orange: "#ff8a00", Black: "#000000", Gray: "#8a8f99",
};

export const getCrosshair = (id: string) => CROSSHAIRS.find((x) => x.id === id) ?? null;
export const primaryOf = (code: string): Crosshair | null => { const r = parseCode(code); return r.ok ? r.value.primary : null; };
export const subtitle = (x: XRaw) => (x.cat === "pro" ? x.team || "Pro player" : CAT_LABEL[x.cat]);
