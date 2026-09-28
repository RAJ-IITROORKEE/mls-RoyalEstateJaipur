import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PropertyCardAction } from "@/components/properties/property-card-action";
import type { PublicPropertyCard } from "@/features/properties/queries";
import { formatInrMinorUnits } from "@/lib/utils";

function propertyLabel(value: string) {
  if (value === "SELL") return "Buy";
  if (value === "RENT") return "Rent";
  if (value === "PLOT") return "Plot & land";
  return value[0] + value.slice(1).toLowerCase();
}

export function PropertyCard({
  property,
  showReference = false,
}: {
  property: PublicPropertyCard;
  showReference?: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl focus-within:border-primary/50 focus-within:shadow-xl motion-reduce:transform-none motion-reduce:transition-none">
      <Link
        aria-label={`View ${property.title} in ${property.localityName}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        href={`/properties/${property.slug}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {property.coverImage?.publicUrl ? (
            <Image
              alt={property.coverImage.altText}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.025] group-focus-within:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              src={property.coverImage.publicUrl}
            />
          ) : (
            <div aria-hidden="true" className="architectural-art h-full opacity-80" />
          )}
          <span className="absolute right-4 top-4 inline-flex min-h-9 items-center rounded-full border border-primary-foreground/30 bg-primary px-4 text-xs font-extrabold uppercase tracking-[0.14em] text-primary-foreground shadow-lg ring-2 ring-background">
            {propertyLabel(property.intent)}
          </span>
          {showReference ? (
            <span className="absolute bottom-4 left-4 rounded-full border border-border bg-background/95 px-3 py-1 text-[11px] font-semibold tabular-nums text-foreground shadow-sm">
              {property.referenceNumber}
            </span>
          ) : null}
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            {propertyLabel(property.category)}
          </p>
          <h3 className="mt-3 text-balance font-serif text-2xl leading-tight transition-colors group-hover:text-primary group-focus-within:text-primary sm:text-3xl">
            {property.title}
          </h3>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />
            {property.localityName}, {property.city}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            {property.areaValue ? (
              <span className="rounded-lg bg-muted px-2.5 py-1.5">
                {property.areaValue} {property.areaUnit}
              </span>
            ) : null}
            <span className="rounded-lg bg-muted px-2.5 py-1.5">
              {property.priceOnRequest || property.priceMinor === null
                ? "Price on request"
                : formatInrMinorUnits(property.priceMinor)}
            </span>
          </div>
          <PropertyCardAction />
        </div>
      </Link>
    </article>
  );
}
