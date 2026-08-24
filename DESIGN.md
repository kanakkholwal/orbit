# Orbit Design System

A near-white, border-first editorial surface for a privacy-first PDF toolkit. Structure comes
from 1px hairlines and dense monochrome type, never from elevation. One teal does the talking.

> **Borders, not depth.** A container is a 1px `#e5e5e5` edge and a radius. If a surface needs a
> shadow to read, it needs better spacing instead.

This document is Orbit's application of the **Dub** style reference. Two things are Orbit's own
and are exempt from the mirror:

| Exempt | Value | Why |
| --- | --- | --- |
| Typeface | Google Sans Variable | Orbit's voice. One face carries display and body. |
| Brand accent | teal, hue 178 | Orbit's identity. Replaces Dub's Electric Blue everywhere. |

Everything else: surfaces, neutrals, type scale, radii, elevation, spacing, component
grammar: follows the reference.

Tokens live in [app.css](src/app.css). Never hardcode a hex in a component.

---

## Colour

### Surfaces & ink

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| Canvas | `#ffffff` | `#0a0a0a` | `--background` |
| Paper (alt band, hover fill) | `#f5f5f5` | `#171717` | `--paper` → `bg-paper` |
| Card | `#ffffff` | `#0a0a0a` | `--card` |
| Hairline | `#e5e5e5` | `#262626` | `--border` |
| Strong border | `#d4d4d4` | `#383838` | `--border-strong` |
| Body text | `#171717` | `#fafafa` | `--foreground` |
| Muted text | `#525252` | `#a3a3a3` | `--muted-foreground` |
| Placeholder | `#737373` | `#737373` | `--placeholder` |

Cards are white on a white canvas. They are told apart by the hairline, not by tone. That is the
whole idea, and it is why the hairline is never diluted.

**Muted text is `#525252`, not Dub's `#737373`.** Fog measures 4.74:1 on white but **4.35:1 on the
paper band**, and Orbit alternates white and paper sections, so muted copy would fail on every
other section. Steel measures 7.81:1 and holds everywhere. `#737373` is kept for placeholders and
disabled states only, where the 4.5:1 floor does not apply.

**Dark mode is derived, not copied.** The reference ships light only. Every dark neutral holds the
light relationship against a `#0a0a0a` canvas: the hairline measures 1.31:1 in dark against 1.26:1
in light, muted ink 7.85:1 against 7.81:1.

### The accent

`--primary` is `oklch(0.52 0.105 178)` light, `oklch(0.72 0.1 178)` dark. It measures **5.14:1** on
white, **4.71:1** on paper, **8.36:1** on the dark canvas.

**L is 0.52, not the original 0.565.** The brighter teal measured 3.96:1 on the canvas while being
used as 11px eyebrow text and as the second clause of the hero headline. Same hue, same chroma,
legible.

`--primary` is reserved for:

1. Links inside body copy.
2. Active states and selection.
3. Focus rings (`--ring` is `--primary`, at full strength: a ring needs 3:1).
4. The accent clause in a headline.
5. Toggle "on" states and progress fills.

**Never a decorative tint, and never a large background fill.** It is a highlight colour, not a
surface colour.

### The filled action is black, not teal

`--action` is `#0a0a0a` light / `#fafafa` dark. `<Button>` with no variant is that fill.

**One filled action per surface.** Blue highlights, black commits. A second filled button on the
same view is the most common way this system gets diluted: the second action is `variant="outline"`.

### Feature-tag hues

One hue per tag, never two on one component, always rendered duotone (`glyph-duotone`: full-strength
stroke over a 20% fill of the same hue). No tinted tile behind the glyph.

| Tag | Light | Dark | Token |
| --- | --- | --- | --- |
| Tangerine | `#ea580c` | `#fb923c` | `--color-tag-tangerine` |
| Lavender | `#7c3aed` | `#a78bfa` | `--color-tag-lavender` |
| Green | `#16a34a` | `#4ade80` | `--color-tag-green` |

