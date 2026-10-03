# Royal Estates Jaipur — Redesign and InsForge migration plan

Updated: 2026-10-03 (Asia/Calcutta)
Status: Phase 1 verified locally and live; GitHub Actions cannot start due to account billing lock. Phase 2 in progress.
Branch: `codex/insforge-redesign-plan`
Baseline: `564595b` on `codex/real-estate-ui-auth-content`.
Live application: https://royalestatejaipur.vercel.app/

## 1. Scope and decision record

The latest user instruction approves InsForge as the replacement for Supabase Auth, Postgres, and Storage. Build a cohesive premium public site and operational admin experience, following the reference's section sequence. Fix packages and API/security foundations first; deliver the redesign in verified stages; rehearse the migration; then change production providers.

This plan supersedes the September completion plan, preserved in [the archive](archive/PLAN-2026-09-30.md). Old passing checks are historical evidence, not proof that the new work is complete. [HANDOFF.md](HANDOFF.md) records every completed stage; [AUDIT-2026-10-03.md](AUDIT-2026-10-03.md) contains the current findings and browser evidence.

### Authorized and established

- InsForge CLI login and link succeeded for **RealEstate-MLS**, project `e37d17ef-599d-470b-b821-4304da8015aa`, region `us-east`, API `https://t5gi2y6m.us-east.insforge.app`.
- Project status is active; organization billing reports the **free** plan; backend service version is 2.3.2.
- Four official InsForge skills are now installed **inside this repository**, with sources/hashes in `skills-lock.json`. Global agent configuration was not changed.
- CLI credentials and inspection files remain under ignored `.insforge/`; no key belongs in these documents, public environment variables, git, or browser screenshots.
- Existing Next.js App Router, strict TypeScript, Tailwind CSS 4, Zod, Prisma, server authorization, GitHub and Vercel workflows remain the foundation.
- The user's reference implementation is `E:/c++/Arduino/AI-VoiceAssitant/voice-agent-app`. It was inspected read-only; its project credentials and configuration must not be copied here.

### Remaining decisions and constraints

- UI direction below is a design recommendation, not a claim that one palette is scientifically best for real estate.
- New theme/palette approval in the latest request supersedes the older requirement to keep ivory/navy/brass. Preserve the business name/logo.
- No payments, paid template purchase, plan upgrade, or extra identity provider is part of this release.
- Production remains on Supabase until the final cutover gate passes. Connection setup does not mean migration or Google sign-in is complete.
- Confirm free backend branch entitlement before creating branches. If unavailable, document the limitation and use an explicitly isolated, free rehearsal target; never experiment on the active source database.
- Obtain approved business contact details and property media/content before declaring the catalogue launch-ready.
- Recheck deployment plan eligibility and service limits before commercial release; no new paid resource is authorized.

## 2. Observed baseline

| Area | Current evidence | Consequence |
| --- | --- | --- |
| Packages | Next 16.3.6, React 19.2.4, Prisma 6.19.3, Tailwind 4; npm lockfile | Upgrade compatible dependency chains before aesthetic changes |
| Audit | 11 high findings in the full development graph; production-only audit has 0 | Review leaf fixes and parent compatibility; never run a forced breaking downgrade |
| Application data | 16 Prisma domain models; 8 checked-in migrations; 31 API route handlers | Preserve domain relationships, transitions and transaction guarantees |
| Supabase | Current Auth endpoint, bootstrap password sign-in, profile and database probe passed | Isolate Google/session flow failures; do not claim all authentication is down |
| Local app | No reachable server at the configured local URL during the diagnostic | Browser/API admin journey needs a running application |
| InsForge target | No public application tables; no Storage buckets | This is an empty target, not migrated inventory |
| InsForge Auth | Metadata lists Google/GitHub, requires email verification, and has no allowed redirect URLs | Configure and verify application callbacks before exposing the new auth flow |
| ORM compatibility | Existing Prisma client executed read-only `SELECT 1` against InsForge | Direct connectivity works; schema migrations, pooling and transaction behavior remain to verify |
| Deployment | Vercel production reports Ready; browser renders home and journal | Record an actual preview/build URL after each implemented stage |
| Tools | GitHub CLI, Vercel CLI and InsForge CLI work | Their dedicated MCP namespaces are not exposed in this session; use authenticated CLIs |

