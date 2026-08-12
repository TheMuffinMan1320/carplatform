---
name: MyDrive
description: A car-rental fleet platform rendered as a working automotive spec sheet, not a marketing brochure.
colors:
  signal: "#2f6fed"
  signal-soft: "#e4ecfd"
  blueprint: "#122a4e"
  blueprint-deep: "#0b1c38"
  blueprint-line: "#cfe0f5"
  blueprint-line-dim: "#7fa3d6"
  vellum: "#f4f6f7"
  vellum-dim: "#e8edf0"
  vellum-line: "#d3dce1"
  ink: "#16212c"
  ink-soft: "#4b5d6c"
  ink-faint: "#5a6b78"
  available: "#1f8b4c"
  available-soft: "#e2f3e8"
  pending: "#a5751f"
  pending-soft: "#f6ecda"
  danger: "#b3402c"
  danger-soft: "#fbe7e2"
typography:
  display:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.07em"
rounded:
  sheet: "3px"
  dot: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.vellum}"
    typography: "{typography.display}"
    rounded: "{rounded.sheet}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.blueprint}"
  button-secondary:
    backgroundColor: "{colors.vellum}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.sheet}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.vellum}"
    typography: "{typography.display}"
    rounded: "{rounded.sheet}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.vellum}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sheet}"
    padding: "8px 12px"
  badge:
    backgroundColor: "{colors.signal-soft}"
    textColor: "{colors.signal}"
    typography: "{typography.label}"
    rounded: "{rounded.sheet}"
    padding: "2px 8px"
---

# Design System: MyDrive

## Overview

**Creative North Star: "The Spec Sheet"**

MyDrive is a multi-location car-rental platform rendered as a working automotive document, not a dealership advertisement. Every vehicle is presented the way a real spec sheet would present it — measured dimensions, a technical line-drawing silhouette in place of a photo, VIN and mileage as data rather than trivia — because the product's actual differentiation (database-enforced no-double-booking, idempotent payments, location-scoped authorization) is a claim about rigor, and the interface should look as rigorous as the backend actually is. The system was chosen deliberately against two earlier, more atmospheric directions (a valet-claim-ticket world and a motorsport-broadcast-timing world) because they read as evocative rather than literal; Spec Sheet won because it is the most concretely automotive and the most practically legible of the candidates.

Two registers share one vocabulary. Public, decision-making surfaces (the vehicle browse page, vehicle detail, login/register) get the full "cover page" treatment: a deep cyanotype-blue canvas with a light drafting grid, white linework, and a large committed headline. Authenticated operate screens (fleet inventory, reservations, maintenance, admin) drop the cyanotype canvas entirely and stay on plain vellum — dense, hairline-ruled, and fast to scan — because a fleet agent working a queue all day needs restraint, not atmosphere. Both registers use the same type system, the same 3px corner radius, the same status-color vocabulary, and the same monospace "spec label" texture, so a user moving from the public site into their dashboard never feels like they changed products.

**Key Characteristics:**
- A working blueprint's palette: cool vellum and graphite for documents, deep cyanotype only for cover-page moments.
- IBM Plex Mono, uppercase and tracked, as the universal texture for labels, captions, and data — never used decoratively.
- A single 3px corner radius everywhere; nothing rounder except status dots.
- Hairline borders and a signature "dimension-line" divider do the separating; shadows are reserved for things that leave the page's plane.
- No vehicle photography anywhere — a hand-authored technical silhouette (`VehicleBlueprint`) stands in for every image, tinted by pricing tier.

## Colors

A working blueprint's palette: two neutral grounds (paper and cyanotype), one accent reserved strictly for interactivity, and a small closed set of status colors that never wander into decoration.

### Primary
- **Signal Blue** (`#2F6FED`): the only saturated color used for interactive intent — primary buttons' focus rings, links, the active-nav underline, form focus states. If something is blue, it is clickable or currently selected; nothing else in the system uses this hue.

