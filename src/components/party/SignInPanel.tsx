"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const nice = (code: string) => ({
  "auth/invalid-credential": "That email and password do not match.",
  "auth/user-not-found": "No account with that email yet. Create one below.",
  "auth/wrong-password": "That password is wrong.",
  "auth/email-already-in-use": "That email already has an account. Sign in instead.",
  "auth/weak-password": "Use at least 6 characters for the password.",
  "auth/invalid-email": "That email address does not look right.",
  "auth/popup-closed-by-user": "The Google window was closed before finishing.",
  "auth/unauthorized-domain": "Google sign-in is not enabled for this site address yet.",
  "auth/operation-not-allowed": "This sign-in method is not switched on yet.",
}[code] || "Sign-in failed. Try again.");

export function SignInPanel({ onClose }: { onClose: () => void }) {
  const { signInGoogle, signInEmail, signUpEmail } = useAuth();
  const [tab, setTab] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [name, setName] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const run = async (fn: () => Promise<void>) => { setBusy(true); setErr(""); try { await fn(); onClose(); } catch (e) { setErr(nice((e as { code?: string }).code || "")); } finally { setBusy(false); } };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="card w-full max-w-md rounded-b-none p-5 sm:rounded-2xl animate-rise" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between"><div><p className="kicker">IDENTITY</p><h2 className="h2 text-xl">{tab === "in" ? "Sign in" : "Create account"}</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-fg-3" aria-label="Close"><X size={20} /></button></div>
        <button type="button" disabled={busy} onClick={() => run(signInGoogle)} className="btn-ghost w-full"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.8 38 46.5 31.8 46.5 24.5z"/><path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z"/></svg> Continue with Google</button>
        <div className="my-4 flex items-center gap-3 text-xs text-fg-3"><span className="h-px flex-1 bg-line" />or with email<span className="h-px flex-1 bg-line" /></div>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); run(() => tab === "in" ? signInEmail(email, pw) : signUpEmail(email, pw, name)); }}>
          {tab === "up" && <label className="block"><span className="label">Display name</span><input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="What teammates see" required maxLength={40} /></label>}
          <label className="block"><span className="label">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" required autoComplete="email" /></label>
          <label className="block"><span className="label">Password</span><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="input" placeholder="At least 6 characters" required minLength={6} autoComplete={tab === "in" ? "current-password" : "new-password"} /></label>
          {err && <p className="rounded-xl border border-val/40 bg-val/10 p-3 text-sm">{err}</p>}
          <button type="submit" disabled={busy} className="btn-primary">{busy ? "One moment…" : tab === "in" ? "Sign in" : "Create account"}</button>
        </form>
        <p className="mt-4 text-center text-xs text-fg-2">{tab === "in" ? "New here?" : "Already have an account?"} <button type="button" className="font-bold text-val" onClick={() => { setTab(tab === "in" ? "up" : "in"); setErr(""); }}>{tab === "in" ? "Create an account" : "Sign in"}</button></p>
      </div>
    </div>
  );
}
