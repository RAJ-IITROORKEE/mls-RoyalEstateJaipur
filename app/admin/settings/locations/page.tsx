import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Search } from "lucide-react";
import {
  LocationDelete,
  LocationEditor,
} from "@/components/admin/location-actions";
import { SettingsNavigation } from "@/components/admin/settings-navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminLocations } from "@/features/site-content/location-queries";
import {
  locationFiltersSchema,
  locationTableHref,
} from "@/features/site-content/location-table";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = locationFiltersSchema.parse(
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : value,
      ]),
    ),
  );
  const result = await getAdminLocations(filters);
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-7">
      <SettingsNavigation active="locations" />
      <header className="flex flex-col gap-3">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Property locations
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage the areas available in property search. Keep linked locations
          inactive when they are no longer offered.
        </p>
      </header>
      {result.state !== "ready" ? (
        <Alert>
          <AlertTitle>
            {result.state === "forbidden"
              ? "Administrator access required"
              : "Locations are temporarily unavailable"}
          </AlertTitle>
          <AlertDescription>
            {result.state === "forbidden"
              ? "An active administrator can manage property locations."
              : "Reload this page to try again. Your saved locations have not changed."}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <form
              action="/admin/settings/locations"
              method="get"
              className="min-w-0 flex-1"
              key={`${filters.q}-${filters.sort}`}
            >
              <FieldGroup className="flex-row flex-wrap items-end gap-3">
                <Field className="min-w-0 flex-[1_1_220px]">
                  <FieldLabel htmlFor="location-search">
                    Search locations
                  </FieldLabel>
                  <Input
                    id="location-search"
                    name="q"
                    type="search"
                    autoComplete="off"
                    defaultValue={filters.q}
                    maxLength={100}
                    placeholder="Name, city or state…"
                  />
                </Field>
                <Field className="w-full flex-[0_1_180px]">
                  <FieldLabel htmlFor="location-sort">
                    Sort locations
                  </FieldLabel>
                  <NativeSelect
                    id="location-sort"
                    name="sort"
                    defaultValue={filters.sort}
                  >
                    <option value="name_asc">Name A–Z</option>
                    <option value="name_desc">Name Z–A</option>
                    <option value="display_order">Display order</option>
                    <option value="newest">Newest first</option>
                  </NativeSelect>
                </Field>
                <Button type="submit">
                  <Search aria-hidden="true" data-icon="inline-start" />
                  Apply
                </Button>
                {filters.q && (
                  <Button asChild variant="ghost">
                    <Link href="/admin/settings/locations">Clear search</Link>
                  </Button>
                )}
              </FieldGroup>
            </form>
            <div className="shrink-0 self-start xl:self-auto">
              <LocationEditor />
            </div>
          </div>
          <p
            className="text-sm tabular-nums text-muted-foreground"
            role="status"
          >
            {result.total} {result.total === 1 ? "location" : "locations"}
            {filters.q ? ` matching “${filters.q}”` : ""} · Page {result.page}{" "}
            of {result.pages}
          </p>
          {result.localities.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <MapPin aria-hidden="true" />
                <EmptyTitle>
                  <h2>
                    {filters.q
                      ? "No matching locations"
                      : "Add your first location"}
                  </h2>
                </EmptyTitle>
                <EmptyDescription>
                  {filters.q
                    ? "Try a different name, city or state, or clear your search."
                    : "Add an area to make it available in property search."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-5">Location</TableHead>
                      <TableHead>Search visibility</TableHead>
                      <TableHead>Display order</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead className="pr-5 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.localities.map((locality) => (
                      <TableRow key={locality.id}>
                        <TableCell className="max-w-xs whitespace-normal px-5 py-5">
                          <p className="break-words font-semibold">
                            {locality.name}
                          </p>
                          <p className="mt-1 break-words text-xs text-muted-foreground">
                            {locality.city}, {locality.state}
                          </p>
                          {locality.isFeatured && (
                            <Badge variant="secondary" className="mt-2">
                              Featured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              locality.isActive ? "secondary" : "outline"
                            }
                          >
                            {locality.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {locality.sortOrder}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {locality.propertyCount}
                        </TableCell>
                        <TableCell className="pr-5">
                          <div className="flex justify-end gap-2">
                            <LocationEditor locality={locality} />
                            <LocationDelete locality={locality} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ul className="grid gap-3 md:hidden">
                {result.localities.map((locality) => (
                  <li
                    key={locality.id}
                    className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="break-words text-base font-semibold">
                          {locality.name}
                        </h2>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {locality.city}, {locality.state}
                        </p>
                      </div>
                      <Badge
                        variant={locality.isActive ? "secondary" : "outline"}
                      >
                        {locality.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Order {locality.sortOrder} · {locality.propertyCount}{" "}
                      linked properties
                      {locality.isFeatured ? " · Featured" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <LocationEditor locality={locality} />
                      <LocationDelete locality={locality} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <nav
            aria-label="Location pages"
            className="flex flex-wrap items-center justify-between gap-3"
          >
            {result.page > 1 ? (
              <Button asChild variant="outline">
                <Link href={locationTableHref(filters, result.page - 1)}>
                  <ChevronLeft aria-hidden="true" data-icon="inline-start" />
                  Previous
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {result.page < result.pages && (
              <Button asChild variant="outline">
                <Link href={locationTableHref(filters, result.page + 1)}>
                  Next
                  <ChevronRight aria-hidden="true" data-icon="inline-end" />
                </Link>
              </Button>
            )}
          </nav>
        </>
      )}
    </section>
  );
}
