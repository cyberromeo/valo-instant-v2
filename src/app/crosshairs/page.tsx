import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { PageHead } from "@/components/ui/PageHead";
import { CrosshairBrowser } from "@/components/crosshair/CrosshairBrowser";
import { CHECKED_ON, CROSSHAIRS, FAMILIES, FAMILY_SWATCH } from "@/lib/crosshair-library";
import { fmtDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Crosshairs", description: "Every working Valorant crosshair code from the pros, plus classic and fun styles, with live previews and one-tap copy." };

export default function CrosshairsPage() {
  const pros = CROSSHAIRS.filter((x) => x.cat === "pro").length;
  return (
    <>
      <PageHead
        kicker={`${CROSSHAIRS.length} CODES · ${pros} PROS`}
        title="Crosshairs"
        sub={`Pro players' current crosshairs plus classic and fun styles. Every preview is drawn from the code itself, and every code was checked on ${fmtDate(CHECKED_ON)}. Copy one, then in game go to Settings → Crosshair → Import.`}
        right={<Link href="/crosshairs/build" className="btn-primary hidden shrink-0 sm:inline-flex"><SlidersHorizontal size={16} /> Build your own</Link>}
      />
      <Link href="/crosshairs/build" className="btn-primary mb-4 w-full sm:hidden"><SlidersHorizontal size={16} /> Build your own</Link>
      <Suspense fallback={<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-ink-3" />)}</div>}>
        <CrosshairBrowser items={CROSSHAIRS} families={FAMILIES} swatches={FAMILY_SWATCH} />
      </Suspense>
    </>
  );
}
