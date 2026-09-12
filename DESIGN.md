# Orbit Design System

A blueprint surface for a privacy-first PDF toolkit. White cards sit on a light gray canvas between
dashed column rails. Structure comes from 1px hairlines, generous spacing and one emerald accent.

> **Borders, not depth.** A container is a 1px hairline and a radius. If a surface needs a shadow
> to read, it needs better spacing instead.

Orbit's CSS mirrors the **Rune Icons** reference (layout, neutrals, dark palette, radii, type scale,
card grammar). Three things are Orbit's own:

| Exempt | Value | Why |
| --- | --- | --- |
| Heading face | Google Sans Variable | Orbit's voice on every `h1`-`h6` and display text. |
| Body face | Inter Variable | Dense UI copy, tables, inputs. |
| Brand accent | emerald, `#047857` / `#34d399` | Orbit's identity. Replaced teal (hue 178) in Sept 2026. |

Tokens live in [app.css](src/app.css). Never hardcode a hex in a component.

---

## Colour

### Surfaces & ink

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| Page canvas (public pages, desktop home) | `#f5f5f5` | `#0a0a0a` | `--canvas` → `bg-canvas` |
| App background | `#ffffff` | `#0a0a0a` | `--background` |
| Card | `#ffffff` | `#171717` | `--card` |
| Muted fill, hover fill | `#f5f5f5` | `#262626` | `--muted`, `--paper` |
| Hairline | `#e5e5e5` | `rgb(255 255 255 / .10)` | `--border` |
| Strong border | `#d4d4d4` | `rgb(255 255 255 / .16)` | `--border-strong` |
| Input border | `#e5e5e5` | `rgb(255 255 255 / .15)` | `--input` |
| Ink | `#0a0a0a` | `#fafafa` | `--foreground` |
| Muted ink | `#6b6b6b` | `#a1a1a1` | `--muted-foreground` |
| Placeholder | `#737373` | `#737373` | `--placeholder` |

These are Rune's values with one exception.

**Muted ink is `#6b6b6b`, not Rune's `#737373`.** `#737373` measures 4.35:1 on the gray canvas, below
the 4.5:1 body floor. `#6b6b6b` measures 4.89:1 on the canvas and 5.33:1 on white, and is visually
indistinguishable. Dark muted ink `#a1a1a1` measures 7.66:1 on `#0a0a0a`.

**Cards on public pages** use `panel-card`: white in light, `--background` (`#0a0a0a`) in dark, so a
dark card is told apart from the canvas by its hairline alone, as in the reference. App-shell cards
use `bg-card` (`#171717` in dark) for a raised layer.

### The accent

| Token | Light | Dark |
| --- | --- | --- |
| `--primary` | `#047857` (emerald-700) | `#34d399` (emerald-400) |
| `--primary-active` | `#065f46` | `#10b981` |
| `--primary-foreground` | `#ffffff` | `#0a0a0a` |

Light measures **5.48:1** on white, **5.03:1** on the canvas, **4.74:1** on a `bg-primary/10` tint.
Dark measures **10.30:1** on `#0a0a0a` and 9.33:1 on `#171717`.

**Not emerald-600.** Tailwind's default `#059669` measures 3.77:1 on white and 3.46:1 on the canvas,
so it fails as headline accent and link text.

`--primary` is for: the accent words in a headline, the primary brand action, links in body copy,
active and selected states, focus rings, and toggle-on / progress fills. Never a large flat
background fill; the brand panels below are raster gradients, not the token.

### Brand gradient panels

Two noise-grain emerald gradients with fine grid lines, generated to match Rune's
`cta-gradient` / `search-gradient` assets:

| Utility | Asset | Use |
| --- | --- | --- |
| `panel-brand` | `static/assets/landing/cta-gradient.webp` (2400×1000) | Closing CTA, `BrandPanel` |
| `panel-brand-tall` | `static/assets/landing/search-gradient.webp` (1200×1600) | Tool finder panel |

Both stay the same in dark mode. White text measures 4.70:1 on the base `#05845f` and 7.18:1 on the
deep tone, but only 3.12:1 on the brightest streak (`#22a57b`). So text on a brand panel is either
48px+ headline or centred body copy away from the streaks. The one exception is the tool finder's 12px tile labels, which sit on the glass card rather than the raw gradient. Regenerate
with `node scripts/gen-brand-gradients.mjs` rather than editing the images by hand.

