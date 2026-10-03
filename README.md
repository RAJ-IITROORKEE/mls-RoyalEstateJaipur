# Royal Estates Jaipur

An India-first property marketplace foundation built with Next.js App Router, Supabase Auth/Storage/Postgres, Prisma, Tailwind CSS, and strict TypeScript.

## Prerequisites

- Node.js 24.x (`.node-version`, CI and Vercel use the same major)
- npm
- A Supabase project for Auth, Postgres, and Storage

## Local setup

```bash
npm ci
copy .env.example .env.local
npm run prisma:generate
npm run dev
npm run format:check
```

Set the values in `.env.local` before using database-backed features. Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_*` variable.

## Database and Supabase

1. Set `DATABASE_URL` to the pooled Supabase connection and `DIRECT_URL` to the direct migration connection. Prisma commands load both values from `.env.local` automatically through the checked-in wrapper.
2. Run `npm run prisma:validate` to verify configuration, then `npm run prisma:migrate` for local development or `npm run prisma:deploy` in deployment automation.
3. Run `npm run db:seed` to create safe, clearly marked placeholder settings.
4. For local UI review only, `npm run db:seed:preview` can add five unverified listings and two original sample articles. It requires `SEED_REFERENCE_PREVIEW=true` and a localhost `NEXT_PUBLIC_SITE_URL`. A remote `DATABASE_URL` additionally requires `SEED_REFERENCE_PREVIEW_ALLOW_REMOTE=true`; this intentionally creates published preview records in that database, so do not enable it for production inventory.
5. Run `npm run db:check` to execute a minimal Prisma query without printing credentials.
6. Run `npm run supabase:configure` to create/update the six Storage buckets and apply the checked-in Storage policies/RLS configuration. Run `npm run supabase:check-storage` to verify bucket names and public/private visibility without printing credentials.
7. For the first admin only, set `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, and `ADMIN_BOOTSTRAP_NAME` in uncommitted `.env.local`, then run `npm run admin:bootstrap`. The command uses the server-only service-role key, confirms/updates the Auth user, and upserts an active `SUPER_ADMIN` profile. Remove or rotate the bootstrap password after successful access.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run test:a11y
npm run build
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate
npm run prisma:deploy
npm run db:seed
npm run db:seed:preview
npm run db:check
npm run supabase:configure
npm run supabase:check-storage
npm run admin:bootstrap
```

## Architecture

The public site uses a warm editorial token system with light/dark/system themes. The admin area uses the same tokens with a denser operational shell: fixed/collapsible desktop navigation, mobile drawer, context header, live database summary queries, and explicit setup/empty states. See `docs/ARCHITECTURE.md` and `docs/PHASE_STATUS.md`.

## Deployment and rollback

Configure the environment variables in Vercel, run `npm run prisma:deploy` from a controlled migration job, then deploy the app. Keep a Supabase database backup or point-in-time recovery plan appropriate to the project plan before migrations. Roll back application code through Vercel and roll forward database changes with a new migration. Do not reset, force-push, or drop a shared Supabase database.

## Authentication setup

- Enable Supabase email authentication and configure the site URL plus `/auth/callback` redirect URL.
- For Google sign-in, create a Google OAuth Web application. In Google Cloud, register Supabase's callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`). In Supabase, enable Google under **Authentication > Sign In / Providers** and enter the Google client ID and secret there. Set the Supabase Site URL to `NEXT_PUBLIC_SITE_URL` and add `http://localhost:3000/auth/callback` plus the deployed site's `/auth/callback` as allowed redirect URLs. Keep the Google secret in the Supabase provider settings; it does not belong in this repository or a `NEXT_PUBLIC_*` variable.
- `/api/auth/google` starts OAuth through Supabase Auth, and `/auth/callback` verifies the PKCE code and provisions the matching `Profile` UUID. A working Postgres connection is required to finish profile provisioning.
- Keep **Confirm email** enabled. In Supabase Dashboard, open **Authentication > Email Templates > Confirm signup**, use the subject `Your Royal Estates Jaipur verification code`, and paste the branded template from `docs/supabase-email-templates/confirm-signup.html`. The required `{{ .Token }}` variable supplies the standard six-digit code used by the in-app OTP form.
- Set the hosted email OTP length to six in **Authentication > Sign In / Providers > Email**, or configure a local `SUPABASE_ACCESS_TOKEN` and run `npm run supabase:auth-config`. The command changes only `mailer_otp_length`, verifies the saved value, and does not print the token.
- Configure hosted SMTP using `docs/supabase-email-templates/README.md`. Run `npm run diagnose:signup` after saving the SMTP and template settings; it performs a disposable signup test without printing credentials.

- Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL`, and `DIRECT_URL` before using account or database features.
- Auth route handlers verify sessions server-side. A matching `Profile` row is provisioned idempotently only after successful email verification.
- Never promote a role from a browser form. Staff roles are application records and require the protected `npm run admin:bootstrap` command or an existing SUPER_ADMIN.

## Supabase MCP connection

MCP authorization is managed by the host session. Do not put an MCP token in `.env.local` or commit it to this repository. Before using database-backed features, verify the project is online with `npm run db:check`. Then run `npm run prisma:deploy`, `npm run db:seed`, `npm run supabase:configure`, and `npm run supabase:check-storage`. The Storage check verifies bucket names and public/private visibility without printing credentials.

The checked-in Storage policy separates public `property-media`, `profile-avatars`, and `blog-media` from private `property-documents`, `property-submission-media`, and `blog-draft-media`. Keep private documents and draft assets private; authorized server operations use short-lived access where needed.

## Current checkpoint

The public catalogue, content management, Supabase authentication, owner intake, moderation, and administrator operations are implemented. Provider status and connectivity can change independently of this checkout; verify the database and Storage buckets before each release. Hosted email templates, Google OAuth credentials, and allowed callback URLs are managed in the Supabase Dashboard.

## Release checklist

Run formatting, lint, typecheck, unit tests, accessibility tests, the complete Playwright suite, Prisma validation, database and Storage checks, the production build, and `git diff --check`. Confirm Google Auth reports enabled before advertising Google sign-in. Review seeded preview listings and unpublish or replace any content that is not verified business inventory.

## Security foundations and CI

- All 36 API mutation exports use a shared same-origin request boundary. Browser requests must send the exact initiating `Origin`; scripts must provide the configured site origin explicitly. Vercel aliases come from server environment variables, and forwarded-host input is ignored.
- The boundary validates dynamic UUIDs, rejects malformed JSON/forms, bounds actual streamed bodies, returns safe errors with request IDs, and marks responses private/no-store. Default limit: 256 KiB; existing upload handlers: 11 MiB including multipart overhead. Domain identity, ownership, roles and schemas remain checked inside each handler.
- Production rate limits use atomic Postgres counters in `RateLimitBucket`, with hashed identifiers and bounded expiry cleanup. Apply migration `0009_durable_rate_limits` before releasing this code. Database failure rejects limited mutations safely. `RATE_LIMIT_BACKEND=memory` is an explicit local/test option; production ignores it. Set `TRUST_PROXY_IP=true` only behind a proxy that overwrites incoming address headers. Vercel performs that overwrite automatically.
- Public enquiries serialize identical submissions within a five-minute window. Staff changes acquire a transaction lock before checking actor status and last-super-admin protection. Session refresh runs in Next.js Proxy; protected server operations verify the user independently.
- `.github/workflows/quality.yml` uses pinned actions, Node 24, disposable Postgres and synthetic CI fixtures. It runs install/generate, format, lint, typecheck, unit tests, production dependency audit, migration validation, build and essential public/API browser flows. CI fixtures are refused outside a local database named `test` with `CI=true`.
- `scripts/validate-phase1-db.ts` rehearses all application migrations, counter/enquiry concurrency and RLS in a randomly named disposable schema using the ignored private InsForge connection file. It drops only its own validated schema. This is a compatibility check, not a completed provider/data migration.
- The current production dependency audit is clean. Five high development findings remain in Next ESLint's unpatched `braces` glob chain; assessed details and scoped dependency decisions are in `docs/PHASE1-SECURITY.md`.

Vercel's function request limits can reject larger existing uploads before our handler. Phase 4/6 must introduce direct, validated storage upload flows; an 11 MiB application bound does not increase a hosting platform limit.

Rollback for Phase 1: revert to the prior verified application deployment and keep the additive private counter table. Do not drop shared data or reverse migrations destructively. The staged InsForge migration is approved in `docs/PLAN.md`; production still uses Supabase until its auth/data/cutover gates pass.
