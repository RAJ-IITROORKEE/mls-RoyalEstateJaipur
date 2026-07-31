# Master Build Prompt — Modern Real Estate Marketplace

Copy this prompt into Codex, Claude Code, Cursor, OpenCode, or another capable coding agent from the repository root. Keep `AGENTS.md` and `DESIGN.md` in the same root and treat them as binding project instructions.

---

## Mission

Act as the lead product engineer, UX designer, database architect, security reviewer, and QA owner. Build a production-ready real estate marketplace for **[ROYALESTATEJAIPUR]** where:

1. Property owners create an account and submit plots or other properties for sale, rent, or lease.
2. Admins review each submission, request changes, reject it, or approve and publish it.
3. Visitors browse only approved, published properties.
4. Interested visitors can send an enquiry, request a callback/site visit, open a prefilled WhatsApp conversation, or use the contact page.
5. Admins manage submissions, published listings, enquiries, users/admins, notifications, site content, settings, and immutable audit history.

Payments, subscriptions, commissions, and online booking payments are explicitly out of scope for this version. Design the domain so billing can be added later without rewriting the property, enquiry, or user models.

Use the two supplied reference websites only for understanding real-estate content patterns such as search, featured properties, localities, services, seller submissions, and enquiries. Do not clone their layouts, wording, branding, code, or visual identity. Create an original, premium, fast, modern product.

## Binding project documents

Before changing code:

1. Read all of `AGENTS.md`.
2. Read all of `DESIGN.md`.
3. Inspect the complete repository, current branch, package manager, configuration, and uncommitted changes.
4. If a Sites/Vercel hosting manifest or repo-specific instruction exists, read and obey it.
5. Use any installed Vercel skills relevant to React/Next.js performance and web interface quality. If they are unavailable, follow their equivalent official best practices manually.

The latest user instruction overrides this prompt. `AGENTS.md` governs engineering practice; `DESIGN.md` governs visual and interaction decisions.

## Product assumptions

- Market: India-first, international-ready.
- Default currency: INR, stored as integer minor units (`paise`) or an exact decimal—not JavaScript floating point.
- Area units: sq ft, sq yd, sq m, acre, hectare, and bigha. Store the submitted value/unit and a normalized square-metre value when conversion is reliable.
- Public browsing requires no account.
- Authentication is required to submit and track a property.
- Admin access is never self-assignable.
- A property submission is not publicly visible until approved and published.
- “Book” means create an enquiry/site-visit request in this release; it must never imply a confirmed reservation or payment.
- Unknown business content—brand, phone, WhatsApp number, address, social URLs, email, operating areas—must be centralized in typed site settings and obvious seed placeholders. Do not scatter fake values through components.
- Never claim a property is legally verified merely because an admin approved the listing. Use separate moderation and verification fields.

## Required technology

- Next.js App Router with TypeScript in strict mode
- React and Server Components by default
- Tailwind CSS
- shadcn/ui for accessible primitives
- Aceternity UI used selectively for one or two premium marketing effects, not as the base component system
- Motion for React (formerly Framer Motion) for purposeful transitions and micro-interactions
- Supabase Postgres
- Prisma ORM for application-domain data
- Supabase Auth as the **only** authentication provider
- `@supabase/ssr` with cookie-based sessions for Next.js
- Supabase Storage for property images/documents
- Zod for all untrusted input and environment validation
- React Hook Form where a client-side form controller is genuinely useful
- Server Actions for internal mutations and Route Handlers for external/webhook-style endpoints or APIs
- next-themes for light/dark/system theme
- Lucide icons
- Sonner for non-critical feedback
- Vitest plus Testing Library for unit/component tests
- Playwright for essential end-to-end flows

Do not add Better Auth or Clerk alongside Supabase Auth. Do not introduce a second database, CMS, state manager, or UI kit without a demonstrated need.

## Architecture

Use a feature-oriented, server-first structure. Adapt names to an existing repository rather than duplicating folders.

```text
app/
  (marketing)/
  (auth)/
  account/
  admin/
  api/
components/
  ui/
  layout/
  marketing/
  properties/
  forms/
  admin/
features/
  auth/
  properties/
  submissions/
  enquiries/
  notifications/
  audit/
lib/
  actions/
  auth/
  dal/
  db/
  permissions/
  supabase/
  validation/
  utils/
prisma/
tests/
```

Rules:

