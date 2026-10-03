# Implementation Handoff Log

This is the running record for `docs/PLAN.md`. Update it whenever a phase or material change is completed. A phase is complete only after its implementation and applicable checks pass.

## 2026-10-03 — Redesign research and approved InsForge setup

### Outcome

- Prepared a new phased redesign and InsForge migration plan in `docs/PLAN.md`; preserved the previous plan at `docs/archive/PLAN-2026-09-30.md`.
- Added `docs/AUDIT-2026-10-03.md` with source findings, current service checks and three locally inspected live-browser screenshots for home/footer/journal.
- Confirmed the user meant InsForge, authenticated its CLI and linked **RealEstate-MLS**, project `e37d17ef-599d-470b-b821-4304da8015aa`, us-east. Project is active and billing reports free.
- Installed the four official InsForge skills project-locally and recorded their source hashes in `skills-lock.json`. They are available to Codex on the next turn.
- Updated the generated InsForge section in AGENTS.md to state the migration is approved but production still uses Supabase; preserved SSR, privacy, stable identities and no-payments requirements.
- Ensured `.insforge/` is ignored. Removed CLI-generated broad agent-directory ignores so project skills remain reviewable.
- Inspected `E:/c++/Arduino/AI-VoiceAssitant/voice-agent-app` read-only. It demonstrates browser SDK auth and owner RLS; this site's admin requires server sessions/permissions and the SDK SSR helpers.
- Proposed Plus Jakarta Sans, one forest-green accent, neutral light surfaces and Slate 950 dark surfaces. Shared shadcn controls, Motion and one adapted free Aceternity effect are the recommended UI kit.

### Decisions and boundaries

- Latest user approval supersedes the old Supabase provider choice. Keep Prisma and the existing domain transactions pending full migration validation.
- Direct Prisma `SELECT 1` against InsForge passed. This confirms connectivity only; schema/pooling/load/permission compatibility needs Phase 5–6 checks.
- The InsForge target has zero public application tables and zero buckets. Google/GitHub are listed in auth metadata, but allowed app redirects are empty and real OAuth callback success is unverified.
- Current Supabase password authentication, Profile and database probes pass. Local application server was unreachable, so this run did not verify application admin access.
- Full npm audit now reports 11 high findings in development dependency chains; production audit is clean. No forced downgrade or package modification was applied.
- GitHub and Vercel CLIs are authenticated. Dedicated GitHub/Vercel/InsForge MCP tools were not exposed in this session.
- Full redesign, provider migration and new production deployment have not been performed in this planning stage.

### Files changed

- `.gitignore`, AGENTS.md, skills-lock.json.
- Four `.agents/skills/insforge*` directories.
- docs/PLAN.md, docs/AUDIT-2026-10-03.md, this log, docs/PHASE_STATUS.md.
- Archived September plan; docs/audits/2026-10-03 browser PNGs.

### Checks

- InsForge CLI 0.2.8 login/link: pass.
- Project/billing/metadata/table/bucket read-only inspection: pass.
- InsForge memory list: pass, no entries.
- Existing Prisma 6.19.3 read-only query against target: pass.
- `npm audit --omit=dev --json`: pass, zero.
- `npm audit --json`: 11 high development findings, scheduled in Phase 1.
- `npm run diagnose:admin`: Supabase/password/profile/DB pass; local app not reachable; admin browser path not tested.
- Vercel inspect: production Ready, deployment `dpl_5DBiesRuihb9Lukdt2U6JfDbxCza`.
- Browser reference and production evidence saved/reopened: pass.
- Application lint/typecheck/build/test suite not rerun for docs and skill setup; September results below remain historical only.
- Documentation links/nonempty files, staged credential-path/pattern check, and `git diff --cached --check`: pass.
- Planning checkpoint `9bbe476` pushed to `origin/codex/insforge-redesign-plan`; production remains the existing Ready deployment. This checkpoint contains the plan, audit, browser evidence and project-local skills.

### Next phase and required inputs

Start Phase 1 with compatible package-chain repair, API origin/input/rate-limit checks and auth session consistency. Then implement the shared theme and public/admin redesign before the final migration.

For launch, obtain real listing photos/content and approved business contacts; verify Google OAuth with a real account and exact app callbacks; validate free branch/rehearsal entitlement, identity mapping and source backup/reconciliation. Keep user data exports and keys out of git. No paid upgrade is authorized.

## 2026-09-30 — Final production browser confirmation

### Outcome

