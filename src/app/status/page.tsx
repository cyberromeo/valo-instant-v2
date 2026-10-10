import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui/PageHead";
import { en, getRiotStatus, STATUS_REGIONS } from "@/lib/riot-status";
import { getVersion } from "@/lib/valorant-api";
import { fmtDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Server status" };
export const revalidate = 120;
const NAMES: Record<string, string> = { ap: "Asia Pacific", na: "North America", eu: "Europe", kr: "Korea", br: "Brazil", latam: "Latin America" };

export default async function StatusPage() {
  const [version, ...regions] = await Promise.all([getVersion(), ...STATUS_REGIONS.map((r) => getRiotStatus(r))]);
  return (
    <>
      <PageHead kicker={`LIVE · PATCH ${version.version.split(".").slice(0, 2).join(".")} · BUILD ${version.buildVersion}`} title="Server status" sub="Riot's own status feed for every Valorant region, refreshed every couple of minutes." right={<Link href="/news" className="btn-ghost">Esports news</Link>} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {STATUS_REGIONS.map((r, i) => {
          const s = regions[i];
          const incidents = s?.incidents || [];
          const maint = s?.maintenances || [];
          const ok = incidents.length === 0;
          return (
            <li key={r} className="card p-4">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${!s ? "bg-fg-3" : ok ? "bg-teal animate-pulseDot" : "bg-val"}`} aria-hidden />
                <p className="font-display text-2xl uppercase leading-none">{NAMES[r]}</p>
                <span className="ml-auto text-xs font-semibold text-fg-2">{!s ? "No data" : ok ? "All systems normal" : `${incidents.length} incident${incidents.length > 1 ? "s" : ""}`}</span>
              </div>
              {incidents.map((e) => (
                <div key={e.id} className="mt-3 rounded-xl border border-val/40 bg-val/10 p-3 text-sm">
                  <p className="font-bold">{en(e.titles)}</p>
                  {e.updates?.[0] && <p className="mt-1 text-xs text-fg-2">{en(e.updates[0].translations)}</p>}
                  <p className="mt-1 text-[11px] text-fg-3">{e.incident_severity ? `${e.incident_severity} · ` : ""}{fmtDate(e.created_at)}</p>
                </div>
              ))}
              {maint.map((e) => (
                <div key={e.id} className="mt-3 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm">
                  <p className="font-bold">{en(e.titles)}</p>
                  {e.updates?.[0] && <p className="mt-1 text-xs text-fg-2">{en(e.updates[0].translations)}</p>}
                  <p className="mt-1 text-[11px] text-fg-3">Maintenance{e.maintenance_status ? ` · ${e.maintenance_status}` : ""} · {fmtDate(e.created_at)}</p>
                </div>
              ))}
              {s && ok && maint.length === 0 && <p className="mt-2 text-xs text-fg-3">No incidents or planned maintenance.</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-fg-3">Game version {version.version} · engine {version.engineVersion} · built {fmtDate(version.buildDate)}.</p>
    </>
  );
}
