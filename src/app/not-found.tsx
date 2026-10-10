import Link from "next/link";
export default function NotFound() {
  return <div className="py-20 text-center"><p className="kicker">404</p><h1 className="h1">Nothing here</h1><p className="mt-2 text-sm text-fg-2">That page does not exist.</p><Link href="/" className="btn-primary mt-5">Back home</Link></div>;
}