## 3. Reference layout contract

Observed in the live browser on 2026-10-03. Reuse page sequence and interaction patterns with original Royal Estates copy, branding and approved imagery. [Reference home](https://www.crossworldproperties.com/)

| Surface | Observed structure |
| --- | --- |
| Home | Header → centered hero/search → latest properties → trust/service highlights → locality discovery → FAQ → owner CTA → footer |
| Catalogue | Heading/count → query/location/type/intent filters → view controls → property grid → pagination → footer |
| About | Simple title → readable editorial content → related property links → footer |
| Contact | Compact title/introduction → contact methods → enquiry form → footer |

Sources: [catalogue](https://www.crossworldproperties.com/properties), [about](https://www.crossworldproperties.com/about-us), [contact](https://www.crossworldproperties.com/contact).

### Royal Estates requirements applied to that structure

- Home search has only **Buy** and **Rent**, query, **All Locations**, **All property types**, and a clear Search action. Keep visible labels; fit the desktop controls on one row and stack them on mobile.
- Remove the landmark carousel; it is already absent and must stay absent.
- Preserve the reference's main section order. Keep the existing journal as a clearly secondary insertion between locality discovery and FAQ.
- Cards keep photo → title/location → facts/price → action hierarchy. Intent badge stays prominent in the top-right. Show human area units and readable Indian currency.
- Gallery, filter state and pagination remain functional; search state belongs in the URL. Only published and currently available listings appear in default results.
- A map view must only appear after coordinates and a free map-service integration are real and verified. No decorative nonfunctional map switch.
- Localities and FAQ remain administered through complete guarded CRUD. Reconcile new reference locality names with existing IDs; do not delete or silently rename linked locations.
- About follows the simple editorial structure with original business content and real related listings. Do not invent expertise, JDA verification, awards, clients or returns.
- Contact starts directly with useful contact methods/form. Keep the previously rejected “Bring the question...” hero removed.
- Theme selection stays in the **footer**, absent from the header and sign-in screen.
- Auth/account/admin use the same tokens, type scale, controls and feedback as the public site.

## 4. Recommended free engineering kit

Popularity is a time-stamped discovery signal, not a quality guarantee. Repository star counts below came from GitHub's public API on 2026-10-03. Review licenses and generated code for every selected component.

### Skills

| Recommendation | Status / purpose | Source |
| --- | --- | --- |
| Vercel React best practices | Installed; server boundaries, auth per mutation, parallel reads, bundle size | [Official Vercel skills](https://github.com/vercel-labs/agent-skills) — 31,857 stars |
| Vercel composition patterns | Installed; reusable domain components without giant variant APIs | Same official collection |
| Web design guidelines | Installed; current checklist fetched for final keyboard/theme/form QA | [Official guidelines](https://github.com/vercel-labs/web-interface-guidelines) |
| Frontend design | Installed; intentional hierarchy and cohesive visual decisions | [Anthropic skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) |
| shadcn skill | Recommended project-local addition in Phase 2; component-aware configuration and composition | [Official skill](https://ui.shadcn.com/docs/skills) |
| UI UX Pro Max | Recommend reviewed upstream searchable bundle in Phase 2; compare palettes/type and generate project rules | [Upstream](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) — 132,611 stars, MIT |
| Playwright best practices | Installed; stable locators, real auth coverage, responsive regression | Repository skill already tracked |
| InsForge app, CLI, debug and integrations | Installed project-local; SDK/SSR, infrastructure, diagnostics; integrations only if actually needed | [Official skills](https://github.com/InsForge/insforge-skills), Apache-2.0 |

The globally available `ui-ux-pro-max` skill is a prose-only local guide. Its presence does not mean the upstream search scripts/datasets are installed. Install a reviewed project-local upstream version without replacing that global file. Install skill sources locally, record their revision/hash, read their instructions, and reject instructions that contradict approved stack or privacy rules.

### Components and runtimes

| Tool | Decision | Why |
| --- | --- | --- |
| Next.js + React + TypeScript + Tailwind 4 | Keep | Existing full-stack routing and domain code do not need a framework rewrite |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Primary shared component foundation; MIT, 125,013 stars | Own the source; normalize Dialog, Sheet, Accordion, forms, badges, buttons and tables |
| [Motion](https://github.com/motiondivision/motion) | Already installed; MIT, 33,811 stars | Drawer transitions, gallery changes and short hero/text reveals |
| [Aceternity Background Beams](https://ui.aceternity.com/components/background-beams) | One reviewed free decorative component | The user wants an obvious hero effect; adapt color, motion duration and accessibility |
| [Magic UI](https://github.com/magicuidesign/magicui) | Optional alternative, not an additional full design system; MIT, 22,449 stars | Compare one effect if Aceternity cannot meet the budget |
| [tweakcn](https://github.com/jnsahaj/tweakcn) | Optional visual token editor; Apache-2.0, 10,435 stars | Preview light/dark semantic colors; export reviewed tokens, not its whole application |
| Lucide / next-themes / Zod | Already installed; keep | One icon family, hydration-safe theme switching, trust-boundary validation |
| InsForge SDK | Add in Phase 5; npm reports 1.5.2 | Native auth, Storage and user-scoped database APIs; SSR helpers available |
| Prisma | Keep after compatibility gate | Existing typed domain queries/transactions; direct InsForge probe passed |
| Vitest / Testing Library / Playwright / Axe | Already installed; keep | Domain, permission, keyboard, theme, responsive and end-to-end coverage |

The official [shadcn CLI](https://ui.shadcn.com/docs/cli) supports inspecting changes with `add --dry-run`, `--diff` and `--view`. The repository currently has no `components.json`; create reviewed configuration matching its aliases/Tailwind 4 before adding selected primitives. Do not run an overwrite/reinitialization workflow.

Use only explicitly free Aceternity components; its Pro blocks/templates have separate licenses. Adapt the component into the shared visual system. No cursor followers, content-obscuring effects, particle packages or 3D card dependency are needed.

### CLI choices and reproducibility

- Existing GitHub CLI 2.96.0 and Vercel CLI 50.34.1 are authenticated.
- InsForge CLI 0.2.8 is available through `npx -y @insforge/cli`; use it for backend operations, with `--json` and protected private output where necessary. No global binary installation.
- shadcn 4.21.1 and skills 1.7.0 are npm versions observed today, not added runtime dependencies.
- Keep npm/`package-lock.json`, `npm ci`, `npm audit`, Vitest and Playwright workflows; add a formatter check and CI.
- Project-local skill installation example: `npx -y skills add shadcn/ui --agent codex --yes`. Review the resolved source and pin/record it before use.
- For UI UX Pro Max, inspect the upstream Codex installation/search scripts before running them; do not blindly execute a global installer.
- Lighthouse is optional later as a pinned standalone audit tool. Do not reintroduce the dependency graph previously removed for security findings.
- Review GitHub/Vercel connector availability if exposed later. Do not claim a plugin action when a CLI performed it.

## 5. Proposed visual system

One forest-green accent, spacious neutral surfaces, strong photography and a consistent sans-serif hierarchy. Use **Plus Jakarta Sans** for headings, body and UI; browser computed styles confirmed it on the reference. Keep tabular numerals for amounts and operational tables. Limit the globally active font set instead of declaring/preloading unrelated display fonts.

### Starting tokens

| Token | Light | Dark |
| --- | --- | --- |
| Page | `#F8FAF9` | `#020617` (Slate 950) |
| Card / panel | `#FFFFFF` | `#0F172A` |
| Raised / muted surface | `#EDF3EF` | `#1E293B` |
| Text | `#102A22` | `#F1F5F9` |
| Secondary text | `#52635C` | `#94A3B8` |
| Border | `#D9E2DC` | `#334155` |
| Primary action | `#174B3A` | `#A3D9B7` |
| Text on primary | `#FFFFFF` | `#092419` |

These are candidates; contrast must be measured for text, disabled state, focus ring, overlays, images and native Windows controls before approval of the implementation. Convert to semantic CSS variables/OKLCH consistently. Avoid arbitrary color classes per page.

### Hierarchy and motion

- Hero: balanced natural wrapping, relaxed tracking around `-0.02em` rather than current `-0.04em`, line-height about 1.15, 40–64 px responsive display size.
- Main section headings: concise 28–40 px; card titles around 20–24 px. Keep price more prominent than category metadata.
- Controls: 44–48 px targets; cards about 16 px radius; consistent gaps, borders, icon sizing and focus ring.
- Use a visible, adapted beam/spotlight moment behind the centered hero and an opaque search surface. Text/search remain usable before JS loads.
- Hero text reveal up to 500 ms; decorative backdrop settles within 5 seconds, with no infinite loop. If later adding longer autoplay motion, expose pause/stop and disable it under reduced motion.
- Button feedback uses short color/transform/opacity changes and a small arrow movement. Pending labels/spinners communicate actual request state.
- Motion does not reveal essential content only after scroll. Disable movement under reduced motion and while effects are offscreen.
- Honor system mode and footer preference; set native `color-scheme`, select colors and matching browser theme color. [Motion accessibility](https://motion.dev/docs/react-accessibility)

## 6. Target architecture and auth requirements

```text
app/                        thin routes, layouts, metadata, Route Handlers
components/ui/              accessible shared primitives
components/<domain>/        presentation composition
features/<domain>/          schemas, permissions, domain transitions, services
lib/auth/                   provider session + application Profile resolution
lib/permissions/            exact role/record checks
lib/dal/                    server-only domain reads/writes
lib/insforge/               separate server/browser/admin clients, storage helpers
lib/db/                     Prisma singleton and connection/pooling policy
prisma/                     sole owner of application Prisma schema/migrations
insforge/                   auth/storage config + reviewed policy SQL, no secrets
tests/ and e2e/             domain and real browser regression
```

### Preserve the useful existing structure

Keep public published-only projections, integer minor-unit money, exact role/owner checks, idempotent Profile provisioning, submission versioning, and atomic moderation + notification + audit transactions. Route handlers call feature services; every mutation independently verifies identity and permission, parses Zod input, maps allowed fields, and returns safe typed errors.

Avoid a wholesale conversion of 31 routes to Server Actions during provider migration. New internal forms may use Server Actions; preserve existing tested API contracts unless a phase explicitly changes them.

### InsForge authentication

Use the official installed [SSR guide](../.agents/skills/insforge/auth/ssr-integration.md):

1. Add `@insforge/sdk/ssr` server/browser clients, server auth actions and `/api/auth/refresh`.
2. Add Next.js 16 `proxy.ts` using the dedicated middleware entrypoint to refresh cookies before rendering. Proxy is not the authorization boundary.
3. Keep refresh tokens httpOnly/server-owned. Never return token-bearing SDK objects from Server Actions or use an admin client in browser code.
4. Start Google OAuth on the server with PKCE; store the verifier in a short-lived httpOnly cookie; exchange `insforge_code` on the server; clear verifier state; verify the user and then resolve application roles.
5. Allow exact local, preview and production callback origins. Do not use request-controlled host headers or broad wildcard redirects.
6. Implement signup, verification OTP, resend cooldown, password reset/update, sign-out, session refresh and revoked/suspended-account behavior as one complete journey.
7. Block suspended application profiles consistently for password and OAuth login. Google/email signup grants only the ordinary owner role; staff access comes from protected application data.
8. Preserve safe `next`/redirect intent throughout login without allowing external destinations.
9. Verify Google through an actual chooser → callback → authenticated account/admin permission check. Metadata/provider availability alone is insufficient.
10. Use InsForge native auth. The inspected voice app's client-only `AuthGate`/disabled email verification are not sufficient for admin authorization here.

### Database ownership and identity mapping

- Use Prisma for application models and migrate only app-owned tables. InsForge CLI SQL handles platform-compatible RLS/storage policies; it must not become a second owner of the same Prisma DDL.
- Confirm runtime connection pool limits, TLS, cold starts and a separate migration connection. A successful single query is not proof of production scaling.
- Protect every SDK-exposed table with grants and RLS, including staff roles/PII/private records. A direct Prisma connection bypasses user JWT RLS unless deliberately scoped, so server permission checks remain mandatory.
- Existing `Profile.id` mirrors Supabase auth IDs and anchors many foreign keys. Preserve these application IDs and add a unique protected mapping to the new InsForge identity if IDs cannot be preserved by a supported import.
- Map staff, owners, reviewers, authors, recipients and audit actors before any public release. Do not infer staff roles from email addresses or allow client-editable role fields.
- Do not copy managed `auth` tables or assume password hashes are portable. Confirm a supported identity import; otherwise use an explicit password-reset/reverification migration and test duplicate-account handling.
- Verify role provisioning with a safe admin bootstrap and protect the last active super admin.
- If direct Prisma compatibility later fails on a concrete requirement, document it and use tested database RPC transactions where needed; never replace atomic transitions with unrelated sequential REST writes.

### Storage migration

Inventory all six current buckets: public `property-media`, `profile-avatars`, `blog-media`; private `property-documents`, `property-submission-media`, `blog-draft-media`.

Create equivalent public/private boundaries in InsForge; preserve or map keys; validate object counts, sizes/checksums, MIME and ownership; copy in bounded batches with retries. Persist durable keys/metadata, not expiring private URLs. Test signed access denial for another owner and public access only after publication. Review publication transfer, remove/reconcile behavior and a durable retry/outbox for cross-system failures.

Update image/CSP host allowlists to the exact verified InsForge host. Verify gallery, blog, avatar, draft preview, public publishing and private admin document review. Keep Supabase data and objects intact through rollback validation.

## 7. Phase execution and delivery

Each phase must update HANDOFF with outcomes, files, commands/pass/fail, credentials still needed, commit SHA, preview URL and browser evidence. Finish one phase's vertical slices before starting its successor.

| Phase | Status | Owner / focus | Delivery |
| --- | --- | --- | --- |
| 0 | Complete for research/setup | Engineering + design audit | Plan, audit, linked backend, skills |
| 1 | Complete locally/live; hosted CI blocked externally | Engineering/security | Dependency repair, API boundaries, repeatable checks |
| 2 | In progress | Design system | Tokens, type, accessible primitives, visual preview |
| 3 | Planned | Public experience | Home, catalogue, detail, journal, about, contact/footer |
| 4 | Planned | Owner/admin experience | Coherent forms, CRUD and operational workflows |
| 5 | Planned | Backend/auth | InsForge session/auth vertical slice in isolation |
| 6 | Planned | Data/storage | Migration rehearsal and reconciliation |
| 7 | Planned | Release engineering | Production cutover and rollback verification |
| 8 | Planned | QA/operations | Full release gates and documented launch |

### Phase 0 — Discovery and safe setup

- [x] Read repository rules/design/docs and current git state.
- [x] Inspect source routes, auth, schema, storage, packages and existing tests.
- [x] Inspect live reference home/catalogue/about/contact and actual site home/footer/journal.
- [x] Research official skills/CLI/component sources and current licenses/popularity.
- [x] Link the authorized InsForge project; install its four project-local skills.
- [x] Read-only project, auth metadata, database/bucket inventory and free-plan check.
- [x] Verify direct Prisma connectivity without applying a migration.
- [x] Inspect the voice-agent-app authentication reference without modifying it.
- [x] Record current findings and the phased plan.
- [x] Commit/push the planning stage after diff/secret checks; checkpoint `9bbe476` recorded in HANDOFF.

### Phase 1 — Packages, APIs and repository hygiene

- [x] Add a formatter check and deterministic CI: npm ci, formatting, lint, typecheck, unit tests, build and scoped browser checks.
- [x] Address current `brace-expansion`, `braces`, `micromatch`, `fast-glob`, `js-yaml`, `undici`, and `deepmerge-ts` dependency chains. Evaluate patched leaf versions within actual compatible ranges.
- [x] Review Next/eslint-config-next and Prisma/CLI parents together. Reject npm's suggested incompatible downgrades; record any remaining upstream issue with reachability and next review.
- [x] Keep lockfile/source versions coherent and select a supported Node LTS for local/CI/Vercel; align types without opportunistic major upgrades.
- [x] Inventory every mutation's identity, record permission, Zod schema, rate limit, audit and error behavior.
- [x] Add centralized same-origin/CSRF defenses for cookie-auth Route Handler mutations; reject malformed/oversized inputs with safe responses. Verify forwarded-header trust on Vercel.
- [x] Add a durable free-tier-compatible limiter and atomic duplicate protection; retain bounded local fallback only where its limits are explicit.
- [x] Repair password/OAuth suspended-profile consistency and session refresh on the current provider where required for safe interim release.
- [x] Paginate the public journal and bound its home read; ensure personalized/admin/draft data is never publicly cached. Operational collection pagination follows with its complete UI in Phase 4; recorded in PHASE1-SECURITY.md.
- [x] Review dead code/dependencies without moving unrelated modules; shared-control consolidation is implemented with the Phase 2 design system.
- [x] Test auth failures, direct API invocation, forged ownership/roles, redirects, invalid inputs and public PII exposure.
- [x] Commit and deploy a Vercel preview; promote only passing release-safe changes.

Gate: production dependency audit clean; unresolved development findings explicitly assessed; relevant checks pass; API regressions prevented.

### Phase 2 — Theme, typography and shared controls

- [ ] Add the reviewed shadcn skill/upstream UI UX Pro Max search bundle locally and record provenance.
- [ ] Use upstream palette/type exploration to compare the proposed theme; record selected tokens and update DESIGN.md.
- [ ] Configure components.json matching current aliases and Tailwind 4; inspect dry-run/diffs before adding each component.
- [ ] Build a component preview covering buttons, fields, tabs, combobox, sheet/dialog, accordion, badges, empty/loading/error states, tables and destructive confirmations.
- [ ] Apply one active default font with responsive line-height/tracking; retain admin font selection only if it can avoid unnecessary global loads and inconsistency.
- [ ] Check all tokens in light/dark/system and native Windows form controls.
- [ ] Provide the finite visible hero motion prototype and reduced-motion equivalent.
- [ ] Test keyboard focus/traps/restoration, 200% zoom, touch targets and six viewport widths.
- [ ] Commit; deploy and visually compare the preview before rolling tokens through public pages.

Gate: clear hierarchy, measured contrast, consistent controls, no hydration warnings, visible animation without content obstruction.

### Phase 3 — Public site redesign

- [ ] Implement the home sequence from Section 3, compact desktop search and mobile layout.
- [ ] Rebuild one shared property card with prominent price, top-right intent, real photo or honest “Photo coming soon”, human units and clear animated action.
- [ ] Refactor catalogue controls into a mobile filter sheet and desktop filter surface; preserve URL state, server pagination, clear/reset and truthful result counts.
- [ ] Polish property detail: responsive gallery, facts, enquiry/contact actions, availability history, safe public context.
- [ ] Give journal a concise heading and stronger featured/list hierarchy, useful metadata and clearly visible article CTA; retain at least two original demo articles for preview only.
- [ ] Use original editorial About content and direct Contact methods/form; improve footer hierarchy and verified business contact actions.
- [ ] Reconcile locality defaults (including reference changes such as Goner) through admin-managed data without breaking related records.
- [ ] Show actual loading, empty, unavailable and error recovery; preserve public/private media separation.
- [ ] Metadata/canonical/noindex, sitemap and JSON-LD reflect actual visible records.
- [ ] Remove/unpublish seeded/test listings from production launch inventory or mark them unmistakably as demos.
- [ ] Browser-test search → catalogue → property → enquiry, article navigation, FAQ and theme persistence.
- [ ] Commit and deploy each coherent page group; record live/preview URLs and screenshots.

Gate: all public journeys functional in both themes; footer and lower page sections reviewed; demo content cannot mislead visitors.

### Phase 4 — Owner, staff and content operations

- [ ] Apply shared form and operational tokens to sign-in, signup, account and admin.
- [ ] Keep progress, validation/error summary, autosave versioning, retry and unsaved-exit behavior clear in the owner wizard.
- [ ] Verify true media/document uploads and owner-only draft access; never count a mocked upload as integration proof.
- [ ] Verify FAQ/locality CRUD end to end, including reorder, inactive state, referenced delete protection, publication, audit and public cache invalidation.
- [ ] Verify blog publishing, property editing/media, moderation reasons, draft vs published state and enquiry workflow.
- [ ] Staff/role changes require exact server permission, suspension checks and last-super-admin protection.
- [ ] Mobile tables/cards, keyboard navigation, dialog confirmations and persistent async feedback.
- [ ] Commit and deploy tested workflows.

Gate: complete owner-to-review-to-explicit-publication flow; unauthorized paths rejected; no real data damaged by tests.

### Phase 5 — InsForge authentication vertical slice

- [ ] Verify free isolated backend branch/rehearsal environment entitlement before any schema/auth change.
- [ ] Add reviewed SDK version, separate clients, SSR cookies/refresh Proxy and environment schema.
- [ ] Check in safe auth config with exact localhost/127.0.0.1, controlled preview and production callback URLs; enforce email verification and chosen password policy.
- [ ] Confirm the project's Google provider behavior and real app callback; use platform-managed Google OAuth if supported, or configure the required project client privately.
- [ ] Build Profile identity mapping/provisioning and repeat-safe staff bootstrap in the isolated target.
- [ ] Test email/signup verification, reset, Google callback success/denial, missing/reused verifier, expired/rotating session, revoked account and sign-out.
- [ ] Test real owner login, real admin login and direct unauthorized access/mutations; public signup must not grant admin.
- [ ] Preserve existing routes and safe redirect intent; set preview environments independently of production.
- [ ] Commit; deploy InsForge-backed preview only; record actual browser result.

Gate: Google and password flows completed end to end with server permission checks. No production cutover on provider metadata alone.

### Phase 6 — Database and Storage rehearsal

- [ ] Inventory source rows, identities, role/status distribution, application FKs and all bucket objects with private reports.
- [ ] Create encrypted/private source backup and rollback manifest; do not commit exports with user data.
- [ ] Baseline migrations against an isolated target; preserve indexes, Decimal/integer amounts, enums, IDs and transactions.
- [ ] Use a supported user import or documented reset/reverification; reconcile new auth IDs with stable Profile IDs.
- [ ] Create reviewed grants/RLS for every SDK-exposed table and bucket; anon/owner/staff negative tests.
- [ ] Copy application rows in FK order with repeatable checkpoints; compare counts, relationships and representative checksums.
- [ ] Copy objects in bounded retryable batches; reconcile DB paths/public hosts/private access.
- [ ] Test approval transaction, notifications/audit atomicity, concurrency, media publication and cleanup retries.
- [ ] Rehearse failure halfway through import/copy and resume/rollback without duplicates or orphaned records.
- [ ] Verify target sizes/egress fit the free limits before final copy.
- [ ] Commit migration tooling/config only; record reconciliation evidence and preview URL.

Gate: complete reconciled rehearsal, known identity transition, no FK loss, no unauthorized media access, restore procedure verified.

### Phase 7 — Production cutover

- [ ] Prepare concrete release deployment, exact environment diff, backup, migration report and rollback steps.
- [ ] Use a bounded maintenance/write-freeze window; capture final source delta and validate target again.
- [ ] Set InsForge runtime/migration connection and auth/storage environment in Vercel production privately.
- [ ] Apply reviewed application migrations/config and deploy verified commit; do not use schema push.
- [ ] Verify live Google/email auth, owner/account/admin permissions, images/private review, enquiries, publishing and logs.
- [ ] Verify sessions from the old provider end cleanly and reauthentication is explained.
- [ ] Resume writes on one provider only; avoid accidental dual writes.
- [ ] Revert environment/deployment using the tested rollback if any critical reconciliation/auth gate fails.
- [ ] Preserve Supabase source/backup through the agreed observation period; retiring its resources is a separate deliberate action.

Gate: verified live provider change with reconciled data and successful business journeys; no secrets in logs or public bundles.

### Phase 8 — Release QA and operations

- [ ] Formatter, lint, typecheck, domain/component tests, safe migration validation, production build.
- [ ] Playwright: guest search/detail/enquiry; Google/password auth; owner wizard/media; admin moderation; FAQ/locality/blog CRUD; logout; unauthorized/expired/suspended paths.
- [ ] Axe + keyboard/focus checks in light/dark/system, reduced motion, mobile filter/dialog/owner wizard.
- [ ] Widths: 320, 375, 768, 1024, 1440, 1920; 200% zoom and long content/error text.
- [ ] Capture production-browser evidence after deployment, including footer and lower sections; check console/runtime errors.
- [ ] Measure performance against baseline: public p75 targets LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 when field samples exist; label lab measurements accurately.
- [ ] Vercel React and current web interface guidelines review; repair actual findings.
- [ ] Update README, environment example, architecture, setup/bootstrap, migrations, tests, deployment, backups/rollback and operations runbook.
- [ ] Record phase commit SHA, Vercel deployment ID/URL, check results and outstanding business content.

Gate: no critical unresolved permission/data/auth defects; verified deployment; remaining limitations visible in HANDOFF.

## 8. Free-tier and release realities

Current published InsForge free limits: 500 MB database, 1 GB file storage, 5 GB bandwidth, 50,000 monthly active users; projects pause after **one week of inactivity**. Migration does not eliminate inactivity-related downtime. Track capacity, compress property imagery, bound reads, handle unavailable services, and document restore actions. [Current InsForge pricing](https://insforge.dev/pricing)

Authentication emails are supported by the platform; do not assume custom transactional marketing/enquiry email is included for free. Use in-app notifications for the present workflow until a separately approved delivery service is configured.

The us-east target has not been measured from Jaipur. Measure request latency from the actual audience before deciding whether a different region is necessary.

## 9. Git, deployment and handoff rules

- Keep each phase's changes scoped and reviewable; use `codex/` branches.
- Before commit: inspect diff, whitespace, secret patterns and ignored credentials; stage explicit paths.
- Keep one successful commit per coherent slice, with further commits when required; never squash unrelated user work.
- Push passing changes to GitHub; deploy a preview for visible implementation stages, then production only after their release gate.
- A documentation-only checkpoint does not require a new production deployment.
- Keep the exact release commit/deployment/alias in HANDOFF; rollback to a verified previous deployment and provider environment together when needed.
- Never write “complete” based only on a build, mocked integration test, availability metadata, or historical passing result.
