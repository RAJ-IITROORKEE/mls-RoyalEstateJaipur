# RoyaleStateJaipur Upgrade Plan

## Objective

Deliver the requested owner-media, moderation, admin operations, and blog-authoring upgrades as complete vertical slices while preserving Supabase Auth, Prisma/Postgres ownership, Supabase Storage separation, the existing editorial visual system, and server-side authorization.

This document is the handoff plan for implementation. No reference-project branding, copy, assets, or source code will be copied. The Anatolearn project is used only for editor and workflow patterns.

## Execution Status

Implemented: database foundation through migration 0004, private owner preview media with a one-image minimum and five-image maximum, start-review moderation, approval/archive controls, admin dashboard/users/audit upgrades, a complete property inventory workspace, public Blogs navigation, a managed rich blog editor with cover/inline media lifecycle, and Storage bucket configuration.

Verified: Prisma deployment, database query, Storage bucket visibility, typecheck, lint, 39 unit tests, 6 Playwright tests, and production build.

Known follow-ups: a durable outbox/reconciliation worker for process crashes during Storage transitions, a fully compensating approve-and-publish submission-media workflow, and broader owner/admin/blog mutation E2E coverage.

## Confirmed Product Decisions

- Blog creation, editing, review, and publication are restricted to active staff profiles (`REVIEWER`, `ADMIN`, and `SUPER_ADMIN`). Public visitors can read only published posts.
- The Users table “Delete” action means audited account suspension. It must not physically delete the Supabase Auth identity, profile, submissions, enquiries, properties, or audit history.
- Audit “Delete” means Super-Admin-only archival from the default view. The original audit record remains immutable and a separate archival record records who archived it, when, and why.
- Only an active `SUPER_ADMIN` can change user roles, assign `ADMIN`, suspend users, or reactivate users.
- Submitted property records are not physically deleted. Admin removal uses the existing archival state so moderation history and owner references remain intact.
- Approval is an explicit workflow. `SUBMITTED` and `RESUBMITTED` records must enter `UNDER_REVIEW` before a final moderation decision.
- “Approve and publish” must not report success unless the property record and public media are ready for public display.
- Owner preview photos remain private before publication. Published listing photos use the public `property-media` bucket.

## Confirmed Root Causes and Current Gaps

- Approval currently fails because the UI exposes approval for `SUBMITTED` and `RESUBMITTED`, while the domain state machine only permits approval from `UNDER_REVIEW`.
- No code currently performs the required start-review transition.
- `APPROVE` creates a draft property, but no complete property lifecycle action exists to publish that draft later.
- Submission media is available only after a draft already has an ID and is rendered below the wizard, so first-time users do not experience it as an actual wizard step.
- Media transfer after publication currently catches Storage failures silently, allowing a published property to exist without the expected images.
- Admin users and submissions are limited list/card views rather than URL-backed, paginated data tables.
- Audit records are immutable, but there is no safe archival overlay for the requested Super Admin action.
- The dashboard has no total-user metric and fetches five recent audit events instead of the requested three.
- Blog database, allowlisted rich editor, managed image insertion, cover workflow, compensated private/public asset transfer, admin management surface, and public routes are implemented.

## Phase 1: Database and Domain Foundation

### Prisma changes

Create a checked-in migration after updating `prisma/schema.prisma`.

1. Extend `PropertySubmissionMedia`:
   - Add `isCover Boolean @default(false)`.
   - Keep deterministic `sortOrder`.
   - Add or retain an index supporting `submissionId + sortOrder`.

2. Add immutable audit archival overlay:
   - `AuditLogArchive`
   - `id`, unique `auditLogId`, `archivedById`, `reason`, `archivedAt`
   - Relations to `AuditLog` and `Profile`
   - Index by `archivedAt` and `archivedById`
   - Do not add `deletedAt` to `AuditLog` and do not update/delete audit rows.

3. Add blog lifecycle models:
   - `BlogStatus`: `DRAFT`, `PUBLISHED`, `ARCHIVED`
   - `BlogPost`: author, title, slug, excerpt, versioned JSON content, status, reading minutes, SEO title/description, cover asset, optimistic version, `publishedAt`, timestamps
   - Unique slug and indexes for status/published date and author/update date
   - `BlogAsset`: post relation when attached, uploader, private/public storage paths as needed, filename, MIME, size, width, height, alt text, caption, sort order, timestamps
   - Asset records must store paths, never long-lived signed URLs.

