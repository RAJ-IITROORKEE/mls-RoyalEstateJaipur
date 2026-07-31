# AGENTS.md — Engineering Rules for the Real Estate Platform

These instructions apply to every agent and every file in this repository.

## 1. Operating contract

- Read this file and `DESIGN.md` completely before modifying code.
- Inspect existing code, scripts, package manager, git state, and repository-specific instructions first.
- Preserve unrelated work. Do not overwrite user changes or perform destructive git/file operations.
- Maintain a short execution plan for multi-phase work and update it as implementation progresses.
- Prefer a complete vertical slice over disconnected UI mocks.
- Do not call a feature complete until its authorization, validation, loading, empty, error, responsive, and test states exist.
- When a requirement is ambiguous but not blocking, choose the safest scalable default, record the assumption, and continue.
- Do not add payment behavior in this release.

## 2. Required skills and references

When the agent environment supports skills:

1. Discover and use `vercel-react-best-practices` while writing or reviewing React/Next.js code.
2. Discover and use `web-design-guidelines` before final UI/accessibility QA.
3. Use any repository-provided Next.js, Supabase, Prisma, testing, or deployment skill whose trigger clearly matches the task.
4. Read each selected skill fully and follow its linked instructions.

If these Vercel skills are not installed, state that briefly and use their official guidance as a manual checklist. Do not pause the build merely because an optional skill is unavailable.

Skills may be installed by the developer separately from `vercel-labs/agent-skills`; do not silently install global tools or mutate the developer’s agent configuration.

For unstable APIs and package behavior, use current primary sources only: official Next.js, React, Supabase, Prisma, shadcn/ui, Motion, Playwright, and Vercel documentation.

## 3. Source-of-truth hierarchy

Use this order when instructions conflict:

1. Latest explicit user instruction.
2. Security, privacy, and data-integrity requirements.
3. Existing repository and hosting instructions.
4. This `AGENTS.md`.
5. `DESIGN.md`.
6. `MASTER_BUILD_PROMPT.md`.
7. Existing implementation conventions.

Do not copy reference-site branding, text, layout, assets, or code. References are product-pattern inspiration only.

## 4. Technology decisions

- Next.js App Router and strict TypeScript.
- Supabase Auth is the single identity/session provider. Do not add Clerk, Better Auth, NextAuth/Auth.js, or custom password storage.
- Supabase Postgres is the database.
- Prisma owns application-domain tables in the public application schema.
- Supabase Storage owns uploaded property media and private documents.
- shadcn/ui is the accessible component foundation.
- Aceternity UI is an occasional decorative layer, not a second design system.
- Motion for React is allowed for purposeful animation.
- Prefer Server Components. Add `"use client"` only at the smallest interactive boundary.
- Prefer Server Actions for internal form mutations and Route Handlers for public API/webhook boundaries.
- Use Zod at every trust boundary.

Never replace this stack without documenting a concrete incompatibility and obtaining user approval when the change is material.

## 5. Repository shape

Use feature-oriented boundaries:

- `app/`: routes, layouts, metadata, route handlers, and thin page composition.
- `components/ui/`: reusable visual primitives only.
- `components/<domain>/`: composed presentation components.
- `features/<domain>/`: domain-specific actions, queries, schemas, permissions, and components.
- `lib/dal/`: server-only data access.
- `lib/auth/` and `lib/permissions/`: session resolution and authorization.
- `lib/supabase/`: browser/server/storage clients.
- `lib/db/`: Prisma singleton and database helpers.
- `prisma/`: schema, migrations, and seed.
- `tests/`: shared fixtures and end-to-end tests.

Avoid miscellaneous dumping grounds. A helper used by one feature belongs with that feature.

## 6. TypeScript and code quality

- Keep `strict` enabled.
- Do not use `any`; use `unknown` plus narrowing at untrusted boundaries.
- Avoid non-null assertions unless an invariant is both proven and commented.
- Prefer discriminated unions for action results and state-specific UI.
- Use explicit domain names: `PropertySubmission`, `PublishedProperty`, `EnquiryStatus`, not generic `item`, `data`, or `record`.
- Keep functions focused; extract business decisions into named domain functions.
- Use named exports except where Next.js requires a default export.
- Remove dead code, commented-out implementations, and unused dependencies.
- Comments explain why, constraints, or non-obvious invariants—not what straightforward code does.
- Formatting and lint rules apply to generated code too.

## 7. Server/client and performance rules