### Semantic colour

| Token | Light | Dark |
| --- | --- | --- |
| `--destructive` | `#c0242a` | `#ff6b61` |
| `--success` | `#0a7d47` | `#30d158` |
| `--warning` | `#8a5c00` | `#ff9f0a` |
| `--info` | `#0060c9` | `#409cff` |

**State is never colour alone.** Emerald and the success green collide under every vision type
(OKLab dE 0.079), and no success green escapes it (`#15803d` 0.050, olive `#4d7c0f` 0.083). Every
status carries a glyph or a word; hue is corroborating evidence, not the signal.

### Contrast floors

| Thing | Floor |
| --- | --- |
| Body text on its surface | 4.5:1 |
| Focus ring, control boundary, meaningful icon | 3:1 |
| Two controls distinguished by colour | 3:1 luminance **or** >0.10 OKLab dE under CVD |

**Never fade a text token with an opacity modifier** (`text-muted-foreground/50` measures 1.94:1).
Tints on fills (`bg-primary/10`) and on white text over a brand panel (`text-white/80`) are fine.

---

## Typography

Self-hosted through Fontsource, imported in `src/routes/+layout.svelte` and `+error.svelte`.

| Token | Face | Package | Applies to |
| --- | --- | --- | --- |
| `--font-heading` / `font-display` | Google Sans Variable | `@fontsource-variable/google-sans` | `h1`-`h6` (base layer), logo wordmark |
| `--font-sans` | Inter Variable | `@fontsource-variable/inter` | `body` and everything that inherits |
| `--font-mono` | Source Code Pro Variable | `@fontsource-variable/source-code-pro` | Code, checksums, keycaps |

Headings are weight **500** (`font-medium`), as in the reference. h1/h2 carry `-0.02em` tracking.

### Scale

Tailwind's default type scale, the same as Rune's, with Orbit role names on top. Line height rides
along with each step.

| Token | Tailwind | Size / line | Role |
| --- | --- | --- | --- |
| `text-caption` | `text-xs` | 12 / 16 | Chips, meta, tags, footer legal |
| `text-body` | `text-sm` | 14 / 20 | Body copy, card copy, buttons, FAQ answers |
| `text-body-lg` | `text-base` | 16 / 24 | Card titles (h3), FAQ questions, ledes from `md` |
| `text-body-xl` | `text-lg` | 18 / 28 | Rare emphasis |
| `text-subheading` | `text-xl` | 20 / 28 | Changelog entry title, legal section h2, specimen title |
| `text-heading-sm` | `text-2xl` | 24 / 32 | Prose section h2 (docs), version numbers |
| `text-heading` | `text-3xl` | 30 / 36 | Prose section h2 from `sm` |
| `text-heading-lg` | `text-4xl` | 36 / 40 | Page h1 (mobile), split-section h2, FAQ title |
| `text-display` | `text-5xl` | 48 / 1 | Page h1 from `md`, brand panel h2 |
| `text-display-xl` | `text-6xl` | 60 / 1 | Landing hero h1 and closing CTA from `lg`, nothing else |

`text-7xl` and above clamp to 60px. **No ad-hoc `text-[Npx]`.**

### Roles, applied everywhere

| Element | Classes |
| --- | --- |
| Landing hero h1 | `text-heading-sm sm:text-heading-lg md:text-display lg:text-display-xl font-medium` |
| Page h1 (`PageHero`) | `text-heading-lg md:text-display font-medium`, accent on a second line |
| Section h2 (`SplitSection`) | `text-heading-lg font-medium`, accent on a second line |
| Prose h2 (docs) | `text-heading-sm sm:text-heading font-medium` |
| Card h3 | `text-body md:text-body-lg font-medium` (bento) / `text-body-lg font-medium` |
| Lede | `text-body md:text-body-lg text-muted-foreground` |
| Body | `text-body text-muted-foreground`, `leading-relaxed` in long copy |
| Meta | `text-caption` |

### tailwind-merge

`cn()` uses `extendTailwindMerge(twMergeConfig)` from [utils.ts](src/lib/utils.ts), which registers
every `text-*` role and custom shadow name. Without it, tailwind-merge reads `text-body` as a colour
and silently drops it when a `text-foreground` follows. Add any new size or shadow token there.