4. Add profile/blog relations and audit archival relations without modifying Supabase-owned auth tables.

### Supabase Storage changes

Extend `supabase/migrations/0001_storage_and_rls.sql` idempotently:

- Retain private `property-submission-media` and public `property-media`.
- Add private `blog-draft-media` for unpublished uploads.
- Add public `blog-media` for published blog assets.
- Add service-role-only write/manage policies.
- Add public read only for `blog-media` and `property-media`.
- Keep private documents and draft media inaccessible through public URLs.

### Domain schemas and permissions

- Add `START_REVIEW` to the moderation command schema, not to arbitrary client-controlled status updates.
- Add explicit property publication transition functions.
- Add blog Zod schemas for metadata, versioned rich content, assets, save, publish, archive, and query filters.
- Add `canManageBlogs(role)` for `ADMIN` and `SUPER_ADMIN`.
- Reject `SUSPENDED` profiles centrally in `getCurrentUserAccess()` and retain mutation-level role checks.

### Tests first

- Migration/schema validation.
- Submission start-review and final-decision transitions.
- Suspended profile access denial.
- Blog status transitions and publication prerequisites.
- Audit archive permission and immutability.
- Last-active-super-admin protection.

## Phase 2: Owner Submission Photo Experience

### Wizard integration

Refactor `components/forms/owner-submission-wizard.tsx` and `app/account/submissions/new/page.tsx` so photos are a visible wizard step immediately after Details.

Target steps:

1. Purpose
2. Location
3. Details
4. Photos
5. Price
6. Review

When a new user reaches Photos:

- Validate the completed earlier steps.
- Save the draft once to obtain the server-generated submission ID.
- Keep the user on the Photos step after creation.
- Show an accessible retry state if draft creation fails.

### Photo UI

Upgrade `components/forms/owner-submission-media.tsx`:

- Large drag-and-drop area plus conventional file picker.
- JPG/PNG guidance and 10 MB per-image limit shown before selection.
- Minimum one photo before final submission; maximum five.
- Responsive 4:3 preview tiles.
- Per-image upload progress, success, and retry state.
- Display filename, file size, width, and height.
- Required descriptive alt text per image.
- Select one cover image.
- Reorder using accessible move-left/move-right controls; drag reorder can be added only if keyboard alternatives remain.
- Remove with confirmation and storage cleanup.
- “Upload more” remains visible until five images are present.
- Clearly label photos as private until the listing is explicitly published.

### APIs

Extend `app/api/submissions/[id]/media/route.ts`:

- Keep verified owner and editable-status checks.
- Add `PATCH` for alt text, cover, and order.
- Add `DELETE` for one owned media record with exact-path storage cleanup.
- Normalize ordering server-side.
- Enforce exactly one cover when media exists.
- Continue returning short-lived signed preview URLs without storage paths.
- Rate-limit write operations and return generic client errors.

Extend final submission handling:

- On `SUBMIT`, transactionally verify the owner has one to five valid media records.
- Prevent submission when uploads are pending or metadata is incomplete.
- Do not trust a client-supplied media count.

### Public result

- Preserve every approved image in `PropertyMedia` with cover/order/alt/dimensions.
- Catalogue cards use the cover image with a graceful fallback.
- Property details show all images in order with image count and responsive gallery behavior.

### Acceptance checks

- New drafts visibly include the Photos step.
- One to five images can be uploaded, previewed, described, assigned as cover, removed, and submitted.
- A sixth image is rejected server-side.
- Other users cannot list, update, sign, or delete the media.
- Public pages never expose private submission bucket paths.

## Phase 3: Moderation and Publication Repair

### Start review

Update:

- `features/submissions/schemas.ts`
- `features/submissions/transitions.ts`
- `features/submissions/moderation.ts`
- `app/api/admin/submissions/[id]/route.ts`
- `components/admin/submission-review-actions.tsx`

Behavior:

- `SUBMITTED`/`RESUBMITTED` show a “Start review” action.
- Starting review assigns the active reviewer, transitions to `UNDER_REVIEW`, writes audit history, and notifies the owner if appropriate.
- Approve/request changes/reject controls render only during `UNDER_REVIEW`.
- Route handlers return stable generic error codes; raw Prisma/Supabase messages remain server-side.