- Verified `https://royalestatejaipur.vercel.app` in the browser. The homepage shows the Buy/Rent search, locality and property-type selectors, latest listings, FAQs, and journal preview.
- Verified the canonical `/properties` page title and live catalogue controls; six clearly marked preview listings render with Buy/Rent filters.
- Verified `/blogs` page title and both original article cards, plus the redesigned `/about` page and its property-type/locality navigation.
- `vercel inspect` reports the current production deployment as **Ready** and lists `https://royalestatejaipur.vercel.app` as its canonical alias.

### Remaining external setup

- Public property cards still include seeded preview/demo listings. Replace or unpublish them before presenting the catalogue as actual business inventory.
- Google OAuth remains disabled in Supabase until the OAuth client ID and secret are entered directly in the project's Google provider settings. Do not put the client secret in source control or chat.

### Checks

- Live production browser review: pass for home, properties, blogs, and about.
- Current production deployment inspection: pass — status Ready and canonical alias present.
- No application code changed in this follow-up; the comprehensive automated test results remain recorded in the 2026-09-28 entry below.

## 2026-09-28 — Architecture, security, and shared UI completion

### Outcome

- Consolidated homepage and catalogue listings into one accessible `PropertyCard`, with a highlighted top-right intent badge, consistent facts, stronger focus and hover elevation, and the shared animated action.
- Added public/auth metadata, noindex protection for account/auth areas, route-matched loading skeletons, and safe error recovery for public catalogue and journal routes.
- Normalized button and form interaction feedback while retaining the ivory/navy/brass light theme and Slate 950 dark hierarchy.
- Hid the placeholder WhatsApp action, removed demo language from the public footer, and kept the theme selector in the footer as requested.
- Bounded the in-memory limiter, rate-limited avatar and submission media uploads, removed replaced avatar objects, verified file signatures for JPG/PNG/WebP/PDF uploads, and added five-minute duplicate enquiry suppression plus a supporting database index.
- Applied migration `0008_enquiry_duplicate_index` successfully to the connected Supabase database.
- Upgraded Next.js, Tiptap, Sharp, ESLint config, and Vitest to patched compatible versions. Production dependency audit is clean. Lighthouse CI was removed because its latest package currently contributes unresolved high-severity development-only advisories; the remaining development audit findings are in Prisma's current CLI/config chain.

### Verification completed so far

- `npm run lint`: pass with zero warnings after replacing internal `window.location` navigation with the Next router.
- `npm run typecheck`: pass.
- `npm test`: pass, 55 tests across 13 files.
- `npm run prisma:validate` and `npm run prisma:generate`: pass; Prisma 6 reports its documented future config-file deprecation warning.
- `npm run prisma:deploy`: pass; eight migrations are applied.
- `npm run db:check`: pass; six site settings readable.
- `npm run supabase:check-storage`: pass.
- `npm run build`: pass on Next.js 16.3.6, 55 routes generated.
- Playwright accessibility scan: pass on home, catalogue, journal, and sign-in with no serious or critical WCAG A/AA findings. A real light-theme contrast issue in homepage step numbers was found and fixed; reduced motion is enabled during automated contrast scans to avoid sampling translucent entrance frames.

### External state

- The Supabase public Auth settings endpoint still reports Google provider enabled: `false`. The Google client exists, and the application initiation/callback code is ready, but the client ID and secret still need to be saved directly in Supabase's Google provider panel. The secret was not read, logged, or committed.

### Final verification and delivery

- `npm run test:e2e`: pass, 12 Chromium tests in 1.3 minutes. Coverage includes public search and cards, footer theme placement, reduced motion, Axe checks, sign-up OTP, authenticated admin sign-in, owner photo flow, signed-out admin protection, and zero horizontal overflow on home/catalogue/journal at 320, 375, 768, 1024, 1440, and 1920 px.
- `npm audit --omit=dev`: pass, zero production vulnerabilities. Full audit has five high development-only findings in Prisma 6.19.3's current CLI/config dependency chain; no breaking forced upgrade was applied.
- `git diff --check`: pass. No environment file, Vercel directory, Playwright artifact, or secret was committed.
- Git commit `b1854e1` was pushed to `origin/codex/real-estate-ui-auth-content`.
- Vercel project `unfiltered-iit-ians/royalestatejaipur` was linked. `NEXT_PUBLIC_SITE_URL=https://royalestatejaipur.vercel.app` was added for production and this preview branch.
- Vercel preview build completed successfully at `https://royalestatejaipur-fnbw3cuor-unfiltered-iit-ians.vercel.app` (deployment protection is enabled).
- Vercel production build completed successfully and was aliased to `https://royalestatejaipur.vercel.app`.
- Live browser verification passed on the production home, catalogue, and journal: current headings and cards render, the intent badge is in the top-right, the card action is visible, journal metadata/featured hierarchy is present, footer theme control exists, and no horizontal overflow was detected.

### Files and modules

