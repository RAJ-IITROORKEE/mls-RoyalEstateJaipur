# MLS Real Estate UI, Content, Auth, and Reliability Plan

## Goal

Reshape the Royal Estates Jaipur public experience around a clear property search, keep its existing listing-card information, add editable FAQ and locality content, improve light/dark presentation, provide Google sign-in through the existing Supabase Auth provider, and repair the `/blogs` database failure without weakening authorization or hiding operational state.

## Reference review

The user-provided reference is [Crossworld Properties](https://www.crossworldproperties.com/). Its current home page begins with a plain text-led hero heading and description followed by a single-row search form, then latest properties, locality links, FAQs, and a contact/list-property call to action. The hero does not use a landmark carousel. Its catalogue leads with a title and result count, a search/filter row, a listing grid, and pagination. The home search presents title/locality search, All Locations, All property types, and Search. The observed locality dropdown contains:

1. Adarsh Nagar
2. Alwar
3. Badanpura, Ring Road
4. Badi Chopar
5. Brihmpuri
6. C Scheme
7. Chhoti Chopar
8. Dolai
9. Durgapura
10. Indira Gandhi Nagar
11. JLN Marg
12. Jagatpura II
13. Malviya Industrial Area
14. Malviya Nagar
15. Manesar
16. Mansarovar Extension
17. Mansarover
18. Model Town
19. Moti Doongari
20. Moti Nagar
21. Nirmal Nagar
22. Prahladpura
23. Pratap Nagar
24. Ptrakar Colony
25. Raja Park
26. Ranipura
27. Ring Road
28. Sanganer
29. Sidhart Nagar
30. Sitapura Industrial Area
31. Sodala
32. Sumer Nagar
33. Vaishali Nagar
34. jawahar nagar
35. tonk road

The about page will be original and factual. Reference patterns are inspiration only: do not reuse its copy, brand assets, exact visual composition, or claims. The current Royal Estates property-card content/structure remains the source of truth while card styling and page rhythm are refined.

## Repository baseline

- Next.js App Router, React 19, strict TypeScript, Tailwind CSS, Prisma, Supabase Auth/Postgres/Storage, Zod, Vitest, Testing Library, and Playwright are already in place.
- `app/` holds routes and route handlers; `features/` holds domain services/queries/schemas; `components/` holds UI; `lib/auth`, `lib/db`, and `lib/supabase` hold infrastructure.
- Public routes include `/`, `/properties`, `/properties/[slug]`, `/localities`, `/about`, `/services`, `/contact`, `/blogs`, and `/blogs/[slug]`. Admin routes already cover dashboard, users, submissions, properties, enquiries, blogs, notifications, audit, and settings.
- API route handlers already use Supabase identity, role checks, Zod, explicit mutation schemas, and audit/revalidation patterns. New admin content APIs must follow those boundaries.
- `Locality` already exists in Prisma; FAQ persistence and public locality visibility/sort fields do not.
- The public intent enum still contains `LEASE`. Public choices and new submissions will be limited to Buy (`SELL`) and Rent (`RENT`); historical `LEASE` records and lifecycle values stay readable in admin/database to avoid destructive data conversion.
- The working tree was clean on `main` at discovery. npm is the package manager and dependencies are present.
- `SUPABASE_ACCESS_TOKEN` is present in `.env.local` but the Supabase Management API returned HTTP 401. The configured runtime pooler is TCP reachable, while `npm run db:check` and Prisma queries fail to establish a database session. The Supabase dashboard requires sign-in. No Supabase MCP namespace or Supabase CLI is available in this task session.
- The requested Vercel `vercel-react-best-practices` and `web-design-guidelines` skills are not installed/exposed. Follow the repository rule and use official Vercel/Next.js/React documentation as a manual review checklist; do not install global tools or change agent configuration.
- GitHub CLI (`gh`) and Vercel CLI are available. GitHub, Vercel, and Supabase MCP tools are not currently exposed. Use local CLI checks where appropriate; do not claim a remote push/deployment/database migration until verified.

## Decisions and assumptions

- The plan and handoff live in the existing repository `docs/` directory as `docs/PLAN.md` and `docs/HANDOFF.md`; there is no existing `as/` tree.
- Search intent uses `SELL` internally for the visible “Buy” option and `RENT` for “Rent.” Search, public filter controls, and new owner submissions expose only those two options. Existing lease inventory remains readable in the admin; a legacy record retains its current intent until edited.
- Use the existing Supabase Auth identity/session and implement Google OAuth through Supabase. Do not add Clerk or custom password storage.
- The 35 reference localities become editable initial dropdown data. Seed by stable slug with empty update clauses so repeat seed runs do not overwrite staff edits. In offline/error fallback, show the same known default options and an explicit unavailable state in admin.
- Localities referenced by historical properties are deactivated/hidden from new public dropdown choices instead of physically deleted. FAQ delete can be a normal audited admin delete because FAQ rows have no listing-history relationship.
- Public marketing reads must degrade to explicit empty/unavailable states when Postgres is unreachable. Catching the `/blogs` query is a user-facing outage boundary, not a replacement for restoring the database connection.
- No map provider, Google OAuth client secret, production content, business contact details, or property imagery will be invented. A map view is deferred unless the repository already has a working map implementation/provider.
- Keep the existing palette character: warm ivory/navy/brass in light mode, with a warm graphite surface and accessible jade/teal action color in dark mode.
- Use shadcn-style primitives already present and purposeful CSS/Motion only where it improves feedback or hierarchy. Do not add decorative component libraries wholesale.

## Phases and acceptance checks

### Phase 0 — Discovery and written plan (complete)

- Read repository instructions and `DESIGN.md`; inspect git state, project scripts, routes, API handlers, Prisma models, and prior architecture notes.
- Inspect the reference home, catalogue, about page, and actual locality dropdown.
- Record baseline findings and assumptions in this plan and the handoff log.

### Phase 1 — Database and `/blogs` reliability

- Trace the current Supabase pooler configuration and verify runtime/database endpoints without exposing credentials.
- Correct application/configuration defects that are fixable from the repository. If the provider project is paused or credentials are rejected, leave the user-facing route resilient and identify the precise dashboard/credential step still required.
- Make published blog queries return a typed connection state; render a clear retryable unavailable state rather than allowing `PrismaClientInitializationError` to crash `/blogs`.
- Audit similar public reads for uncaught database connection failures and fix only concrete issues in scope.
- Acceptance: `/blogs` renders with an empty, populated, or unavailable state; no raw SQL/Prisma details reach the page. Database checks report a verified outcome or a precise external blocker.

### Phase 2 — Public search, catalogue, about, and theme

- Rebuild the homepage hero around title/area/locality search, locality selector (All Locations default), property-type selector (All property types default), a Buy/Rent choice, and a clear Search action.
- Preserve the existing listing-card information and property destinations. Refine presentation for the reference catalogue pattern: title/count, compact URL-backed search and filters, responsive grid, pagination, empty/error states.
- Remove Lease from public intent choices and ensure search query validation maps only Buy/Rent. Retain historical enum data safely.
- Replace the about page’s current generic product-foundation framing with a concise, original, editorial overview and clear next steps. Avoid unsupported business claims.
- Add the locality index and FAQ sections in the home-page flow, driven by the new content services with safe defaults when the database is down.
- Improve both themes using semantic tokens, focus/hover states, native control legibility, and reduced-motion-aware transitions. Use restrained reveals and button feedback only.
- Acceptance: search query parameters preserve selected intent/locality/type; mobile and desktop layouts remain usable; cards retain their current facts/actions; both themes have readable contrast.

### Phase 3 — FAQ and locality administration

- Add a Prisma FAQ model and active/sort fields for Locality, with a checked-in migration.
- Add idempotent, non-destructive default FAQ/locality seed data.
- Add staff-only, Zod-validated, audited FAQ CRUD and locality create/edit/deactivate/restore operations. Preserve referential integrity for localities used by properties.
- Add responsive admin pages and navigation. Include loading/empty/error states and inline form feedback.
- Public readers expose only published FAQs and active localities, ordered deterministically. Public content remains independent of private owner/admin data.
- Acceptance: unauthorized requests fail; admin create/read/update/delete/deactivate/restore paths work; audit records exist; public pages reflect active/published content.

### Phase 4 — Google sign-in/sign-up

- Add a server-side Supabase OAuth initiation route and callback flow using the existing cookie-based SSR client and safe internal `next` redirects.
- Add accessible “Continue with Google” controls to sign-in and sign-up surfaces; retain existing email/OTP and password recovery flow.
- Rate-limit OAuth initiation and show provider/setup errors generically.
- Document Google Cloud and Supabase provider configuration without placing client secrets in source control. Google provider credentials must be supplied/configured in the user’s own Supabase project.
- Acceptance: callback exchanges Supabase PKCE code, ensures the auth UUID is provisioned to Profile idempotently, blocks unsafe redirects, and preserves admin role assignment policy.

### Phase 5 — Verification and handoff

- Add/update domain/API/UI tests for search intent, locality and FAQ public filtering, CRUD permission boundaries, OAuth redirect safety, and `/blogs` unavailable behavior.
- Run formatter/check, lint, typecheck, unit/component tests, Prisma generation/validation, safe migration checks when connectivity permits, production build, and Playwright/browser flows.
- Use the browser automation available in this session to verify the local pages, representative viewport widths (320, 375, 768, 1024, 1440, wide), themes, keyboard/focus, empty/error states, and admin interactions where credentials make them accessible.
- Review React/Next performance and accessibility against official Vercel/Next.js/React guidance because the named Vercel skills are unavailable.
- Update `docs/HANDOFF.md` after every completed phase. Summarize files, behavior, security decisions, checks, blockers, and user-supplied credentials/content.
- Commit completed local changes using Git/`gh` if configured; do not push or deploy unless explicitly requested and remotely verified.

## Final acceptance summary

- Home and catalogue provide a clear Buy/Rent-only search with all 35 default localities and all property types.
- Existing property-card facts remain intact.
- FAQs and locality choices are staff-managed and public reads are filtered safely.
- About content is original, factual, and useful.
- Dark mode has intentional surfaces and readable controls.
- `/blogs` does not throw on a database outage, and provider/authentication issues are reported without leaking internals.
- Google OAuth is implemented on Supabase Auth; the app checks whether Google is enabled and reports its setup state. End-to-end Google login remains pending valid Google OAuth Web credentials in Supabase.
- Automated and browser verification results are recorded honestly in the handoff.

## Follow-up — homepage motion and property-card action feedback (2026-09-25)

- [x] Increase homepage headline line spacing and reduce overly tight letter spacing.
- [x] Add subtle theme-token spotlight motion and a one-time headline reveal, with reduced-motion support.
- [x] Create one shared animated “View property” CTA for homepage and property catalogue cards.
- [x] Preserve visible keyboard focus for each card link.
- [x] Run lint, typecheck, Vitest with bundled Node 24, production build, and desktop homepage/catalogue browser review.
- [x] Record final results in `docs/HANDOFF.md`.

## Follow-up — 2026-09-25

- Updated the public heading/body typeface to Plus Jakarta Sans, matching the reference site's font family. A tracked migration resets the previously saved Playfair choice to the requested default and writes an audit event.
- Refined the homepage heading and search surface, added the journal preview, and raised the Buy/Rent badges to the upper-right of both home and catalogue cards. Catalogue reference numbers move to the lower-left so labels do not overlap.
- Reworked About into an original locality/category-led page using the reference's broad content rhythm, and removed the large promotional section from Contact while retaining its enquiry form.
- Added five idempotent preview listings and two original articles using public listing facts requested for UI review. Their ownership, availability, pricing, and approvals are unverified; no reference photos were copied, so listing image placeholders remain until authorized media is supplied. Replace or remove preview inventory before treating it as real stock.
- Verified Supabase reports `external.google: false`; the authenticated dashboard shows Google disabled and empty client fields. OAuth initiation now checks provider state and returns an actionable sign-in message before redirecting. The provider cannot be enabled until its Google Web OAuth client ID and secret are configured by the project owner.
- Final checks for this follow-up are recorded in `docs/HANDOFF.md`.
- Dark appearance refinement: switched to slate 950 surfaces, separated spotlight panels from gold action colors, added Light/Dark/System selection, and exposed the control in public, mobile, admin, and sign-in navigation. Verification is in `docs/HANDOFF.md`.
