export const VALORANT_REGIONS = {
  AP: { name: "Asia Pacific", servers: ["Mumbai", "Singapore", "Tokyo", "Hong Kong", "Sydney", "Manila", "Seoul"] },
  NA: { name: "North America", servers: ["US East (N. Virginia)", "US West (N. California)", "US Central (Texas)", "US Central (Illinois)", "US Central (Georgia)"] },
  EU: { name: "Europe", servers: ["Frankfurt", "Paris", "London", "Warsaw", "Istanbul", "Madrid", "Bahrain"] },
  LATAM: { name: "Latin America", servers: ["Santiago", "Mexico City", "Miami"] },
  BR: { name: "Brazil", servers: ["Sao Paulo"] },
  KR: { name: "Korea", servers: ["Seoul"] },
} as const;
export type RegionKey = keyof typeof VALORANT_REGIONS;
export const REGION_KEYS = Object.keys(VALORANT_REGIONS) as RegionKey[];
export const isRegion = (r: string): r is RegionKey => r in VALORANT_REGIONS;
