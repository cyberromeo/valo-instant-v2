import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHead } from "@/components/ui/PageHead";
import { CrosshairBuilder } from "@/components/crosshair/CrosshairBuilder";

export const metadata: Metadata = { title: "Build a crosshair", description: "Design a Valorant crosshair with a live preview and copy its code." };

export default function BuildPage() {
  return (
    <>
      <PageHead back={{ href: "/crosshairs", label: "All crosshairs" }} kicker="CROSSHAIR BUILDER" title="Build your own" sub="Move the sliders and watch it change. The code below updates live and imports straight into the game." />
      <Suspense fallback={<div className="aspect-[16/10] animate-pulse rounded-2xl bg-ink-3" />}>
        <CrosshairBuilder />
      </Suspense>
    </>
  );
}