- Keep Prisma and service-role credentials server-only.
- Use a cached Prisma singleton in development.
- Use the Supabase pooled runtime connection for the deployed app and a direct database connection for Prisma migrations when the current Prisma/Supabase documentation requires it.
- Treat Server Actions and Route Handlers as public entry points: authenticate, authorize, validate, and rate-limit as appropriate inside each action/handler.
- Centralize authorization in reusable permission functions; hiding a button is not authorization.
- Keep business logic in a data/service layer, not in page components.
- Fetch independent server data concurrently and avoid client-side fetch waterfalls.
- Pass only minimal serializable data from Server Components into Client Components.
- Use transactions for approval/rejection, publication changes, role changes, and other workflows that must atomically write domain state plus an audit event.
- Use URL search parameters as the source of truth for public/admin filtering, sorting, query, and pagination.

## Authentication and authorization

Implement Supabase email/password authentication with email verification, sign-in, sign-up, sign-out, forgot password, reset password, and safe redirect handling. Google OAuth may be included behind configuration, but the application must work without it.

Use:

- `auth.users` as the authentication identity.
- A Prisma-managed public `Profile` record keyed by the same UUID for application data.
- A reliable idempotent profile provisioning path after first authenticated access/sign-up.
- Server-side session verification using the current supported Supabase SSR API.
- Role-based access control with `USER`, `REVIEWER`, `ADMIN`, and `SUPER_ADMIN`.

Permissions:

- `USER`: manage own profile, drafts, submissions, and own enquiry history.
- `REVIEWER`: review submissions, request changes, approve/reject, and manage listing content; no admin-role assignment.
- `ADMIN`: reviewer permissions plus enquiries, site content, media, notifications, and non-super-admin user management.
- `SUPER_ADMIN`: assign/revoke staff roles and edit security-sensitive settings.

Never trust role claims supplied by the browser. Never expose the Supabase service-role key. Prevent the last super admin from removing their own effective access. Record every privileged mutation in the audit log.

## Core data model

Create a complete Prisma schema with indexes, relations, timestamps, and sensible database constraints. Use enums where they improve integrity and avoid enum explosion where configurable tables are better.

Minimum models:

### Identity and administration

- `Profile`: auth UUID, display name, email snapshot, phone, avatar, role, status, last login, timestamps.
- `AdminInvitation` if staff invitation is implemented.
- `AuditLog`: actor ID, action, entity type, entity ID, human summary, structured before/after or metadata JSON, request ID, IP/user-agent where legally appropriate, created timestamp. Audit records are append-only.
- `Notification`: recipient or broadcast scope, type, title, body, entity link, read timestamp, created timestamp.

### Property intake and publishing

- `PropertySubmission`: owner, reference number, intent (`SELL`, `RENT`, `LEASE`), category, form payload or normalized fields, moderation status, assigned reviewer, submit/review timestamps, rejection/change-request reason, internal notes, version.
- `Property`: public listing identity, source submission, owner, slug, title, description, intent, category, status, moderation/verification badges, price fields, negotiable flag, address/locality/city/state/postal code, optional coordinates, area values, dimensions, facing, possession/availability, furnishing, bedrooms/bathrooms/floors where applicable, amenities, highlights, RERA/document metadata, featured flags/rank, published timestamp, SEO fields, timestamps.
- `PropertyMedia`: property/submission relation, storage path, type, alt text, sort order, cover flag, width/height where known, timestamps.
- `Amenity` and join model, or a carefully validated array if that is the stronger implementation.
- `Locality`: slug, name, city/state, summary, hero image, featured flag, SEO metadata.
- `PropertyDocument`: private storage metadata only; never publicly expose sensitive ownership documents.

### Leads and content

- `Enquiry`: property optional, contact name, email, phone, message, enquiry type, preferred contact method/time, site-visit date request, source/UTM metadata, status, assigned admin, notes, consent timestamp, timestamps.
- `EnquiryActivity`: status changes, notes, assignments, contact attempts.
- `ContactMessage` if kept separate from property enquiries; otherwise use a discriminated `Enquiry`.
- `Testimonial`: approval and display order.
- `ContentPage` or typed content sections for About/Services/Home content that admins are expected to edit.
- `SiteSetting`: allowlisted, validated public business configuration. Secrets must remain environment variables, never database settings.

Recommended state machines:

```text
Submission: DRAFT → SUBMITTED → UNDER_REVIEW
             ↘ NEEDS_CHANGES → RESUBMITTED → UNDER_REVIEW
             ↘ APPROVED
             ↘ REJECTED
             ↘ WITHDRAWN / ARCHIVED

Property: DRAFT → PUBLISHED → PAUSED → PUBLISHED
                    ↘ RENTED / LEASED / SOLD / ARCHIVED

Enquiry: NEW → CONTACTED → QUALIFIED → SITE_VISIT_SCHEDULED
                               ↘ NEGOTIATING → CLOSED_WON / CLOSED_LOST
               ↘ SPAM
```