- Fetch on the server unless browser state or a browser-only API requires otherwise.
- Do not use `useEffect` for initial server data.
- Do not create sequential awaits for independent work; use safe concurrency.
- Avoid barrel imports that inflate client bundles.
- Dynamically load heavy interactive components such as a lightbox only when useful.
- Select only required database fields and include relations intentionally.
- Avoid N+1 database and storage queries.
- Paginate potentially unbounded collections.
- Cache only public, non-personalized reads. Tag cached property/locality queries and invalidate them after publication mutations.
- Never place session-specific, admin, draft, or PII responses in a public cache.
- Use `next/image` with dimensions/aspect ratio and meaningful `sizes`.
- Give `priority` only to the true above-the-fold LCP image.
- Do not animate layout-triggering properties when transform/opacity works.

## 8. Data and Prisma rules

- Store money exactly as integer minor units or Prisma `Decimal`; never as JavaScript floating point.
- Use UUIDs consistently for auth-linked identities.
- Add indexes for real query patterns: slug/status/published date, location and intent filters, owner submissions, moderation queue, enquiry status/assignee, notifications, and audit time/entity.
- Add unique constraints for slugs, human reference numbers, and one-to-one source relations where applicable.
- Keep `createdAt` and `updatedAt`; use explicit event timestamps such as `submittedAt`, `reviewedAt`, and `publishedAt`.
- Use database transactions for state transition + public record + notification + audit log when atomicity matters.
- Migrations must be checked in. Do not use schema push as the production migration strategy.
- Seed scripts must be idempotent and clearly distinguish demo content.
- Use a pooled Supabase connection at runtime and the documented direct connection for migration tooling.
- Never change or introspect Supabase-owned auth tables through destructive Prisma migrations.

## 9. Supabase Auth and storage

- Follow the current `@supabase/ssr` cookie pattern; do not use deprecated auth-helper packages.
- Create distinct browser and server clients.
- Server code must verify the current user; do not rely only on middleware/proxy or layout redirects.
- Keep the service-role key server-only and out of `NEXT_PUBLIC_*`.
- Mirror the auth UUID to a public `Profile` record through an idempotent, documented process.
- Staff roles live in protected application data and are checked server-side.
- Public property images and private owner documents use separate buckets or strictly separate policies.
- Randomize storage keys; validate file count, size, MIME type, extension, and ownership.
- Store paths/metadata in the database, not long-lived signed URLs.
- Generate short-lived signed URLs for authorized private document review.
- Delete/reconcile orphan uploads safely; never delete storage objects through unresolved wildcards.

## 10. Security and authorization

Treat every Server Action and Route Handler as directly callable.

For every mutation:

1. Resolve and verify the authenticated identity.
2. Check the exact permission for the target record.
3. Parse input with Zod.
4. Explicitly map allowed fields.
5. Execute the domain transition.
6. Write an audit event for privileged changes.
7. Revalidate only affected routes/tags.
8. Return a typed result without sensitive internals.

Additional rules:

- Never trust a role, owner ID, price, status, storage path, redirect, or sort column from the client.
- Never expose private documents, owner PII, internal notes, audit metadata, or unpublished records through public queries.
- Use safe redirect allowlists to prevent open redirects.
- Sanitize rich text or prefer plain text/structured fields.
- Apply rate limits to contact, enquiry, submission, upload-signing, and auth-adjacent actions.
- Add spam honeypots and server-side duplicate protection.
- Do not log secrets, tokens, passwords, document URLs, or complete sensitive form bodies.
- Use generic client errors and structured server logs with request IDs.
- Audit logs are append-only from the product UI.
- Prevent privilege escalation and protect the last active super admin.

## 11. Domain workflow rules

- Submission moderation and legal/document verification are different concepts.
- Only `PUBLISHED` properties are publicly queryable.
- An approved submission may create/update a property draft; publish state is explicit.
- State transitions must go through tested domain functions, not arbitrary Prisma updates.
- Preserve moderation history and reasons.
- Owners can access only their own drafts/submissions.
- Reviewers can access assigned/all review queues according to policy but cannot manage super admins.
- “Request booking” creates an enquiry/site-visit request; it never confirms availability or reserves a property.
- WhatsApp URLs contain only public listing context and safely encoded text.
- Marking a property sold/rented/leased must remove it from default availability results while preserving its page/history according to SEO policy.

## 12. Forms

- Every field has a visible label. Placeholder text is not a label.
- Use correct `name`, input type, `autocomplete`, input mode, and mobile keyboard hints.
- Validate at step boundaries for the owner wizard and validate the complete payload on final submit.
- Display field errors next to fields and an accessible error summary for long forms.
- Preserve valid input after failed submission.
- Disable duplicate submission while pending, but do not use disabled buttons as the only server-side guard.
- Confirm destructive exits when unsaved changes exist.
- Autosave should debounce, show saved/saving/error state, and never race older writes over newer data.
- Conditional fields must be removed from validation/payload when not applicable.
- Consent checkboxes cannot be preselected.

