"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, HelpCircle, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { lobbies as lobbyDb } from "@/lib/db";
import { VALORANT_REGIONS, REGION_KEYS, isRegion, type RegionKey } from "@/lib/constants";
import { RANKED_ONLY } from "@/lib/ranks";
import { MODES, type Lobby, type Mode } from "@/types/lobby";
import { cn } from "@/lib/utils";
import { LobbyCard } from "./LobbyCard";
import { CreateLobbyModal } from "./CreateLobbyModal";
import { SignInPanel } from "./SignInPanel";
import { demoLobbies } from "./demo";
import type { AgentLite, RoleLite } from "./types";

export function PartyDashboard({ agents, roles }: { agents: AgentLite[]; roles: RoleLite[] }) {
  const { user, profile, ready, loading } = useAuth();
  const [region, setRegion] = useState<RegionKey>("AP");
  const [mode, setMode] = useState<Mode | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [server, setServer] = useState("");
  const [mic, setMic] = useState(false);
  const [minRank, setMinRank] = useState(0);
  const [agent, setAgent] = useState("");
  const [rows, setRows] = useState<Lobby[] | null>(null);
  const [err, setErr] = useState("");
  const [create, setCreate] = useState(false);
  const [signIn, setSignIn] = useState(false);
  const [toast, setToast] = useState("");
  const [, tick] = useState(0);

  // Region follows the profile the first time it loads; the user can still switch.
  useEffect(() => { if (profile?.region && isRegion(profile.region)) setRegion(profile.region); }, [profile?.region]);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 15000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!ready) { setRows(demoLobbies(region, agents)); return; }
    setRows(null); setErr("");
    try {
      return lobbyDb.subscribe(region, setRows, (e) => { setErr(e.message); setRows([]); });
    } catch (e) { setErr((e as Error).message); setRows([]); }
  }, [region, ready, agents]);

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const filtered = useMemo(() => (rows || []).filter((l) => {
    if (mode !== "all" && l.mode !== mode) return false;
    if (server && l.server !== server) return false;
    if (mic && !l.micRequired) return false;
    if (minRank > 0 && (l.minRank || 0) < minRank) return false;
    if (agent && !l.slots.some((s) => s.status === "open" && s.restriction?.type === "agent" && s.restriction.value === agent)) return false;
    return true;
  }), [rows, mode, server, mic, minRank, agent]);

  const counts = useMemo(() => Object.fromEntries(MODES.map((m) => [m.id, (rows || []).filter((l) => l.mode === m.id).length])), [rows]);
  const mine = user ? (rows || []).find((l) => l.memberIds?.includes(user.uid)) : undefined;
  const activeFilters = [server, mic, minRank > 0, agent].filter(Boolean).length;

  const onCreate = () => { if (!ready) return say("Connect the database to create a party."); if (!user) return setSignIn(true); if (mine) return say("You are already in a party. Leave it first."); setCreate(true); };

  return (
    <div className="animate-rise">
      {!ready && (
        <div className="mb-4 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
          <p className="font-bold text-gold">Database not connected yet</p>
          <p className="mt-1 text-fg-2">The party finder is showing sample parties. Once the Firebase config is set, real parties appear here live and you can create or join one.</p>
        </div>
      )}
      {ready && !loading && !user && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-ink-2 p-4 text-sm">
          <p className="text-fg-2">Sign in to create a party or claim a seat. Browsing is open to everyone.</p>
          <button type="button" className="btn-primary" onClick={() => setSignIn(true)}>Sign in</button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker mb-1">PARTY FINDER · {VALORANT_REGIONS[region].name}</p>
          <h1 className="h1">Find a squad</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/party/how-to" className="btn-ghost" aria-label="How to use"><HelpCircle size={16} /> <span className="hidden sm:inline">How to use</span></Link>
          <button type="button" onClick={onCreate} className="btn-primary"><Plus size={16} /> Create party</button>
        </div>
      </div>

      <div className="scroll-x mb-3">
        {REGION_KEYS.map((r) => <button key={r} type="button" onClick={() => { setRegion(r); setServer(""); }} className={cn("chip", region === r && "chip-on")}>{r} <span className="text-fg-3">{VALORANT_REGIONS[r].name}</span></button>)}
      </div>
      <div className="scroll-x mb-3">
        <button type="button" onClick={() => setShowFilters((s) => !s)} className={cn("chip", (showFilters || activeFilters > 0) && "chip-on")}><Filter size={12} /> Filters{activeFilters ? ` (${activeFilters})` : ""}</button>
        <button type="button" onClick={() => setMode("all")} className={cn("chip", mode === "all" && "chip-on")}>All <b>{rows?.length ?? 0}</b></button>
        {MODES.map((m) => <button key={m.id} type="button" onClick={() => setMode(m.id)} className={cn("chip", mode === m.id && "chip-on")}>{m.label} <b>{counts[m.id] || 0}</b></button>)}
      </div>

      {showFilters && (
        <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-4">
          <label className="block"><span className="label">Server</span>
            <select value={server} onChange={(e) => setServer(e.target.value)} className="input"><option value="">Any server</option>{VALORANT_REGIONS[region].servers.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="block"><span className="label">Minimum rank</span>
            <select value={minRank} onChange={(e) => setMinRank(Number(e.target.value))} className="input"><option value={0}>Any rank</option>{RANKED_ONLY.map((r) => <option key={r.tier} value={r.tier}>{r.name}</option>)}</select></label>
          <label className="block"><span className="label">Open seat for</span>
            <select value={agent} onChange={(e) => setAgent(e.target.value)} className="input"><option value="">Any agent</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
          <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={mic} onChange={(e) => setMic(e.target.checked)} className="h-5 w-5 accent-val" /> Mic required only</label>
        </div>
      )}

      {err && <p className="mb-3 rounded-xl border border-val/40 bg-val/10 p-3 text-sm">Live updates stopped: {err}</p>}

      {rows === null ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-ink-3" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <RefreshCw className="text-fg-3" />
          <p className="font-display text-2xl uppercase">No parties here right now</p>
          <p className="max-w-sm text-sm text-fg-2">Nothing open in {VALORANT_REGIONS[region].name}{mode !== "all" ? ` for ${MODES.find((m) => m.id === mode)?.label}` : ""} with these filters. Be the first.</p>
          <button type="button" onClick={onCreate} className="btn-primary"><Plus size={16} /> Create party</button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => <li key={l.id}><LobbyCard lobby={l} agents={agents} onNeedSignIn={() => setSignIn(true)} say={say} inParty={!!mine} /></li>)}
        </ul>
      )}

      {create && user && <CreateLobbyModal agents={agents} roles={roles} region={region} onClose={() => setCreate(false)} onCreated={(m) => { setCreate(false); setMode(m); say("Party is live. Share your code."); }} />}
      {signIn && <SignInPanel onClose={() => setSignIn(false)} />}
      {toast && <div className="fixed inset-x-0 bottom-24 z-50 mx-auto w-max max-w-[90vw] rounded-full border border-line bg-ink-3 px-4 py-2 text-sm font-semibold shadow-card md:bottom-8">{toast}</div>}
    </div>
  );
}
