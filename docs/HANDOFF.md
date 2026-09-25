# Implementation Handoff Log

This is the running record for `docs/PLAN.md`. Update it whenever a phase or material change is completed. A phase is complete only after its implementation and applicable checks pass.

## 2026-09-25 — Phase 0: Discovery and planning

**Status:** Complete. Implementation is in progress; see phase updates below.

### Outcome

- Added `docs/PLAN.md` with phased scope, acceptance checks, implementation assumptions, the reference locality list, and external dependencies.
- Confirmed the repository is an existing Next.js real-estate platform with Supabase Auth/Postgres/Storage, Prisma, and protected admin features rather than a starter requiring a new architecture.
- Confirmed the working tree was clean on `main` at discovery (`1380246`, `Add global font settings preview`). npm is the package manager and `node_modules` is present.
- Reviewed the Crossworld home, catalogue, about page, and opened its home locality dropdown. The dropdown has 35 named options plus “All Locations.” The reference has latest listings, locality links, FAQs, and a CTA on home; the catalogue has search/filter controls, listing cards, and pagination.
- `Locality` already exists in Prisma, but FAQ persistence and active/order fields for locality choices are not present.
- `PropertyIntent` includes `SELL`, `RENT`, and `LEASE`. Public UI and new-write paths should offer Buy (`SELL`) and Rent (`RENT`) only; historical lease records stay intact unless a separate data decision is made.
- Existing list/property cards show image, intent, title, locality, area/category, price, and detail link. Preserve these facts while revising layout and theme.
- Admin API route inventory spans auth, enquiries, profiles, submissions/media/documents, properties/media, settings, users, notifications, audit, and blog content. New content mutations will use the established role checks, Zod schemas, audit, and revalidation conventions.

### Database diagnosis — initial state before dashboard restoration

- `.env.local` contains the expected public Supabase project URL and a runtime Supavisor transaction-pooler URL on port 6543. The shared-pooler username matches the configured project reference, and `pgbouncer=true` is present. The migration URL points to shared pooler session mode on port 5432. The connection password/token were not printed.
- `Test-NetConnection` to the runtime pooler port succeeds, but `npm run db:check` fails. A direct Prisma `SELECT 1` reports `PrismaClientInitializationError: Can't reach database server at aws-0-ap-southeast-2.pooler.supabase.com:6543`.
- Supabase Management API `GET /v1/projects` returned HTTP 401 using the configured local access token. The Supabase Dashboard redirects to its sign-in page, so project state cannot be verified from the current session. No Supabase MCP tool namespace or Supabase CLI is exposed.
- Supabase documentation confirms port 6543 is shared transaction mode and `pgbouncer=true` is the documented Prisma compatibility parameter; free projects can pause after low activity. These facts do not establish that this project is paused. Do not report it as restored until a real DB query passes.
- Public database reads must return a useful unavailable state. This resilience work does not replace restoring the provider project or correcting invalid credentials.

The failed connectivity and dashboard-access findings above describe the initial discovery state only. They were superseded after the user authenticated the Supabase dashboard and restored the project; the verified current state is recorded in the restoration entry below.

### Tool and skill availability

- `gh` and `vercel` CLIs are installed; `supabase`, `psql` are not. GitHub/Vercel/Supabase MCP namespaces are not exposed in this task session.
- The specifically named Vercel React and web-design skills are absent from available skills and local skill roots searched. Their official guidance will be applied as a manual checklist; no global skills/tools will be installed.
- Relevant available UI/UX, Supabase, and computer-use instructions were read. The current repository `DESIGN.md` and `AGENTS.md` remain authoritative.

### Checks run

| Check | Result |
| --- | --- |
| `git status --short --branch` | Pass at discovery: clean `main` tracking `origin/main` |
| `npm run db:check` | Fail: database session could not be established |
| Direct Prisma `SELECT 1` | Fail: pooler endpoint reported unreachable |
| TCP check to pooler port 6543 | Pass: TCP endpoint accepted a connection; SQL session remains unverified |
| Supabase Management API project lookup | Blocked: HTTP 401 from configured access token |
| Supabase Dashboard | Blocked: sign-in required in this browser session |

