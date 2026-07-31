# DESIGN.md — Premium Real Estate Visual and UX System

## 1. Design direction

Create an original real estate experience that feels like a trusted boutique advisory firm combined with a modern property marketplace.

The visual character is:

- Editorial, calm, premium, and trustworthy
- Image-led but information-dense where decisions require detail
- Warm and architectural rather than cold corporate SaaS
- Modern Indian-market aware without using visual clichés
- Equally intentional in light and dark modes

It must not look like:

- A clone of either reference website
- A generic admin template
- A crypto/AI landing page
- A glassmorphism demo
- A page made from unrelated animated component examples

## 2. Core visual concept

Use **architectural framing** as the unifying idea:

- Strong vertical and horizontal alignment
- Fine keylines that resemble floor-plan structure
- Generous image windows with consistent aspect ratios
- Layered but restrained panels
- An editorial serif for high-impact property/marketing headings paired with a highly legible sans-serif for UI and body text

One premium accent color signals important actions and selected states. A muted warm metallic accent may support small labels and editorial details; it must not dominate buttons or reduce contrast.

## 3. Color system

Implement colors as semantic CSS variables using OKLCH where supported by the project setup. Never hard-code arbitrary colors throughout components.

### Light theme

| Token | Intent | Suggested visual |
| --- | --- | --- |
| `--background` | Main canvas | Warm ivory, not pure white |
| `--foreground` | Primary text | Deep charcoal |
| `--card` | Cards/surfaces | Soft white |
| `--muted` | Quiet surfaces | Warm light stone |
| `--muted-foreground` | Secondary text | Medium neutral |
| `--border` | Dividers | Low-contrast warm grey |
| `--primary` | Main CTA/selected | Deep forest or architectural teal |
| `--primary-foreground` | Text on primary | Near white |
| `--accent` | Editorial highlight | Restrained brass/sand |
| `--destructive` | Dangerous action | Accessible deep red |

### Dark theme

| Token | Intent | Suggested visual |
| --- | --- | --- |
| `--background` | Main canvas | Near-black graphite with a warm/green undertone |
| `--foreground` | Primary text | Warm off-white |
| `--card` | Cards/surfaces | Elevated charcoal |
| `--muted` | Quiet surfaces | Soft graphite |
| `--muted-foreground` | Secondary text | Light neutral grey |
| `--border` | Dividers | Visible but quiet graphite line |
| `--primary` | Main CTA/selected | Brighter accessible jade/teal |
| `--primary-foreground` | Text on primary | Very dark graphite |
| `--accent` | Editorial highlight | Muted warm gold |
| `--destructive` | Dangerous action | Accessible coral-red |

Rules:

- Minimum WCAG AA contrast for text and essential UI.
- Avoid pure `#000` and large fields of pure `#fff`.
- Gradients are rare, subtle, and derived from tokens.
- Property status colors require an icon or text label in addition to color.
- Data visualization palettes must work in both themes and remain distinguishable.

## 4. Typography

Use locally optimized `next/font` fonts with no layout shift.

Suggested pairing:

- Display/editorial: `Cormorant Garamond`, `DM Serif Display`, or a similarly refined serif.
- Interface/body: `Manrope`, `Geist`, or `Inter`.

Choose one pairing and use it consistently.

Type scale:

- Hero display: responsive `clamp`, visually strong but no more than about 72 px on common desktop widths.
- Page title: 40–56 px desktop, 32–40 px mobile.
- Section title: 30–44 px desktop, 26–34 px mobile.
- Card title: 18–24 px.
- Body: 16–18 px marketing, 14–16 px dense UI.
- Labels/captions: 12–14 px; never below 12 px for essential content.

Rules:

- Keep body line length around 60–75 characters.
- Use sentence case for UI labels.
- Use tabular numerals for prices, metrics, IDs, and admin tables.
- Use the serif for marketing/property storytelling, not form fields, tables, or long admin copy.
- Do not render paragraphs in uppercase. Use modest tracking only for short eyebrow labels.

## 5. Spacing, grid, and shape

