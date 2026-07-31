# Phase Status

## Phase 0 — Discovery and decisions

Status: complete.

- npm is the package manager (`package-lock.json` is present).
- The repository was a clean Next.js starter with no existing database, auth, storage, test, or UI foundation.
- Supabase Auth, Supabase Postgres, Prisma, Supabase Storage, Zod, Vitest, and Testing Library were selected to match the binding build documents.
- The host Supabase MCP connection is authenticated for the configured project, but this OpenCode session exposes no direct MCP tool namespace. The equivalent checked-in Prisma/Supabase connection workflow was used for the verified remote configuration.
- The reference admin app was used only for interaction patterns: collapsible sidebar, mobile drawer, page context header, dense operational cards, and explicit empty states.

## Phase 1 — Foundation

Status: complete locally.

- Added theme tokens, responsive public header/footer, system/light/dark theme support, focus states, skip links, loading and not-found boundaries.
- Added responsive admin shell with fixed/collapsible desktop navigation and a mobile drawer.
- Added typed environment parsing and `.env.example`.
- Added Supabase browser/server client factories and a cached Prisma singleton.
- Added strict Prisma schema, generated initial migration, seed contract, Supabase bucket/RLS migration, and database-backed admin summary query.
- Added domain tests for permissions, submission transitions, slugs, and WhatsApp URLs.
- Added public homepage, sign-in/sign-up foundation pages, admin overview, submission empty state, and settings setup notes.

Verification:

- The initial and submission-media Prisma migrations have been applied successfully to the configured Supabase database. `db:seed`, `db:check`, and `supabase:check-storage` also pass without printing credentials.

## Phase 2 — Supabase and authentication

Status: implemented and verified against the configured project.

- Added Zod auth schemas, safe internal redirect handling, Supabase SSR sign-in/sign-up/sign-out, email reset, callback exchange, and password update routes.
- Added idempotent Auth UUID to Prisma `Profile` provisioning and server-side admin authorization checks.
- Added confirm-password validation and accessible show/hide controls for both signup password fields.
- Added a server-only `admin:bootstrap` command that creates or updates a verified Supabase Auth user, provisions an active `SUPER_ADMIN` Profile, and writes an audit record without printing credentials.
- Added auth and enquiry trust-boundary tests.

## Phase 3 — Public shell and catalogue

Status: implemented; published data remains controlled by the guarded seed/content workflow.

- Added public properties search, published-property detail, locality setup state, owner submission entry point, about, services, contact, privacy, and terms routes.
- Added a Zod-validated enquiry Route Handler with consent, honeypot, public-property lookup, and generic client errors.
- Added explicit empty/setup states rather than inventing listings, locality claims, metrics, or availability.

## Phase 5 — Owner intake

Status: implemented and database-backed paths are migrated.

- Added an authenticated six-step owner wizard for purpose, location, details, photos, price, and final review.
- Added draft creation, debounced autosave, versioned edits, final submission validation, owner-only list/detail routes, status messaging, and private document upload to the separate documents bucket.
- Added conditional plot fields, consent, safe file MIME/extension/size checks, random storage paths, orphan cleanup, and generic API errors.
- Added the post-save Photos step with signed private previews, dimensions, alt text, cover selection, remove/update controls, a five-image cap, and server-enforced minimum of one image before submission.

## Phase 6 — Moderation

Status: implemented and database-backed paths are migrated.

- Added reviewer queue/detail views, role checks, explicit transition validation, required reasons for negative decisions, confirmation before high-impact actions, audit records, owner notifications, and approval-to-property creation.
- Approval can create a draft property or explicitly publish it; publication is never implied by submission approval alone.
- Added explicit Start review, reviewer media previews, publication failure reporting, and non-destructive submission archival.

## Phase 7 — Operations

Status: implemented and database-backed.