### Reliable approve and publish

- Validate the complete stored submission and the four-to-five-photo requirement.
- Prepare/copy all private submission photos to randomized public `property-media` paths before committing publication.
- If any copy fails, clean created public objects and leave the submission/property state unchanged.
- In one Prisma transaction, upsert the property, create ordered `PropertyMedia`, transition the submission, notify the owner, and write audit history.
- After DB success, remove private source objects and records; failed source cleanup is logged for reconciliation but does not unpublish a valid listing.
- Make “Approve and publish” the clear primary approval action so the requested approved listing appears publicly.
- Retain “Approve as draft” only with a complete, separately tested property publish action in Admin Properties.
- Invalidate only affected public property routes/tags.

### Submission archival

- Replace destructive “Delete” with “Archive submission.”
- Require confirmation and a reason.
- Permit only valid terminal/archive transitions.
- Write an audit record and retain owner/property relations.

### Acceptance checks

- Existing `SUBMITTED` records no longer fail when staff follow the displayed workflow.
- Approval with valid media creates one publicly queryable `PUBLISHED` property.
- Failed Storage copy does not create a partially published listing.
- Owner sees the resulting status and notification.

## Phase 4: Admin Shell and Dashboard

### Sidebar

Update `components/admin/admin-shell.tsx`:

- Rename `OPS DESK` to `ADMIN DASHBOARD`.
- Place Users directly below Overview.
- Proposed order: Overview, Users, Submissions, Properties, Enquiries, Blogs, Notifications, Audit history, Settings.
- Add route-aware active styling and `aria-current="page"`.
- Pass the verified staff role from `app/admin/layout.tsx` and hide links the role cannot use.
- Keep desktop collapse and mobile drawer behavior.

### Dashboard metrics

Update `features/admin/queries.ts` and `app/admin/page.tsx`:

- Add `totalUsers` count.
- Keep pending reviews, published listings, new enquiries, and unread notifications.
- Use a responsive five-card layout without shrinking critical text.
- Scope unread notifications to the current staff recipient where appropriate.
- Fetch only three latest non-archived audit events.
- Add “Show all activity” below the queue, linking to `/admin/audit`.
- Recent items link to their entity/detail route when safe.

### Acceptance checks

- Sidebar labels/order match the request on desktop and mobile.
- Total users reflects Profile rows.
- Dashboard queue displays at most three records and a working Show all link.

## Phase 5: Users Data Table and Role Management

### Query and pagination

Refactor `features/admin/users.ts`:

- URL-backed `q`, `page`, `pageSize`, `role`, and `status` filters.
- Default page size 10; allow bounded 10/25/50.
- Run filtered count and page query concurrently.
- Select only ID, display name, email, avatar path, role, status, created date, and last login.
- Generate avatar public URLs server-side.

### Table UX

Refactor `app/admin/users/page.tsx` into a responsive data table:

- Avatar/fallback initials.
- Name and email.
- Role badge.
- Account status badge.
- Joined date.
- Three-dot Actions menu.
- Search input and role/status filters.
- Result count and Previous/Next pagination with preserved query parameters.
- Mobile cards retain all actions and labels.
- Loading, empty, no-match, database error, and unauthorized states.

### Actions

Replace the always-visible controls with an accessible menu/dialog:

- “Update role” opens a confirmation dialog.
- “Suspend account” replaces destructive deletion.
- Suspended users get “Reactivate account.”
- Only `SUPER_ADMIN` sees mutation actions.
- `ADMIN` can view/search but cannot modify roles.
- Protect self-modification and the final active Super Admin.
- Role/status changes remain transactional and audited.
- Assigning `ADMIN` immediately grants admin access after the target’s next verified request/session check.

### API

- Keep/update `app/api/admin/users/route.ts` or split explicit role/status endpoints.
- Validate UUID, target role/status, and action with Zod.
- Resolve actor server-side; never trust an actor/role from the client.
- Return typed, generic results and revalidate `/admin/users` and `/admin`.

### Acceptance checks

