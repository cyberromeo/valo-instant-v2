"use client";
import {
  addDoc, collection, deleteDoc, doc, getDoc, limit, onSnapshot, query, runTransaction, serverTimestamp, setDoc, updateDoc, where,
  type DocumentData, type QueryDocumentSnapshot, type Unsubscribe,
} from "firebase/firestore";
import { getFirebase } from "./firebase";
import { LOBBY_TTL_MS, type Lobby, type LobbySlot, type Profile } from "@/types/lobby";

const toLobby = (d: QueryDocumentSnapshot<DocumentData>): Lobby => {
  const x = d.data();
  return { ...(x as Omit<Lobby, "id">), id: d.id, slots: Array.isArray(x.slots) ? x.slots : [] };
};

function need() {
  const { db, auth } = getFirebase();
  if (!db || !auth) throw new Error("Database is not connected yet.");
  return { db, auth };
}

export const lobbies = {
  /** Live list of open lobbies in a region, newest first. Expired ones are dropped client-side. */
  subscribe(region: string, cb: (rows: Lobby[]) => void, onError?: (e: Error) => void): Unsubscribe {
    const { db } = need();
    // Single-field filter only, sorted here: no composite index is needed for the app to work.
    // (firestore.indexes.json ships the region+createdAt index for larger regions; deploy it when convenient.)
    const q = query(collection(db, "lobbies"), where("region", "==", region), limit(200));
    return onSnapshot(q, (snap) => {
      const now = Date.now();
      cb(snap.docs.map(toLobby).filter((l) => l.expiresAt > now && l.status !== "closed").sort((a, b) => b.createdAt - a.createdAt));
    }, (e) => onError?.(e));
  },

  async create(data: Omit<Lobby, "id" | "createdAt" | "expiresAt" | "memberIds" | "memberCount" | "status">) {
    const { db } = need();
    const now = Date.now();
    const payload = {
      ...data,
      memberIds: [data.hostId],
      memberCount: 1,
      status: "open" as const,
      createdAt: now,
      expiresAt: now + LOBBY_TTL_MS,
      serverCreatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, "lobbies"), payload);
    return ref.id;
  },

  /** Claim an open slot. Runs as a transaction so two people cannot take the same seat. */
  async join(lobbyId: string, slotIndex: number, me: { uid: string; name: string; avatar?: string | null; rankTier?: number }) {
    const { db } = need();
    const ref = doc(db, "lobbies", lobbyId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error("This party is gone.");
      const l = snap.data() as Lobby;
      if (l.expiresAt < Date.now() || l.status === "closed") throw new Error("This party has expired.");
      if ((l.memberIds || []).includes(me.uid)) throw new Error("You are already in this party.");
      const slots: LobbySlot[] = [...l.slots];
      const s = slots[slotIndex];
      if (!s || s.status !== "open") throw new Error("That seat was just taken.");
      slots[slotIndex] = { ...s, status: "filled", userId: me.uid, userName: me.name, userAvatarUrl: me.avatar ?? null, userRankTier: me.rankTier ?? 0 };
      const memberIds = [...(l.memberIds || []), me.uid];
      const open = slots.some((x) => x.status === "open");
      tx.update(ref, { slots, memberIds, memberCount: memberIds.length, status: open ? "open" : "full" });
    });
  },

  async leave(lobbyId: string, uid: string) {
    const { db } = need();
    const ref = doc(db, "lobbies", lobbyId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const l = snap.data() as Lobby;
      const slots = l.slots.map((s) => (s.userId === uid && s.index !== 0 ? { ...s, status: "open" as const, userId: null, userName: null, userAvatarUrl: null, userRankTier: null } : s));
      const memberIds = (l.memberIds || []).filter((m) => m !== uid);
      tx.update(ref, { slots, memberIds, memberCount: memberIds.length, status: "open" });
    });
  },

  async close(lobbyId: string) { const { db } = need(); await deleteDoc(doc(db, "lobbies", lobbyId)); },
  async update(lobbyId: string, data: Partial<Lobby>) { const { db } = need(); await updateDoc(doc(db, "lobbies", lobbyId), data); },

  subscribeMine(uid: string, cb: (rows: Lobby[]) => void): Unsubscribe {
    const { db } = need();
    const q = query(collection(db, "lobbies"), where("memberIds", "array-contains", uid));
    return onSnapshot(q, (snap) => cb(snap.docs.map(toLobby).filter((l) => l.expiresAt > Date.now())));
  },
};

export const profiles = {
  async get(uid: string): Promise<Profile | null> {
    const { db } = need();
    const s = await getDoc(doc(db, "users", uid));
    return s.exists() ? (s.data() as Profile) : null;
  },
  subscribe(uid: string, cb: (p: Profile | null) => void): Unsubscribe {
    const { db } = need();
    return onSnapshot(doc(db, "users", uid), (s) => cb(s.exists() ? (s.data() as Profile) : null));
  },
  async upsert(p: Profile) { const { db } = need(); await setDoc(doc(db, "users", p.uid), { ...p, updatedAt: Date.now() }, { merge: true }); },
};