- Shared/public UI: `components/properties/property-card.tsx`, `components/ui/*`, `app/page.tsx`, `app/properties/*`, `app/blogs/*`, public metadata pages, footer, and global tokens.
- Security/backend: `lib/security/*`, upload Route Handlers, enquiry schema/route, Prisma schema and migration `0008_enquiry_duplicate_index`.
- Verification/docs: Vitest config/tests, Axe Playwright coverage, responsive Playwright coverage, package manifests, README, `.env.example`, `docs/PLAN.md`, and this log.

## 2026-09-28 — Approved completion programme started

### Outcome

- Installed the approved local agent guidance: Vercel React performance, Vercel composition patterns, Vercel web design guidelines, frontend design, and Playwright best practices.
- Added Supabase CLI, `@axe-core/playwright`, and Lighthouse CI to the development toolchain. The first npm process completed the downloads but stalled before writing the manifest; the dependency versions were recorded explicitly and the lockfile was regenerated successfully with scripts disabled.
- Replaced the earlier feature-specific plan with a full route, architecture, UI, security, performance, verification, and delivery plan in `docs/PLAN.md`.
- Began Phase 1 with a complete route/file inventory.

### Verified service state

- `npm run db:check`: pass; the configured Supabase database is reachable.
- `npm run supabase:check-storage`: pass; required buckets and visibility match.
- `npm run prisma:validate`: pass; Prisma emitted its existing Prisma 7 configuration deprecation warning.
- Supabase Auth settings check: Google and email external-provider flags currently report disabled. Google OAuth remains an external dashboard credential step; no secret was read, printed, or stored.

### Decisions

- Preserve the current Next.js, Supabase, Prisma, Tailwind, Motion, Lucide, and next-themes stack.
- Use Aceternity-inspired visuals as small local, token-based components rather than adding another broad component system.
- Keep the public theme selector in the footer and the admin theme selector in the operational shell.
- Treat Crossworld Properties as interaction and information-architecture inspiration only.

### Changed files

- `.agents/skills/*`, `skills-lock.json`
- `package.json`, `package-lock.json`
- `docs/PLAN.md`, `docs/HANDOFF.md`

### Current status

- Phase 0 complete.
- Phase 1 repository/route/architecture audit in progress.
- npm reports 51 resolved-tree advisories. They require scoped dependency triage in Phase 6; no forced breaking upgrade has been applied.

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

- Google Auth Platform consent setup and OAuth Web client creation are complete in `My First Project`. The Supabase provider remains disabled until the user enters the new Client ID and Client Secret directly in Supabase; never send the secret through chat or commit it.
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

**Status:** Application flow implemented and Google OAuth Web client created; provider activation awaits the user entering its credentials directly in Supabase.

- Added rate-limited Google OAuth initiation, safe callback redirect handling, idempotent profile provisioning, suspended-profile rejection, role-aware destinations, and buttons on sign-in/sign-up. Existing email/OTP recovery stays available.
- Dashboard verification: Supabase Google provider is **Disabled**; client ID and secret are blank. Redirect allowlist already includes `http://localhost:3000/auth/callback` and `https://royalestatejaipur.vercel.app/auth/callback` plus reset-password variants. Email sign-up and email confirmation are enabled.
- User action needed: enter the new OAuth Web client ID and secret directly in Supabase's Google provider panel and enable Google. The secret must not be sent through chat or committed. After that, rerun browser OAuth sign-in and callback checks.
- Remaining Supabase Security Advisor warning: leaked-password protection is disabled. No paid plan change or CAPTCHA vendor was configured.

#### Google OAuth failure recheck — 2026-09-25

- `GET /api/auth/google` returns HTTP 303 to the Supabase `/auth/v1/authorize` endpoint with `provider=google` and the correct `http://localhost:3000/auth/callback` redirect.
- Following that authorization URL returns HTTP 400 with `validation_failed: Unsupported provider: provider is not enabled`.
- The OAuth flow therefore stops in Supabase before Google authentication or the app callback. This confirms the current failure is provider configuration, not the local callback URL or redirect construction.
- Fix remains: configure a Google Cloud OAuth Web client and enable Google in Supabase with its Client ID and Client Secret, then retry the end-to-end flow.

#### Google OAuth dashboard recheck — 2026-09-25

