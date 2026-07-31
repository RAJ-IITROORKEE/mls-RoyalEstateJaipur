import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function configured(value: string | undefined) {
  return Boolean(value && !/[<\[]|replace-with|your-/i.test(value));
}

function sanitizeProviderMessage(message: string) {
  return message
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/[A-Za-z0-9_-]{32,}/g, "[redacted]")
    .slice(0, 240);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const sourceEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const admin = createSupabaseAdminClient();

  if (!configured(url) || !configured(key) || !configured(sourceEmail) || !admin || !sourceEmail?.includes("@")) {
    throw new Error("Signup diagnostics require configured Supabase public, service-role, and bootstrap email values.");
  }

  const [localPart, domain] = sourceEmail.toLowerCase().split("@");
  const testEmail = `${localPart.split("+")[0]}+signup-check-${Date.now()}@${domain}`;
  const password = `Check-${randomBytes(18).toString("base64url")}`;
  try {
    const response = await fetch(`${url}/auth/v1/signup`, {
      body: JSON.stringify({ data: { display_name: "Signup Diagnostic" }, email: testEmail, password }),
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const responseText = await response.text();

    if (!response.ok) {
      console.info("SUPABASE_SIGNUP: FAILED");
      console.info(`SUPABASE_SIGNUP_STATUS: ${response.status}`);
      console.info(`SUPABASE_SIGNUP_PROVIDER_RESPONSE: ${sanitizeProviderMessage(responseText)}`);
      process.exitCode = 1;
      return;
    }

    const data: unknown = JSON.parse(responseText);
    const record = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    console.info(`SUPABASE_SIGNUP: ${record?.id ? "OK" : "INCOMPLETE_RESPONSE"}`);
    console.info(`SUPABASE_SIGNUP_CONFIRMATION: ${record?.access_token ? "AUTO_CONFIRMED" : "EMAIL_VERIFICATION_REQUIRED"}`);
    if (!record?.id) process.exitCode = 1;
  } finally {
    const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const testUser = users.data.users.find((user) => user.email?.toLowerCase() === testEmail);
    if (testUser) await admin.auth.admin.deleteUser(testUser.id);
    console.info("SUPABASE_SIGNUP_CLEANUP: COMPLETE");
  }
}

main().catch(() => {
  console.error("Signup diagnostics could not run.");
  process.exitCode = 1;
});