- Search and pagination are URL-backed and work together.
- Super Admin can promote an active user to Admin.
- Admin cannot promote anyone or call the API directly.
- Suspension blocks account/admin access without deleting history.

## Phase 6: Submissions Data Table and Detail Review

### Queue table

Refactor `features/admin/submission-queries.ts` and `app/admin/submissions/page.tsx`:

- URL-backed search, status, page, and page-size filters.
- Columns: preview, reference/property title, owner, category/intent, status badge, submitted/updated date, actions.
- Preview uses a short-lived signed URL for the selected cover/first private image.
- Status badges include visible text, not color alone.
- Three-dot Actions: View and Archive.
- Default queue prioritizes `SUBMITTED`, `RESUBMITTED`, then oldest `UNDER_REVIEW`.
- Mobile uses information-complete cards.

### Full detail

Upgrade `app/admin/submissions/[id]/page.tsx`:

- Two-pane desktop layout and stacked mobile layout.
- Full owner-entered property details grouped by purpose, location, details, price, amenities, contact, and consent.
- Editorial media gallery for all private signed previews.
- Private document section visibly marked private.
- Reference, owner, submitted time, version, reviewer, current status, and owner-visible reason.
- Moderation rail with Start review and valid status actions only.
- Never render storage paths, private document URLs, internal audit metadata, or unrestricted owner PII publicly.

### Acceptance checks

- Queue looks and behaves as a real paginated operations table.
- View shows every relevant submitted field and all preview images.
- Staff cannot force invalid status transitions.
- Approved-and-published records appear in `/properties`.

## Phase 7: Safe Audit Archival

### Query/UI

Update `features/admin/audit-queries.ts` and `app/admin/audit/page.tsx`:

- URL-backed search, actor, action/entity, archive state, page, and page-size filters.
- Default query excludes records with an `AuditLogArchive` overlay.
- Show archived records only to `SUPER_ADMIN` through an explicit filter.
- Add a three-dot menu for Super Admin with “Archive from view.”
- Require confirmation and a reason.
- Display archival actor/time in the archived view.

### Mutation

- Add Super-Admin-only archive API/action.
- Never update or delete the original `AuditLog` row.
- Create the archive overlay and a new `AUDIT_ENTRY_ARCHIVED` audit event transactionally.
- Prevent duplicate archival.

### Acceptance checks

- Admin/Reviewer cannot see or call the archive action.
- Super Admin can remove a record from the default view.
- The original record remains queryable in the archived view and database.

## Phase 8: Public Navigation and Blog Platform

### Navigation cleanup

Update public header/footer/home/dashboard links:

- Primary center navigation: Properties, Blogs, About, Contact.
- Remove List property and Services from center navigation.
- Remove the `/services` and `/list-property` pages after updating every internal link.
- Owner listing CTAs link directly to `/account/submissions/new` and preserve sign-in redirect behavior.
- Add `/blogs` to desktop and mobile navigation.

### Blog routes

Public:

- `/blogs`: published-only, paginated editorial index with search/category/tag support if included in schema.
- `/blogs/[slug]`: server-rendered published post, metadata, canonical URL, Open Graph data, reading time, author display, published date, cover image, and sanitized rich content.
- Draft/admin/preview URLs use noindex.

Admin:

- `/admin/blogs`: searchable, paginated status table with title, author, status, updated/published date, and actions.
- `/admin/blogs/new`: new draft editor.
- `/admin/blogs/[id]`: editor, preview, lifecycle actions, and audit context.

### Rich editor pattern

Adapt the reference project’s product patterns using an original RoyaleStateJaipur implementation:

- Install only required Tiptap packages after dependency review.
- Single continuous editor surface.
- Toolbar: paragraph, H2/H3/H4, bold, italic, underline, strike, safe link, bullet/ordered list, quote/callout, horizontal rule, alignment, allowlisted text/highlight colors, undo/redo, managed image insertion, clear formatting.
- Exclude H1, arbitrary HTML, arbitrary embeds, scriptable links, code execution, and external hotlinked images.
- Sticky toolbar with horizontal scrolling on narrow screens.
- Metadata fields for title, slug, excerpt, reading time, cover image, SEO title, and SEO description.
- Save draft separate from Publish.
- Dirty-state/navigation guard.
- Optimistic version check so stale saves cannot overwrite newer work.
- Accessible preview dialog rendering current unsaved content and pending local images.
- Shared rich-content renderer for preview and public pages to prevent visual drift.

