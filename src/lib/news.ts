import "server-only";

export interface NewsItem { title: string; link: string; date: string; description: string }

function pick(xml: string, tag: string) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : "";
}

export async function getEsportsNews(limit = 20): Promise<NewsItem[]> {
  try {
    const r = await fetch("https://www.vlr.gg/rss", { next: { revalidate: 900 }, headers: { "User-Agent": "valo-instant-v2" } });
    if (!r.ok) return [];
    const xml = await r.text();
    const items = xml.split("<item>").slice(1);
    return items.slice(0, limit).map((it) => ({
      title: pick(it, "title"),
      link: pick(it, "link"),
      date: pick(it, "pubDate"),
      description: pick(it, "description").replace(/<[^>]+>/g, "").slice(0, 220),
    }));
  } catch { return []; }
}
