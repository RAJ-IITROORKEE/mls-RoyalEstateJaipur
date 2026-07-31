import { Mail, Phone } from "lucide-react";
import Link from "next/link";

import { PublicPage } from "@/components/layout/public-page";
import { Button } from "@/components/ui/button";
import { getEnvironment } from "@/lib/env";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const environment = getEnvironment();
  const error = first(params.error);
  const propertyReference = first(params.property);
  const propertyIntent = first(params.intent);
  const intentLabel =
    propertyIntent === "RENT"
      ? "renting"
      : propertyIntent === "LEASE"
        ? "leasing"
        : "buying";
  return (
    <PublicPage>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1360px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Contact
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.95] sm:text-7xl">
            Bring the question. We will bring the next step.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            Ask about a published property, request a callback, or tell us what
            you are looking for.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1120px] gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.7fr_1.3fr]">
        <aside>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Direct contact
          </p>
          <div className="mt-6 grid gap-4 text-sm">
            <a
              className="flex items-center gap-3 font-semibold"
              href={`mailto:${environment.NEXT_PUBLIC_BUSINESS_EMAIL}`}
            >
              <Mail aria-hidden="true" className="size-4 text-primary" />{" "}
              {environment.NEXT_PUBLIC_BUSINESS_EMAIL}
            </a>
            <a
              className="flex items-center gap-3 font-semibold"
              href={`tel:${environment.NEXT_PUBLIC_BUSINESS_PHONE}`}
            >
              <Phone aria-hidden="true" className="size-4 text-primary" />{" "}
              {environment.NEXT_PUBLIC_BUSINESS_PHONE}
            </a>
          </div>
          <p className="mt-8 text-sm leading-7 text-muted-foreground">
            We use the details you submit only to respond to the enquiry and
            route it to the appropriate workspace.
          </p>
          <Link
            className="mt-6 inline-flex text-sm font-bold text-primary"
            href="/privacy"
          >
            Read privacy notes
          </Link>
        </aside>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10">
          <h2 className="font-serif text-4xl">
            {propertyReference ? `Ask about ${propertyReference}` : "Send an enquiry"}
          </h2>
          {propertyReference && (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your property reference is included automatically so the team can respond about {intentLabel} this listing.
            </p>
          )}
          {params.sent && (
            <p
              aria-live="polite"
              className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm leading-6"
            >
              Your enquiry is with the team. We will respond using the contact
              details provided.
            </p>
          )}
          {error && (
            <p
              aria-live="polite"
              className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm leading-6 text-destructive"
            >
              {error}
            </p>
          )}
          <form
            className="mt-8 grid gap-5"
            action="/api/enquiries"
            method="post"
          >
            <input
              aria-hidden="true"
              autoComplete="off"
              className="hidden"
              name="website"
              tabIndex={-1}
            />
            <input
              name="propertyReference"
              type="hidden"
              value={propertyReference ?? ""}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Name
                <input
                  className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="name"
                  name="contactName"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email
                <input
                  className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoComplete="email"
                  name="email"
                  required
                  type="email"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              Phone{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
              <input
                className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoComplete="tel"
                inputMode="tel"
                name="phone"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Message
              <textarea
                className="min-h-36 rounded-xl border border-border bg-background p-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={
                  propertyReference
                    ? `I would like to know more about ${intentLabel} property ${propertyReference}.`
                    : undefined
                }
                name="message"
                required
              />
            </label>
            <label className="flex items-start gap-3 text-sm leading-6">
              <input
                className="mt-1 size-4 accent-primary"
                name="consent"
                required
                type="checkbox"
              />
              <span>I consent to being contacted about this enquiry.</span>
            </label>
            <Button className="min-h-12 sm:w-fit" type="submit">
              Send enquiry
            </Button>
          </form>
        </div>
      </section>
    </PublicPage>
  );
}
