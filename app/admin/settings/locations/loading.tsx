import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingLocations() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading locations"
      className="flex flex-col gap-6"
    >
      <Skeleton className="h-11 w-60" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-80 w-full" />
    </section>
  );
}