- Base spacing unit: 4 px.
- Common rhythm: 8, 12, 16, 24, 32, 48, 64, 96.
- Public content max width: approximately 1280–1360 px with responsive gutters.
- Reading content max width: approximately 720–800 px.
- Admin content uses a fluid container with controlled max widths for forms.
- Desktop public grid: 12 columns.
- Tablet: 8 columns.
- Mobile: 4 columns.

Radii:

- Inputs/buttons: 10–12 px.
- Cards: 16–20 px.
- Large media frames/hero panels: 24–32 px.
- Pills only for tags, filters, and compact statuses.
- Do not turn every rectangle into a pill.

Shadows:

- Prefer borders and tonal elevation.
- Use a soft shadow only for floating menus, dialogs, sticky enquiry cards, and lifted featured cards.
- Dark mode elevation comes from tone + border, not black shadows.

## 6. Public navigation

Desktop header:

- Logo/wordmark left.
- Primary links: Properties, List Property, Services, About, Contact.
- Compact theme control.
- Account/sign-in action.
- One visually clear CTA: “List your property”.

Mobile:

- Logo, theme, and menu trigger in a compact top bar.
- Full-height or large drawer with clear focus handling.
- Primary CTA remains obvious without crowding.
- Do not hide contact access behind several layers.

Header behavior:

- Transparent/overlay only when hero contrast is guaranteed.
- On scroll, use a solid tokenized surface with subtle border/backdrop.
- Avoid excessive shrinking or animated logo transformations.

## 7. Homepage composition

### Hero

- Use one excellent architectural/property image or restrained collage.
- Place value proposition and search where both remain readable.
- Search has Buy/Rent/Lease intent tabs and high-value fields only.
- Primary CTA: explore properties.
- Secondary CTA: list a property.
- A subtle Aceternity spotlight/grid effect may appear behind text, but never compete with photography or reduce performance.

### Featured properties

- Use a three-column desktop grid, two-column tablet, one-column mobile.
- One optional editorial-featured card may span columns.
- Give the image visual priority; keep metadata scannable.
- Show intent, locality, price, area, and up to two type-specific facts.

### Trust/process

- Use three concise steps: Submit → We review → Connect.
- Do not use fake counters.
- Trust claims must be factual and administratively editable.

### Localities and services

- Use editorial image tiles and clear summaries.
- Avoid identical card styling for every section; maintain rhythm with controlled variation.

### Final CTA

- Full-width, calm, high-contrast contact/WhatsApp panel.
- State what will happen after the user contacts the team.

## 8. Property cards

Every standard card includes:

- Fixed-aspect image with graceful fallback
- Intent/status badge
- Optional verified/moderated indicator only when backed by data
- Price or “Price on request”
- Descriptive title
- Locality/city
- Area and relevant facts
- Favorite/share only if implemented; no dead icons

Interaction:

- Entire semantic title/image region links to details.
- Hover lifts 2–4 px and subtly scales the image, while focus receives an equally strong visible state.
- Motion is disabled/reduced under the user preference.
- Never hide price or primary facts until hover.

## 9. Property catalogue

Desktop:

- Clear page title and result count.
- Search/sort row.
- Filter sidebar or stable filter rail.
- 2–3 card columns depending on viewport.

Mobile:

- Sticky compact toolbar for Filters and Sort.
- Filter drawer/sheet with current count and clear/apply actions.
- Active filter chips scroll horizontally only when necessary.

Use URL-backed filters. On updates, preserve context and avoid snapping the page unexpectedly. Skeletons match the final card geometry. The no-results state suggests clearing or widening filters.

## 10. Property detail

Above the fold:

- Breadcrumb
- Intent/type and factual status badges
- Strong title and locality
- Price and key metrics
- Editorial gallery

Gallery:

- Desktop asymmetrical grid only when enough images exist.
- Mobile swipeable region with a visible image count.
- Full-screen lightbox is keyboard accessible.
- Preserve aspect ratio and avoid layout shift.

Content:

- Overview
- Key details
- Amenities
- Location
- Availability/terms
- Disclaimer and property reference
- Similar properties

Conversion:

- Desktop: sticky enquiry panel aligned to content.
- Mobile: bottom action bar with Call/WhatsApp/Enquire; account for safe-area inset.
- Buttons must say “Request a site visit” or “Send enquiry,” not “Book now,” unless actual reservation semantics exist.

