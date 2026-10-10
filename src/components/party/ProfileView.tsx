"use client";
import { useEffect, useRef, useState } from "react";
import { LogOut, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { lobbies as lobbyDb } from "@/lib/db";
import { RANKS, rankByTier } from "@/lib/ranks";
import { VALORANT_REGIONS, REGION_KEYS } from "@/lib/constants";
import { PageHead } from "@/components/ui/PageHead";
import { Img } from "@/components/ui/Img";
import { SignInPanel } from "./SignInPanel";
import type { Lobby } from "@/types/lobby";
import { MODES } from "@/types/lobby";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

export function ProfileView({ lookupAvailable }: { lookupAvailable: boolean }) {
  const { ready, loading, user, profile, logout, saveProfile } = useAuth();
  const [signIn, setSignIn] = useState(false);
  const [name, setName] = useState(""); const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mine, setMine] = useState<Lobby[]>([]);

  const seeded = useRef(false);
  useEffect(() => { if (profile && !seeded.current) { seeded.current = true; setName(profile.riotName || ""); setTag(profile.riotTag || ""); } }, [profile]);
  useEffect(() => { if (!user || !ready) return; try { return lobbyDb.subscribeMine(user.uid, setMine); } catch { return; } }, [user, ready]);

  const lookup = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/riot/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), tag: tag.trim().replace(/^#/, "") }) });
      const j = await r.json();
      if (j.notConfigured) { await saveProfile({ riotName: name.trim(), riotTag: tag.trim().replace(/^#/, ""), rankVerified: false }); setMsg({ ok: true, text: "Riot ID saved. Live rank lookup is not connected yet, so pick your rank below." }); return; }
      if (!r.ok) { setMsg({ ok: false, text: j.error || "Lookup failed." }); return; }
      await saveProfile({ riotName: j.riotName, riotTag: j.riotTag, puuid: j.puuid, region: j.region, rankTier: j.rankTier, rankName: j.rankName, rankIconUrl: j.rankIconUrl, accountLevel: j.accountLevel, playerCardUrl: j.playerCardUrl, rankVerified: true });
      setMsg({ ok: true, text: `Linked ${j.riotName}#${j.riotTag}: ${j.rankName}${j.rr != null ? ` · ${j.rr} RR` : ""}, level ${j.accountLevel}.` });
    } catch { setMsg({ ok: false, text: "Could not reach the lookup service." }); } finally { setBusy(false); }
  };

  if (!ready) return (
    <>
      <PageHead kicker="PROFILE" title="Your profile" />
      <div className="card p-5 text-sm"><p className="font-bold text-gold">Database not connected yet</p><p className="mt-1 text-fg-2">Sign-in, Riot ID linking and your party history switch on once the Firebase config is set. The wiki works without it.</p></div>
    </>
  );
  if (loading) return <PageHead kicker="PROFILE" title="Loading…" />;
  if (!user) return (
    <>
      <PageHead kicker="PROFILE" title="Who are you?" sub="Sign in to create parties, claim seats and link your Riot ID." />
      <button type="button" className="btn-primary" onClick={() => setSignIn(true)}>Sign in</button>
      {signIn && <SignInPanel onClose={() => setSignIn(false)} />}
    </>
  );
  const rank = rankByTier(profile?.rankTier || 0);
  return (
    <div className="animate-rise">
      <PageHead kicker="PROFILE" title={profile?.riotName ? `${profile.riotName}#${profile.riotTag}` : profile?.displayName || "Agent"} right={<button type="button" onClick={logout} className="btn-ghost"><LogOut size={16} /> Sign out</button>} />
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <section className="card flex items-center gap-4 p-5">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-ink-3"><Img src={profile?.playerCardUrl || user.photoURL} alt="" className="h-full w-full object-cover" eager /></div>
          <div className="min-w-0">
            <p className="break-all text-sm text-fg-2">{user.email}</p>
            <p className="mt-1 flex items-center gap-2 text-base font-bold"><img src={profile?.rankIconUrl || rank.icon} alt="" className="h-7 w-7" /><span style={{ color: rank.color }}>{profile?.rankName || rank.name}</span></p>
            <p className="text-xs text-fg-3">{profile?.rankVerified ? "Verified from a live lookup" : "Self-reported"}{profile?.accountLevel ? ` · level ${profile.accountLevel}` : ""} · {VALORANT_REGIONS[(profile?.region as keyof typeof VALORANT_REGIONS) || "AP"]?.name || profile?.region}</p>
          </div>
        </section>

        <section className="card p-5">
          <p className="kicker mb-1">RIOT ID</p>
          <h2 className="h2 mb-3 text-xl">Link your Riot ID</h2>
          {!lookupAvailable && <p className="mb-3 rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs text-fg-2">Live rank lookup is not connected on this server yet. Your Riot ID still saves and you can set your rank by hand.</p>}
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} placeholder="Game name" className="input" aria-label="Game name" />
            <input value={tag} onChange={(e) => setTag(e.target.value.slice(0, 6))} placeholder="TAG" className="input w-28 font-mono uppercase" aria-label="Tag line" />
          </div>
          <button type="button" onClick={lookup} disabled={busy || !name || !tag} className="btn-primary mt-3 w-full"><Search size={16} /> {busy ? "Looking up…" : lookupAvailable ? "Look up rank and link" : "Save Riot ID"}</button>
          {msg && <p className={`mt-3 rounded-xl border p-3 text-sm ${msg.ok ? "border-teal/40 bg-teal/10" : "border-val/40 bg-val/10"}`}>{msg.text}</p>}
        </section>

        <section className="card p-5">
          <p className="kicker mb-1">SETTINGS</p>
          <h2 className="h2 mb-3 text-xl">Rank and region</h2>
          <label className="block"><span className="label">Display name</span><input defaultValue={profile?.displayName || ""} onBlur={(e) => e.target.value.trim() && saveProfile({ displayName: e.target.value.trim().slice(0, 40) })} className="input" /></label>
          <label className="mt-3 block"><span className="label">Home region</span><select value={profile?.region || "AP"} onChange={(e) => saveProfile({ region: e.target.value })} className="input">{REGION_KEYS.map((r) => <option key={r} value={r}>{r} · {VALORANT_REGIONS[r].name}</option>)}</select></label>
          <label className="mt-3 block"><span className="label">Current rank {profile?.rankVerified ? "(verified; changing it marks it self-reported)" : ""}</span>
            <select value={profile?.rankTier || 0} onChange={(e) => { const r = rankByTier(Number(e.target.value)); saveProfile({ rankTier: r.tier, rankName: r.name, rankIconUrl: r.icon, rankVerified: false }); }} className="input">{RANKS.map((r) => <option key={r.tier} value={r.tier}>{r.name}</option>)}</select></label>
        </section>

        <section className="card p-5">
          <p className="kicker mb-1">MY PARTIES</p>
          <h2 className="h2 mb-3 text-xl">Where you are in</h2>
          {mine.length === 0 ? <p className="text-sm text-fg-2">You are not in a party right now. <Link href="/party" className="font-bold text-val">Find one</Link>.</p> : (
            <ul className="grid gap-2">{mine.map((l) => <li key={l.id} className="rounded-xl border border-line bg-ink-3 p-3 text-sm"><b>{MODES.find((m) => m.id === l.mode)?.label}</b> · {l.region} {l.server} · host {l.hostName} · {l.memberCount}/{l.maxMembers} · {timeAgo(l.createdAt)}{l.partyCode ? <span className="ml-2 font-mono text-teal">{l.partyCode}</span> : null}</li>)}</ul>
          )}
        </section>
      </div>
    </div>
  );
}