Tangerine (3.56:1) and green (3.30:1) clear the 3:1 icon floor but **not** the 4.5:1 text floor in
light mode. They are for glyphs, tags, and emphasized phrases at 18px and above, never body copy.

### Semantic colour

| Token | Light | Dark |
| --- | --- | --- |
| `--destructive` | `#c0242a` | `#ff6b61` |
| `--success` | `#0a7d47` | `#30d158` |
| `--warning` | `#8a5c00` | `#ff9f0a` |
| `--info` | `#0060c9` | `#409cff` |

Each light value doubles as ink on a neutral surface **and** as a fill under white text, so both
jobs clear 4.5:1 from one token. The Apple system values these replaced did not: warning measured
2.96:1 as text, and it is used as text.

**State is never colour alone.** Teal and the success green collide under tritanopia (OKLab dE
0.089, below the 0.10 threshold); teal and info blue collide harder (0.050). Every `StatusPill`
carries a glyph (a spinner, a check, an alert, or a dot for idle), so hue is corroborating
evidence, not the signal.

### Contrast floors

| Thing | Floor |
| --- | --- |
| Body text on its surface | 4.5:1 |
| Focus ring, control boundary, meaningful icon | 3:1 |
| Two controls distinguished by colour | 3:1 luminance **or** >0.10 OKLab dE under CVD |

**Never fade a text or border token with an opacity modifier.** `text-muted-foreground/50` measures
1.94:1; `/40` measures 1.60:1. 318 such dilutions were removed in this pass. If copy should be
quieter it takes `text-muted-foreground`, full stop. Tints on *fills* (`bg-primary/10`) are fine;
the rule is about ink and hairlines.

---

## Typography

One face: **Google Sans Variable**. Hierarchy comes from size, weight and tracking, not a second
family. `--font-mono` is Source Code Pro, for code and technical readouts only.

- **h1, h2**: weight **500**, tracking `-0.02em`. Medium, not bold: headings read confident, never
  shouty. This is the signature.
- **h3-h6**: weight 600, tracking `-0.01em`.
- **Body**: weight 400. 500 for emphasis and button labels, 600 for important UI labels.

### Scale

Nine steps. Line height rides along via Tailwind v4's `--text-*--line-height` pairing, so
`text-body` sets both and no call site needs a `leading-` utility.

| Token | Size | Line height | Use |
| --- | --- | --- | --- |
| `text-caption` | 11px | 1.5 | Eyebrows, micro-labels, table meta |
| `text-body` | 14px | 1.43 | Dense data, card copy, table rows |
| `text-body-lg` | **16px** | 1.5 | **Canonical body size** |
| `text-body-xl` | 18px | 1.56 | Ledes |
| `text-subheading` | 20px | 1.4 | h3 |
| `text-heading-sm` | 24px | 1.33 | Panel titles |
| `text-heading` | 30px | 1.38 | Section h2 |
| `text-heading-lg` | 36px | 1.11 | Large section h2, interior h1 |
| `text-display` | 48px | 1.0 | Hero h1 only |

`<body>` is 16px. **No ad-hoc `text-[Npx]`**: the page previously carried 72 of them, including
9px, 10px and 11px hardcodes.

**Tailwind's default steps are re-pointed onto this scale**, so `text-sm` is 14px, `text-xs` is
11px, `text-2xl` is 24px, and `text-5xl` through `text-9xl` all clamp to 48px. 262 existing call
sites therefore sit on the scale without a rename, and a stray `text-7xl` cannot invent a tenth step.

Legacy Orbit names (`text-title-sm`, `text-display-md`, `text-micro`, …) are aliased onto the same
steps. Prefer the canonical names in new markup.

Use `text-balance` on every headline and `text-pretty` on every body paragraph.

### Eyebrows

