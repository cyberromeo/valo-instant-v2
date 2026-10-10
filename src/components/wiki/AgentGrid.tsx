"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Img } from "@/components/ui/Img";
import { cn } from "@/lib/utils";

type A = { slug: string; name: string; role: string; icon: string; bust: string | null; colors: string[]; abilities: string[] };

export function AgentGrid({ agents, roles }: { agents: A[]; roles: string[] }) {
  const [role, setRole] = useState("All");
  const [q, setQ] = useState("");
  const list = useMemo(() => agents.filter((a) => (role === "All" || a.role === role) && (!q || a.name.toLowerCase().includes(q.toLowerCase()) || a.abilities.some((x) => x.toLowerCase().includes(q.toLowerCase())))), [agents, role, q]);
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="scroll-x sm:mx-0 sm:px-0">
          {["All", ...roles].map((r) => <button key={r} type="button" onClick={() => setRole(r)} className={cn("chip", role === r && "chip-on")}>{r}</button>)}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents or abilities" className="input sm:ml-auto sm:max-w-xs" aria-label="Search agents" />
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((a) => (
          <li key={a.slug}>
            <Link href={`/wiki/agents/${a.slug}`} className="card group relative block aspect-[4/5] overflow-hidden" style={{ background: `linear-gradient(160deg, #${a.colors?.[0]?.slice(0, 6) || "1f232c"}55, #${a.colors?.[2]?.slice(0, 6) || "0a0b0f"})` }}>
              <Img src={a.bust} alt="" className="absolute inset-x-0 bottom-0 h-full w-full object-cover object-top transition group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent p-3 pt-10">
                <p className="font-display text-2xl uppercase leading-none">{a.name}</p>
                <p className="text-xs text-fg-2">{a.role}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="py-10 text-center text-sm text-fg-3">No agent matches that.</p>}
    </>
  );
}
