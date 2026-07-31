import { ArrowUpRight, FileCheck2, Handshake, SearchCheck } from "lucide-react";
import Link from "next/link";

import { PublicPage } from "@/components/layout/public-page";

const services = [
  [SearchCheck, "Property discovery", "A focused way to narrow published inventory by intent, type, and locality."],
  [FileCheck2, "Listing review", "A structured submission path for owners before a property is considered for publication."],
  [Handshake, "Conversation support", "A direct enquiry path for questions, callbacks, and site-visit requests without implying a booking."],
] as const;

export default function ServicesPage() {
  return <PublicPage><section className="border-b border-border bg-card"><div className="mx-auto max-w-[1360px] px-5 py-20 sm:px-8 sm:py-28"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How we help</p><h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.95] sm:text-7xl">A clear path from question to next step.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">The platform keeps discovery, review, and contact legible. No invented certainty, no hidden booking promise.</p></div></section><section className="mx-auto grid max-w-[1360px] gap-5 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-3">{services.map(([Icon, title, detail]) => <article className="rounded-2xl border border-border bg-card p-6" key={title}><Icon aria-hidden="true" className="size-7 text-primary" /><h2 className="mt-12 font-serif text-3xl">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{detail}</p></article>)}</section><section className="mx-auto max-w-[1360px] px-5 pb-20 sm:px-8 sm:pb-28"><div className="rounded-[2rem] border border-border p-8 sm:p-12"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Need a specific answer?</p><h2 className="mt-3 max-w-2xl font-serif text-4xl">Tell us what you are trying to decide.</h2><Link className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground" href="/contact">Talk to the team <ArrowUpRight aria-hidden="true" className="size-4" /></Link></div></section></PublicPage>;
}