---

## Shape

Rune's radius scale (`--radius` 10px base).

| Utility | Value | Use |
| --- | --- | --- |
| `rounded-sm` / `rounded-xs` | 6px | Chip inner tiles, keycaps |
| `rounded-md` | 8px | Buttons, navbar controls, tilted chips |
| `rounded-lg` | 10px | Tool tiles, list rows, nav items |
| `rounded-xl` | 14px | Inset visuals, search inputs, navbar shell |
| `rounded-2xl` | 18px | Cards (`panel-card`), FAQ cards, bento cards (mobile), panels |
| `rounded-3xl` | 22px | Bento cards from `md`, brand panels, footer card, glass search card |
| `rounded-full` | 9999px | Pills, status tags |

Nest radii inward: a 14px visual inside an 18-22px card, never the reverse.

---

## Elevation

Borders define containers. Shadows:

| Use | Token |
| --- | --- |
| Buttons, navbar shell | `shadow-xs` / `shadow-sm` |
| Inset visuals inside a bento card | `shadow-sm` |
| Bento card hover (pointer feedback only) | `shadow-lg` |
| Floating overlays, specimen tile, brand-panel glass card | `shadow-md` / `shadow-lg` |

**Cards carry no shadow at rest.** Inputs carry no shadow.

---

## Layout

### The rail frame

Every public page renders inside `<RailFrame>`, which owns the navbar, `<main>`, the footer and the
rails. Pages never import `Navbar` or `Footer` directly.

- **Column** (`rail-column`): `min(95vw, 1440px)`, `min(90vw, 1440px)` from `md`, `min(85vw, 1800px)`
  from 1536px.
- **Rails:** two fixed 2px dashed lines on the column edges in `--border` (`rail-dash border-x-2`).
- **Rows:** `<RailRow>` = a full-bleed 2px dashed rule, then the column with `p-3 sm:p-6`. The first
  row passes `divider={false}`. `label` names the section for assistive tech.

### Row paddings (from the reference)

| Row | Padding |
| --- | --- |
| Landing hero | `pt-32 sm:pt-36 pb-4 sm:pb-6`; hero grid `lg:h-[calc(100svh-10rem)] lg:max-h-195` |
| Tool finder | `py-10 sm:py-14`, inner `py-6`, halves `gap-5` |
| Bento, CTA, generic rows | `p-3 sm:p-6` |
| FAQ / split sections | inner `px-1 sm:px-4 lg:px-16`, `py-6 sm:py-8 lg:py-10`, title column `lg:w-110`, `lg:gap-20` |
| Footer | `py-10 sm:py-14` |

The navbar floats (`fixed`), so the first row carries the navbar's height in its top padding.

### Page primitives (`src/components/site`)

| Component | Shape |
| --- | --- |
| `PageHero` | Tilted check chip, h1 with emerald second line, lede, actions, optional `aside` column |
| `SplitSection` | Title + accent + description (+ `aside`) left, content right; `sticky` keeps the title in view |
| `BrandPanel` | `panel-brand` 22px card, centred white h2, body, `ink` + `light` actions |
| `FaqList variant="cards"` | Numbered 18px cards, emerald index, chevron rotates, one open |

### Pages

- **Home** (`Web.Home`): hero (`HeroSection` + `HeroIllustration`), tool finder, benefits bento, FAQ,
  closing CTA, footer.
- **About, Docs, Changelog, Download, Install, Privacy, Terms**: `PageHero`, then `SplitSection` rows of
  `panel-card`s, ending in a `BrandPanel` where there is a next step. Docs owns the technical detail
  (engines, runtimes); marketing pages speak to non-technical visitors.
- **Error**: canvas + rails, one `panel-card`, the same h1 + accent pattern.
- **Desktop home** (`Desktop.Home`): rendered at `/` in Tauri, or on the web with `/?mode=desktop`
  (shows "Exit preview"). App toolbar with search (`/` focuses it), greeting, recent or popular tools,
  category sidebar + compact tool grid. No marketing sections, no rails. It owns its scroll inside
  the fixed Tauri frame.

---

## App workspace shell

Every `(app)` route (`/home`, `/explore`, `/tools/*`) renders inside `WorkspaceShell`
([src/components/workspace](src/components/workspace)). Option A of the shell review: rail,
tools panel, context bar, workspace, inspector, action bar.

