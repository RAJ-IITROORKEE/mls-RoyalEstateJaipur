"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LocationsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <Alert>
        <AlertTitle>Locations could not be loaded</AlertTitle>
        <AlertDescription>
          Try again to reload your saved locations.
        </AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
