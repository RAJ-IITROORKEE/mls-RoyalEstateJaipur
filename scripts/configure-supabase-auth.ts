import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env.local" });
config({ path: ".env" });

const environmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_ACCESS_TOKEN: z.string().min(20),
});

const authConfigSchema = z
  .object({
    mailer_otp_length: z.number().int(),
  })
  .loose();

function getProjectReference(supabaseUrl: string) {
  const hostname = new URL(supabaseUrl).hostname;
  const [projectReference, ...domain] = hostname.split(".");

  if (!projectReference || domain.join(".") !== "supabase.co") {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not a hosted Supabase project URL.",
    );
  }

  return projectReference;
}

async function requestAuthConfig(
  endpoint: string,
  accessToken: string,
  init?: RequestInit,
) {
  const response = await fetch(endpoint, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Supabase Management API returned HTTP ${response.status}.`,
    );
  }

  return authConfigSchema.parse(await response.json());
}

async function main() {
  const environment = environmentSchema.safeParse(process.env);
  if (!environment.success) {
    throw new Error(
      "Set a valid SUPABASE_ACCESS_TOKEN in .env.local before changing hosted Auth configuration.",
    );
  }

  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ACCESS_TOKEN } = environment.data;
  const projectReference = getProjectReference(NEXT_PUBLIC_SUPABASE_URL);
  const endpoint = `https://api.supabase.com/v1/projects/${projectReference}/config/auth`;

  const current = await requestAuthConfig(endpoint, SUPABASE_ACCESS_TOKEN);
  if (current.mailer_otp_length !== 6) {
    await requestAuthConfig(endpoint, SUPABASE_ACCESS_TOKEN, {
      method: "PATCH",
      body: JSON.stringify({ mailer_otp_length: 6 }),
    });
  }

  const verified = await requestAuthConfig(endpoint, SUPABASE_ACCESS_TOKEN);
  if (verified.mailer_otp_length !== 6) {
    throw new Error(
      "Supabase did not persist the six-digit email OTP configuration.",
    );
  }

  console.log("Supabase email OTP length verified: 6 digits.");
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Unable to configure Supabase Auth.",
  );
  process.exitCode = 1;
});