### Secondary
- **Cyanotype** (`#122A4E`, deep variant `#0B1C38`): the "cover page" ground — used exclusively on the public browse hero and the login/register brand panel. Paired with **Cyanotype Line** (`#CFE0F5`, dimmed `#7FA3D6`) for linework, captions, and form fields drawn on that dark ground. Never used on an authenticated Operate screen.

### Neutral
- **Vellum** (`#F4F6F7`): the working paper — the default page background on every screen except the two hero moments above.
- **Vellum Dim** (`#E8EDF0`): table header rows, subtle panel differentiation against Vellum.
- **Vellum Line** (`#D3DCE1`): hairline borders and dividers on light grounds, including the `.dim-rule` dimension-line motif.
- **Graphite Ink** (`#16212C`): primary text and line art.
- **Ink Soft** (`#4B5D6C`): secondary text — subtitles, supporting copy.
- **Ink Faint** (`#5A6B78`): the lightest text tier — inactive nav links, footer meta, hints. Deliberately darkened from an earlier, too-light `#7A8B99` after a contrast review measured it at 3.51:1 against white; this value clears 4.5:1.

### Status (data colors — reserved exclusively for system state)
- **Available Green** (`#1F8B4C`, soft `#E2F3E8`): vehicle available, reservation completed, active/enabled.
- **Pending Amber** (`#A5751F`, soft `#F6ECDA`): in maintenance, reservation active/in-progress, payment requires action.
- **Danger Red** (`#B3402C`, soft `#FBE7E2`): out of service, cancelled, payment failed, destructive actions (Retire, Deactivate, Cancel).
- A fifth tone, **Role Purple** (`#5B4FC4`), marks role badges (Admin / Fleet Agent / Customer) — the one status color not tied to a state machine, used only in the Users table and role chips.

### Named Rules
**The One Accent Rule.** Signal Blue is the only color in the system used to mean "you can act on this." Status colors mean "this is what's true right now" and are never repurposed for emphasis or navigation.

**The Cover-Page Rule.** Cyanotype is a hero/brand-moment ground, never a working-screen ground. If a screen has a data table or a form the user fills out repeatedly, it sits on Vellum.

## Typography

**Display Font:** Space Grotesk (with `ui-sans-serif, system-ui, sans-serif` fallback)
**Body Font:** IBM Plex Sans (with `ui-sans-serif, system-ui, sans-serif` fallback)
**Label/Mono Font:** IBM Plex Mono (with `ui-monospace, SFMono-Regular, Menlo, monospace` fallback)

**Character:** Space Grotesk's slightly technical, geometric character carries every decision point — headlines, buttons, links, nav, prices. IBM Plex Mono, uppercase and letter-spaced, carries every fact — field labels, table headers, VINs, dates, dimension callouts. IBM Plex Sans is reserved for actual reading copy: hero subtext, form hints, longer paragraphs.

### Hierarchy
- **Display** (600–700 weight, `clamp(1.75rem, 3.5vw, 3rem)`, 1.05 line-height, -0.01em tracking): hero headlines on the browse and login cover pages.
- **Headline** (600 weight, 1.5rem / text-2xl): page titles ("Fleet Vehicles", "My Reservations", "Admin Dashboard").
- **Title** (600 weight, 1–1.25rem): card and section titles — vehicle make/model, modal titles, reservation vehicle name.
- **Body** (400 weight, 0.9375rem, 1.6 line-height): paragraph copy — hero subtext, panel descriptions, payment-panel explanatory note.
- **Label** (500 weight, 11px, 0.07em tracking, uppercase): the system's signature texture — field labels, table column headers, badges, captions, dimension callouts, footer meta.

### Named Rules
**The Two-Voice Rule.** Space Grotesk is for things the user decides or acts on; IBM Plex Mono is for things the user reads as fact. A screen element rendered in the wrong voice is a sign it's serving the wrong job.