- Added enquiry status transitions, scoped admin update API, activity and audit records, assigned-admin notifications, recipient-scoped notification center, and mark-read behavior.
- Added enquiry assignment with active-staff validation, assignment activity/audit records, and assignee notifications.
- Added explicit setup/empty states for operations routes and hardened the admin guard against database connection failures.
- Added total-user metrics, three-event activity queue, Users data table with pagination/search/avatar/role/status controls, and Super-Admin-only role assignment/suspension.
- Added Super-Admin-only audit archival that preserves immutable audit rows.
- Added a responsive property inventory command center with global status cards, status/intent/category charts, banner thumbnails, URL-backed search/filter/sort/pagination, audited lifecycle and featured actions, and a full listing/media editor restricted to active administrators.

## Operations expansion

Status: implemented locally; live data pending database connectivity.

- Added authorized public property media management for owners and staff, including multiple uploads, randomized public-bucket paths, MIME/extension/size validation, alt text, cover ordering, metadata updates, removal, orphan cleanup, and confirmation feedback.
- Added owner submission preview media with a private bucket, signed preview URLs, five-image limit, dimensions, descriptive metadata, and transfer to public listing media on explicit publication.
- Added owner account dashboard, signed-in avatar menu, profile details update, and profile avatar upload.
- Added rupee-first owner price input with Indian grouping while persisting paise as integer minor units, required custom type validation for `OTHER`, and three additional guarded Jaipur demo listings.
- Added protected super-admin staff access management with search, role/status updates, explicit audit records, self-change protection, and last-active-super-admin protection.
- Added authorized editable site settings for business identity and demo mode with allowlisted keys, typed values, audit records, and generic mutation responses.
- Added operational regression tests covering media boundaries, settings schemas, staff permissions, and authorization rules.

## Phases 8–11 — Hardening and readiness

Status: implemented and verified against the configured project.

- Added endpoint rate limits for authentication, enquiries, owner mutations, and document uploads with generic client responses.
- Added security headers, CSP, HSTS, image-source restrictions, sitemap, robots rules, canonical property metadata, and public media URL generation.
- Added an authorized append-only audit history view with minimal actor and entity metadata.
- Added public catalogue category filters, intent filters, locality search, pagination, and published media gallery rendering.
- Added price, area, bedroom, furnishing, and amenity filters, Residence JSON-LD, and guarded deterministic demo seed content.
- Added regression coverage for rate-limit behavior, request identity extraction, media URL encoding, validation, permissions, transitions, and private document boundaries.
- Added Playwright public smoke coverage for keyboard navigation and labelled catalogue/contact controls.
- Added staff-only blog drafts, an allowlisted continuous rich editor, required cover images, managed inline images, preview, compensated private/public asset transitions, publish/archive APIs, admin routes, public listing/detail routes, and blog bucket configuration.
- Public navigation now exposes Blogs instead of List property and Services.
- Added light-first theming, a global route progress bar, corrected password focus treatment, signed-in property-listing CTA behavior, homepage latest-property cards and sorting, catalogue banner images, enhanced property details/contact context, a WhatsApp brand icon, and related listings.

## Remaining implementation

- Owner preview media is available after the draft receives an ID; inline pre-save upload remains follow-up work.
- Approve-and-publish database state is committed before post-transaction media transfer; failures now surface and clean copied objects, but a fully compensating pre-commit workflow remains.
- Blog media transitions compensate for normal copy/database failures, but a durable outbox and reconciliation worker is still required to recover from a process crash between Storage and database steps.
- Distributed rate-limit storage and notification delivery integrations remain follow-up work.
- Assignment history UI remains follow-up work; public property media and rich blog content are now administratively editable.
- Playwright public smoke coverage passes locally after installing Chromium; CI browser caching and execution configuration remain deployment-readiness work.
- Formal WCAG scanning, lightbox/keyboard gallery interactions, distributed rate-limit storage, and notification delivery integrations remain follow-up work.

Next: add durable Storage reconciliation/outbox processing and broaden owner/admin/blog mutation E2E coverage before production rollout.