| Region | Size | Behaviour |
| --- | --- | --- |
| Rail | 56px, `bg-canvas` | Logo mark, Home, Explore, Search, panel toggle, up to 5 recent tools, Docs, desktop app (web), theme. 40px targets, tooltips on the right. Hidden below `md`. |
| Tools panel | 256px, `bg-canvas` | Filterable tool list by category, no visible scrollbar. Inline from 1280px; opens and closes with a 300ms width + fade (`ease-craft`), remembered in `localStorage`. An 8px edge strip between panel and card toggles it (hover shows a line, `w-resize`/`e-resize` cursor). Below 1280px, and on immersive tools, a left drawer; on mobile a bottom drawer. |
| Workspace card | fills the rest | `workspace-surface`: `--workspace` (`#ffffff` light, `#111111` dark) and re-points `--background` for everything inside, so the card lifts off the `#0a0a0a` canvas in dark as it does in light. 14px radius, hairline, `shadow-xs`, 8px inset from `md`. Full-bleed on mobile. |
| Context bar | 56px min | Tool icon + `h1` title + category, or the page name. Centred search trigger (`md`+), Settings button when an inspector exists below 1280px, Share. |
| Workspace (`main#workspace`) | flex-1 | The only scroll container. Tool sticky bars stick to it. |
| Inspector | 320px | Filled by a tool via `<WorkspaceInspector title>`. Right column from 1280px, right drawer below, bottom drawer on mobile. |
| Action bar | auto | Filled via `<WorkspaceActionBar>`. Pinned under the workspace with safe-area padding. |
| Mobile tab bar | 56px min | Home, Explore, Search, Tools (opens the panel drawer). Hidden for immersive tools. |

### Tool layouts

Each tool may declare `layout` in [list.ts](src/tools/list.ts):

| Value | Workspace | Guide below | Tools |
| --- | --- | --- | --- |
| `form` (default) | Centred, `max-w-5xl`, padded | Web only | Single-file, batch, readout tools |
| `canvas` | Full width, padded | Web only | Page grids, crop, eSign, bookmarks, multi-tool, images to PDF |
| `immersive` | Whole workspace, no padding, no page scroll, no panel or tab bar | Never | View PDF, Edit PDF |

On the web, non-immersive tool pages continue below the workspace on `bg-canvas`: one ad, About,
How it works, use cases, FAQ cards, related tools. The desktop app shows none of it.

### Overlays

Prefer drawers (`vaul-svelte`, `$components/ui/drawer`) over dialogs: bottom on mobile, side on
tablet and desktop, `shouldScaleBackground={false}`. The command menu is a centred dialog on desktop
and a bottom drawer on mobile; it is mounted once by the shell and opened through
`workspace.searchOpen` (⌘K / Ctrl K, the rail, the tab bar, `SearchTrigger`).

### Active and focus states in the shell

- Active nav item: `bg-muted`, medium weight, emerald icon. No ring, no shadow.
- Hover: `bg-muted/60`.
- Keyboard focus: `ring-2 ring-inset ring-ring` (inset so it never clips inside scroll areas).
- Text fields in the shell: border turns `--ring` on focus, no outer ring.
- Scrollbars: hidden in the rail and tools panel (`no-scrollbar`); thin and gutterless in the
  workspace and inspector (`scrollbar-subtle`).

### Explore and Home

- **Explore** (`ToolLauncher`): tilted chip, question headline with emerald key words, a glass card
  (`bg-card/85`, blur, `shadow-lg`) holding category chips (active chip: emerald icon tile) over a
  56px search field with "Choose a file" and a round submit, on the plain workspace surface with no
  background decoration. Enter opens the best match.
  Below it, the library: one section per category, `ToolCard` grid.
- **Home** (`WorkspaceHome`): greeting, "Start with a file" drop card + "Jump back in" recent list,
  four popular tools, category cards linking to Explore's filters.
- **ToolCard**: 18px card, 40px bordered icon tile (emerald on hover), 16px title, two-line
  description, arrow appears on hover. No footer.

### Tool template

Reference implementation: [compress-pdf/tool.svelte](src/tools/compress-pdf/tool.svelte). Every
tool moves through the same four states, built from `$components/tool`:

