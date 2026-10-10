"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile,
  type User,
} from "firebase/auth";
import { firebaseReady, getFirebase } from "@/lib/firebase";
import { profiles } from "@/lib/db";
import type { Profile } from "@/types/lobby";

interface Ctx {
  ready: boolean;            // Firebase configured at all
  loading: boolean;          // auth state still resolving
  user: User | null;
  profile: Profile | null;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (p: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!firebaseReady) return;
    const { auth } = getFirebase();
    return onAuthStateChanged(auth!, (u) => { setUser(u); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    let unsub: (() => void) | undefined;
    (async () => {
      const existing = await profiles.get(user.uid).catch(() => null);
      if (!existing) {
        const fresh: Profile = {
          uid: user.uid, displayName: user.displayName || user.email?.split("@")[0] || "Agent", email: user.email, photoURL: user.photoURL,
          region: "AP", rankTier: 0, rankName: "Unranked", rankVerified: false, updatedAt: Date.now(),
        };
        await profiles.upsert(fresh).catch(() => {});
      }
      unsub = profiles.subscribe(user.uid, setProfile);
    })();
    return () => unsub?.();
  }, [user]);

  const signInGoogle = useCallback(async () => { const { auth } = getFirebase(); await signInWithPopup(auth!, new GoogleAuthProvider()); }, []);
  const signInEmail = useCallback(async (e: string, p: string) => { const { auth } = getFirebase(); await signInWithEmailAndPassword(auth!, e, p); }, []);
  const signUpEmail = useCallback(async (e: string, p: string, name: string) => {
    const { auth } = getFirebase();
    const cred = await createUserWithEmailAndPassword(auth!, e, p);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
      await profiles.upsert({ uid: cred.user.uid, displayName: name, email: e, photoURL: null, region: "AP", rankTier: 0, rankName: "Unranked", rankVerified: false, updatedAt: Date.now() }).catch(() => {});
    }
  }, []);
  const logout = useCallback(async () => { const { auth } = getFirebase(); await signOut(auth!); }, []);
  const saveProfile = useCallback(async (p: Partial<Profile>) => {
    if (!user) return;
    await profiles.upsert({ ...(profile ?? { uid: user.uid, displayName: user.displayName || "Agent", region: "AP", rankTier: 0, rankName: "Unranked", rankVerified: false, updatedAt: 0 }), ...p, uid: user.uid } as Profile);
  }, [user, profile]);

  const value = useMemo(() => ({ ready: firebaseReady, loading, user, profile, signInGoogle, signInEmail, signUpEmail, logout, saveProfile }),
    [loading, user, profile, signInGoogle, signInEmail, signUpEmail, logout, saveProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
