"use client";

import { RouteError } from "@/components/ui/route-error";

export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="The property catalogue could not be loaded."
    />
  );
}
