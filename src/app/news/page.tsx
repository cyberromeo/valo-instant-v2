import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageHead } from "@/components/ui/PageHead";
import { getEsportsNews } from "@/lib/news";
import { fmtDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Esports news" };
export const revalidate = 900;

export default async function NewsPage() {
  const news = await getEsportsNews(25);
  return (
    <>
      <PageHead kicker="ESPORTS · VLR.GG" title="News" sub="The latest Valorant esports headlines from vlr.gg, refreshed every 15 minutes." right={<Link href="/status" className="btn-ghost">Server status</Link>} />
      {news.length === 0 ? <p className="card p-5 text-sm text-fg-2">The news feed is not answering right now. Try again in a minute.</p> : (
        <ul className="grid gap-2">
          {news.map((n) => (
            <li key={n.link}>
              <a href={n.link} target="_blank" rel="noreferrer" className="card flex items-start gap-3 p-4 hover:border-line-2">
                <div className="min-w-0 flex-1"><p className="text-sm font-bold leading-snug">{n.title}</p>{n.description && <p className="mt-1 line-clamp-2 text-xs text-fg-2">{n.description}</p>}<p className="mt-1 text-[11px] text-fg-3">{fmtDate(n.date)}</p></div>
                <ExternalLink size={14} className="mt-1 shrink-0 text-fg-3" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