### External information still needed

- Google OAuth Web client ID and secret must be entered by the user in the existing Supabase Google provider settings before Google sign-in can be exercised end to end. Do not send the secret through chat or commit it.
- No Vercel deployment, GitHub push, or remote Supabase migration has been performed.

## Phase updates

### 2026-09-25 — Supabase restoration and access review

**Status:** Database and storage configuration verified. Google OAuth provider remains unconfigured pending the user's Google OAuth client credentials.

- The authenticated Supabase dashboard confirmed project restoration completed. Its overview now reports **Healthy**.
- `npm run db:check` passes against the restored runtime pooler: database connection is available and six site settings are readable.
- `npm run prisma:deploy` applied `0005_site_font_setting` and `0006_site_content` successfully.
- `npm run db:seed` completed idempotently: six site settings, 35 default localities, and five initial FAQs; demo content stayed disabled.
- `npm run supabase:configure` completed. The Security Advisor now shows **0 errors**; the prior public-table RLS errors are cleared.
- Security review found three unnecessary public `storage.objects` list policies. Since app pages resolve media from known public object URLs and admin uploads use the service role, the public list policies were removed and the SQL was re-applied. The advisor then showed 0 errors and one warning (leaked-password protection disabled).
- Storage has six configured buckets: `property-media`, `blog-media`, and `profile-avatars` are public; `property-documents`, `property-submission-media`, and `blog-draft-media` are private. The dashboard now shows one service-role policy per bucket and no extra `storage.objects` policies. All six buckets are empty. The runtime storage check passes.
- Supabase URL Configuration already allows local and production `/auth/callback` and reset-password callbacks. New-user signups and email confirmation are enabled.
- Google is disabled in the Supabase provider settings and the Client IDs and Client Secret fields are empty. The repository now includes the Google OAuth route and callback flow, but no provider credential was invented or supplied. End-to-end Google login is therefore pending the user entering their Google OAuth Web client ID and secret into the Supabase Google provider settings.

### Phase 1 — Database and `/blogs` reliability

**Status:** Complete.

- Public blog list/detail reads now return a safe connection state and show a retryable unavailable state instead of throwing a Prisma error or exposing raw internals.
- Related public property reads also have connection-aware empty/error behavior.
- Database restoration, Prisma migrations, seed, and runtime connection were verified as recorded above.
- Checks: `npm run db:check`, `npm run prisma:deploy`, and `npm run db:seed` passed.

### Phase 2 — Public search, catalogue, about, and theme

**Status:** Complete; local browser and responsive checks passed.

- Replaced the home landmark carousel with a text-led property search hero inspired by the reference's search-first structure; added Buy/Rent, All Locations and All property types defaults, latest properties, locality links, FAQs, and contact CTA.
- Refactored the property catalogue around search/filter controls, count, listing cards, pagination, and empty/error/loading states while retaining existing card facts.
- Public listings and new submissions offer Buy/Rent only; historical lease records remain accessible to staff.
- Rewrote the About page with original, factual editorial content. Added a locality index. Dark mode uses warm graphite surfaces and accessible action colors.
- Browser checks: home and catalogue have no horizontal overflow at 320, 375, 768, 1024, and 1440 px. The home hero search, Buy/Rent controls, locality defaults, and catalogue intent query were verified. The FAQ accordion and dark theme toggle work in the browser.
- The connected database currently returns one public listing titled `Test title xyz`. This looks like placeholder content; it was not altered. Review its title, image, price, and publish status before presenting production listings.
- Checks: lint, typecheck, unit suite, Prisma validation/generation, and production build passed (details below).

### Phase 3 — FAQ and locality administration

**Status:** Complete; admin-browser flows require an authenticated staff session for end-to-end verification.

- Added `FaqItem`, locality activity/order fields, migration `0006_site_content`, idempotent default content, public query services, and staff-only audited FAQ/locality routes and admin manager.
- Deactivation preserves localities referenced by historical listings. FAQs and locality options have validation, inline state feedback, and confirmation for deletes.
- The applied seed contains 35 localities and five FAQs. Admin authorization paths have unit coverage.