| State | Workspace | Inspector | Action bar |
| --- | --- | --- | --- |
| Empty | `UploadArea`: 18px dashed card, 56px emerald icon tile, `text-heading-sm` title naming the job ("Drop PDFs to compress"), one-line promise, emerald "Choose files", meta line (type · size limit · stays on this device) | none | none |
| Loaded | `ToolBar` (title, count, total size, Add files, Clear all), then `FileRow`s (40px icon tile, name, size line, `StatusPill`, 36px remove) | `WorkspaceInspector` with `OptionGroup`s | `ToolFooter`: summary left, one `variant="primary"` action right ("Compress 3 files") |
| Running | Rows show per-file `StatusPill` | Controls stay editable for the next run | `ProgressLine` (label, "2 of 5", determinate bar); action disabled with "…" label |
| Done | `ResultCard` above the list: check glyph, outcome in numbers ("Saved 8.1 MB"), Download again, Start over, then "Continue with" suggestions that hand the output files to the next tool | unchanged | summary says what's left |

Inspector controls:

- `SegmentedControl`: 2-4 short, mutually exclusive modes (native radios, arrow-key friendly).
- `ChoiceList`: 3-5 options that each need a one-line hint (radio cards, emerald when selected).
- `OptionToggle`: on/off extras as a label, hint and `Switch`. Disable, don't hide, options that
  don't apply to the chosen mode, and say why in the group description.
- `OptionGroup`: label + optional description around any control. Groups sit 24px apart.

Controls that sit next to each other share one height:

| Height | Button | Other controls | Where |
| --- | --- | --- | --- |
| 40px | `default`, `icon` | Input, Select, `SegmentedControl` (default) | Inspector, action bar, result cards |
| 36px | `sm`, `icon-sm` | Row inputs (`h-9`), Select `sm`, `SegmentedControl size="sm"` | `ToolBar` actions, file rows, page cards |
| 28px | `xs`, `icon-xs` | none | Dense chips only, never as a primary touch target |

Never override a Button's height or size with a class; pick the size that matches its neighbours.

Base form controls (`$components/ui`) share one spec so inner tool forms match the template:

| Control | Spec |
| --- | --- |
| Input | 40px, `rounded-lg`, `border-border`, `bg-background`, `text-body`, placeholder `--placeholder`; focus turns the border `--ring`; invalid turns it `--destructive`. 16px text below `md` so iOS doesn't zoom. |
| Textarea | Same, `rounded-xl`, `py-2.5`, `leading-relaxed`, grows with content. |
| Select | 40px trigger (36px `sm`), chevron in `text-muted-foreground`, border `--ring` while open; menu `rounded-xl shadow-lg`, 36px items, emerald check on the selected item. |
| Label | `text-body font-medium text-foreground`. |
| Checkbox | 16px, `rounded-xs`, `border-placeholder` (3:1 boundary), emerald when checked. |

Tool bodies drop "Quick tips" boxes: guidance is one `text-body text-muted-foreground` line above
the content it explains, or a placeholder in the field itself.

`ToolFooter` renders into the shell's pinned action bar through `WorkspaceActionBar`, so every tool
using it gets a pinned primary action without further changes. Tools that auto-download still show
the `ResultCard` so the outcome and next step are visible.

### File hand-off

Dropping or choosing a file on Explore or Home shows `FileSuggestions`: the tools that can open it
(PDFs: 12 common tools; images: Image to PDF). Picking one calls `openFilesInTool`, and the tool's
primary `UploadArea` takes the files on mount (`takePendingFiles`), so the file is never chosen
twice. Files meant for one page are discarded if the user lands anywhere else.

### File drops

Tauri drops go to the earliest registered `UploadArea` on the page (the primary intake), not the
last one mounted.

### PDF editor chrome (View PDF, Edit PDF)

The embedpdf renderers in [pdf-editor](src/components/application/pdf-editor) build every control
from `chromeButton` in `chrome.ts`, so the chrome follows the 36px row of the height table.

