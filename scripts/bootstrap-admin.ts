import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env.local" });
config({ path: ".env" });

import { prisma } from "@/lib/db/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bootstrapSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  DATABASE_URL: z.string().min(1),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email(),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8),
  ADMIN_BOOTSTRAP_NAME: z.string().trim().min(2).max(120),
});

async function main() {
  const environment = bootstrapSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL,
    ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD,
    ADMIN_BOOTSTRAP_NAME: process.env.ADMIN_BOOTSTRAP_NAME,
  });
  if (!environment.success) throw new Error("Admin bootstrap requires valid Supabase, database, and ADMIN_BOOTSTRAP_* environment values.");

  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Admin bootstrap requires the server-only Supabase service-role key.");

  const email = environment.data.ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
  const users = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw new Error("Could not inspect Supabase Auth users.");
  const existing = users.data.users.find((user) => user.email?.toLowerCase() === email);
  const authResult = existing
    ? await supabase.auth.admin.updateUserById(existing.id, {
        email,
        password: environment.data.ADMIN_BOOTSTRAP_PASSWORD,
        email_confirm: true,
        user_metadata: { ...existing.user_metadata, display_name: environment.data.ADMIN_BOOTSTRAP_NAME },
      })
    : await supabase.auth.admin.createUser({
        email,
        password: environment.data.ADMIN_BOOTSTRAP_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: environment.data.ADMIN_BOOTSTRAP_NAME },
      });
  if (authResult.error || !authResult.data.user) throw new Error("Could not create or update the bootstrap Auth user.");

  const user = authResult.data.user;
  await prisma.$transaction(async (transaction) => {
    await transaction.profile.upsert({
      where: { id: user.id },
      create: { id: user.id, email, displayName: environment.data.ADMIN_BOOTSTRAP_NAME, role: "SUPER_ADMIN", status: "ACTIVE" },
      update: { email, displayName: environment.data.ADMIN_BOOTSTRAP_NAME, role: "SUPER_ADMIN", status: "ACTIVE" },
    });
    await transaction.auditLog.create({
      data: { actorId: user.id, action: "BOOTSTRAP_SUPER_ADMIN", entityType: "Profile", entityId: user.id, summary: "Initial super-admin bootstrap completed." },
    });
  });

  console.info("Admin bootstrap completed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Admin bootstrap failed.");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