Enforce valid transitions in domain functions and test them. Admin approval should create or update a draft `Property`; publishing can occur during approval or as a separate explicit action. Make the choice visible in the review UI.

## Public routes and UX

Implement these routes with complete empty, loading, error, and responsive states:

- `/` — premium homepage
- `/properties` — searchable, filterable property catalogue
- `/properties/[slug]` — complete property detail
- `/localities` and `/localities/[slug]` if locality content is enabled
- `/list-property` — explanation and authenticated multi-step owner form
- `/account/submissions` and `/account/submissions/[id]` — owner tracking/editing
- `/about`
- `/services`
- `/contact`
- `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
- `/privacy`, `/terms`
- branded `not-found` and error pages

Homepage sections:

1. Editorial hero with a clear value proposition and quick search.
2. Search tabs for Buy, Rent, and Lease.
3. Featured verified/moderated properties.
4. Browse by property type.
5. Popular localities.
6. “List your property” owner pathway.
7. Trust/process section: submit, review, connect.
8. Services.
9. Testimonials only if real/seeded as clearly demo data.
10. Final WhatsApp/contact CTA and complete footer.

Property catalogue:

- Search by locality/city/title.
- Filter by intent, category, min/max price, area, bedrooms, furnishing, and amenities when relevant.
- Sort by newest, price low-high/high-low, and featured.
- Server-rendered first result page with shareable query parameters.
- Desktop filter sidebar and mobile filter drawer.
- Clear-all filters, active filter chips, result count, skeleton, no-results recovery.
- Cursor or page-based pagination; do not fetch an unbounded list.

Property detail:

- Image gallery with correct aspect ratios, thumbnails, keyboard support, and lightbox.
- Intent badge, price, title, location, specifications, overview, amenities, availability, property ID, and updated date.
- Sticky desktop enquiry card and mobile bottom action bar.
- Buttons for callback, site-visit request, contact, share, and WhatsApp.
- Prefilled WhatsApp text includes public property ID/title and canonical URL, URI-encoded safely.
- Nearby/locality content without inventing distances.
- Similar properties based on real matching rules.
- Clear disclaimer that listing details require independent verification.
- Never expose owner documents, internal notes, owner email, or private storage paths.

Owner submission form:

- A polished multi-step wizard: purpose/type → location → property details → price/availability → amenities → photos/documents → owner contact/consent → review/submit.
- Conditional fields by property category; a plot must not ask for bedrooms.
- Autosave authenticated drafts.
- Progress indicator, step validation, back/next, review screen, and save-and-exit.
- Multiple image upload with limits, type/size validation, reorder, cover selection, alt text, progress, retry, and removal.
- Private document uploads are visually and technically separated from public photos.
- On final submit, freeze or version the reviewed snapshot and issue a human-readable reference number.
- Show a success page and in-app notification.
- Protect against duplicate submissions and accidental double-clicks.

Contact and enquiry:

- Contact cards for phone, email, address, operating hours, WhatsApp, and configured social links.
- Validated enquiry form with consent checkbox.
- Property-specific enquiry context when redirected from a listing.
- WhatsApp deep link with a safe prefilled message.
- Do not render a fake map. Use a configured map URL/embed only when valid.
- Add spam protection using a honeypot plus server-side rate limiting; keep CAPTCHA provider optional.

## Admin application

All `/admin` routes require server-verified staff authorization. Build:

- Dashboard: pending submissions, published inventory, new enquiries, recent activity, trend summaries, and actionable queues.
- Submissions: searchable/filterable table, bulk-safe selection, status tabs, assignment, SLA age, detail review, media/document inspection, internal notes, change request, approve, reject, and history.
- Properties: create/edit/preview/publish/pause/mark sold-rented-leased/archive; featured ranking; SEO preview.
- Enquiries: pipeline/table, detail timeline, assignment, notes, status changes, contact actions, export of a filtered set when authorized.
- Users: search users, view activity, suspend/reactivate application access.
- Admin management: invite/promote/demote with confirmation and strict `SUPER_ADMIN` checks.
- Notifications: inbox, unread count, mark read/all read, links to relevant records.
- Audit logs: filter by actor/action/entity/date, expandable structured change detail, no edit/delete controls.
- Content: homepage sections, About, Services, testimonials, and locality content if enabled.
- Settings: public business/contact/social/WhatsApp settings, listing defaults, upload limits, feature toggles.

Admin UX requirements:

- Responsive sidebar with compact mobile drawer.
- Command/search affordance where it adds value.
- Data tables have accessible sorting, filtering, pagination, column visibility, and row actions.
- Destructive or high-impact actions require a clear confirmation dialog.
- Optimistic UI only when rollback is reliable; approval and role changes should prefer confirmed server responses.
- All mutations return typed success/error results and display field-level or actionable errors.

## Notifications

For this release, implement database-backed in-app notifications:

- New submission → reviewer/admin recipients.
- Submission change requested/approved/rejected → owner.
- New enquiry → assigned/default admin recipients.
- Enquiry assigned/status changed → relevant staff where useful.

Create a provider interface for future email/SMS/WhatsApp notifications, but do not integrate paid providers or claim messages were sent. Notification creation that is critical to a workflow should occur in the same transaction as the state change.

## Visual implementation

Follow `DESIGN.md` exactly. The experience should feel like a trusted boutique property advisory platform, not a generic SaaS dashboard and not a template clone.

- Light, dark, and system themes must all work without hydration flashes.
- Use real estate photography supplied by the user or properly licensed placeholder sources during development; keep demo images replaceable.
- Preserve one strong visual idea per section.
- Use Aceternity only for a restrained hero/spotlight or premium card treatment.
- Use Motion for subtle reveals, filter transitions, drawers, gallery state, and feedback; honor reduced motion.
- Avoid over-animation, constant floating, scroll-jacking, excessive gradients, nested glass cards, and huge text that harms usability.

## Security and privacy

- Validate all inputs with Zod on the server.
- Authorize every write and sensitive read in the server entry point and DAL.
- Use allowlists for sort keys, filter fields, redirect targets, setting keys, upload MIME types, and storage paths.
- Sanitize any user-controlled rich text or avoid HTML input entirely.
- Set upload size/count limits and randomized storage keys.
- Separate public property media and private ownership documents into different buckets/policies.
- Do not put PII or secrets in logs, URLs, analytics events, client bundles, audit diffs, or error messages.
- Apply rate limits to authentication-adjacent, contact, enquiry, and submission endpoints.
- Prevent mass assignment by explicitly mapping accepted fields.
- Use secure response headers and a Content Security Policy compatible with required services.
- Add privacy/consent text and configurable retention notes. Do not fabricate legal compliance claims.
- Keep server-only modules marked and impossible to import into Client Components.

## SEO, performance, and accessibility

- Dynamic metadata and canonical URLs for published properties/localities.
- `sitemap.xml`, `robots.txt`, Open Graph metadata, and generated social fallback.
- JSON-LD only when fields are factual; use appropriate `RealEstateListing`, `Residence`, `Offer`, `Organization`, and breadcrumb structures where valid.
- Noindex admin, auth utility, account, preview, and unpublished pages.
- Use `next/image`, explicit dimensions/aspect ratios, responsive sizes, modern formats, and sensible priority only for the LCP image.
- Cache public listing reads intentionally and invalidate by tag/path after publication mutations; never cache personalized/admin data publicly.
- Avoid N+1 queries and select only required fields.
- Target good Core Web Vitals on mobile and a lean first load.
- Meet WCAG 2.2 AA: semantic landmarks, keyboard navigation, visible focus, labels, descriptions, error summaries, contrast, 44px touch targets where practical, screen-reader announcements, and reduced motion.

## Seed and demo data

Provide an idempotent seed script with:

- A small set of realistic Indian property categories, amenities, localities, published listings, one draft/paused listing, submissions in multiple review states, enquiries in several pipeline states, notifications, and content sections.
- Clearly marked demo copy and image configuration.
- No hard-coded production passwords.
- A documented safe method to bootstrap the first super admin from a real Supabase Auth user ID/email.

## Testing

At minimum, implement:

### Unit/domain tests

- Currency/area formatting and conversion.
- Slug/reference generation.
- Zod schemas and conditional property-form validation.
- Permission matrix.
- Submission/property/enquiry state transitions.
- WhatsApp URL generation.

### Integration tests

- Owner can create/edit/submit a draft.
- Owner cannot access another owner’s submission.
- Reviewer can request changes and approve.
- Ordinary user cannot reach or mutate admin resources.
- Approval creates/updates the correct property and audit log.
- Only published properties appear publicly.
- Enquiry creation generates the expected notification.
- Private documents never appear in public data.

### End-to-end tests

- Sign up/sign in/reset happy path as feasible in the test environment.
- Browse/filter/open property.
- Submit a property and track status.
- Admin review and publish.
- Send a property enquiry and generate a WhatsApp link.
- Mobile navigation and theme switching.

Run lint, type checking, unit tests, production build, and essential Playwright tests. Fix root causes; do not silence errors with `any`, broad lint disables, skipped tests, or unsafe casts.

## Delivery phases

Maintain a living checklist in the task/plan system and complete phases in order. Each phase ends with a working, verified checkpoint.

### Phase 0 — Discovery and decisions

- Inspect the repo and preserve unrelated user changes.
- Confirm package manager and current stable compatible package versions from official docs.
- Record assumptions and an implementation plan.
- Resolve any contradiction with existing code before editing.

### Phase 1 — Foundation

- Scaffold/configure Next.js, TypeScript strict mode, Tailwind, shadcn/ui, theme provider, lint/format/test tooling.
- Create route groups, layouts, error boundaries, loading states, and typed env validation.
- Establish design tokens and base components from `DESIGN.md`.

### Phase 2 — Supabase, Prisma, and auth

- Configure server/browser Supabase clients using the current SSR pattern.
- Configure pooled runtime and direct migration URLs correctly.
- Create schema, migrations, seed, Prisma singleton, profile provisioning, auth pages, protected route strategy, RBAC, and permission tests.

### Phase 3 — Public shell and marketing pages

- Build header, navigation, footer, homepage, About, Services, Contact, legal pages, theme switching, and responsive states.
- Use centralized site content/settings.

### Phase 4 — Property discovery

- Implement published property DAL, filters, URL state, catalogue, cards, detail gallery, similar listings, metadata, structured data, sitemap, and caching.

### Phase 5 — Owner intake

- Implement account area, multi-step draft form, conditional schemas, uploads, autosave, review/submit, status tracking, and owner notifications.

### Phase 6 — Admin moderation

- Build admin shell, dashboard, submission queue/detail, assignment, notes, request changes, approval/rejection, property creation/update, and audit transactions.

### Phase 7 — Inventory, leads, and administration

- Complete property management, enquiry pipeline, notification center, users/admin management, content management, settings, and audit viewer.

### Phase 8 — UX hardening

- Complete empty/loading/error states, mobile behavior, focus management, reduced motion, image behavior, form recovery, confirmations, and toast policy.

### Phase 9 — Security and performance

- Review authorization, storage policies, RLS boundaries, secrets, rate limits, headers/CSP, query plans/indexes, caching, bundle size, and image/LCP behavior.

### Phase 10 — Test and deployment readiness

- Run all checks, production build, seed validation, Playwright smoke flows, responsive QA, light/dark QA, and accessibility audit.
- Add `.env.example`, setup instructions, migration/seed commands, Supabase bucket/policy setup, first-admin bootstrap, deployment instructions, and backup/rollback notes.

### Phase 11 — Final review

- Use the installed Vercel React best-practices skill to review/refactor React and Next.js performance.
- Use the installed Vercel web-design-guidelines skill for UI, accessibility, form, interaction, and performance review.
- Re-run all verification after fixes.

## Required deliverables

- Complete working application, not wireframes.
- Prisma schema, migrations, and idempotent seed.
- Supabase auth/storage/RLS setup documentation or migrations where appropriate.
- `.env.example` with descriptions and no secrets.
- `README.md` with local setup, scripts, architecture, role bootstrap, deployment, and troubleshooting.
- Test suite and test data strategy.
- Responsive public site and admin panel.
- No dead buttons, fake counters, fake map, fake “verified” badge, lorem ipsum, or TODO-only critical flows.

## Definition of done

The work is complete only when:

1. An owner can authenticate, save a draft, upload valid media, submit a property, and see its status.
2. A reviewer can inspect it, request changes or approve it, and the action is audited.
3. An approved and published property appears in public search and has a functional details page.
4. A visitor can submit a validated enquiry and open a correctly prefilled WhatsApp chat.
5. An admin can manage the enquiry pipeline, notifications, listings, users, staff roles within permission, content, settings, and audit logs.
6. Public users cannot access drafts, private documents, PII, admin data, or privileged mutations.
7. Light/dark/system themes, keyboard navigation, responsive layouts, and reduced motion work.
8. Typecheck, lint, tests, and production build pass.
9. Setup and deployment can be reproduced from the documentation.

## Agent operating rule

Work autonomously through the phases and make safe, reversible decisions within scope. Do not stop after scaffolding or produce only a plan. If credentials or a genuinely business-specific decision blocks external setup, complete everything possible with adapters, typed placeholders, local tests, and exact setup instructions, then report only the remaining blocker. At the end, provide a concise summary of implemented features, architecture decisions, verification results, remaining configuration values, and exact run/deploy commands.

