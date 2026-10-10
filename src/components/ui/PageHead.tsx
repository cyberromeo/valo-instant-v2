import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHead({ kicker, title, sub, back, right }: { kicker?: string; title: string; sub?: string | null; back?: { href: string; label: string }; right?: React.ReactNode }) {
  return (
    <div className="mb-5 animate-rise">
      {back && <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-fg-2 hover:text-fg"><ArrowLeft size={14} /> {back.label}</Link>}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {kicker && <p className="kicker mb-1">{kicker}</p>}
          <h1 className="h1 break-words">{title}</h1>
          {sub && <p className="mt-2 max-w-2xl text-sm text-fg-2">{sub}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}