## 11. Owner submission wizard

Layout:

- Desktop: centered form with a calm summary/help rail.
- Mobile: single column with persistent but compact progress.
- Maximum comfortable form width: roughly 760–880 px.

Progress:

- Step number, short name, and completion state.
- Mobile may show “Step 3 of 7” plus progress bar rather than cramped labels.

Fields:

- Group related fields in titled sections.
- Use helper text where domain terms may be unfamiliar.
- Units and currency are explicit.
- Conditional fields enter/leave cleanly and are removed from the payload when irrelevant.
- Price, area, phone, and postal code receive suitable input modes.

Autosave:

- Show `Saving…`, `Saved`, or `Couldn’t save`.
- Status is quiet but visible and announced accessibly.
- Preserve input and allow retry after errors.

Upload:

- Large drop area plus conventional file picker.
- Display allowed types/limits before selection.
- Image tiles show progress, error, retry, reorder, cover, alt, and remove.
- Public photos and private documents are visually separated with privacy explanation.

Review:

- Present a readable listing preview and an edit link for each step.
- Consent is explicit and not prechecked.
- Submission confirmation includes reference number and expected next action without promising an unconfigured timeline.

## 12. Contact and enquiry UX

- Use clear business contact cards and a focused form.
- Prefill property context when arriving from a listing.
- Preferred contact method is a segmented control or radios, not an ambiguous select.
- WhatsApp CTA uses recognizable iconography and explains it opens WhatsApp.
- Social links show only when configured.
- Phone/email links use `tel:`/`mailto:` correctly.
- A map appears only with valid configured data.
- Confirmation explains that the request was received, not that a property was reserved.

## 13. Authentication UX

- Use a split editorial panel on wide screens and a focused single card on mobile.
- Keep sign-in forms compact.
- Make password visibility toggle keyboard accessible.
- Display email verification and password-reset states clearly.
- Do not leak whether arbitrary emails exist beyond provider-safe behavior.
- Return users only to allowlisted internal routes.

## 14. Admin shell

The admin area uses the same tokens but a denser, operational tone.

Desktop:

- Fixed/collapsible sidebar.
- Top bar with page context, search/command affordance if implemented, notifications, theme, and account.
- Main content has readable max width for forms and fluid width for tables.

Mobile/tablet:

- Sidebar becomes a drawer.
- Critical metrics use a 1–2 column grid.
- Tables become scroll-managed or card-like rows without losing actions.

Dashboard:

- First row emphasizes actionable counts: pending review, new enquiries, stale queue, published listings.
- Trend cards appear only with real query data.
- Recent activity is chronological and linked.
- Avoid decorative charts with insufficient data.

## 15. Admin tables and moderation

Tables:

- Sticky header only when useful.
- Row selection is separate from navigation.
- Filters and state live in the URL where practical.
- Empty and no-match states are distinct.
- Row actions have text in menus; do not rely on unlabeled icons.
- Use confirmation dialogs for archive, reject, role, and publication-impacting actions.

Submission review:

- Two-pane desktop layout: property data/media plus moderation rail.
- Mobile stacks content before actions.
- Show reference, owner, submit time, version, assignment, status history.
- Private documents carry a visible private label and are accessed through authorized short-lived URLs.
- Approval, request-changes, and rejection are visually distinct.
- Reasons are required for request-changes/rejection and visible to the appropriate owner.
- Internal notes are clearly marked and never mixed with owner-visible messages.

Audit log:

- Neutral, factual presentation.
- Actor/action/entity/time visible at a glance.
- Structured detail expands on demand.
- No edit/delete affordance.
- Sensitive values are redacted before storage and display.

## 16. Motion system

Purpose:

- Establish hierarchy on first view.
- Preserve spatial understanding during filter, drawer, gallery, and step changes.
- Confirm a completed user action.

Motion tokens:

- `fast`: 120–160 ms
- `base`: 180–240 ms
- `panel`: 240–320 ms
- `hero`: 400–500 ms maximum
- Standard easing: a smooth ease-out curve; avoid playful spring overshoot for serious workflows.

