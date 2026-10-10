import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui/PageHead";

export const metadata: Metadata = { title: "How to use" };

const STEPS = [
  { n: "01", t: "Sign in", d: "Use Google or an email. Then link your Riot ID on the Profile tab so teammates see your rank and card." },
  { n: "02", t: "Open your party in Valorant", d: "In the game, go to your party screen, set it to Open, and copy the party code (it looks like VAL143)." },
  { n: "03", t: "Create a party here", d: "Tap Create party, pick the mode, region and server, paste your code, and choose who you want in each seat: anyone, a role, or a specific agent. Lock seats you are saving for friends." },
  { n: "04", t: "Or claim a seat", d: "Browsing is open to everyone. Tap an open seat on a party that fits you, then Copy the code and paste it into the Join Party box in Valorant. You join automatically." },
  { n: "05", t: "Keep it clean", d: "Parties disappear on their own after one hour. When you are full, close your party so nobody keeps knocking." },
];

export default function HowTo() {
  return (
    <>
      <PageHead kicker="PARTY FINDER" title="How to use" sub="Five steps from solo queue to a full stack." back={{ href: "/party", label: "Party finder" }} />
      <ol className="grid gap-3">
        {STEPS.map((s) => (
          <li key={s.n} className="card flex gap-4 p-4">
            <span className="font-display text-3xl text-val">{s.n}</span>
            <div><p className="text-base font-bold">{s.t}</p><p className="mt-1 text-sm leading-relaxed text-fg-2">{s.d}</p></div>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex gap-2"><Link href="/party" className="btn-primary">Find a party</Link><Link href="/profile" className="btn-ghost">Set up profile</Link></div>
    </>
  );
}
