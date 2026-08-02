import Image from "next/image";
import Link from "next/link";

import { SocialLinks } from "@/components/layout/social-links";
import {
  createWhatsAppEnquiryMessage,
  createWhatsAppUrl,
} from "@/features/properties/domain";
import { getEnvironment } from "@/lib/env";

export function PublicFooter({ businessName }: { businessName: string }) {
  const environment = getEnvironment();
  const whatsappHref = createWhatsAppUrl(
    environment.NEXT_PUBLIC_BUSINESS_WHATSAPP,
    createWhatsAppEnquiryMessage({ businessName }),
  );

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-[1360px] gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-accent">
              <Image
                alt={businessName}
                className="object-cover"
                fill
                sizes="44px"
                src="/logo.jpeg"
              />
            </span>
            <span className="text-sm font-bold tracking-[0.16em]">
              {businessName}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            A considered way to discover and present property across Jaipur.
            Every public listing is reviewed before it is published.
          </p>
          <SocialLinks whatsappHref={whatsappHref} />
        </div>
        <div>
          <h2 className="text-sm font-bold">Explore</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <Link href="/properties">Properties</Link>
            <Link href="/localities">Localities</Link>
            <Link href="/services">Services</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold">For owners</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <Link href="/list-property">List your property</Link>
            <Link href="/sign-in">Track a submission</Link>
            <Link href="/contact">Talk to the team</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>
            © {new Date().getFullYear()} {businessName}. Demo foundation.
          </span>
          <span className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
