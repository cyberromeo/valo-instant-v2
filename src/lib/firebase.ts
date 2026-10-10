"use client";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

/** True when a real project config or the emulator is available. */
export const firebaseReady = useEmulator || !!(cfg.apiKey && cfg.projectId && cfg.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
const g = globalThis as unknown as { __valoEmu?: boolean };

export function getFirebase() {
  if (!firebaseReady) return { app: null, auth: null, db: null };
  if (!app) {
    app = getApps()[0] ?? initializeApp(useEmulator ? { ...cfg, apiKey: cfg.apiKey || "demo-key", projectId: cfg.projectId || "valo-instant-v2", appId: cfg.appId || "demo-app" } : cfg);
    auth = getAuth(app);
    db = getFirestore(app);
    if (useEmulator && !g.__valoEmu) {
      g.__valoEmu = true;
      const host = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(db, host, 8080);
    }
  }
  return { app, auth: auth!, db: db! };
}
