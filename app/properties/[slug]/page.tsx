import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  Check,
  MapPin,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicPage } from "@/components/layout/public-page";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { createWhatsAppUrl } from "@/features/properties/domain";
import {
  getPublishedProperties,
  getPublishedProperty,
} from "@/features/properties/queries";
import { getEnvironment } from "@/lib/env";
import { formatInrMinorUnits } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedProperty(slug);
  if (!result.property) return { title: "Property not found" };
  return {
    title: result.property.title,
    description: result.property.description.slice(0, 160),
    alternates: { canonical: `/properties/${result.property.slug}` },
    openGraph: {
      title: result.property.title,
      description: result.property.description.slice(0, 160),
      type: "website",
      images: result.property.media.find((media) => media.publicUrl)?.publicUrl
        ? [result.property.media.find((media) => media.publicUrl)!.publicUrl!]
        : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublishedProperty(slug);
  if (result.connected && !result.property) notFound();
  const { NEXT_PUBLIC_BUSINESS_WHATSAPP: whatsapp } = getEnvironment();
  const property = result.property;
  const relatedResult = property
    ? await getPublishedProperties({ category: property.category, limit: 4 })
    : null;
  const relatedProperties =
    relatedResult?.properties
      .filter((candidate) => candidate.slug !== property?.slug)
      .slice(0, 3) ?? [];
  const structuredData = property
    ? {
        "@context": "https://schema.org",
        "@type": "Residence",
        name: property.title,
        description: property.description,
        address: {
          "@type": "PostalAddress",
          addressLocality: property.localityName,
          addressRegion: property.state,
          addressCountry: "IN",
          postalCode: property.postalCode ?? undefined,
        },
        ...(property.priceMinor !== null && !property.priceOnRequest
          ? {
              offers: {
                "@type": "Offer",
                price: (property.priceMinor / BigInt(100)).toString(),
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
              },
            }
          : {}),
        ...(property.bedrooms !== null
          ? { numberOfBedrooms: property.bedrooms }
          : {}),
        ...(property.areaValue !== null
          ? {
              floorSize: {
                "@type": "QuantitativeValue",
                value: property.areaValue.toString(),
                unitText: property.areaUnit ?? undefined,
              },
            }
          : {}),
      }
    : null;

  return (
    <PublicPage>
      <section className="mx-auto max-w-[1120px] px-5 py-12 sm:px-8 sm:py-20">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          href="/properties"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to properties
        </Link>
        {!result.connected ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-8">
            <h1 className="font-serif text-4xl">
              Property details are waiting for database setup.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This page only displays published records from the connected
              catalogue.
            </p>
          </div>
        ) : (
          property && (
            <>
              <div className="mt-12 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  {property.intent === "SELL"
                    ? "Buy"
                    : property.intent.toLowerCase()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {property.category === "OTHER"
                    ? property.otherPropertyType
                    : property.referenceNumber}
                </span>
              </div>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.95] sm:text-7xl">
                {property.title}
              </h1>
              <p className="mt-5 text-base text-muted-foreground">
                {property.localityName}, {property.city}, {property.state}
              </p>
              {structuredData && (
                <script
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData).replace(
                      /</g,
                      "\\u003c",
                    ),
                  }}
                  type="application/ld+json"
                />
              )}
              {property.media.some((media) => media.publicUrl) && (
                <div className="mt-10 grid gap-4 lg:grid-cols-[1.45fr_0.75fr]">
                  {property.media.slice(0, 1).map((media) =>
                    media.publicUrl ? (
                      <div
                        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted lg:aspect-auto lg:min-h-[34rem]"
                        key={media.storagePath}
                      >
                        <Image
                          alt={media.altText}
                          className="object-cover"
                          fill
                          priority
                          sizes="(min-width: 1024px) 68vw, 100vw"
                          src={media.publicUrl}
                        />
                      </div>
                    ) : null,
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {property.media.slice(1).map((media) =>
                      media.publicUrl ? (
                        <div
                          className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
                          key={media.storagePath}
                        >
                          <Image
                            alt={media.altText}
                            className="object-cover"
                            fill
                            sizes="(min-width: 1024px) 30vw, 50vw"
                            src={media.publicUrl}
                          />
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>
              )}
              <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                  <h2 className="font-serif text-3xl">Property overview</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-4">
                      <Building2
                        aria-hidden="true"
                        className="size-5 text-primary"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Property type
                        </p>
                        <p className="mt-1 text-sm font-bold">
                          {property.category === "OTHER"
                            ? property.otherPropertyType
                            : property.category[0] +
                              property.category.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-4">
                      <MapPin
                        aria-hidden="true"
                        className="size-5 text-primary"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Location
                        </p>
                        <p className="mt-1 text-sm font-bold">
                          {property.localityName}, {property.city}
                        </p>
                      </div>
                    </div>
                    {property.areaValue && (
                      <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-4">
                        <Ruler
                          aria-hidden="true"
                          className="size-5 text-primary"
                        />
                        <div>
                          <p className="text-xs text-muted-foreground">Area</p>
                          <p className="mt-1 text-sm font-bold">
                            {property.areaValue.toString()} {property.areaUnit}
                          </p>
                        </div>
                      </div>
                    )}
                    {property.bedrooms !== null && (
                      <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-4">
                        <BedDouble
                          aria-hidden="true"
                          className="size-5 text-primary"
                        />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Bedrooms
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {property.bedrooms}
                          </p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms !== null && (
                      <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-4">
                        <Bath
                          aria-hidden="true"
                          className="size-5 text-primary"
                        />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Bathrooms
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {property.bathrooms}
                          </p>
                        </div>
                      </div>
                    )}
                    {property.furnishing && (
                      <div className="rounded-xl bg-muted/70 p-4">
                        <p className="text-xs text-muted-foreground">
                          Furnishing
                        </p>
                        <p className="mt-1 text-sm font-bold">
                          {property.furnishing}
                        </p>
                      </div>
                    )}
                  </div>
                  <h2 className="mt-10 font-serif text-3xl">
                    About this property
                  </h2>
                  <p className="whitespace-pre-line text-base leading-8 text-muted-foreground">
                    {property.description}
                  </p>
                  {property.highlights.length > 0 && (
                    <div className="mt-10 border-t border-border pt-8">
                      <h2 className="font-serif text-3xl">Highlights</h2>
                      <ul className="mt-5 grid gap-3 text-sm">
                        {property.highlights.map((highlight) => (
                          <li className="flex gap-3" key={highlight}>
                            <Check
                              aria-hidden="true"
                              className="mt-0.5 size-4 shrink-0 text-primary"
                            />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {property.amenities.length > 0 && (
                    <div className="mt-10 border-t border-border pt-8">
                      <h2 className="font-serif text-3xl">Amenities</h2>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {property.amenities.join(" · ")}
                      </p>
                    </div>
                  )}
                </article>
                <aside className="h-fit rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Next step
                  </p>
                  <h2 className="mt-4 font-serif text-4xl">
                    Ask about this property.
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-primary-foreground/70">
                    A request starts a conversation. It does not reserve the
                    property or confirm availability.
                  </p>
                  {property.priceOnRequest ? (
                    <p className="mt-8 text-lg font-bold">Price on request</p>
                  ) : (
                    property.priceMinor !== null && (
                      <p className="mt-8 text-lg font-bold">
                        {formatInrMinorUnits(property.priceMinor)}
                      </p>
                    )
                  )}
                  <div className="mt-8 grid gap-3">
                    <Link
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-foreground"
                      href={`/contact?property=${encodeURIComponent(property.referenceNumber)}&intent=${encodeURIComponent(property.intent)}`}
                    >
                      Send an enquiry
                    </Link>
                    <a
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-4 text-sm font-bold"
                      href={createWhatsAppUrl(
                        whatsapp,
                        `I am enquiring about ${property.referenceNumber}: ${property.title}`,
                      )}
                    >
                      <WhatsAppIcon className="size-5" /> WhatsApp
                    </a>
                  </div>
                </aside>
              </div>
              {relatedProperties.length > 0 && (
                <section className="mt-20 border-t border-border pt-14">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        Explore more
                      </p>
                      <h2 className="mt-3 font-serif text-4xl">
                        Related properties
                      </h2>
                    </div>
                    <Link
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary"
                      href={`/properties?category=${property.category}`}
                    >
                      See all similar properties{" "}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                  <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {relatedProperties.map((related) => (
                      <Link
                        className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/40"
                        href={`/properties/${related.slug}`}
                        key={related.slug}
                      >
                        <div className="relative aspect-[4/3] bg-muted">
                          {related.coverImage?.publicUrl ? (
                            <Image
                              alt={related.coverImage.altText}
                              className="object-cover"
                              fill
                              sizes="(min-width: 768px) 33vw, 100vw"
                              src={related.coverImage.publicUrl}
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="architectural-art h-full opacity-80"
                            />
                          )}
                        </div>
                        <div className="p-5">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                            {related.category === "PLOT"
                              ? "Plot & land"
                              : related.category[0] +
                                related.category.slice(1).toLowerCase()}
                          </p>
                          <h3 className="mt-3 font-serif text-2xl leading-tight">
                            {related.title}
                          </h3>
                          <p className="mt-3 text-sm text-muted-foreground">
                            {related.localityName}, {related.city}
                          </p>
                          <p className="mt-5 font-bold">
                            {related.priceOnRequest ||
                            related.priceMinor === null
                              ? "Price on request"
                              : formatInrMinorUnits(related.priceMinor)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )
        )}
      </section>
    </PublicPage>
  );
}
