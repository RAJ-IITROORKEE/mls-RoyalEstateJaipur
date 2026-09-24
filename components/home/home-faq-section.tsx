import { ChevronDown } from "lucide-react";

type Faq = { question: string; answer: string };

export function HomeFaqSection({ faqs }: { faqs: readonly Faq[] }) {
  if (!faqs.length) return null;

  return (
    <section className="mx-auto grid max-w-[1360px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Helpful answers
        </p>
        <h2 className="mt-3 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
          Frequently asked questions
        </h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
          Clear information about listings, enquiries, and what happens next.
        </p>
      </header>
      <div className="divide-y divide-border border-y border-border">
        {faqs.map((faq, index) => (
          <details className="group py-1" key={`${faq.question}-${index}`}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-4 text-left text-base font-semibold marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-primary transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="max-w-2xl pb-5 pr-9 text-sm leading-7 text-muted-foreground">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