### Phase 4 — Google sign-in/sign-up

**Status:** Application flow implemented; provider activation and end-to-end check blocked by missing Google OAuth credentials.

- Added rate-limited Google OAuth initiation, safe callback redirect handling, idempotent profile provisioning, suspended-profile rejection, role-aware destinations, and buttons on sign-in/sign-up. Existing email/OTP recovery stays available.
- Dashboard verification: Supabase Google provider is **Disabled**; client ID and secret are blank. Redirect allowlist already includes `http://localhost:3000/auth/callback` and `https://royalestatejaipur.vercel.app/auth/callback` plus reset-password variants. Email sign-up and email confirmation are enabled.
- User action needed: create/configure an OAuth Web client in Google Cloud, set the Supabase callback URL shown in the provider panel, then enter that client ID and secret in Supabase's Google provider panel. Do not send the secret through chat or commit it. After that, rerun browser OAuth sign-in and callback checks.
- Remaining Supabase Security Advisor warning: leaked-password protection is disabled. No paid plan change or CAPTCHA vendor was configured.

#### Google OAuth failure recheck — 2026-09-25

- `GET /api/auth/google` returns HTTP 303 to the Supabase `/auth/v1/authorize` endpoint with `provider=google` and the correct `http://localhost:3000/auth/callback` redirect.
- Following that authorization URL returns HTTP 400 with `validation_failed: Unsupported provider: provider is not enabled`.
- The OAuth flow therefore stops in Supabase before Google authentication or the app callback. This confirms the current failure is provider configuration, not the local callback URL or redirect construction.
- Fix remains: configure a Google Cloud OAuth Web client and enable Google in Supabase with its Client ID and Client Secret, then retry the end-to-end flow.

### Phase 5 — Verification and handoff

**Status:** Automated and local browser checks complete; Google provider activation and admin-session end-to-end CRUD remain externally dependent.

- Passed: `npm run lint`, `npm run typecheck`, `npm test` (47 tests, Node 24), `npm run prisma:validate`, `npm run prisma:generate`, `npm run build`, `npm run db:check`, and `npm run supabase:check-storage`.
- The default shell Node 20.13 is too old for installed jsdom/Supabase Realtime dependencies. Checks that load those modules passed with the installed Node 24 runtime.
- `npm run supabase:configure` was re-applied after removing public bucket-list policies. The dashboard confirms the tightened policy inventory.
- Browser verified `/`, `/properties`, `/about`, `/localities`, `/blogs`, `/sign-in`, and `/sign-up`; the FAQs expand, Buy/Rent filters submit URL-backed state, the `/blogs` route renders published content or a useful empty state, and anonymous `/admin/content` access is redirected to sign-in. Dark mode was visually checked.
- Admin CRUD was not exercised in an authenticated browser session because no staff session was available. Authorization and validation have automated coverage. Responsive viewport sweep covered home/catalogue at 320, 375, 768, 1024, and 1440 px with no horizontal overflow.
- The local development server is running at `http://127.0.0.1:3000` for follow-up.
- No GitHub push or Vercel deployment has happened. The completed changes are being kept in a local `codex/` branch for review.

### Changed files and modules

- Public experience: `app/page.tsx`, `app/properties/page.tsx`, `app/about/page.tsx`, `app/localities/page.tsx`, `app/globals.css`, and new `components/home/*` sections/search.
- Content/admin: new `features/site-content/*`, `app/admin/content/`, `app/api/admin/faqs/`, `app/api/admin/localities/`, `components/admin/site-content-manager.tsx`, `prisma/migrations/0006_site_content/`, and seed/model updates.
- Auth: `app/api/auth/google/`, `app/auth/callback/route.ts`, sign-in/up pages, Google button component, and profile metadata handling.
- Reliability/security: blog and public property queries, blog pages, public media policy SQL, tests, README, `docs/PLAN.md`, and this handoff.

### Follow-up — 2026-09-25 — UI content review and Google provider recheck

**Status:** Public UI/content preview and OAuth provider diagnostics complete. Google sign-in is still externally blocked because the Google OAuth client credentials are not configured in Supabase.

