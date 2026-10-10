import { NextRequest, NextResponse } from "next/server";
import { getAccount, getMMR, henrikConfigured } from "@/lib/henrik";
import { rankByName } from "@/lib/ranks";

export async function POST(req: NextRequest) {
  const { name, tag } = await req.json().catch(() => ({}));
  if (!name || !tag || String(name).length > 16 || String(tag).length > 5) return NextResponse.json({ error: "Enter a Riot ID like Name#TAG." }, { status: 400 });
  if (!henrikConfigured()) return NextResponse.json({ error: "Rank lookup is not connected on this server yet. Pick your rank by hand for now.", notConfigured: true });
  const acc = await getAccount(name, tag);
  if (!acc.data) return NextResponse.json({ error: acc.status === 404 ? `Riot ID "${name}#${tag}" was not found. Check the spelling.` : acc.error || "Lookup failed." }, { status: acc.status || 502 });
  const mmr = await getMMR(acc.data.region, name, tag);
  const rankName = mmr.data?.currenttierpatched || "Unranked";
  const tier = mmr.data?.currenttier ?? rankByName(rankName).tier;
  return NextResponse.json({
    riotName: acc.data.name, riotTag: acc.data.tag, puuid: acc.data.puuid, region: acc.data.region.toUpperCase(),
    accountLevel: acc.data.account_level, playerCardUrl: acc.data.card?.small, rankTier: tier, rankName, rankIconUrl: mmr.data?.images?.small || null,
    rr: mmr.data?.ranking_in_tier ?? null, elo: mmr.data?.elo ?? null,
  });
}
