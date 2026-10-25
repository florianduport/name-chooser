---
name: LeBabyName
description: A warm, generous interface for quick and comfortable baby-name choices.
colors:
  cream-canvas: "#f7f1e8"
  warm-paper: "#fffaf2"
  white-surface: "#ffffff"
  stone-ink: "#1c1917"
  stone-body: "#44403c"
  stone-muted: "#57534e"
  stone-subtle: "#78716c"
  stone-border: "#e7e5e4"
  rose-action: "#be123c"
  rose-action-hover: "#9f1239"
  rose-soft: "#ffe4e6"
  rose-soft-hover: "#fecdd3"
  sky-soft: "#e0f2fe"
  sky-soft-hover: "#bae6fd"
  night-footer: "#0c0a09"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
rounded:
  md: "0.375rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
  3xl: "1.375rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
  2xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.stone-ink}"
    textColor: "{colors.white-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "0.75rem 1.25rem"
    height: "3rem"
  button-rose:
    backgroundColor: "{colors.rose-action}"
    textColor: "{colors.white-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "0.75rem 1.25rem"
    height: "3rem"
  choice-rose:
    backgroundColor: "{colors.rose-soft}"
    textColor: "{colors.stone-ink}"
    rounded: "{rounded.2xl}"
    padding: "1.25rem"
  choice-sky:
    backgroundColor: "{colors.sky-soft}"
    textColor: "{colors.stone-ink}"
    rounded: "{rounded.2xl}"
    padding: "1.25rem"
  card:
    backgroundColor: "{colors.white-surface}"
    textColor: "{colors.stone-ink}"
    rounded: "{rounded.3xl}"
    padding: "2rem"
  input:
    backgroundColor: "{colors.white-surface}"
    textColor: "{colors.stone-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
    height: "2.25rem"
---

# Design System: LeBabyName

## Overview

**Creative North Star: "The Warm Family Table"**

LeBabyName feels like making an important choice together in a calm, welcoming room. A warm cream canvas, softly tinted choices, generous editorial type, and plain controls keep the product playful without becoming childish. The interface is mobile-first and direct: one decision is visually dominant, supporting detail remains quiet, and monetization never competes with the naming task.

The visual system pairs expressive Fraunces headlines with practical Geist UI copy. White surfaces float gently over cream rather than forming a dense dashboard, while rose and sky tints distinguish choices without assigning rigid meaning beyond the current source list.

**Key Characteristics:**
- Warm cream foundations with translucent or white content surfaces.
- Generous serif display type paired with compact, legible sans-serif controls.
- Soft, deeply rounded containers and restrained warm shadows.
- Rose for action and focus; rose and sky pastels for paired choices.
- Mobile-first layouts with short paths and comfortable tap targets.

## Colors

The palette combines warm cream and stone neutrals with restrained rose and sky accents.

### Primary
- **Rose Action:** Used for the strongest product action, progress, and branded focus emphasis.
- **Stone Ink:** Used for default high-contrast actions, marks, headings, and primary text.

### Secondary
- **Rose Soft:** The warm member of paired choices and gentle emphasis.
- **Sky Soft:** The cool member of paired choices and gentle emphasis.

### Neutral
- **Cream Canvas:** The default full-page background.
- **Warm Paper:** A warmer inset surface for menus and modal-like panels.
- **White Surface:** Cards, fields, and translucent overlays.
- **Stone Body:** Primary reading copy.
- **Stone Muted:** Supporting copy and subdued controls.
- **Stone Subtle:** Metadata and low-emphasis labels.
- **Stone Border:** Quiet separators and control outlines.
- **Night Footer:** The grounding footer field for discovery and legal navigation.

### Named Rules
**The Cream Ground Rule.** Product flows and public editorial pages begin on the cream canvas; white is a surface, not the default page field.

**The Accent Restraint Rule.** Rose and sky clarify actions or paired choices. They do not become large decorative fields or compete simultaneously for attention.

## Typography

**Display Font:** Fraunces (with Georgia and serif fallbacks)
**Body Font:** Geist (with Arial and sans-serif fallbacks)

**Character:** Fraunces gives names and decisions warmth and ceremony. Geist keeps instructions, metadata, navigation, and consent language direct and compact.

### Hierarchy
- **Display:** Regular Fraunces with a tight line and strongly negative tracking. It is reserved for page heroes, winners, and the current name choice; mobile sizes step down substantially from the desktop display token.
- **Headline:** Regular Fraunces for major section titles and modal headings.
- **Title:** Regular Fraunces for cards, names in lists, and secondary section headings.
- **Body:** Regular Geist with open leading for explanations and legal copy; long-form lines stop around 72 characters.
- **Label:** Medium Geist for buttons, navigation, compact controls, and metadata.

### Named Rules
**The Names Deserve Ceremony Rule.** Names, winners, and decision prompts use the serif voice; controls and explanations stay sans-serif.

**The Tight Display Rule.** Large serif text uses close tracking and compact leading, while body copy keeps generous leading for reading comfort.