- Font: changed the “current” font option to Plus Jakarta Sans for both body and display text, updated its admin label, and applied migration `0007_reference_font_default` to Supabase. The migration resets the stored appearance font to `current` and records an audit entry. A cache-key revision ensures the old font setting cache is not reused.
- Homepage/cards: strengthened the homepage headline and search panel; moved the Buy/Rent badge to the high-contrast top-right on homepage and catalogue cards; moved catalogue reference numbers to bottom-left to prevent collision. The homepage now previews two articles.
- About/Contact: About now follows a text-first overview, category list, locality links, and a clear CTA; the promotional Contact banner is removed, leaving a compact Contact title beside the enquiry form.
- Preview data: `npm run db:seed:preview` succeeded against the configured Supabase database with five idempotent, explicitly unverified preview listings and two original blog articles. They are visible for UI review; no source-site images were copied, so property cards use the existing architectural placeholder. Replace or remove these records and upload authorized media before presenting them as verified Royal Estates inventory.
- Database safety: the active Supabase dashboard branch is named `main` / `PRODUCTION`, and `.env.local` points to it. The preview rows and font migration are therefore in that connected project. The preview seed now requires `SEED_REFERENCE_PREVIEW_ALLOW_REMOTE=true` when the configured database host is remote, in addition to its localhost UI and seed opt-ins. The records must be replaced or unpublished before treating the production catalogue as real inventory.
- OAuth: Supabase Dashboard still shows Google **Disabled** and both Client IDs and Client Secret empty. The public Auth settings endpoint reports `external.google: false`. `/api/auth/google` now checks the setting and returns an actionable message instead of sending users to Supabase's raw `Unsupported provider` 400 page. Browser verified that redirect. No OAuth credentials were created, exposed, or stored.
- Required external setup: create a Google OAuth Web client, register the Supabase callback `https://hyshazxauycyhlafyenp.supabase.co/auth/v1/callback` in Google Cloud, then enter the client ID and secret in Supabase **Authentication → Sign In / Providers → Google** and enable it. Keep the secret inside Supabase; do not send it through chat or commit it.

#### Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| Vitest via Node 24 | Pass — 50 tests across 11 files |
| `npm run build` | Pass; Supabase client warns that Node 20 and below are deprecated |
| `npm run db:check` | Pass — Supabase database connection available |
| `npm run prisma:deploy` | Pass — applied `0007_reference_font_default` |
| Browser: homepage | Pass — search defaults, five preview listings, two journal articles, and badge placement visible |
| Browser: About and Contact | Pass — requested page structures rendered; Contact promotional banner absent |
| Browser: `/blogs` | Pass — both original article cards visible |
| Browser: mobile 375 px | Pass — About, Contact, Blogs, and Properties showed no horizontal overflow |
| Browser: OAuth initiation | Pass — disabled provider returns a clear sign-in notice; full OAuth handshake remains blocked by missing external credentials |

#### Changed in this follow-up

- `app/about/page.tsx`, `app/contact/page.tsx`, `app/page.tsx`, `app/properties/page.tsx`, `app/blogs/page.tsx`, `app/api/auth/google/route.ts`
- `features/auth/provider-availability.ts`, `features/site-appearance/font-family.ts`, `features/site-appearance/queries.ts`
- `app/globals.css`, `components/home/home-property-search.tsx`, `package.json`
- `prisma/seed-reference-preview.ts`, `prisma/migrations/0007_reference_font_default/migration.sql`
- `tests/provider-availability.test.ts`, `tests/admin-settings-ui.test.tsx`
- `docs/PLAN.md` and `docs/HANDOFF.md`

### Follow-up — 2026-09-25 — Homepage motion and property-card actions

**Status:** Implemented and verified in the local browser.

- Relaxed the homepage headline line height and letter spacing so the two lines read more clearly.
- Added a low-contrast, token-based spotlight drift behind the homepage content and a single headline entrance reveal. Reduced-motion users receive a static background and headline.
- Replaced the plain “View property” footer on homepage and catalogue cards with one shared, full-width CTA treatment. Hover and keyboard focus change the CTA surface and move its arrow slightly; reduced-motion keeps the visual state change without movement.
- Added visible inset keyboard focus on property-card links.
- No Aceternity package was added; the effect is a small CSS implementation adapted to the existing theme tokens and accessibility rules.

#### Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| Vitest with system Node 20 | Runtime incompatibility: `ERR_REQUIRE_ESM` while loading `html-encoding-sniffer`; no tests started |
| Vitest with bundled Node 24.19.0 | Pass — 52 tests across 12 files |
| Next.js production build with bundled Node 24.19.0 | Pass |
| Playwright `public.spec.ts` | Pass — 3 tests covering the hero/reduced-motion/card-focus flow, catalogue/contact labels, and signed-out admin redirect |
| `git diff --check` | Pass |
| Browser: homepage, light theme | Pass — headline spacing, search, and updated homepage card actions rendered |
| Browser: property catalogue, light theme | Pass — shared card action rendered on all six listings |
| Browser: property catalogue, dark theme | Pass — slate surfaces, gold action states, and readable CTA text visible |
| Browser: keyboard focus | Pass — focused listing link showed a visible card focus state and highlighted CTA |
| Reduced-motion behavior | CSS fallback added; not manually toggled in browser |

The dev server was restarted on its default host after the production build so the original `localhost:3000` origin remains available. A stale preview tab that had converted into a browser connection-error page could not be controlled; a fresh deliverable homepage tab is open instead.

#### Changed in this follow-up

- `app/page.tsx`, `app/properties/page.tsx`, `app/globals.css`
- `components/properties/property-card-action.tsx`
- `e2e/public.spec.ts`
- `docs/PLAN.md`, `docs/HANDOFF.md`

### Follow-up — 2026-09-25 — Slate dark appearance

**Status:** Implemented and verified in the local browser.

- Replaced the green-charcoal dark tokens with a layered slate palette: Slate 950 canvas, Slate 900 cards, Slate 800 muted controls, and Slate 700 borders. Warm gold remains the action and selected-state accent.
- Added a separate spotlight surface so large feature panels remain deep slate in dark mode instead of inheriting the gold CTA color. Applied it to sign-in, owner submission, listing enquiry, homepage CTA, account submission, listing, and admin guidance panels.
- Theme selection now offers Light, Dark, and System, defaults to System for new visitors, persists explicit choices through `next-themes`, and appears in the public header, footer, mobile menu, admin shell, and sign-in page.
- Added restrained dark ambient color and a lower-contrast architectural image fallback. Updated `DESIGN.md` with the new dark palette.

#### Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| ESLint via Node 24 | Pass |
| Vitest via Node 24 | Pass — 52 tests across 12 files |
| Browser: sign-in dark mode | Pass — slate canvas, layered slate surfaces, gold controls, and theme selector visible |
| Browser: home at 360 px | Pass — background `#020617`, card surface `#0f172a`, no horizontal overflow |

#### Changed in this follow-up

- `app/globals.css`, `components/theme-provider.tsx`, `components/theme-toggle.tsx`, `components/layout/public-header.tsx`
- `app/sign-in/page.tsx`, `app/page.tsx`, `app/list-property/page.tsx`, `app/admin/page.tsx`, `app/account/page.tsx`, `app/properties/[slug]/page.tsx`, `components/forms/owner-submission-wizard.tsx`
- `DESIGN.md`, `tests/theme-toggle.test.tsx`

### Follow-up — move public theme selection to footer

**Status:** Implemented; browser verification recorded below.

- Removed the Light/Dark/System selector from the public desktop header and mobile navigation. The public footer remains the theme-selection location for public pages; admin and standalone sign-in controls remain in their task-specific shells.
- Added a public browser check confirming the selector appears in the footer, is absent from the header, and still applies dark mode.

#### Verification

| Check | Result |
| --- | --- |
| Playwright `public.spec.ts` | Pass — 4 tests, including footer placement and dark-theme selection |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| Browser: homepage accessibility tree | Pass — no theme selector in public header; Light/Dark/System control is in the footer |

#### Changed in this follow-up

- `components/layout/public-header.tsx`
- `e2e/public.spec.ts`
- `docs/PLAN.md`, `docs/HANDOFF.md`
