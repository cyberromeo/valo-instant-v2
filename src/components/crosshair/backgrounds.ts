export interface XBg { key: string; label: string; src?: string; color?: string; light?: boolean }

/** Map art is cropped from the official splash screens and served from this site. */
export const BACKGROUNDS: XBg[] = [
  { key: "ascent", label: "Ascent", src: "/crosshairs/bg-ascent.webp" },
  { key: "bind", label: "Bind", src: "/crosshairs/bg-bind.webp" },
  { key: "icebox", label: "Icebox", src: "/crosshairs/bg-icebox.webp", light: true },
  { key: "lotus", label: "Lotus", src: "/crosshairs/bg-lotus.webp" },
  { key: "breeze", label: "Breeze", src: "/crosshairs/bg-breeze.webp", light: true },
  { key: "dark", label: "Dark", color: "#15171c" },
  { key: "gray", label: "Gray", color: "#6b7079" },
  { key: "light", label: "Light", color: "#e9ecef", light: true },
];
export const bgByKey = (k: string) => BACKGROUNDS.find((b) => b.key === k) ?? BACKGROUNDS[0];
