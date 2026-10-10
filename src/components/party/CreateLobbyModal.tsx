"use client";
import { useEffect, useState } from "react";
import { Lock, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { lobbies as lobbyDb } from "@/lib/db";
import { VALORANT_REGIONS, REGION_KEYS, type RegionKey } from "@/lib/constants";
import { RANKED_ONLY, rankByTier } from "@/lib/ranks";
import { MODES, type LobbySlot, type Mode, type Restriction } from "@/types/lobby";
import { cn } from "@/lib/utils";
import type { AgentLite, RoleLite } from "./types";

const emptySlot = (i: number): LobbySlot => ({ index: i, status: "open", restriction: { type: "any" } });

export function CreateLobbyModal({ agents, roles, region: initialRegion, onClose, onCreated }: { agents: AgentLite[]; roles: RoleLite[]; region: RegionKey; onClose: () => void; onCreated: (m: Mode) => void }) {
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<Mode>("competitive");
  const [region, setRegion] = useState<RegionKey>(initialRegion);
  const [server, setServer] = useState<string>(VALORANT_REGIONS[initialRegion].servers[0]);
  const [partyCode, setPartyCode] = useState("");
  const [note, setNote] = useState("");
  const [minRank, setMinRank] = useState(3);
  const [maxRank, setMaxRank] = useState(27);
  const [mic, setMic] = useState(true);
  const [slots, setSlots] = useState<LobbySlot[]>([{ index: 0, status: "filled", userId: user?.uid, userName: "You" }, emptySlot(1), emptySlot(2), emptySlot(3), emptySlot(4)]);
  const [active, setActive] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setServer(VALORANT_REGIONS[region].servers[0]); }, [region]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const setRestriction = (i: number, r: Restriction | "locked") => {
    setSlots((s) => s.map((x) => x.index !== i ? x : r === "locked" ? { ...x, status: "locked", restriction: null } : { ...x, status: "open", restriction: r }));
    setActive(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return;
    if (minRank > maxRank) return setErr("Minimum rank is above the maximum rank.");
    setBusy(true); setErr("");
    const name = profile?.riotName ? `${profile.riotName}#${profile.riotTag}` : profile?.displayName || user.displayName || "Agent";
    try {
      await lobbyDb.create({
        platform: "pc", region, server, mode, hostId: user.uid, hostName: name, hostAvatarUrl: profile?.playerCardUrl || user.photoURL || null, hostRankTier: profile?.rankTier || 0,
        micRequired: mic, minRank, maxRank, partyCode: partyCode.trim().toUpperCase() || null, note: note.trim() || null, maxMembers: 5,
        slots: slots.map((s) => s.index === 0 ? { index: 0, status: "filled", userId: user.uid, userName: name, userAvatarUrl: profile?.playerCardUrl || user.photoURL || null, userRankTier: profile?.rankTier || 0 } : s),
      });
      onCreated(mode);
    } catch (ex) { setErr((ex as Error).message || "Could not create the party."); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Create party">
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="card max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-b-none sm:rounded-2xl animate-rise">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-2/95 px-5 py-3 backdrop-blur">
          <div><p className="kicker">NEW PARTY</p><h2 className="h2 text-xl">Create a party</h2></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-fg-3 hover:text-fg" aria-label="Close"><X size={20} /></button>
        </div>
        <div className="grid gap-5 p-5">
          <div>
            <span className="label">Game mode</span>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => <button key={m.id} type="button" onClick={() => setMode(m.id)} className={cn("rounded-xl border border-line bg-ink-3 px-2 py-2.5 text-sm font-semibold", mode === m.id && "border-val bg-val/15")}>{m.label}</button>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="label">Region</span><select value={region} onChange={(e) => setRegion(e.target.value as RegionKey)} className="input">{REGION_KEYS.map((r) => <option key={r} value={r}>{r} · {VALORANT_REGIONS[r].name}</option>)}</select></label>
            <label className="block"><span className="label">Server</span><select value={server} onChange={(e) => setServer(e.target.value)} className="input">{VALORANT_REGIONS[region].servers.map((s) => <option key={s}>{s}</option>)}</select></label>
          </div>
          <label className="block"><span className="label">Party code (from your Valorant party screen)</span><input value={partyCode} onChange={(e) => setPartyCode(e.target.value.slice(0, 12))} placeholder="e.g. VAL143" className="input font-mono uppercase tracking-widest" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="label">Minimum rank</span><select value={minRank} onChange={(e) => setMinRank(Number(e.target.value))} className="input">{RANKED_ONLY.map((r) => <option key={r.tier} value={r.tier}>{r.name}</option>)}</select></label>
            <label className="block"><span className="label">Maximum rank</span><select value={maxRank} onChange={(e) => setMaxRank(Number(e.target.value))} className="input">{RANKED_ONLY.map((r) => <option key={r.tier} value={r.tier}>{r.name}</option>)}</select></label>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-line bg-ink-3 px-4 py-3 text-sm"><span><b>Mic required</b><span className="block text-xs text-fg-3">Only people who will talk</span></span><input type="checkbox" checked={mic} onChange={(e) => setMic(e.target.checked)} className="h-5 w-5 accent-val" /></label>
          <div>
            <span className="label">Seats · tap one to set who you want in it</span>
            <div className="grid grid-cols-5 gap-2">
              {slots.map((s) => {
                const a = s.restriction?.type === "agent" ? agents.find((x) => x.id === s.restriction?.value) : null;
                const label = s.index === 0 ? "You (host)" : s.status === "locked" ? "Locked" : s.restriction?.type === "any" || !s.restriction ? "Anyone" : s.restriction.displayName;
                const icon = s.index === 0 ? profile?.playerCardUrl || user?.photoURL : a?.icon || s.restriction?.iconUrl;
                return (
                  <button key={s.index} type="button" disabled={s.index === 0} onClick={() => setActive(s.index)}
                    className={cn("flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] font-semibold", s.index === 0 ? "border-val/50 bg-val/10" : s.status === "locked" ? "border-line/50 bg-ink/40 text-fg-3" : "border-line bg-ink-3 hover:border-line-2", active === s.index && "ring-2 ring-val")}>
                    <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-md bg-ink-4">{s.status === "locked" ? <Lock size={14} /> : icon ? <img src={icon} alt="" className={cn("h-9 w-9 object-cover", s.restriction?.type === "role" && "invert p-1.5")} /> : <span className="text-fg-3">{s.index + 1}</span>}</span>
                    <span className="w-full truncate text-center">{label}</span>
                  </button>
                );
              })}
            </div>
            {active !== null && (
              <div className="mt-3 rounded-xl border border-line bg-ink-3 p-3">
                <p className="mb-2 text-xs font-bold">Seat {active + 1}: who should take it?</p>
                <div className="mb-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setRestriction(active, { type: "any" })} className="chip">Anyone</button>
                  {roles.map((r) => <button key={r.name} type="button" onClick={() => setRestriction(active, { type: "role", value: r.name, displayName: r.name, iconUrl: r.icon })} className="chip"><img src={r.icon} alt="" className="h-3.5 w-3.5 invert" />{r.name}</button>)}
                  <button type="button" onClick={() => setRestriction(active, "locked")} className="chip"><Lock size={12} /> Lock seat</button>
                </div>
                <p className="label">Or a specific agent</p>
                <div className="grid max-h-40 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-9">
                  {agents.map((a) => <button key={a.id} type="button" title={a.name} aria-label={a.name} onClick={() => setRestriction(active, { type: "agent", value: a.id, displayName: a.name, iconUrl: a.icon })} className="overflow-hidden rounded-md border border-line hover:border-val"><img src={a.icon} alt="" className="aspect-square w-full" /></button>)}
                </div>
              </div>
            )}
          </div>
          <label className="block"><span className="label">Note (optional)</span><input value={note} onChange={(e) => setNote(e.target.value.slice(0, 140))} placeholder="Chill comp, no toxicity, English voice" className="input" /></label>
          {err && <p className="rounded-xl border border-val/40 bg-val/10 p-3 text-sm">{err}</p>}
          <p className="text-xs text-fg-3">Your party stays listed for one hour, then vanishes on its own. Close it when you are full. Rank shown: {rankByTier(profile?.rankTier || 0).name}.</p>
        </div>
        <div className="sticky bottom-0 flex gap-2 border-t border-line bg-ink-2/95 p-4 backdrop-blur">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? "Creating…" : "Go live"}</button>
        </div>
      </form>
    </div>
  );
}
