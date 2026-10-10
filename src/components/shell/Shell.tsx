"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Radio, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchButton } from "@/components/wiki/SearchOverlay";
import { useAuth } from "@/contexts/AuthContext";

const TABS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/party", label: "Party", icon: Users, match: (p: string) => p.startsWith("/party") },
  { href: "/wiki", label: "Wiki", icon: BookOpen, match: (p: string) => p.startsWith("/wiki") },
  { href: "/status", label: "Live", icon: Radio, match: (p: string) => p.startsWith("/status") || p.startsWith("/news") },
  { href: "/profile", label: "Profile", icon: User, match: (p: string) => p.startsWith("/profile") },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, profile } = useAuth();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur-md" style={{ paddingTop: "var(--sat)" }}>
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl uppercase tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-val text-white slant text-sm">V</span>
            <span>Valo <span className="text-val">Instant</span></span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Primary">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold text-fg-2 hover:text-fg", t.match(path) && "bg-ink-3 text-fg")}>{t.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <SearchButton />
            <Link href="/profile" className="hidden items-center gap-2 rounded-full border border-line bg-ink-3 py-1 pl-1 pr-3 text-xs font-semibold md:flex">
              {profile?.playerCardUrl || user?.photoURL ? <img src={profile?.playerCardUrl || user?.photoURL || ""} alt="" className="h-6 w-6 rounded-full object-cover" /> : <span className="grid h-6 w-6 place-items-center rounded-full bg-val/20 text-val">●</span>}
              <span className="max-w-[140px] truncate">{profile?.riotName ? `${profile.riotName}#${profile.riotTag}` : user ? profile?.displayName || "Agent" : "Sign in"}</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 pb-28 pt-4 md:pb-10">{children}</main>
      <footer className="hidden px-4 pb-8 text-xs text-fg-3 md:block">
        VALO INSTANT v2 by SRIHARI · game data from valorant-api.com · Not affiliated with Riot Games. VALORANT and all related assets are trademarks of Riot Games, Inc.
      </footer>
      <nav aria-label="Tabs" className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-ink/90 backdrop-blur-md md:hidden" style={{ paddingBottom: "var(--sab)" }}>
        <ul className="grid grid-cols-5">
          {TABS.map((t) => {
            const on = t.match(path);
            return (
              <li key={t.href}>
                <Link href={t.href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-fg-3", on && "text-val")} aria-current={on ? "page" : undefined}>
                  <t.icon size={22} strokeWidth={on ? 2.4 : 1.8} />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
