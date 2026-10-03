# Phase 2 — Design system decisions

Status: verified locally; deployment checkpoint pending.

## Approved direction

Jaipur buyers and renters need a clear search, visible price and usable enquiry path. Use one forest accent, neutral light surfaces, Slate 950 dark surfaces and Plus Jakarta Sans. The centered hero/search and public section sequence follow the approved Crossworld product patterns; content, code and branding remain original.

The single decorative moment is architectural light rays behind the hero, inspired by Aceternity Spotlight New. The user explicitly requested ongoing visible motion after the finite prototype settled. Four token-colored rays move through two CSS transform layers over ten seconds, with a visible keyboard-accessible pause/resume control. Existing Motion observes visibility to pause offscreen; reduced motion renders a static composition and no motion control. Search remains opaque, all text is present before JavaScript, and no canvas/WebGL or new animation dependency is required.

## Tokens

| Semantic role | Light | Dark |
| --- | --- | --- |
| Canvas | `#F8FAF9` | `#020617` |
| Primary text | `#102A22` | `#F1F5F9` |
| Card / popover | `#FFFFFF` | `#0F172A` |
| Muted surface | `#EDF3EF` | `#1E293B` |
| Secondary text | `#52635C` | `#94A3B8` |
| Decorative border | `#D9E2DC` | `#334155` |
| Essential control outline | `#7B8D82` | `#64748B` |
| Primary / focus ring | `#174B3A` | `#A3D9B7` |
| Primary text | `#FFFFFF` | `#092419` |
| Hover action | `#123C2E` | `#BFE7C9` |
| Spotlight surface | `#102A22` | `#0F172A` |
| Spotlight text / accent | `#FFFFFF` / `#A3D9B7` | `#F1F5F9` / `#A3D9B7` |
| Dangerous action / text | `#B42332` / `#FFFFFF` | `#FDA4AF` / `#450A0A` |

Keep exact approved values in semantic variables; OKLCH mixing is decorative only. Text pairs require 4.5:1 and essential outlines/focus 3:1. Disabled controls use readable muted tokens, not a global opacity reduction.

## Research and provenance

- Project-local shadcn skill: `shadcn-ui/ui`, commit `295a1f114a138f23b5dfee0e0c6812394dfeb90c`, `skills/shadcn`; upstream UI UX Pro Max: `nextlevelbuilder/ui-ux-pro-max-skill`, commit `09170eec67eefd46a7ae85de61b40c194020f997`, `.claude/skills/ui-ux-pro-max`. File hashes are in `skills-lock.json`. Installation used the existing skill-installer helper and changed no global agent configuration.
- UI UX Pro Max query `real estate premium marketplace --design-system` matched real-estate teal, but also suggested glassmorphism, Cinzel/Josefin and a separate blue CTA. Those do not fit the approved single accent, sans typography and restrained marketplace, so the approved forest system wins. Focused `dark mode contrast --domain ux` and `font loading layout --stack nextjs` searches support measured contrast and optimized fonts.
- Official [shadcn schema](https://ui.shadcn.com/schema.json) confirms `radix-vega`; CLI 4.21.1 detected App Router / Tailwind 4 / existing aliases. The dry run proposed 21 new files and overwriting the existing button; the button was preserved and merged explicitly.
- Generated registry code used a new `cn` dependency and umbrella `radix-ui` imports. Replace them with the existing utility and direct Radix primitive packages. Adapt theme tokens, explicit transition properties, viewport scrolling, 44 px controls and Radix `data-state` animations.
- Reviewed the free [Aceternity Background Beams](https://ui.aceternity.com/components/background-beams) registry through `shadcn add --view`. Its 50 paths, random gradient coordinates, blue/purple colors and infinite loops were rejected. The initial finite prototype was replaced after user feedback. Reviewed [Spotlight New](https://ui.aceternity.com/components/spotlight-new) and created an original four-ray CSS composition with pause/resume, bounded clipping and project tokens. [Motion](https://github.com/motiondivision/motion/blob/main/LICENSE.md) is the existing MIT-licensed animation/visibility library; no Pro asset or template is used.
- Current [Vercel interface guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), installed Vercel React rules and local Next 16 font documentation guide accessibility, SVG wrapper animation and font scoping.

## Scope and acceptance

Build a protected administrative component preview before the Phase 3 page compositions. It covers shared buttons, fields/validation, intent selection, searchable locality, sheet/dialog focus restoration, accordion, badges, empty/loading/error states and responsive tables/destructive confirmation. No preview control changes application data.

Verify both themes, system persistence, native selects, six widths, 200% zoom, keyboard/focus, reduced motion, pause/resume and offscreen animation suspension. Record actual check results, screenshots and deployment checkpoint in HANDOFF; do not mark the phase complete before its gate.

## Verification decisions

- Token unit tests cover 32 foreground/surface and essential outline pairs; normal text meets 4.5:1 and essential borders/focus 3:1 in both themes.
- Browser checks wait for the actual theme class and computed colors before scanning, and for streamed loading content to be replaced by one main landmark. No contrast rule is disabled.
- Repaired the preview loading label role, dark sign-in eyebrow contrast, browser chrome synchronization with next-themes, semantic card headings and reduced-motion skeleton loops.
- Real admin browser checks cover searchable locality, tabs, accordion, dialog/sheet focus trapping/restoration, confirmation cancellation, six widths and **200% CSS zoom**. This is a CSS zoom/reflow check; no native screen-reader certification is claimed.
- The default homepage loads one font preload and no inactive family variables. Alternate administrator previews remain explicit.
- Skill/component upstream MIT notices are retained locally. Vercel upload ignores private environment/linkage files, skills, dependency caches and local browser evidence.
