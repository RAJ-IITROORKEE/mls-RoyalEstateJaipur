import Link from "next/link";
import { MapPin, Type } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsNavigation({
  active,
}: {
  active: "appearance" | "locations";
}) {
  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-wrap gap-2 border-b border-border pb-5"
    >
      {[
        {
          key: "appearance",
          href: "/admin/settings",
          label: "Appearance",
          icon: Type,
        },
        {
          key: "locations",
          href: "/admin/settings/locations",
          label: "Locations",
          icon: MapPin,
        },
      ].map(({ key, href, label, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          aria-current={active === key ? "page" : undefined}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold hover:bg-muted",
            active === key && "bg-accent text-accent-foreground",
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