`label-eyebrow`: 11px, weight 600, **sentence case, no letter-spacing**. Colour is set by the
caller (`text-muted-foreground` or `text-primary`). Uppercase letter-spaced micro-labels are gone;
at 11px they cost legibility and, repeated, read as a tic.

---

## Shape

Five radii. Nothing else.

| Element | Value | Utility |
| --- | --- | --- |
| Tags, badges, pills | 9999px | `rounded-full` |
| Inputs | 6px | `rounded-xs` |
| Buttons | 8px | `rounded-sm` / `rounded-md` |
| Cards | 12px | `rounded-lg` / `.surface` |
| Large feature surfaces, mockups | 16px | `rounded-xl` / `.surface-lg` |

Tailwind's `rounded-2xl` and `rounded-3xl` are collapsed onto 16px, so the vocabulary cannot be
exceeded from a call site.

---

## Elevation

Borders define containers. Shadows are allowed in exactly three places:

| Use | Token |
| --- | --- |
| Filled button lift | `--shadow-subtle` = `rgba(0,0,0,.05) 0 1px 2px` |
| Product mockup / elevated feature card | `--shadow-ring` = `rgba(0,0,0,.1) 0 0 0 4px` |
| Floating overlays (menus, dialogs, sheets) | `--shadow-md` / `--shadow-lg` |

**Cards carry no shadow.** Inputs carry no shadow.

---

## Surfaces

| Class | Use |
| --- | --- |
| `.surface` | Cards. Card fill, 1px hairline, 12px. |
| `.surface-lg` | Feature and showcase panels. 16px. |
| `.surface-alt` | Nested tonal panel. Paper, no border, 16px. A border inside a border is two edges. |
| `.mockup-frame` | Product screenshots. 16px, 4px ring, no border. |
| `.pill` | Hero feature tags. Transparent, no border, 9999px. |
| `.pill-outline` | Badges and status chips. Card fill, hairline, 9999px. |
| `.pressable` | Press feedback for anything pressable that is not a `<Button>`. |

### Backgrounds

The canvas is flat. The only texture is `.bg-dot-grid`: a 16px dot array at ~7% opacity with a
radial fade. This is the blueprint signature, and it is applied once. No aurora, no gradient wash,
no photo behind a headline. `--gradient-conic-spectrum` has no equivalent here: Orbit has no
decorative gradient.

---

## Layout

- **Page max width:** 1200px: `<Container width="wide">` / `max-w-page`.
- **Section rhythm:** 64px: `<Section>` default is `py-16`.
- **Card padding:** 16px. **Element gap:** 8px. Base unit 4px, compact density.
- Sections alternate canvas and `<Section band>` (paper + hairline top and bottom) for tonal
  separation. Mixing the two is what makes the rhythm read.
- Section dividers are `border-t border-border`. No solid rules, no gradients.

### Page rhythm (home)

1. **Hero**: announcement pill, two-line headline with the accent clause on line two, one-paragraph
   subhead, filled + outlined CTA pair, four-stat rule.
2. **01 · Tools**: chapter rule, 5/7 editorial split, `gap-px` hairline grid of tools.
3. **02 · Architecture**: paper band, 5/7 split, three details on hairlines with duotone glyphs.
4. **03 · How it works**: `gap-px` hairline grid, three numbered steps.
5. **04 · FAQ**: sticky title left, single-open accordion right.
6. **Closing CTA**: paper band, one filled action, the three steps restated.
7. **Footer**.

---

## Components

### ChapterRule

`01` in the display face at 24px weight 500, the section label as an eyebrow, and the section's one
action, all on a single hairline across the column. This is how a section opens. A centred heading
stack reads like a slide; a chapter rule reads editorial.

### Buttons

| Variant | Treatment |
| --- | --- |
| `default` | Near-black fill, white text, 8px. **One per surface.** |
| `outline` | Card fill, hairline border, 8px. The workhorse. |
| `ghost` | Transparent, paper on hover. Nav items and icon controls. |
| `primary` | Teal fill. Only where the brand action must read as branded. |
| `light` | White fill on a dark band. |
| `destructive` | Destructive fill, its paired foreground. |

