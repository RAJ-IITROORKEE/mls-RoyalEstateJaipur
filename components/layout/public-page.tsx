import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { getEnvironment } from "@/lib/env";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { getPublicAvatarUrl } from "@/lib/supabase/public-avatar-url";
import type { ReactNode } from "react";

export function PublicPage({ children }: { children: ReactNode }) {
  const { NEXT_PUBLIC_BUSINESS_NAME: businessName } = getEnvironment();
  return (
    <PublicPageWithUser businessName={businessName}>
      {children}
    </PublicPageWithUser>
  );
}

async function PublicPageWithUser({
  businessName,
  children,
}: {
  businessName: string;
  children: ReactNode;
}) {
  const access = await getCurrentUserAccess();
  const user =
    access.mode === "authorized"
      ? {
          displayName: access.profile.displayName,
          email: access.profile.email,
          avatarUrl: getPublicAvatarUrl(access.profile.avatarPath),
        }
      : undefined;
  return (
    <>
      <PublicHeader businessName={businessName} user={user} />
      <main className="flex-1">{children}</main>
      <PublicFooter businessName={businessName} />
    </>
  );
}
