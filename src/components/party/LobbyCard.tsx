"use client";
import { useState } from "react";
import { Check, Copy, Lock, LogOut, Mic, MicOff, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { lobbies as lobbyDb } from "@/lib/db";
import { rankByTier } from "@/lib/ranks";
import { MODES, type Lobby } from "@/types/lobby";
import { cn, timeAgo } from "@/lib/utils";
import { Img } from "@/components/ui/Img";
import { Icon } from "@/components/ui/Pic";
import type { AgentLite } from "./types";

export function LobbyCard({ lobby, agents, onNeedSignIn, say, inParty }: { lobby: Lobby; agents: AgentLite[]; onNeedSignIn: () => void; say: (m: string) => void; inParty: boolean }) {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const isHost = user?.uid === lobby.hostId;
  const isMember = !!user && (lobby.memberIds || []).includes(user.uid);
  const demo = lobby.id.startsWith("demo-");
  const mode = MODES.find((m) => m.id === lobby.mode);
  const host = rankByTier(lobby.hostRankTier);
  const open = lobby.slots.filter((s) => s.status === "open").length;

  const copy = async () => {
    if (!lobby.partyCode) return say("The host has not added a party code yet.");
    try { await navigator.clipboard.writeText(lobby.partyCode); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { say(`Code: ${lobby.partyCode}`); }
  };
  const join = async (index: number) => {
    if (demo) return say("Sample party. Connect the database to join real ones.");
    if (!user) return onNeedSignIn();
    if (inParty) return say("Leave your current party first.");
    setBusy(true);
    try {
      await lobbyDb.join(lobby.id, index, { uid: user.uid, name: profile?.riotName ? `${profile.riotName}#${profile.riotTag}` : profile?.displayName || "Agent", avatar: profile?.playerCardUrl || user.photoURL, rankTier: profile?.rankTier || 0 });
      say("Seat claimed. Copy the code and join in game.");
    } catch (e) { say((e as Error).message); } finally { setBusy(false); }
  };
  const leave = async () => { if (!user) return; setBusy(true); try { await lobbyDb.leave(lobby.id, user.uid); say("You left the party."); } catch (e) { say((e as Error).message); } finally { setBusy(false); } };
  const close = async () => { setBusy(true); try { await lobbyDb.close(lobby.id); say("Party closed."); } catch (e) { say((e as Error).message); } finally { setBusy(false); } };

  return (
    <article className={cn("card flex h-full flex-col gap-3 p-4", isMember && "border-teal/50")}>
      <header className="flex items-start gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-ink-3">
          {lobby.hostAvatarUrl ? <Img src={lobby.hostAvatarUrl} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center font-display text-lg text-val">{lobby.hostName.slice(0, 1).toUpperCase()}</span>}
          <img src={host.icon} alt="" className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded bg-ink/80 p-0.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-bold leading-tight">{lobby.hostName}</p>
          <p className="text-xs text-fg-2" style={{ color: host.color }}>{host.name} · <span className="text-fg-3">{lobby.server}</span></p>
        </div>
        <div className="text-right">
          <span className={cn("inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase", mode?.ranked ? "bg-val/20 text-val" : "bg-teal/15 text-teal")}>{mode?.short || lobby.mode}</span>
          <p className="mt-1 text-[11px] text-fg-3">{timeAgo(lobby.createdAt)}</p>
        </div>
      </header>

      <ul className="grid grid-cols-5 gap-1.5" aria-label="Seats">
        {lobby.slots.map((s) => {
          const a = s.restriction?.type === "agent" ? agents.find((x) => x.id === s.restriction?.value) : null;
          const icon = s.status === "filled" ? (a?.icon || s.userAvatarUrl) : s.restriction?.iconUrl || a?.icon;
          const label = s.status === "filled" ? s.userName || "Taken" : s.status === "locked" ? "Locked" : s.restriction?.type === "any" || !s.restriction ? "Open" : s.restriction.displayName || "Open";
          const canJoin = s.status === "open" && !isMember && !busy;
          return (
            <li key={s.index}>
              <button type="button" disabled={!canJoin} onClick={() => join(s.index)} title={label} aria-label={`Seat ${s.index + 1}: ${label}`}
                className={cn("flex w-full flex-col items-center gap-1 rounded-lg border p-1.5 text-[10px] font-semibold leading-tight",
                  s.status === "filled" ? "border-line bg-ink-3 text-fg-2" : s.status === "locked" ? "border-line/50 bg-ink/40 text-fg-3" : "border-dashed border-teal/50 bg-teal/5 text-teal hover:bg-teal/15 disabled:hover:bg-teal/5")}>
                <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-md bg-ink-4">
                  {s.status === "locked" ? <Lock size={14} /> : icon ? <Icon src={icon} alt="" size={32} className={cn("h-8 w-8 object-cover", s.restriction?.type === "role" && s.status !== "filled" && "invert p-1.5")} /> : s.status === "open" ? <UserPlus size={14} /> : <span className="font-display text-sm text-fg">{(s.userName || "?").slice(0, 1).toUpperCase()}</span>}
                </span>
                <span className="w-full break-words text-center leading-tight line-clamp-2">{s.index === 0 ? "Host" : label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-1.5 text-[11px] text-fg-2">
        <span className="chip py-1">{lobby.micRequired ? <Mic size={11} /> : <MicOff size={11} />} {lobby.micRequired ? "Mic required" : "Mic optional"}</span>
        <span className="chip py-1">{rankByTier(lobby.minRank).name} → {rankByTier(lobby.maxRank).name}</span>
        <span className="chip py-1">{lobby.memberCount}/{lobby.maxMembers} · {open} open</span>
      </div>
      {lobby.note && <p className="text-xs italic text-fg-2">“{lobby.note}”</p>}

      <footer className="mt-auto flex gap-2 pt-1">
        <button type="button" onClick={copy} className={cn("btn-ghost flex-1 font-mono tracking-wider", copied && "border-teal text-teal")}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : lobby.partyCode ? `Code ${lobby.partyCode}` : "No code yet"}</button>
        {isHost && <button type="button" onClick={close} disabled={busy} className="btn-ghost text-val" aria-label="Close party"><Trash2 size={16} /></button>}
        {isMember && !isHost && <button type="button" onClick={leave} disabled={busy} className="btn-ghost" aria-label="Leave party"><LogOut size={16} /></button>}
      </footer>
    </article>
  );
}
