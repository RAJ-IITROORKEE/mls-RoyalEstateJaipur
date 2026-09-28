# Royal Estates Jaipur — Completion Plan

Last updated: 2026-09-28

## Objective

Complete the Royal Estates Jaipur product as a coherent, secure, responsive Next.js real-estate platform. Preserve the current ivory, navy, and brass identity; use a deliberate Slate 950 dark theme; retain Supabase Auth/Postgres/Storage and Prisma; and finish the public, owner, and administrator journeys with verified loading, empty, error, authorization, responsive, and reduced-motion states.

The Crossworld Properties site is a product-pattern reference for search hierarchy, catalogue flow, locality discovery, and content order. Its branding, copy, code, images, and exact visual composition are not copied.

## Approved engineering kit

### Agent guidance

- `vercel-react-best-practices`
- `vercel-composition-patterns`
- `web-design-guidelines`
- `frontend-design`
- `playwright-best-practices`
- Existing `ui-ux-pro-max`, `supabase`, and `supabase-postgres-best-practices`

### Project tools

- Existing: Next.js 16, React 19, Tailwind CSS 4, Motion, Lucide, next-themes, Prisma, Supabase, Vitest, Playwright
- Added for verification: Supabase CLI and Axe for Playwright. Lighthouse CI was removed after its current release introduced unresolved high-severity development-only advisories; the production build and browser checks provide the performance baseline.
- shadcn/ui CLI will be used only with a dry run/diff before adding a component. Existing project primitives and tokens remain the source of truth.
- Aceternity-style effects are adapted into small local components. Continuous motion, cursor followers, heavy parallax, and 3D card effects are excluded.

## Current service baseline

- Database connection: verified on 2026-09-28.
- Supabase Storage buckets and visibility: verified on 2026-09-28.
- Prisma schema: valid on 2026-09-28.
- Google provider: still disabled in the Supabase project. The application already reports this safely. Enabling it requires the Google OAuth client ID and secret to be saved in Supabase; the secret must never enter source control or chat.
- Public catalogue contains explicitly seeded preview content. It must remain identifiable as demo content until replaced by staff.

## Design direction

### Visual system

- Light canvas: warm ivory with white cards, deep Jaipur navy, and restrained brass.
- Dark canvas: Slate 950 with Slate 900/800 elevation, Slate 700 borders, near-white text, and brass for selected/action states.
- Type: the configured site font remains the default body/interface face; the existing editorial serif is reserved for public display headings.
- Shape: 10–12 px controls, 16–20 px cards, larger radius only for major media frames.
- Motion: one composed hero moment, direct interaction feedback, transform/opacity only, full reduced-motion fallback.

### Page hierarchy

- Public pages: one clear job per section, strong imagery where factual media exists, short copy, prominent search/contact actions.
- Admin pages: denser operational layout, clear status, explicit destructive confirmations, mobile-safe tables or cards.
- Shared controls: visible labels, 44 px targets, keyboard focus, status text beyond color, consistent icons.

## Phase plan

### Phase 0 — Tooling and service baseline

Status: complete.

- Install the approved agent skills.
- Add Supabase CLI and Axe Playwright as development dependencies; assess performance with the production build and browser tooling.
- Verify database, Storage, Prisma, and Google-provider state without exposing credentials.
- Record package warnings and audit findings for later dependency review.

### Phase 1 — Repository, route, and architecture audit

Status: complete.

- Inventory public, auth, account, admin, API, data-access, Prisma, Storage, and test surfaces.
- Find server/client boundary problems, sequential independent reads, unbounded queries, duplicated UI, raw errors, missing route boundaries, and unsafe mutations.
- Review all Route Handlers for identity verification, exact authorization, Zod parsing, allowed-field mapping, audit records, rate limits, and safe revalidation.
- Review Prisma indexes and query projections against real filters and operational screens.
- Convert audit results into scoped fixes in the phases below.

Acceptance:

- Every route and mutation has an owner in the plan.
- Concrete risks are fixed or recorded with an external blocker and evidence.

### Phase 2 — Design system and shared shell

Status: complete.

- Consolidate semantic color, spacing, typography, radius, elevation, focus, and motion tokens.
- Normalize Button, form controls, badges, cards, notices, skeletons, dialogs/sheets, pagination, and empty/error patterns.
- Keep the public theme control in the footer; retain an operational theme control in admin.
- Refine public header/mobile navigation/footer and admin shell at 320–1440+ px.
- Add accessible reduced-motion behavior and prevent theme hydration flash.

Acceptance:

- Light, dark, and system themes share the same hierarchy.
- Keyboard focus is visible everywhere and common controls meet the 44 px target where practical.
- No horizontal overflow at required viewport widths.

### Phase 3 — Public discovery experience

Status: complete.

