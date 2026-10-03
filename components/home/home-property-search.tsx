import { Search } from "lucide-react";

import {
  publicPropertyIntents,
  propertyCategories,
} from "@/features/properties/domain";

type HomePropertySearchProps = {
  localities: { name: string }[];
  initialIntent?: string;
  initialQuery?: string;
  initialLocality?: string;
  initialCategory?: string;
};

function optionLabel(value: string) {
  if (value === "SELL") return "Buy";
  if (value === "RENT") return "Rent";
  if (value === "PLOT") return "Plot & land";
  return value[0] + value.slice(1).toLowerCase();
}

export function HomePropertySearch({
  localities,
  initialIntent = "SELL",
  initialQuery = "",
  initialLocality = "",
  initialCategory = "",
}: HomePropertySearchProps) {
  return (
    <section
      aria-label="Search available properties"
      className="hero-reveal relative z-10 mx-auto mt-8 w-full max-w-[1240px]"
      id="property-search"
    >
      <form
        action="/properties"
        className="rounded-2xl border border-border bg-background p-4 shadow-[0_16px_40px_-32px_color-mix(in_oklab,var(--foreground)_48%,transparent)] sm:p-5 lg:p-6"
        method="get"
        role="search"
      >
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="mr-3 text-xs font-semibold text-muted-foreground">
            I want to
          </legend>
          {publicPropertyIntents.map((intent) => (
            <label className="cursor-pointer" key={intent}>
              <input
                className="peer sr-only"
                defaultChecked={initialIntent === intent}
                name="intent"
                type="radio"
                value={intent}
              />
              <span className="inline-flex min-h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
                {optionLabel(intent)}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_auto] lg:items-end">
          <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-muted-foreground">
            Search by title, area, locality
            <input
              className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={initialQuery}
              name="q"
              placeholder="e.g. courtyard home, Jagatpura"
              type="search"
            />
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-muted-foreground">
            Location
            <select
              className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={initialLocality}
              name="locality"
            >
              <option value="">All Locations</option>
              {localities.map(({ name }) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-muted-foreground">
            Property type
            <select
              className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={initialCategory}
              name="category"
            >
              <option value="">All property types</option>
              {propertyCategories.map((category) => (
                <option key={category} value={category}>
                  {optionLabel(category)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover hover:text-primary-hover-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            type="submit"
          >
            <Search aria-hidden="true" className="size-4" />
            Search
          </button>
        </div>
      </form>
    </section>
  );
}
