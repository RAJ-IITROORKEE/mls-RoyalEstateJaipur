import { config } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { prisma } from "@/lib/db/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const emailSchema = z.string().email();
const urlSchema = z.string().url();

function isConfigured(value: string | undefined, validator: (value: string) => boolean) {
  return Boolean(value && !/[<\[]|replace-with|your-project|your-secret/i.test(value) && validator(value));
}

function report(name: string, valid: boolean) {
  console.info(`${name}: ${valid ? "OK" : "MISSING_OR_INVALID"}`);
  return valid;
}

async function main() {
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const bootstrapName = process.env.ADMIN_BOOTSTRAP_NAME;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let ready = true;
  ready = report("NEXT_PUBLIC_SUPABASE_URL", isConfigured(publicUrl, (value) => urlSchema.safeParse(value).success)) && ready;
  ready = report("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", Boolean(publicKey && publicKey.length >= 20 && !/[<\[]|replace-with|your-/i.test(publicKey))) && ready;
  ready = report("SUPABASE_SERVICE_ROLE_KEY", Boolean(serviceKey && serviceKey.length >= 20 && !/[<\[]|replace-with|your-/i.test(serviceKey))) && ready;
  ready = report("DATABASE_URL", Boolean(databaseUrl && !/[<\[]|replace-with|your-/i.test(databaseUrl))) && ready;
  ready = report("DIRECT_URL", Boolean(directUrl && !/[<\[]|replace-with|your-/i.test(directUrl))) && ready;
  ready = report("ADMIN_BOOTSTRAP_EMAIL", Boolean(bootstrapEmail && emailSchema.safeParse(bootstrapEmail).success)) && ready;
  ready = report("ADMIN_BOOTSTRAP_PASSWORD", Boolean(bootstrapPassword && bootstrapPassword.length >= 8 && !/[<\[]|replace-with|your-/i.test(bootstrapPassword))) && ready;
  ready = report("ADMIN_BOOTSTRAP_NAME", Boolean(bootstrapName && bootstrapName.trim().length >= 2 && bootstrapName.trim().length <= 120)) && ready;

  if (publicUrl && publicKey && urlSchema.safeParse(publicUrl).success) {
    try {
      const response = await fetch(`${publicUrl}/auth/v1/settings`, { headers: { apikey: publicKey } });
      report("SUPABASE_AUTH_ENDPOINT", response.ok);
    } catch {
      report("SUPABASE_AUTH_ENDPOINT", false);
    }
  } else {
    report("SUPABASE_AUTH_ENDPOINT", false);
  }

  if (publicUrl && publicKey && bootstrapEmail && bootstrapPassword) {
    try {
      const response = await fetch(`${publicUrl}/auth/v1/token?grant_type=password`, {
        body: JSON.stringify({ email: bootstrapEmail, password: bootstrapPassword }),
        headers: { apikey: publicKey, "Content-Type": "application/json" },
        method: "POST",
      });
      ready = report("BOOTSTRAP_PASSWORD_SIGN_IN", response.ok) && ready;
    } catch {
      ready = report("BOOTSTRAP_PASSWORD_SIGN_IN", false) && ready;
    }
  } else {
    ready = report("BOOTSTRAP_PASSWORD_SIGN_IN", false) && ready;
  }

  try {
    const settingCount = await prisma.siteSetting.count();
    console.info(`DATABASE_QUERY: OK (${settingCount} site settings)`);
  } catch {
    console.info("DATABASE_QUERY: FAILED");
    ready = false;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase && bootstrapEmail) {
    try {
      const users = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const authUser = users.data.users.find((user) => user.email?.toLowerCase() === bootstrapEmail.toLowerCase());
      report("BOOTSTRAP_AUTH_USER", !users.error && Boolean(authUser));
      if (authUser) {
        const profile = await prisma.profile.findUnique({ where: { id: authUser.id }, select: { role: true, status: true } });
        report("BOOTSTRAP_PROFILE", profile?.role === "SUPER_ADMIN" && profile.status === "ACTIVE");
      } else {
        report("BOOTSTRAP_PROFILE", false);
      }
    } catch {
      report("BOOTSTRAP_AUTH_USER", false);
      report("BOOTSTRAP_PROFILE", false);
    }
  } else {
    report("BOOTSTRAP_AUTH_USER", false);
    report("BOOTSTRAP_PROFILE", false);
  }

  if (bootstrapEmail && bootstrapPassword && urlSchema.safeParse(siteUrl).success) {
    try {
      const signInResponse = await fetch(`${siteUrl}/api/auth/sign-in`, {
        body: new URLSearchParams({
          email: bootstrapEmail,
          password: bootstrapPassword,
          redirect: "/admin",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: siteUrl,
        },
        method: "POST",
        redirect: "manual",
      });
      const location = signInResponse.headers.get("location");
      const signInWorked = signInResponse.status === 303 && location === `${siteUrl}/admin`;
      report("APPLICATION_SIGN_IN", signInWorked);

      const cookieHeaders = (
        signInResponse.headers as Headers & { getSetCookie?: () => string[] }
      ).getSetCookie?.() ?? [];
      const cookie = cookieHeaders.map((value) => value.split(";", 1)[0]).join("; ");
      if (signInWorked && cookie) {
        const adminResponse = await fetch(`${siteUrl}/admin`, {
          headers: { Cookie: cookie },
          redirect: "manual",
        });
        report("APPLICATION_ADMIN_ACCESS", adminResponse.ok);
      } else {
        report("APPLICATION_ADMIN_ACCESS", false);
      }
    } catch {
      console.info("APPLICATION_SIGN_IN: DEV_SERVER_NOT_REACHABLE");
      console.info("APPLICATION_ADMIN_ACCESS: NOT_TESTED");
    }
  }

  if (!ready) process.exitCode = 1;
}

main().catch(() => {
  console.error("Admin diagnostics failed.");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
