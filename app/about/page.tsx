import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PublicPage } from "@/components/layout/public-page";

export const metadata: Metadata = {
  title: "About Royal Estates Jaipur",
  description:
    "Explore how Royal Estates Jaipur presents property details, enquiries, and owner submissions.",
  alternates: { canonical: "/about" },
};

const steps = [
  {
    number: "01",
    title: "Explore with context",
    body: "Property pages bring the location, category, area, price, and available listing details together.",
  },
  {
    number: "02",
    title: "Ask a focused question",
    body: "Send an enquiry from the listing page so the team can follow up about the property you have in mind.",
  },
  {
    number: "03",
    title: "Confirm the next step",
    body: "Availability and site visits are discussed directly with the team. An enquiry does not reserve a property.",
  },
];

export default function AboutPage() {
  return (
    <PublicPage>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              About Royal Estates Jaipur
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.96] tracking-tight sm:text-6xl lg:text-7xl">
              Property decisions start with better questions.
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            We bring property listings and the practical details around them
            into one place, so buyers, renters, and owners can begin their next
            conversation with more context.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1360px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            How we work
          </p>
          <h2 className="mt-3 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
            From the first search to a real conversation.
          </h2>
        </div>
        <ol className="divide-y divide-border border-y border-border">
          {steps.map((step) => (
            <li className="grid gap-3 py-6 sm:grid-cols-[64px_1fr]" key={step.number}>
              <span className="text-sm font-bold tabular-nums text-accent">
                {step.number}
              </span>
              <div>
                <h3 className="font-serif text-2xl">{step.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-muted/60">
        <div className="mx-auto grid max-w-[1360px] gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-2">
          <article className="border-l-2 border-primary pl-6 sm:pl-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              For buyers and renters
            </p>
            <h2 className="mt-4 max-w-md font-serif text-3xl leading-tight sm:text-4xl">
              Find the details that help you decide what to ask next.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
              Browse by locality and property type, review the information on a
              listing, and contact the team to confirm current availability.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline decoration-border underline-offset-4 hover:decoration-primary"
              href="/properties"
            >
              Explore properties
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </article>
          <article className="border-l-2 border-accent pl-6 sm:pl-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              For property owners
            </p>
            <h2 className="mt-4 max-w-md font-serif text-3xl leading-tight sm:text-4xl">
              Share your property for review.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
              Add the key information and photos through your owner workspace.
              A staff review happens before a listing is published.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline decoration-border underline-offset-4 hover:decoration-primary"
              href="/list-property"
            >
              Submit a property
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </article>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1360px] flex-col gap-7 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Take the next step
          </p>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            Start with a search or speak with the team.
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover hover:text-primary-hover-foreground"
            href="/properties"
          >
            Browse properties
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            className="inline-flex min-h-12 items-center rounded-xl border border-border px-5 text-sm font-bold transition-colors hover:bg-muted"
            href="/contact"
          >
            Contact us
          </Link>
        </div>
      </section>
    </PublicPage>
  );
}
