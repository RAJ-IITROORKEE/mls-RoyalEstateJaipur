# Royal Estates Jaipur

An India-first property marketplace foundation built with Next.js App Router, Supabase Auth/Storage/Postgres, Prisma, Tailwind CSS, and strict TypeScript.

## Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project for Auth, Postgres, and Storage

## Local setup

```bash
npm install
copy .env.example .env.local
npm run prisma:generate
npm run dev
```

Set the values in `.env.local` before using database-backed features. Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_*` variable.

## Database and Supabase

1. Set `DATABASE_URL` to the pooled Supabase connection and `DIRECT_URL` to the direct migration connection. Prisma commands load both values from `.env.local` automatically through the checked-in wrapper.
2. Run `npm run prisma:validate` to verify configuration, then `npm run prisma:migrate` for local development or `npm run prisma:deploy` in deployment automation.
3. Run `npm run db:seed` to create safe, clearly marked placeholder settings.
4. Run `npm run db:check` to execute a minimal Prisma query without printing credentials.
5. Run `npm run supabase:configure` to create/update the four Storage buckets and apply the checked-in Storage policies/RLS configuration. Run `npm run supabase:check-storage` to verify bucket names and public/private visibility without printing credentials.
6. For the first admin only, set `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, and `ADMIN_BOOTSTRAP_NAME` in uncommitted `.env.local`, then run `npm run admin:bootstrap`. The command uses the server-only service-role key, confirms/updates the Auth user, and upserts an active `SUPER_ADMIN` profile. Remove or rotate the bootstrap password after successful access.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate
npm run prisma:deploy
npm run db:seed
npm run db:check
npm run supabase:configure
npm run supabase:check-storage
npm run admin:bootstrap
```

## Architecture

The public site uses a warm editorial token system with light/dark/system themes. The admin area uses the same tokens with a denser operational shell: fixed/collapsible desktop navigation, mobile drawer, context header, live database summary queries, and explicit setup/empty states. See `docs/ARCHITECTURE.md` and `docs/PHASE_STATUS.md`.

## Deployment and rollback

Configure the environment variables in Vercel, run `npm run prisma:deploy` from a controlled migration job, then deploy the app. Roll back application code through the hosting provider and roll forward database changes with a new migration. Do not reset or drop a shared Supabase database.

## Authentication setup

- Enable Supabase email authentication and configure the site URL plus `/auth/callback` redirect URL.
- Keep **Confirm email** enabled. In Supabase Dashboard, open **Authentication > Email Templates > Confirm signup**, use the subject `Your Royal Estates Jaipur verification code`, and paste the branded template from `docs/supabase-email-templates/confirm-signup.html`. The required `{{ .Token }}` variable supplies the standard six-digit code used by the in-app OTP form.
- Set the hosted email OTP length to six in **Authentication > Sign In / Providers > Email**, or configure a local `SUPABASE_ACCESS_TOKEN` and run `npm run supabase:auth-config`. The command changes only `mailer_otp_length`, verifies the saved value, and does not print the token.
- Configure hosted SMTP using `docs/supabase-email-templates/README.md`. Run `npm run diagnose:signup` after saving the SMTP and template settings; it performs a disposable signup test without printing credentials.

- Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL`, and `DIRECT_URL` before using account or database features.
- Auth route handlers verify sessions server-side. A matching `Profile` row is provisioned idempotently only after successful email verification.
- Never promote a role from a browser form. Staff roles are application records and require the protected `npm run admin:bootstrap` command or an existing SUPER_ADMIN.

## Supabase MCP connection

MCP authorization is managed by the host session. Do not put an MCP token in `.env.local` or commit it to this repository. The authenticated project connection has been used to apply and verify the checked-in Storage/RLS configuration; rerun `npm run supabase:configure` safely because it is idempotent.

## Current checkpoint

The application foundation, authentication, public catalogue, owner intake, moderation, and operations slices are implemented. Prisma migrations, seed, database connectivity, admin bootstrap, password sign-in, browser session authorization, and Storage bucket visibility have been verified against the configured Supabase project. Hosted email-template changes remain managed in the Supabase Dashboard.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