- Homepage: refine the architectural hero background, headline spacing, Buy/Rent search, locality and property-type selectors, latest listings, locality discovery, FAQ, journal preview, and closing action.
- Property cards: image-first layout, highlighted top-right intent badge, visible price/facts, shared animated action, focus equivalence, and fallback media.
- Catalogue: URL-backed search/filter/sort/pagination, result count, responsive filter layout, loading/no-results/database-unavailable states.
- Property detail: gallery semantics, facts, terms, enquiry actions, related listings, mobile conversion bar, metadata, and structured data.
- About, Blogs, Blog detail, Contact, Localities, Privacy, and Terms: consistent page headings, stronger article hierarchy, original factual copy, and correct metadata.
- Public intent choices remain Buy and Rent; historical Lease data stays readable in staff tools.

Acceptance:

- Search selections survive in URL parameters.
- Property and article actions are obvious with mouse, keyboard, touch, and reduced motion.
- Public failures never expose Prisma, Supabase, SQL, or stack details.

### Phase 4 — Auth, owner account, and Google OAuth

Status: complete with an external Google-provider credential blocker recorded below.

- Review email sign-in/sign-up, callback, reset, safe redirects, profile provisioning, session refresh, and sign-out.
- Keep the sign-in page compact and remove the redundant public theme control.
- Review owner dashboard, settings, submission wizard, autosave concurrency, file validation, private-document access, and status feedback.
- Verify the Google OAuth initiation and callback path. Enable end-to-end Google sign-in after the client ID and secret are saved in Supabase.
- Confirm allowlisted post-auth redirects and server-side role checks.

Acceptance:

- Unauthorized paths are tested.
- Google sign-in either completes or shows the existing precise configuration message; no provider secret is logged or committed.

### Phase 5 — Admin operations and content management

Status: complete.

- Review dashboard, submissions, properties, enquiries, users/staff, blog, FAQs/localities, notifications, audit, and settings.
- Refine status density, responsive data presentation, confirmations, inline errors, empty states, and task actions.
- Confirm FAQ CRUD and locality create/update/deactivate/restore are permission-checked, audited, and reflected in public reads.
- Confirm the last active super-admin protection and immutable audit-log behavior.

Acceptance:

- Staff actions are usable on mobile and desktop.
- Every privileged mutation has authorization and audit coverage.

### Phase 6 — Backend, security, and performance hardening

Status: complete.

- Eliminate independent async waterfalls and reduce client boundaries/serialization.
- Review query selection, pagination, indexes, cache rules, invalidation, Storage paths, orphan cleanup, and transaction boundaries.
- Review security headers, redirect allowlists, rate limits, duplicate protection, honeypots, upload limits, and public/private data exposure.
- Run Next.js bundle analysis and address material client-bundle issues.
- Triage dependency advisories without applying breaking upgrades blindly.

Acceptance:

- No user-specific/admin response is publicly cached.
- No sensitive value is exposed through logs, UI, or committed files.
- Performance changes have before/after evidence where measurable.

### Phase 7 — Automated and browser verification

Status: complete.

- Run formatting/check, lint, typecheck, Vitest, Prisma generation/validation, safe migration status, production build, Playwright, and `git diff --check`.
- Add Axe coverage to representative public/auth/admin pages and address serious/critical findings.
- Review representative public pages with browser performance tooling and record measurable limits; do not retain Lighthouse CI while its dependency tree has unresolved high-severity advisories.
- Test 320, 375, 768, 1024, 1440, and wide desktop widths; light/dark/system; keyboard/focus; reduced motion; loading/empty/error states.
- Use browser automation for final visual review and user journeys.

Acceptance:

- Failures are fixed or documented with exact external blockers.
- No check is reported as passed unless it actually ran successfully.

### Phase 8 — Documentation, commit, and delivery

Status: complete.

- Update `docs/HANDOFF.md` after every phase.
- Update README and `.env.example` for current local, Supabase, Prisma, Storage, OAuth, test, deployment, rollback, and first-admin procedures.
- Review the final diff for unrelated changes, secrets, generated artifacts, and dead code.
- Commit coherent changes on the current `codex/` branch.
- Run Vercel preview/deployment checks when credentials and project linkage are available; attach or report any created pull request.

Acceptance:

- Handoff lists user-visible outcomes, architecture/security decisions, changed modules, commands and results, remaining credentials/content, and deferred work.

## Definition of done

- Home, catalogue, property details, about, blogs, contact, auth, owner, and admin flows form one consistent product.
- Buy/Rent search, editable localities, FAQ CRUD, seeded preview content, blogs, dark mode, property cards, and responsive behavior meet the requested experience.
- Database outages and disabled external providers degrade safely.
- Authorization, validation, loading, empty, error, responsive, keyboard, focus, and reduced-motion states exist for the completed features.
- The full verification matrix and final handoff are recorded truthfully.
