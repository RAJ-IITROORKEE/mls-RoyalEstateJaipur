import { FacebookIcon, InstagramIcon } from "@/components/icons/social-icons";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

type SocialLinksProps = {
  whatsappHref?: string;
};

export function SocialLinks({ whatsappHref }: SocialLinksProps) {
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
    <div aria-label="Social links" className="flex flex-wrap gap-3">
      {socialLinks.map(({ href, label, Icon }) => (
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold transition-colors hover:bg-muted"
          href={href}
          key={label}
          rel="noreferrer"
          target="_blank"
        >
          <Icon className="size-4 text-primary" />
          {label}
        </a>
      ))}
    </div>
  );
}
