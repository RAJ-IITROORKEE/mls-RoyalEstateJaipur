import { redirect } from "next/navigation";

import { ProfileSettingsForm } from "@/components/account/profile-settings-form";
import { PublicPage } from "@/components/layout/public-page";
import { getCurrentUserAccess } from "@/lib/auth/current-user";
import { getPublicAvatarUrl } from "@/lib/supabase/public-avatar-url";

export default async function AccountSettingsPage() {
  const access = await getCurrentUserAccess();
  if (access.mode === "unauthenticated")
    redirect("/sign-in?redirect=%2Faccount%2Fsettings");
  if (access.mode !== "authorized")
    return (
      <PublicPage>
        <section className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="font-serif text-4xl">Settings are being prepared.</h1>
        </section>
      </PublicPage>
    );
  return (
    <PublicPage>
      <section className="mx-auto max-w-[1120px] px-5 py-12 sm:px-8 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Account settings
        </p>
        <h1 className="mt-3 font-serif text-5xl">Make your profile yours.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Keep your contact details current so the team can follow up on your
          submissions.
        </p>
        <div className="mt-10">
          <ProfileSettingsForm
            initialAvatarUrl={getPublicAvatarUrl(access.profile.avatarPath)}
            initialName={access.profile.displayName ?? ""}
            initialPhone={access.profile.phone ?? ""}
          />
        </div>
      </section>
    </PublicPage>
  );
}