**The No-Kicker Rule.** No small caption label ever sits directly above a heading as an eyebrow — a finish-review pass caught and removed this pattern from the browse and login heroes. Headlines carry their own weight; supporting context goes in the body copy below, never as a label above.

## Layout

Content sits in a `max-w-6xl` shell with `px-4`/`px-6` gutters (`AppShell`); forms and auth cards narrow to `max-w-sm`, modals to `max-w-lg`. The two cover-page heroes (browse, login/register) break out of that shell with negative margins to run full-bleed, then reintroduce the `max-w-6xl` constraint for their inner content — the only place in the app that happens.

The cyanotype hero pattern is responsive by staying present, not by disappearing: on the login/register split-panel layout, the dark brand panel compresses to a compact band above the form on mobile rather than being hidden (a finish-review fix — hiding it read as a dropped, unfinished screen). The `drafting-grid` texture (a two-axis hairline grid, 24–28px cells) appears only on these cyanotype canvases and is the one place in the system a decorative grid is earned, per its own definition as a blueprint/measurement surface.

Operate screens (fleet, reservations, maintenance, admin) are dense by design: `DataTable` runs full-width with hairline row dividers and a `Vellum Dim` header row, wrapped in `overflow-x-auto` so a wide table scrolls within its own container on mobile without ever taking the page itself sideways.

## Elevation & Depth

The system is flat by default — hairline borders (1px, `ink/8` to `ink/25` depending on emphasis) do the separating work, not shadows. Elevation is reserved for things that leave the page's own plane: modals and toasts float above a scrim or the viewport edge and get a real blurred shadow; everything else (cards, tables) rests directly on the page with at most a whisper of depth.

### Shadow Vocabulary
- **Resting card** (`box-shadow: 0 1px 2px rgba(22,33,44,0.04), 0 4px 10px -4px rgba(22,33,44,0.08)`): vehicle cards, `Card` panels, table container — barely-there, closer to a hairline than a shadow.
- **Floating overlay** (`box-shadow: 0 8px 30px -8px rgba(11,28,56,0.35)`): `Modal` — needs real separation from its cyanotype-tinted scrim.
- **Toast** (`box-shadow: 0 8px 24px -8px rgba(11,28,56,0.3)`): slightly lighter than the modal shadow since it floats over content, not a scrim.

### Named Rules
**The Document Rule.** A resting card lies flat on the sheet; only something that has left the page's plane (a modal over a scrim, a toast over content) earns a real shadow.

## Shapes

One radius, everywhere: `rounded-sheet` (3px) on every button, input, card, badge, table, and modal. Nothing is more rounded than that except fully circular elements — status-badge dots, toast indicator dots, and the wheel hubs/wheels in the `VehicleBlueprint` illustration. There is no intermediate `rounded-md`/`rounded-lg`/`rounded-full`-on-buttons step in this system; the flat 3px everywhere is what keeps the "printed document" character intact.

The signature divider is `.dim-rule` — a 1px line with two short perpendicular tick marks at its ends, standing in for a plain `<hr>` throughout the app. Empty states use a dashed border with four independent corner-registration marks (drafting "crop marks") instead of a plain dashed box.

## Components

### Buttons
- **Shape:** 3px corners (`rounded-sheet`), never more rounded.
- **Primary:** Graphite Ink background (`#16212C`), Vellum text, Space Grotesk 500 at 13px, `8px 16px` padding. Hover darkens to Cyanotype (`#122A4E`).
- **Secondary:** Vellum background, Ink text, `ink/30` hairline border; hover darkens the border to full Ink and tints the background to Vellum Dim.
- **Danger:** Danger Red background, Vellum text — used for Retire, Deactivate, Cancel actions.
- **Ghost:** transparent, Ink Soft text, no border until hover (which draws a faint `ink/20` outline) — used sparingly for the close button and similar low-emphasis controls.