Allowed:

- Opacity + 8–16 px translate reveals
- Card image scale up to about 1.03
- Shared/layout transitions for filter chips and wizard steps
- Drawer/dialog presence transitions
- Small success check transition

Avoid:

- Scroll-jacking
- Continuous floating
- Cursor followers
- Text that animates character-by-character on every visit
- Large 3D tilts
- Parallax on form/admin pages
- Staggering more than a small visible group

Reduced motion:

- Remove translation, scale, parallax, and stagger.
- Use instant changes or short opacity feedback.
- The interface must remain understandable without motion.

## 17. Theme behavior

- Default to system theme on first visit.
- Persist explicit user selection.
- Prevent a flash of the wrong theme.
- Both themes use the same semantic hierarchy; dark mode is not an inverted afterthought.
- Photography overlays, logos, map/embed, charts, skeletons, focus rings, toasts, dialogs, and form autofill must be tested in both modes.
- Provide a compact accessible theme menu: Light, Dark, System.

## 18. Imagery

- Use high-quality property/architecture images with clear licensing during production content entry.
- Do not scrape or copy images from reference sites.
- Keep demo images replaceable via seed/config.
- Use consistent aspect ratios:
  - Listing card: 4:3 or 3:2
  - Wide feature: 16:9
  - Locality tile: 4:5 or 3:4
- Apply a restrained overlay only for text legibility.
- Avoid fake AI architecture imagery in a production property listing.
- Require factual alt text for listing media; decorative marketing imagery may use empty alt text.

## 19. Icons and data display

- Use Lucide consistently at 16, 18, 20, or 24 px.
- Pair unfamiliar icons with labels.
- Use icons to support, not replace, property facts.
- Format price with Indian grouping and compact display where appropriate, while exposing full accessible text.
- Use `Intl.NumberFormat` and never manually concatenate currency symbols to unvalidated values.
- Use tabular numerals for admin metrics and property facts.

## 20. Content voice

Voice: confident, clear, local, helpful, and factual.

Prefer:

- “Find a property that fits your next move.”
- “Submit your property for review.”
- “Request a site visit.”
- “Our team will contact you.”

Avoid:

- “Best property ever”
- “100% guaranteed returns”
- “Legally verified” without a real verification process
- Artificial urgency
- Long generic paragraphs
- Excessive exclamation marks

Button labels describe outcomes: “View property,” “Apply filters,” “Save draft,” “Submit for review,” “Request changes,” “Publish listing.”

## 21. Responsive acceptance checklist

- No horizontal page overflow at 320 px.
- Header, search, filters, gallery, wizard, admin tables, dialogs, and sticky actions remain usable.
- Sticky mobile action bar does not cover content and respects safe areas.
- Touch targets are comfortable.
- Text does not rely on truncation for critical meaning.
- Dialogs and sheets fit the viewport with internal scrolling.
- Images use appropriate sizes and do not cause layout shift.
- Desktop layouts do not become excessively sparse on ultrawide screens.

## 22. Accessibility acceptance checklist

- One logical `h1` per page and correct heading order.
- Skip link and semantic landmarks.
- Keyboard operation for all flows.
- Visible focus for every interactive element.
- Labels, descriptions, required state, and errors are programmatically connected.
- Error summary focuses/links appropriately for long forms.
- Dialog/sheet/lightbox focus is trapped and restored.
- Status is not color-only.
- Images have correct alt behavior.
- Live regions announce saving/submission/status feedback.
- Contrast meets WCAG AA.
- Reduced motion is honored.
- Zoom to 200% remains usable.

## 23. Quality bar

Reject the implementation during review if it contains:

- Unmodified template sections
- Inconsistent radii/colors/spacing
- Excessive animation or gradients
- Light-mode-only decisions
- Fake data presented as fact
- Dead controls
- Inaccessible custom selects/dialogs
- Important interactions available only on hover
- Mobile layouts treated as shrunk desktop
- Admin pages with unbounded or unreadable tables
- Public exposure of owner/private/admin information

The final product should make a first-time visitor trust the business, let an owner submit without confusion, let a buyer/renter act without friction, and let staff understand the next operational task immediately.
