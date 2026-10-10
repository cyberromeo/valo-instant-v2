import { NextRequest, NextResponse } from "next/server";
import { getBuddies, getBundles, getCards, getSprays, getTitles } from "@/lib/valorant-api";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind");
  let data: unknown[] = [];
  if (kind === "cards") data = (await getCards()).map((c) => ({ id: c.uuid, name: c.displayName, icon: c.smallArt || c.displayIcon, large: c.largeArt, wide: c.wideArt }));
  else if (kind === "buddies") data = (await getBuddies()).map((b) => ({ id: b.uuid, name: b.displayName, icon: b.displayIcon }));
  else if (kind === "sprays") data = (await getSprays()).map((s) => ({ id: s.uuid, name: s.displayName, icon: s.fullTransparentIcon || s.displayIcon, gif: s.animationGif, cat: s.category ? s.category.split("::").pop() : null }));
  else if (kind === "titles") data = (await getTitles()).map((t) => ({ id: t.uuid, name: t.titleText, sub: t.displayName?.replace(/ Title$/, "") || "" }));
  else if (kind === "bundles") data = (await getBundles()).map((b) => ({ id: b.uuid, name: b.displayName, sub: b.displayNameSubText, icon: b.displayIcon, desc: b.description }));
  else return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
