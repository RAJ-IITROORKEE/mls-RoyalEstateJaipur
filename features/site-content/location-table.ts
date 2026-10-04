import { z } from "zod";

export const locationSorts = [
  "name_asc",
  "name_desc",
  "display_order",
  "newest",
] as const;
export const locationFiltersSchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  sort: z.enum(locationSorts).catch("name_asc").default("name_asc"),
  page: z.coerce.number().int().min(1).max(100_000).catch(1).default(1),
});
export type LocationFilters = z.infer<typeof locationFiltersSchema>;
export type AdminLocation = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  propertyCount: number;
};

export function locationTableHref(
  filters: LocationFilters,
  page = filters.page,
) {
  const params = new URLSearchParams({
    sort: filters.sort,
    page: String(page),
  });
  if (filters.q) params.set("q", filters.q);
  return `/admin/settings/locations?${params}`;
}
