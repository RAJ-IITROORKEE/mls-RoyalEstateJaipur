import { z } from "zod";

const authSettingsSchema = z
  .object({
    external: z
      .object({
        google: z.boolean().optional(),
      })
      .passthrough(),
  })
  .passthrough();

export type GoogleProviderStatus = "enabled" | "disabled" | "unknown";

export async function getGoogleProviderStatus(): Promise<GoogleProviderStatus> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) return "unknown";

  try {
    const response = await fetch(new URL("/auth/v1/settings", supabaseUrl), {
      headers: { apikey: publishableKey },
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return "unknown";

    const parsedSettings = authSettingsSchema.safeParse(await response.json());
    if (!parsedSettings.success) return "unknown";

    return parsedSettings.data.external.google === false
      ? "disabled"
      : parsedSettings.data.external.google === true
        ? "enabled"
        : "unknown";
  } catch {
    return "unknown";
  }
}
