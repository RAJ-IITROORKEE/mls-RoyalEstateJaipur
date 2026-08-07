import { FacebookIcon, InstagramIcon } from "@/components/icons/social-icons";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { cn } from "@/lib/utils";

type SocialLinksProps = {
  className?: string;
  whatsappHref?: string;
};

export function SocialLinks({ className, whatsappHref }: SocialLinksProps) {
  const socialLinks = [
    {
      href: "https://www.facebook.com/share/1Bz8fy3RST/?mibextid=wwXIfr",
      label: "Facebook",
      Icon: FacebookIcon,
    },
    ...(whatsappHref
      ? [{ href: whatsappHref, label: "WhatsApp", Icon: WhatsAppIcon }]
      : []),
    {
      href: "https://www.instagram.com/royalestatesjaipur?igsh=MXM4dGgxdXM4bHMydA%3D%3D&utm_source=qr",
      label: "Instagram",
      Icon: InstagramIcon,
    },
  ];

  return (
    <nav aria-label="Social links" className={cn("flex flex-wrap gap-3", className)}>
      {socialLinks.map(({ href, label, Icon }) => (
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          href={href}
          key={label}
          rel="noreferrer"
          target="_blank"
        >
          <Icon className="size-4 text-primary" />
          {label}
        </a>
      ))}
    </nav>
  );
}