| Part | Spec |
| --- | --- |
| Document tabs | 48px row, `border-b`. 176px tabs, 36px tall, `rounded-lg`: active `bg-muted`, medium weight, emerald PDF icon. 28px close button (on hover or active with a fine pointer, always visible on touch). Arrow keys move between tabs. 36px "Open another PDF". |
| Toolbars | 48px min, `bg-background`, `border-b`, 8px side padding. Secondary toolbars look the same (no tint). 20px dividers. |
| Command buttons | 36px, `rounded-lg`, 18px icon. Idle muted, hover `bg-muted/60`; active (pressed) `bg-muted` + emerald; disabled `text-placeholder`, no opacity. `aria-label` + shortcut in the title. |
| Mode tabs | `SegmentedControl size="sm"` look: 36px `bg-muted` track, white active thumb with `shadow-sm`. |
| Zoom | 36px bordered field (percentage + menu chevron), then zoom out/in buttons. |
| Canvas | `bg-canvas`, 16px page gap, white pages with a hairline and soft shadow. |
| Page controls | Floating `chromeFloating` pill at the bottom: prev, 36px page field, "of N", next. Shows on scroll, hides after 2.5s unless hovered or focused. |
| Sidebars | Left pages panel 256px (Thumbnails / Outline segmented header), right search and comments 320px, each with a 48px header and close button. Bottom drawer on mobile. |
| Menus | `chromeFloating`, 224px min, 36px rows (44px in the mobile bottom drawer), muted icons, emerald check for the active item, caption section labels. Arrow keys, Home/End, Esc, and flips above the anchor near the bottom edge. |
| Selection menu | `chromeFloating` toolbar of 36px buttons, 6px from the selection. |
| Link | Right drawer (bottom on mobile): `SegmentedControl` URL/Page, 40px field, ghost Cancel + primary Insert link. |
| States | Loading: emerald spinner + `text-body` message. Locked PDF: card with lock tile, password field, wrong-password error. Unreadable PDF and engine failure: card with the reason. All tabs closed: `UploadArea`. |

### Create PDF studio

[create-pdf](src/tools/create-pdf) is an immersive block editor that renders with Forme (Rust to
WASM, lazy-loaded on first preview or download). The page is paper, not UI: it keeps white and its
own theme in both app themes.

| Part | Spec |
| --- | --- |
| Start screen | Tilted count chip, `text-heading-lg` headline, "Continue editing" draft rows (40px accent tile), template filter chips (36px, active `bg-foreground`), template cards with a live read-only thumbnail of the page. |
| Toolbar | 48px: back, inline name field, save status caption, undo/redo, Preview (outline sm), Download PDF (primary sm), more menu. |
| Left panel | 256px from 1280px (drawer below): `SegmentedControl` Blocks / Fields. Block rows are 48px with a 28px icon tile and one-line description. |
| Canvas | `bg-canvas`, page at true point size scaled to fit (0.4 to 1.3). Hover: 1px emerald outline; selected: 2px `#10b981`. Gutter "+" and drag handle outside the text column (fine pointers only). Fields render as emerald chips until "Show values" is on. |
| Right panel | 320px from 1024px (drawer below, bottom on mobile): selected block's fields, or Document (theme cards, accent swatches, page, header, footer, watermark). |
| Mobile | Bottom bar with Add block and Edit block / Document, both drawers. |
| Preview | Right drawer (bottom on mobile) with the real pages rendered by pdf.js. |

Themes use the built-in PDF fonts (Helvetica, Times, Courier) so output is identical offline.

Immersive tools keep the canvas width stable: the rail's panel toggle opens the tools panel as a
left drawer instead of pushing the editor. Shell containers use `overflow-clip`, so focus or
`scrollIntoView` inside the editor can never shift the shell sideways.

---

## Components

### Navbar

`FloatingMenu`'s behaviour is untouched; styling comes through its `classes` prop in
[navbar.svelte](src/components/common/navbar.svelte): 14px radius, one hairline, `bg-background/80`
with blur, `shadow-sm` (`--shadow-craft-floating`), 40px controls with 8px radius, muted ghost
GitHub link, emerald filled Download.

### Buttons

| Variant | Treatment |
| --- | --- |
| `default` | Near-black fill (`--action`), flips to near-white in dark. |
| `primary` | Emerald fill. The page's brand action (hero, download). |
| `outline` | Card fill, hairline. Secondary actions. |
| `ghost` | Transparent, muted fill on hover. |
| `ink` | Fixed near-black in both themes. Primary action on a brand panel. |
| `light` | Fixed white in both themes. Secondary action on a brand panel. |
| `destructive` | Destructive fill. |