## 13. UI and accessibility

- Follow `DESIGN.md` tokens and component rules.
- Support light, dark, and system mode without hydration mismatch.
- Use semantic HTML before ARIA.
- All functionality must work with keyboard only.
- Use visible `:focus-visible` styles.
- Dialogs/drawers trap focus and restore it on close.
- Icon-only controls require accessible names and tooltips where helpful.
- Touch targets should be at least 44×44 px when practical.
- Announce async form and status updates to assistive technology.
- Honor `prefers-reduced-motion` and provide reduced/zero-motion equivalents.
- Never convey status only through color.
- Do not use hover-only disclosure for essential actions.
- Test representative pages at 320, 375, 768, 1024, 1440, and wide desktop widths.

## 14. Component policy

- Build with shadcn primitives and shared project components before adding a dependency.
- Use Aceternity code only after reviewing it for accessibility, theme tokens, bundle impact, and responsiveness.
- Never paste an Aceternity example unchanged into production; adapt it to project tokens and semantics.
- Prefer composition to giant variant-heavy components.
- Do not create a generic wrapper component unless it removes real repetition.
- Use Lucide icons consistently; do not mix icon families without a reason.
- Tables must degrade into usable mobile cards/rows or controlled horizontal layouts.

## 15. Animation policy

- Animation must clarify hierarchy, state, or causality.
- Prefer CSS for simple hover/focus transitions.
- Use Motion for enter/exit, layout changes, drawers, gallery transitions, and orchestrated section reveals.
- Use transform and opacity; avoid animating width, height, top, or left where possible.
- Default durations: 120–180 ms for micro-interactions, 200–320 ms for panels, up to 500 ms for a one-time hero reveal.
- Avoid continuous motion, cursor followers, scroll hijacking, heavy parallax, and staggered animation on large lists.
- Under reduced motion, eliminate parallax and movement; retain instant or short opacity feedback.

## 16. Content and SEO

- Write direct, trustworthy copy. Do not invent awards, clients, property counts, legal verification, prices, addresses, testimonials, or investment returns.
- Keep all business identity and contact data centralized.
- Property titles describe type + intent + locality; do not keyword-stuff.
- Public pages need unique metadata, canonical URLs, and social previews.
- Admin, auth, account, preview, draft, and filtered duplicate pages require correct noindex/canonical handling.
- Structured data must reflect actual visible data.
- Use descriptive image alt text; decorative imagery gets empty alt text.
- Format INR and Indian numbering correctly while keeping data currency-aware.

## 17. Error, loading, and feedback policy

- Use route-level loading/error boundaries for meaningful segments.
- Prefer skeletons that match final geometry and avoid layout shift.
- Empty states explain what happened and offer the next valid action.
- Error messages tell the user what they can do next.
- Toasts are for transient confirmation; persistent or field-specific problems stay inline.
- Never display raw Prisma, Supabase, SQL, stack, or validation internals to users.

## 18. Testing and verification

For each completed feature:

- Add or update tests for domain logic and permissions.
- Test the unauthorized path, not only the happy path.
- Verify responsive behavior and both themes.
- Verify keyboard and focus behavior.
- Run the narrowest relevant checks during iteration.

Before final handoff, run:

1. Formatter/check
2. Lint
3. Typecheck
4. Unit/component tests
5. Production database migration validation against a safe test database when available
6. Production build
7. Essential Playwright flows
8. Vercel React best-practices review
9. Vercel web-design-guidelines review

Do not hide failures with skipped tests, broad ignores, `any`, unsafe casts, or lint suppression. If an external credential blocks a check, distinguish verified work from unverified external configuration.

## 19. Environment and documentation

Maintain `.env.example` with descriptions and safe placeholders for:

- Supabase public URL and publishable/anon key
- Server-only service role key only if required
- Pooled runtime database URL
- Direct migration database URL
- Site URL
- Optional OAuth configuration
- Optional rate-limit/storage/analytics integrations

Never commit `.env*` secrets.

`README.md` must include:

- prerequisites and exact install/run commands
- Supabase project, auth URL, storage bucket/policy, and database setup
- Prisma migration/generate/seed commands
- safe first-super-admin bootstrap
- test commands
- Vercel deployment and environment configuration
- backup/rollback notes
- architecture and authorization summary

## 20. Handoff

End each major implementation with:

- Outcome and user-visible behavior
- Important architectural or security decisions
- Files/modules changed
- Commands/checks run with pass/fail
- Remaining credentials or content the user must supply
- Any consciously deferred work

Never claim deployment, notification delivery, legal compliance, tests, or integrations succeeded unless they were actually verified.

