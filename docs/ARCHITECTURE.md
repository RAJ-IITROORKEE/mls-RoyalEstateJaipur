# Architecture

## Boundaries

- `app/` contains route composition and layouts.
- `components/` contains shared presentation and interactive shells.
- `features/` contains domain types, state transitions, and data queries.
- `lib/db/` owns the Prisma singleton; `lib/supabase/` owns SSR/browser clients.
- `prisma/` owns application-domain tables and migrations.
- `supabase/migrations/` owns storage bucket and RLS setup that is specific to Supabase.

## Data and security decisions

- Supabase Auth is the only identity provider. `Profile.id` mirrors the Auth UUID.
- Prisma uses `DATABASE_URL` for pooled runtime work and `DIRECT_URL` for migrations.
- Public listing media and private owner documents use separate Storage buckets.
- Application tables have RLS enabled and are accessed through server-side Prisma/DAL code. Private documents are managed only through authorized server operations.
- Money is stored as integer minor units (`priceMinor` in paise). Property state transitions and staff authorization are domain concerns, not UI-only checks.
- The current admin dashboard reports zeros and an explicit setup state until a database connection is configured; it never invents operational metrics.
- Auth route handlers parse form input with Zod, use the current Supabase SSR cookie client, reject external redirect targets, and provision `Profile` records only after Supabase verifies the user.
- Public catalogue queries filter strictly to `PUBLISHED` properties. Contact intake accepts only consented, honeypot-clean input and creates an enquiry rather than a booking or reservation.
- Owner mutations verify the Supabase user, scope records to the matching `Profile.id`, parse the complete payload with Zod, and write state/audit/notification changes in a Prisma transaction.
- Moderation actions use an explicit transition matrix and require reasons for request-changes/reject decisions. Approval creates or updates a draft property; publication is a separate explicit action.
- Private owner documents use service-role storage operations only after server-side ownership checks, randomized paths, MIME/extension/size validation, and database reconciliation.
- Enquiry updates use a separate transition matrix, append activity/audit records, and scope notifications and read operations to their recipient.
- Public and auth-adjacent mutation routes use bounded in-memory rate limits in this foundation. Production deployments should replace the process-local store with a shared limiter before horizontal scaling.
- Security headers and CSP are configured centrally in `next.config.ts`; public SEO is generated through `sitemap.ts`, `robots.ts`, and published-property metadata only.
- Audit history exposes summaries and timestamps only. Private payloads, document paths, IPs, and user-agent metadata are not rendered in the admin list.
- Demo seed content is opt-in and requires an explicit flag plus a real Supabase Auth owner UUID/email; the default seed creates only safe settings and never fabricates storage media.
- Public property discovery applies validated filters at the Prisma query boundary and exposes only published records. Property detail pages include factual `Residence` JSON-LD derived from visible fields.
- Property media mutations require an authenticated owner or staff role, allow only editable property states, use randomized public storage paths, and keep media metadata changes separate from private document operations.
- Enquiry assignment validates the target against active staff profiles inside the transaction and records both the assignment actor and recipient notification.
- Staff access changes are SUPER_ADMIN-only, explicitly mapped, audited, and guarded against self-demotion and removal of the last active SUPER_ADMIN. Site settings use an allowlist and typed value schemas rather than arbitrary key/value writes.
- Property inventory reads use server-side allowlisted search, lifecycle/intent/category filters, sort modes, and bounded pagination. Only active `ADMIN` and `SUPER_ADMIN` profiles can edit listings, feature published properties, or move them through explicit lifecycle transitions; each mutation writes an audit event.
- Blog content persists as a versioned allowlisted document tree. Managed image nodes store asset UUIDs rather than signed URLs; draft assets use private signed previews and publishing copies validated cover/inline assets to randomized public paths before a guarded status transaction.
- Storage transitions compensate ordinary copy or database failures, but true process-crash recovery requires a durable outbox/reconciliation worker. Public media already downloaded or cached cannot be revoked by moving a post back to draft.
