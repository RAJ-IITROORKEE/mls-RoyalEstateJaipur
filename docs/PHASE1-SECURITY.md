# Phase 1 — Security and package review

Reviewed 2026-10-03. Runtime provider remains Supabase. The approved InsForge migration is staged separately in PLAN.md.

## Shared mutation contract

All 36 mutation exports in 30 API route files require an exact configured origin, bounded input, valid dynamic UUIDs, private/no-store responses and safe exception handling. A source inventory regression test fails if a mutation bypasses this contract. The boundary supplements each handler's verified identity and exact domain authorization.

Origins come from the site and Vercel deployment environment. `x-forwarded-host` cannot authorize a request. Local loopback aliases are allowed only outside Vercel. Vercel overwrites `x-forwarded-for`; other hosting must explicitly opt into a trusted proxy. [Vercel request headers](https://vercel.com/docs/headers/request-headers)

## API inventory

Paths below omit the `/api` prefix. All rows inherit the shared mutation contract. Schema names refer to the existing feature schemas; file uploads additionally check size, count where applicable, extension, MIME and content signature. An omitted individual rate limit is recorded rather than implied.

| Boundary / methods | Identity and target permission | Validation / limiting / audit |
| --- | --- | --- |
| auth/sign-in POST | Provider-verified user; active Profile required | Credentials/redirect schemas; durable limit; provisioning/login timestamp |
| auth/sign-up POST | Public; ordinary user only | Signup schema; durable limit; no client role |
| auth/verify-signup POST | Provider OTP verification; active Profile | OTP schema; durable limit; idempotent Profile |
| auth/resend-signup POST | Public provider flow | Email schema; durable limit |
| auth/forgot-password POST | Public provider flow | Email schema; durable limit; generic response |
| auth/reset-password POST | Verified active session | Password schema; durable limit; ends session |
| auth/sign-out POST | Ends current provider session | Empty body accepted; same-origin required |
| auth/google GET | Initiates PKCE; exact callback origin | Safe internal redirect; durable limit; callback checks active Profile |
| account/profile PATCH | Own verified Profile | Profile schema; allowed fields only |
| account/profile/avatar POST | Own verified Profile | File checks; durable upload limit |
| submissions POST | Verified owner | Draft schema; durable limit; owner ID from server |
| submissions/[id]/media POST/PATCH/DELETE | Own editable submission | Metadata schemas + media UUID; POST durable limit; private bucket |
| submissions/[id]/documents POST | Own permitted submission | Document schema/file signature; durable limit; private bucket |
| properties/[id]/media POST/PATCH/DELETE | Property owner or administrator; editable state | Media schemas + UUID; POST durable limit; public image bucket |
| enquiries POST | Public; published property context only | Consent, honeypot, enquiry schema; durable limit; atomic five-minute deduplication |
| admin/properties/[id] PATCH | Active ADMIN/SUPER_ADMIN | Inventory schema; audited domain transition |
| admin/submissions/[id] POST | Review permission and target state | Moderation schema; history, notification and audit |
| admin/submissions/[id]/archive POST | Staff archive permission | Archive reason/schema; audit; non-destructive archive |
| admin/enquiries/[id] POST | Staff enquiry permission | Operation schema; activity/audit/notification |
| admin/enquiries/[id]/assignment POST | Staff enquiry permission; active staff assignee | Assignment schema; activity/audit/notification |
| admin/notifications/[id] POST | Own notification recipient | Valid UUID; recipient-scoped update |
| admin/users POST | Active SUPER_ADMIN; rechecked after transaction lock | Access schema; self/last-admin protection; audit |
| admin/settings POST | Active SUPER_ADMIN | Allowlisted setting schema; audit; targeted invalidation |
| admin/audit POST | Active SUPER_ADMIN | Reason/schema; archive marker preserves immutable source audit |
| admin/blog POST; admin/blog/[id] PATCH | REVIEWER/ADMIN/SUPER_ADMIN per existing blog policy | Blog/status/structured-content schemas; audited save/publish/archive |
| admin/blog/assets POST | Existing blog staff permission | Metadata/file signature; durable limit; private/public separation |
| admin/faqs POST; admin/faqs/[id] PATCH/DELETE | ADMIN/SUPER_ADMIN; active actor rechecked in transaction | FAQ schema / UUID; audit and public cache invalidation |
| admin/localities POST; admin/localities/[id] PATCH/DELETE | ADMIN/SUPER_ADMIN; active actor rechecked in transaction | Locality schema / UUID; referenced-delete protection; audit/invalidation |

Private media read handlers independently resolve identity and ownership. No new public GET exposes drafts, owner contact details or audit metadata. The public journal uses a selected published projection, stable ordering and 12-row pagination; personalized data is not cached publicly.

## Dependency decisions

- Node 24 and its types are aligned with Vercel and CI. Keep Next 16.3.6/React 19.2.4/Prisma 6.19.3 together.
- Compatible leaf updates repair `brace-expansion`, `js-yaml` and `undici`. Existing `nanoid` override remains.
- Scope `deepmerge-ts` 8.0.0 to `@prisma/config`. Its documented breaking Map merge behavior does not apply to the trusted plain-object Prisma config usage inspected here. Generate, validation, all nine migrations and real transactions passed. [Release notes](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0)
- Production audit: zero findings. Full audit: five high nodes in the Next ESLint → fast-glob → micromatch → braces development chain. `braces` 3.0.3 is still the latest version with no patched release for [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). The issue consumes stack through malicious deeply nested glob patterns; lint currently uses developer-controlled fixed config, not HTTP input. This is a remaining development-tool risk, not a clean full audit. Review upstream before each release; never force Next's suggested incompatible downgrade or hide findings.
- Prettier is pinned and establishes the previously inconsistent owned-source formatting baseline. Third-party skills, private connection files and generated outputs are excluded.
- GitHub Actions are pinned by commit, with read-only contents permission and disposable Postgres. No production credentials are passed to PR CI.

## Integrity and availability

The additive `0009_durable_rate_limits` migration enables RLS and removes public/client grants on counters. Counters are atomically updated using the database clock and hash identifiers; expired rows are removed in bounded batches. An unavailable database cannot silently disable production limits.

Identical enquiries acquire a transaction-scoped advisory lock before checking/inserting. Six simultaneous real writes produced one enquiry. Eight concurrent limiter attempts admitted exactly three for a limit of three. These checks ran in an isolated random schema, which was removed afterwards. The dedicated enquiry transaction timeout is 25 seconds to cover lock contention; platform timeouts still require operational monitoring. [Postgres advisory locks](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS)

Supabase Proxy refresh propagates request cookies, response cookies and provider headers. It is not the role/ownership boundary. Suspended profiles cannot retain a newly created login session; provider/profile failures fail closed for protected actions. Google configuration remains unverified and is replaced only after Phase 5's real InsForge OAuth gate.

## Remaining phases

- Phase 4: broader per-actor staff mutation limits, all operational list pagination, upload count/concurrency/audit coverage, and real owner/admin CRUD tests. Staff schemas and permissions already exist; this phase does not claim every operational weakness is repaired.
- Phase 4/6: direct validated uploads for hosting request limits; durable media publication reconciliation/outbox and crash recovery.
- Phase 3/8: reviewed launch inventory, actual contact details, all SEO/theme/mobile flows.
- Phase 5–7: real OAuth, identity migration, grants/RLS on all SDK-exposed target tables, bucket copy/reconciliation and cutover. A disposable Prisma schema rehearsal is not the complete data migration.