### Versioned rich content

Store a strict allowlisted JSON AST:

- Versioned envelope, for example `{ version: 1, document: ... }`.
- Server validates node count, nesting depth, total text, heading levels, links, marks, colors, image references, alt text, and captions.
- Unknown nodes/attributes are rejected.
- Publication requires non-empty content and valid attached media.
- Never accept raw HTML from the client.

### Blog media

- Private draft uploads with randomized paths.
- JPG/PNG/WebP validation by extension, declared MIME, decoded image content, dimensions, pixel count, and size.
- Alt text required for meaningful images.
- Preview uses short-lived signed URLs/local object URLs.
- Publish copies referenced media to public `blog-media` before committing `PUBLISHED` status.
- Orphan/pending media reconciliation and cleanup.

### Blog APIs and authorization

- `POST /api/admin/blogs`: create draft.
- `PATCH /api/admin/blogs/[id]`: save metadata/content with version check.
- `POST /api/admin/blogs/[id]/publish`: validate and publish.
- `POST /api/admin/blogs/[id]/archive`: archive.
- Blog media upload/update/delete endpoints.
- Every mutation verifies active session, `ADMIN`/`SUPER_ADMIN`, Zod input, exact record ownership/permission, explicit fields, audit event, and targeted revalidation.

### Acceptance checks

- Admin/Super Admin can create, preview, save, publish, and archive blogs.
- Reviewer/User cannot call blog mutation APIs.
- Only published posts appear publicly.
- Public rendering contains no unsafe HTML/scripts and works in both themes/mobile.
- Blog publication and media transfer are recoverable and audited.

## Phase 9: Verification and Handoff

### Automated tests

Unit/domain:

- Submission photo count, ordering, cover, owner permissions.
- Moderation start-review and approve/publish transitions.
- Storage-copy failure compensation.
- User role/suspension/last-super-admin authorization.
- Audit archive overlay permissions and immutability.
- Blog AST validation, safe links, lifecycle, version conflicts, and publication prerequisites.

Integration/API:

- Unauthorized and suspended mutation paths.
- Super Admin promotion to Admin.
- Submission queue/detail/approval and public visibility.
- Blog create/save/publish/public visibility.
- Private media never exposed through public queries.

Playwright:

- Owner creates draft, uploads four photos, submits, and sees status.
- Admin starts review and approves/publishes.
- Published listing and all photos appear publicly.
- Super Admin searches/paginates users and promotes a user.
- Audit archive is Super-Admin-only.
- Admin creates, previews, saves, and publishes a blog; public blog is readable.
- Keyboard operation for menus, dialogs, editor toolbar, tables, and mobile navigation.

### Required final commands

1. Formatter/check
2. `npm run lint`
3. `npm run typecheck`
4. `npm test -- --run`
5. `npm run prisma:generate`
6. `npm run prisma:validate`
7. `npm run prisma:deploy` against the configured safe Supabase project
8. `npm run supabase:configure`
9. `npm run supabase:check-storage`
10. `npm run db:check`
11. `npm run test:e2e`
12. `npm run build`

### Manual QA matrix

- Widths: 320, 375, 768, 1024, 1440, and wide desktop.
- Light, dark, and system themes.
- Keyboard-only operation and visible focus.
- Dialog focus trapping/restoration.
- 200% zoom.
- Reduced motion.
- Empty, loading, no-match, API error, and disconnected states.
- No owner PII/private document/media paths in public responses.

## Suggested Implementation Order for a Lighter Model

1. Add tests for Phase 1 domain decisions.
2. Implement and deploy Prisma/Storage migration.
3. Complete owner media UX and APIs.
4. Repair moderation and publication atomically.
5. Upgrade shell/dashboard.
6. Build users table and role/suspension actions.
7. Build submissions table/detail.
8. Add audit archival overlay.
9. Add blog schema/storage/domain APIs.
10. Build blog admin editor and public renderer.
11. Run narrow checks after each phase, then the complete Phase 9 gate.

Do not mark a phase complete from UI appearance alone. Authorization, validation, responsive states, storage/database behavior, audit behavior, and tests are part of each phase’s definition of done.