Press feedback is `active:scale-[0.98]`, 100ms. There is no hover-grow and no radius morph. Focus is
a 2px `--ring` with a 2px offset, never a diluted `ring/50`.

### Inputs

White fill, **1px near-black border** (`--input` is `#0a0a0a`), 6px radius, no shadow. The black
border is a signature: inputs feel important, not optional. Placeholders take `--placeholder`.

### Cards

`.surface`: card fill, 1px hairline, 12px, 16px padding, **no shadow**. The most frequent component
in the system. Rely on the border and spacing for structure.

`ToolCard` takes `framing="cell"` to drop its border and radius when it sits inside a `gap-px`
hairline grid, so a card never nests inside a card.

### StatusPill

Tinted fill, pill radius, a glyph for every state including idle. See the CVD note under Semantic
colour for why the glyph is not optional.

### FaqList

Hairline-divided rows, one open at a time, first open on load, plus-rotates-to-close as the only
affordance. No card, no chevron column. Height animates through Svelte's `slide`, which native
`<details>` cannot do.

### Reveal

Wrap scroll-in content in `<Reveal delay={stagger(i)}>`. It **starts visible** and only hides once
the observer is confirmed, so content is never stuck at `opacity: 0` when JS never runs. It exits
early under `prefers-reduced-motion`.

---

## Motion

One entry/exit curve: `--ease-craft` = `cubic-bezier(0.32, 0.72, 0, 1)`. `ease-in` is never used on
UI: it withholds the first frames, which is exactly when the user is watching.

| Use | Duration |
| --- | --- |
| Press feedback | 100ms |
| Hover / state colour change | 200ms |
| Cross-fade, panel | 300ms |
| Overlay enter / exit | 200 / 150ms |
| Sheet enter | 300ms |

Scale deltas are 2% (`0.98`), never smaller. Stagger steps are 30-70ms and cap at 6-8 items, so a
30-card grid does not ladder in over two seconds.

**Svelte `transition:` directives run on WAAPI and bypass the CSS reduced-motion guard.** Gate them
in JS: `rise()` and `stagger()` in [motion.ts](src/lib/motion.ts) already do, returning a short fade
and a zero delay when reduced motion is set. Never hand-roll `in:fly` with raw values on a public
page.

---

## Dos and Don'ts

**Do**

- Define containers with `border-border` at full strength.
- Use the nine-step type scale and the five-radius vocabulary.
- Keep one filled near-black action per surface; everything else is outline or ghost.
- Give each feature tag exactly one hue, rendered duotone.
- Reserve `--primary` to the listed roles.
- Use 16px as the canonical body size; 14px for dense data; 11px for micro-labels.
- Test new sections in both light and dark.

**Don't**

- Don't fade text or hairlines with an opacity modifier: use `text-muted-foreground`.
- Don't use a drop shadow to define a card.
- Don't use pure black for body text: `#171717` and `#fafafa` are the ink.
- Don't apply the teal to a large background fill.
- Don't put two chromatic colours on one component.
- Don't write `text-[13px]` or any other ad-hoc size or radius.
- Don't use `uppercase` + letter-spaced eyebrows; use `label-eyebrow`.
- Don't add `backdrop-filter` to a page surface. The floating navbar is the one exception and it is
  deliberate.

---

## Scope

The public pages (`/`, `/explore`, `/about`, `/docs`, `/changelog`, `/download`, legal) and the
shared `components/ui` primitives are the reference implementation. The `(app)` shell and the PDF
editor inherit the same tokens; where they diverge it is for density, not for a second system.

`src/components/site/` holds the page-level primitives: `Container`, `Section`, `ChapterRule`,
`SectionHeader`, `PageHero`, `FaqList`, `Reveal`. Build public pages from these rather than
hand-rolling section markup.