- In the authenticated Supabase project `Mls-RealEstate` (`hyshazxauycyhlafyenp`), Authentication → Sign In / Providers shows Google disabled; Client IDs and Client Secret are blank. The provider callback shown by Supabase is `https://hyshazxauycyhlafyenp.supabase.co/auth/v1/callback`.
- Supabase URL Configuration is already set to `https://royalestatejaipur.vercel.app` and allows the exact local and production `/auth/callback` URLs plus their password-reset callback variants. Email signup and confirmation are enabled. No allowlist change is currently needed for localhost or the canonical production site.
- At the initial dashboard inspection, Google Cloud Console opened on `My First Project`, where Google Auth Platform was not configured and no OAuth client was listed. No Google Cloud or Supabase settings had been changed at that point.
- The user confirmed `My First Project` as the correct project. The created web client uses authorized JavaScript origins `http://localhost:3000` and `https://royalestatejaipur.vercel.app`, plus the Supabase callback above as its authorized redirect URI.
- Once the Web client is created, enter its Client ID and Client Secret directly in Supabase's Google provider panel, enable Google, and keep “Skip nonce checks” off. Never send the secret through chat or commit it. Then verify login/signup from the browser through the app's PKCE callback and profile provisioning.

#### Google OAuth setup progress — 2026-09-25

- The user confirmed `My First Project` and supplied the consent-screen support contact. Google Auth Platform's App Information step is complete with the app name `Royal Estates Jaipur` and that contact.
- The user selected External for the audience. App Information, Audience, and Contact Information steps are complete for `Royal Estates Jaipur`.
- The user explicitly accepted the Google API Services: User Data Policy. Google Cloud displayed “OAuth configuration created!” and the consent configuration is complete for External audience.
- After the user approved the action-time prompt, an OAuth Web client named `Royal Estates Jaipur Web` was created successfully in `My First Project`. It has authorized origins `http://localhost:3000` and `https://royalestatejaipur.vercel.app`, and authorized redirect URI `https://hyshazxauycyhlafyenp.supabase.co/auth/v1/callback`. The client is enabled. Its ID and secret were not copied into documentation or chat.
- Supabase's Google provider is still disabled with blank credentials. The Supabase provider form is open for the user to enter the Client ID and Client Secret directly; computer-use policy requires the user to take over before a new authentication credential is entered. Keep “Skip nonce checks” off, then save and test Google sign-in. No billing or payment action was taken.

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

- Removed the Light/Dark/System selector from the public desktop header, mobile navigation, and standalone sign-in page. The public footer remains the theme-selection location for public pages; the admin shell retains its task-specific control.
- Added a public browser check confirming the selector appears in the footer, is absent from the header, and still applies dark mode.

#### Verification

| Check | Result |
| --- | --- |
| Playwright `public.spec.ts` | Pass — 4 tests, including footer placement and dark-theme selection |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| Browser: homepage accessibility tree | Pass — no theme selector in public header; Light/Dark/System control is in the footer |
| Browser: production `/sign-in` | Pass — direct sign-in route has no theme selector |

#### Changed in this follow-up

- `components/layout/public-header.tsx`
- `e2e/public.spec.ts`
- `docs/PLAN.md`, `docs/HANDOFF.md`

### Follow-up — strengthened homepage hero and journal cards

**Status:** Implemented and verified in the local browser.

- Replaced the barely visible hero color wash with a token-based architectural grid, framed edges, and two slow-moving spotlights powered by Motion for React. The decorative client island starts static during server rendering and uses `useSyncExternalStore` to disable movement when `prefers-reduced-motion: reduce` is active.
- Restyled the journal heading with an icon-led eyebrow and a stronger two-line title. The first published article is featured with a high-contrast slate panel; both articles now have clear, full-width “Read article” actions and reading-time icons.
- Applied the same featured-card hierarchy and button treatment to the homepage journal preview. Existing property search behavior and listing cards are unchanged.
- Added the `motion` dependency without re-resolving unrelated lockfile packages. `npm install` reported 41 advisories for the resolved dependency tree (31 moderate, 9 high, 1 critical); this UI change did not run automatic dependency upgrades.

#### Verification

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| Vitest with bundled Node 24 | Pass — 52 tests across 12 files |
| Playwright `public.spec.ts` | Pass — 4 tests, including animated/reduced-motion hero and featured journal CTA |
| Next.js production build with bundled Node 24 | Pass |
| Browser: production home and journal, light theme | Pass — animated grid/spotlight hero, featured article, and strong article actions visible |
| Browser: production journal, dark theme | Pass — featured slate panel is distinct, with readable gold article actions |
| Responsive browser check at 320, 375, 768, 1024, and 1440 px | Pass — no horizontal overflow on home or `/blogs` |
| `git diff --check` | Pass |

#### Changed in this follow-up

- `app/page.tsx`, `app/blogs/page.tsx`, `app/globals.css`
- `components/home/home-hero-background.tsx`
- `e2e/public.spec.ts`, `package.json`, `package-lock.json`
- `docs/PLAN.md`, `docs/HANDOFF.md`