### Badges
- **Style:** soft-tinted background + matching hairline border + a small solid dot, all in one of six status tones (green/blue/amber/red/slate/purple). Label text is always IBM Plex Mono, uppercase, 11px.
- **Rule:** the dot is not decorative — it's the same color-coding used in the empty-state and error-banner dots elsewhere, so "a colored dot means status" reads consistently across the whole app.

### Cards / Containers
- **Corner Style:** 3px.
- **Background:** white (list/detail cards) or Vellum (nested panels within a card).
- **Shadow Strategy:** Resting Card shadow (see Elevation).
- **Border:** `ink/12` hairline.
- **Internal Padding:** 24px (`p-6`) standard; vehicle-card image tiles use no padding on the illustration area, 16px (`p-4`) on the content area below.

### Inputs / Fields
- **Style:** Vellum background, `ink/25` hairline border, 3px corners; label sits above as an IBM Plex Mono uppercase caption rather than inline or floating.
- **Focus:** border and a 1px ring both switch to Signal Blue.
- **Error:** border and ring switch to Danger Red; error text renders as a Danger Red mono caption below the field.
- **Inverse variant:** on the Cyanotype cover-page hero, fields switch to a translucent Blueprint-Deep background with Cyanotype-Line text and border, for the location/status/tier filters set into the hero.

### Navigation
- **Style:** Space Grotesk 500 at 13px. Inactive items are Ink Faint; the active item is full Ink with a 2px Signal Blue underline sitting just below the baseline — no background pill, no bold weight change.
- **Mobile:** the nav row wraps rather than collapsing into a menu; the brand/cyanotype panel pattern on auth pages compresses but never hides (see Layout).

### VehicleBlueprint (signature component)
A hand-authored technical line-drawing of a vehicle in side profile — the platform's deliberate answer to having no image-upload endpoint. Two silhouette variants (`compact` for Economy/Standard, `executive` for Premium/Luxury) are drawn as a single continuous body path plus wheel arches, stroked in the vehicle's pricing-tier accent color rather than filled. An optional `showDimensions` mode adds a top length callout and a left-side height callout with tick marks and an IBM Plex Mono figure (e.g. "196.8 IN") — used on the browse hero and vehicle detail page, always paired with "SCALE N.T.S." framing since the figures are schematic, not real per-vehicle data (the API has no length/height fields). Small card thumbnails omit dimensions; only the two full-size hero renderings show them.

## Do's and Don'ts

### Do:
- **Do** set every label, caption, table header, and data value (VIN, dates, mileage, rates) in IBM Plex Mono, uppercase, 0.06–0.08em tracked — it's the system's signature texture.
- **Do** keep every corner at exactly 3px, or fully circular for dots/hubs — no in-between radius.
- **Do** reserve Signal Blue for things the user can click or that are currently active/selected.
- **Do** use `.dim-rule` instead of a plain border divider between sections within a card.
- **Do** keep the Cyanotype ground to hero/brand moments only; Operate screens stay on Vellum.
- **Do** carry the cyanotype brand panel to every breakpoint on auth pages — compress it, never hide it.

### Don't:
- **Don't** place a small caption/eyebrow label directly above a heading — removed from the browse and login heroes in finish review; the heading always carries its own weight.
- **Don't** use gradients, glassmorphism as pure decoration, or a colored `border-left`/`border-right` accent on cards or alerts.
- **Don't** use a hard-offset flat shadow (`4px 4px 0`-style) anywhere — this system is a printed document, not neobrutalist.
- **Don't** use real vehicle photography or stock imagery anywhere — `VehicleBlueprint` is the only vehicle visual, everywhere.
- **Don't** treat the `VehicleBlueprint` dimension callouts as real per-vehicle data — they're schematic ("scale n.t.s."); the API has no length/height fields to bind them to.
- **Don't** reuse a status color (green/amber/red/purple) for anything other than the state it's assigned to elsewhere in the app.
