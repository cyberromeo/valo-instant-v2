"use client";
import { useState } from "react";
import { Img } from "@/components/ui/Img";
import type { Ability } from "@/types/valorant";
import { cn } from "@/lib/utils";

const KEY: Record<string, string> = { Grenade: "C", Ability1: "Q", Ability2: "E", Ultimate: "X", Passive: "P" };

export function AbilityTabs({ abilities }: { abilities: Ability[] }) {
  const list = abilities.filter((a) => a.displayName);
  const [i, setI] = useState(0);
  const ab = list[i];
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-4 border-b border-line sm:grid-cols-5" role="tablist">
        {list.map((a, k) => (
          <button key={a.slot} role="tab" aria-selected={i === k} type="button" onClick={() => setI(k)}
            className={cn("flex flex-col items-center gap-1 px-2 py-3 text-[11px] font-semibold text-fg-3 transition", i === k && "bg-ink-3 text-fg border-b-2 border-val")}>
            <span className="relative"><Img src={a.displayIcon} alt="" className="h-8 w-8 invert" /><kbd className="absolute -right-2 -top-1 rounded bg-val px-1 font-mono text-[9px] text-white">{KEY[a.slot] || "?"}</kbd></span>
            <span className="max-w-full truncate">{a.displayName}</span>
          </button>
        ))}
      </div>
      {ab && (
        <div className="p-4 sm:p-5" role="tabpanel">
          <p className="kicker mb-1">{KEY[ab.slot] === "X" ? "ULTIMATE" : KEY[ab.slot] === "P" ? "PASSIVE" : `KEY ${KEY[ab.slot]}`}</p>
          <h3 className="h2 mb-2 text-xl sm:text-2xl">{ab.displayName}</h3>
          <p className="text-sm leading-relaxed text-fg-2">{ab.description}</p>
        </div>
      )}
    </div>
  );
}