The hero pairs `primary` + `default`, as the reference pairs brand + black. Default size is 40px.
Press feedback is `active:scale-[0.98]`. Focus is a 2px `--ring` with a 2px offset.

### Tool finder

Left: a white plate with corner brackets, a faint 24px grid, the hovered tool's icon in a thick-bordered
tile, title, description, "Open tool". Right: `panel-brand-tall` with a glass card (`bg-white/10`,
`backdrop-blur-[2px]`), a white search field, 40px white tiles with 12px white labels, and an icon
segmented control on a white track with a skeuomorphic sliding thumb.

### Hero illustration

`HeroIllustration.svelte` generates isometric line art from box and ramp definitions (30° projection)
in the reference's style: canvas-toned faces, `--foreground` 1.25px strokes, hatched ramps, emerald
accent tile, pillars fading into the canvas through a mask. A document travels from the input
pillar to the output pillar on a 7s loop; the cloud is crossed out. Height is capped at
`min(34rem, 100svh - 14rem)` so it never collides with the navbar.

### Bento

Transparent cards, `rounded-2xl md:rounded-3xl`, `hover:shadow-lg`. Visuals are white inset cards
over the canvas. Every card states a user benefit in plain language (privacy, offline, signing,
tool range, no account). No stack names, protocols or runtimes on marketing pages.

### Boot splash

Inline in [app.html](src/app.html), so it paints before any CSS or font loads: `--canvas` ground,
the 44px logo mark in `--foreground` drawing in (1.1s), a 96px × 2px track with an emerald segment
sliding across. Content fades in after 150ms, so fast loads show only the canvas. A head script
applies the stored mode-watcher theme before first paint. The root layout sets `data-done` on
mount (200ms fade), then removes it.

### Error pages

`ErrorState` ([common/ErrorState.svelte](src/components/common/ErrorState.svelte)) drives both
error pages: tilted "Error 404" chip, `text-display` headline ("This tool doesn't exist"), one-line
lede, primary + outline actions, collapsible error details for non-404s, four popular tools as 36px
icon rows on a 404, and a support link.

- `src/routes/+error.svelte`: inside `RailFrame` (navbar, footer, rails), hero spacing.
- `src/routes/(app)/+error.svelte`: inside the workspace shell. On a 404 the primary action opens
  the tool search.

### Tilted chips

`-rotate-2` to `rotate-6` label chips. Hairline, 8px radius, 12px semibold. At most two per view.

---

## Motion

One entry/exit curve: `--ease-craft` = `cubic-bezier(0.32, 0.72, 0, 1)`.

| Use | Duration |
| --- | --- |
| Press feedback | 100ms |
| Hover / state colour change | 150-200ms |
| Segmented thumb, panel | 300ms |
| Overlay enter / exit | 200 / 150ms |

Ambient loops (all stop under `prefers-reduced-motion`): hero document travel (7s), bento signature
draw (4.5s), bento tool marquee (48s, pauses on hover), CTA floating glyphs.

**Svelte `transition:` directives bypass the CSS reduced-motion guard.** Use `rise()` and `stagger()`
from [motion.ts](src/lib/motion.ts); never hand-roll `in:fly` with raw values.

---

## Dos and Don'ts

**Do**

- Build public pages from `RailFrame` → `RailRow` → `PageHero` / `SplitSection` / `panel-card`.
- Use the role table for every text size.
- Put the emerald on the key words of a title, on a second line.
- Write marketing copy for non-technical people; keep engine and runtime detail in Docs.
- Test in light and dark, and at 125% OS scaling.

**Don't**

- Don't fade text tokens with an opacity modifier.
- Don't use emerald-600 or a flat emerald fill as a background.
- Don't put a fake metric in a marketing visual. If a number is shown, it must be true.
- Don't write `text-[13px]` or any other ad-hoc size or radius.
- Don't add a size or shadow token without registering it in `twMergeConfig`.
- Don't place small text over the bright streak of a brand panel.

---

## Scope

Public pages and the shared `components/ui` primitives are the reference implementation. The `(app)`
shell and PDF editor inherit the tokens; where they diverge it is for density.

The browser extension's side panel (`extension/entrypoints/side-panel/app.css`) carries its own token
copy. Only its brand colour tracks this document; its neutrals and font still predate the redesign.
