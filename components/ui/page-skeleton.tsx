export function PageSkeleton({ label = "Loading page" }: { label?: string }) {
  return (
    <main aria-busy="true" aria-label={label} className="min-h-[70vh]">
      <span className="sr-only">{label}</span>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-20">
          <div className="h-4 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="mt-5 h-12 w-full max-w-3xl animate-pulse rounded-xl bg-muted motion-reduce:animate-none sm:h-16" />
          <div className="mt-5 h-5 w-full max-w-xl animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
      </section>
      <section className="mx-auto grid max-w-[1360px] gap-5 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            aria-hidden="true"
            className="overflow-hidden rounded-2xl border border-border bg-card"
            key={index}
          >
            <div className="aspect-[4/3] animate-pulse bg-muted motion-reduce:animate-none" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-8 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