## Layout

Pages are mobile-first, begin at a 320px minimum viewport, and use full-height cream canvases. Interactive flows center inside containers around 64–80rem; focused content and legal reading narrow to roughly 42–48rem. Page gutters begin at 0.75–1.25rem and expand at the small breakpoint.

The core rhythm is built from 0.5rem, 0.75rem, 1rem, 1.25rem, 1.5rem, and 2rem steps. Large editorial sections may open to 2.5–4rem vertical gaps. Multi-column structures appear only when the content and viewport support them; primary decisions remain large and stacked on small screens.

**The One Decision Rule.** The active choice or primary action receives the strongest scale and contrast; navigation, advertising, and secondary actions remain visibly subordinate.

## Elevation & Depth

The system is softly layered rather than glossy. White surfaces use warm, widely diffused shadows, often combined with a low-contrast white border and slight translucency. Utility surfaces may stay flat; raised treatment is reserved for primary cards, dialogs, menus, and active decision surfaces.

### Shadow Vocabulary
- **Warm Ambient:** `0 30px 90px -42px rgba(77, 48, 38, 0.5)` for large hero and sign-in cards.
- **Interactive Lift:** `0 20px 60px -38px rgba(77, 48, 38, 0.7)` for selectable tournament cards, strengthening on hover.
- **Consent Float:** `0 18px 55px -22px rgba(28, 25, 23, 0.45)` for the fixed consent notice.
- **Mark Lift:** `0 12px 30px -14px rgba(28, 25, 23, 0.8)` for the circular heart mark when it floats over the canvas.

**The Soft Layer Rule.** Use shadow with translucency and quiet borders to separate a meaningful surface; do not shadow every container.

## Shapes

Rounded geometry keeps the interface friendly and touchable. Small controls use medium-to-large corners, action buttons use large corners, and cards use 2xl or 3xl corners. Pills and circles are reserved for marks, status chips, icon wells, and compact tags. Borders are pale and often partially transparent; content-heavy editorial sections prefer simple divider lines.

**The Nested Radius Rule.** Inner controls use a visibly smaller radius than the surface containing them.

## Components

### Buttons
- **Shape:** Primary actions are comfortably rounded, usually large corners with a 3rem minimum height; decision buttons become deeper and more generous.
- **Primary:** Stone ink with white text is the neutral default. Rose is used when an action carries stronger product emphasis.
- **Hover / Focus:** Hover darkens or gently shifts the fill. Keyboard focus uses a visible stone or translucent rose ring; large choice cards may lift slightly.
- **Secondary / Ghost:** White outlined controls and low-contrast ghost controls preserve hierarchy without disappearing.

### Choice Cards
- **Style:** Paired decisions use rose-soft and sky-soft fills, large corners, clear labels, circular white icon wells, and a directional arrow.
- **State:** Hover strengthens the tint or adds a small lift. Focus keeps a visible rose ring.

### Cards / Containers
- **Corner Style:** Deeply rounded outer surfaces with smaller nested controls.
- **Background:** White or translucent white over the cream canvas; warm paper is reserved for inset overlays.
- **Shadow Strategy:** Warm ambient depth only for focal or floating surfaces.
- **Border:** A quiet white or stone border preserves the edge against the cream field.
- **Internal Padding:** Compact on mobile and generous from the small breakpoint upward.

### Inputs / Fields
- **Style:** White or transparent fields with a quiet stone stroke, compact corners, and sans-serif text.
- **Focus:** Border and ring become visible together.
- **Error / Disabled:** Errors use a pale red field with dark red text; disabled controls retain their shape and reduce opacity.

### Navigation
- The heart-in-circle mark and Fraunces wordmark form the compact brand anchor. Header actions use short labels or familiar icons with explicit accessible names. Dark footers collect discovery and legal links as underlined, low-emphasis text that brightens on hover.

### Consent Notice
- The consent notice is a fixed, centered white surface with a warm floating shadow. Plain-language copy leads; the refusal action stays available beside the filled acceptance action. On narrow screens, actions wrap without blocking the core product.

## Do's and Don'ts

### Do:
- **Do** keep primary touch targets around 3rem high and preserve visible keyboard focus.
- **Do** use cream as the page ground and white as a layered surface.
- **Do** let Fraunces carry names, outcomes, and major headings while Geist carries UI and reading copy.
- **Do** keep legal, consent, advertising, and monetization surfaces visually quieter than the active naming task.
- **Do** reduce or remove animation when the user requests reduced motion.

### Don't:
- **Don't** turn rose and sky into rigid gender claims; they are soft paired accents for source-list choices.
- **Don't** place heavy shadows on every card or divider.
- **Don't** use display serif styling for dense controls, metadata, or long body copy.
- **Don't** let ads, consent prompts, or legal navigation obscure or interrupt a duel.
- **Don't** introduce hard offset shadows, sharp-cornered feature cards, or saturated full-page backgrounds into this soft visual system.
