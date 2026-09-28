"use client";

import { RouteError } from "@/components/ui/route-error";

export default function BlogsError({
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
      title="The journal could not be loaded."
    />
  );
}
