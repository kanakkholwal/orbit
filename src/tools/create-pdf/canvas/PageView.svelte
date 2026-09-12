<script lang="ts">
  import { sortableList } from "$lib/actions/sortable-list";
  import { cn } from "$lib/utils";
  import { IconGripVertical as Grip, IconPlus as Plus } from "@tabler/icons-svelte";
  import { Popover } from "bits-ui";
  import { fill } from "../model/fields";
  import { CSS_FONTS, getTheme, MARGIN_POINTS, pageBox } from "../model/themes";
  import type { Block, BlockType, CreatorDoc } from "../model/types";
  import BlockPicker from "../panels/BlockPicker.svelte";
  import type { CreatorState } from "../state.svelte";
  import BlockView from "./BlockView.svelte";
  import RichText from "./RichText.svelte";

  type Props = {
    doc: CreatorDoc;
    /** Omit for a read-only thumbnail. */
    studio?: CreatorState;
    zoom?: number;
    class?: string;
  };

  let { doc, studio, zoom = 1, class: className }: Props = $props();

  const readonly = $derived(!studio);
  const theme = $derived(getTheme(doc.theme, doc.accent));
  const box = $derived(pageBox(doc.settings.size, doc.settings.orientation));
  const margin = $derived(MARGIN_POINTS[doc.settings.margin]);
  const contentWidth = $derived(box.width - margin * 2);
  const showValues = $derived(readonly || (studio?.showValues ?? false));

  let pickerOpen = $state(false);
  let pickerIndex = $state(0);
  let pickerReplace = $state<string | null>(null);
  let pickerAnchor = $state<HTMLElement | null>(null);

  const cssVars = $derived(
    [
      `--cp-primary:${theme.colors.primary}`,
      `--cp-fg:${theme.colors.foreground}`,
      `--cp-muted:${theme.colors.muted}`,
      `--cp-muted-fg:${theme.colors.mutedForeground}`,
      `--cp-border:${theme.colors.border}`,
      `--cp-body-font:${CSS_FONTS[theme.fonts.body]}`,
      `--cp-heading-font:${CSS_FONTS[theme.fonts.heading]}`,
      `--cp-body:${theme.bodySize}px`,
      `--cp-lh:${theme.lineHeight}`,
      `--cp-hw:${theme.headingWeight}`,
      `--cp-h1:${theme.headingSizes[0]}px`,
      `--cp-h2:${theme.headingSizes[1]}px`,
      `--cp-h3:${theme.headingSizes[2]}px`,
      `--cp-radius:${theme.radius}px`,
      `zoom:${zoom}`,
      `width:${box.width}px`,
      `min-height:${box.height}px`,
      `padding:${margin}px`,
    ].join(";")
  );

  function spacing(block: Block): { top: number; bottom: number } {
    const gap = theme.gap;
    switch (block.type) {
      case "title":
      case "letterhead":
        return { top: 0, bottom: gap * 1.6 };
      case "addresses":
        return { top: 0, bottom: gap * 1.4 };
      case "heading":
        return { top: block.props.level === 1 ? 0 : gap * 0.6, bottom: gap * 0.6 };
      case "divider": {
        const space = block.props.space === "sm" ? 4 : block.props.space === "lg" ? 18 : 10;
        return { top: space, bottom: space + gap * 0.5 };
      }
      case "signature":
        return { top: gap, bottom: gap };
      case "spacer":
        return { top: 0, bottom: 0 };
      case "pageBreak":
        return { top: 6, bottom: 6 };
      default:
        return { top: 0, bottom: gap };
    }
  }

  function openPicker(anchor: HTMLElement, index: number, replace: string | null = null) {
    pickerAnchor = anchor;
    pickerIndex = index;
    pickerReplace = replace;
    pickerOpen = true;
  }

  function pick(type: BlockType) {
    if (!studio) return;
    pickerOpen = false;
    if (pickerReplace) studio.replace(pickerReplace, type);
    else studio.insert(type, pickerIndex);
    const block = studio.selected;
    if (block) studio.focusBlock(block);
  }
</script>

<div
  class={cn("cp-page", className)}
  style={cssVars}
  role="presentation"
  onclick={(e) => {
    if (studio && e.target === e.currentTarget) studio.selectedId = null;
  }}
>
  {#if doc.settings.watermark.enabled && doc.settings.watermark.text}
    <div class="cp-watermark" aria-hidden="true">{fill(doc.settings.watermark.text, doc.data)}</div>
  {/if}

  {#if doc.settings.header.enabled}
    <div class="cp-chrome cp-header">
      <RichText value={doc.settings.header.left} data={doc.data} {showValues} readonly />
      <RichText value={doc.settings.header.right} data={doc.data} {showValues} readonly />
    </div>
  {/if}

  <div
    class="cp-blocks"
    use:sortableList={{
      onReorder: (from, to) => studio?.move(from, to),
      options: { handle: ".cp-handle", disabled: readonly, animation: 160, ghostClass: "cp-ghost" },
    }}
  >
    {#each doc.blocks as block, index (block.id)}
      {@const space = spacing(block)}
      {@const selected = studio?.selectedId === block.id}
      <div
        class="cp-frame"
        class:cp-selected={selected}
        class:cp-interactive={!readonly}
        data-block-id={block.id}
        style:margin-top={`${space.top}px`}
        style:margin-bottom={`${space.bottom}px`}
        role="presentation"
        onpointerdown={() => {
          if (studio && studio.selectedId !== block.id) studio.selectedId = block.id;
        }}
      >
        {#if !readonly}
          <div class="cp-gutter" style:top={`${Math.max(0, -space.top)}px`}>
            <button type="button" class="cp-gutter-btn" aria-label="Add block below" title="Add block below" onclick={(e) => openPicker(e.currentTarget, index + 1)}>
              <Plus size={15} />
            </button>
            <button type="button" class="cp-gutter-btn cp-handle" aria-label="Drag to reorder" title="Drag to reorder">
              <Grip size={15} />
            </button>
          </div>
        {/if}
        <BlockView
          {block}
          {theme}
          data={doc.data}
          {showValues}
          readonly={readonly || showValues}
          {contentWidth}
          focusKey={studio?.focusKey ?? null}
          onfocused={() => {
            if (studio) studio.focusKey = null;
          }}
          update={(patch, tag) => studio?.updateProps(block.id, patch, tag)}
          requestFocus={(key) => {
            if (studio) studio.focusKey = key;
          }}
          onslash={() => {
            const anchor = document.querySelector<HTMLElement>(`[data-block-id="${block.id}"]`);
            if (anchor) openPicker(anchor, index, block.id);
          }}
        />
      </div>
    {/each}
  </div>

  {#if !readonly}
    <button type="button" class="cp-add" onclick={(e) => openPicker(e.currentTarget, doc.blocks.length)}>
      <Plus size={16} />
      Add block
    </button>
  {/if}

  {#if doc.settings.footer.enabled}
    <div class="cp-chrome cp-footer">
      <RichText value={doc.settings.footer.left} data={doc.data} {showValues} readonly />
      <span>{doc.settings.footer.pageNumbers ? "Page 1 of 1" : ""}</span>
    </div>
  {/if}
</div>

{#if studio}
  <Popover.Root bind:open={pickerOpen}>
    <Popover.Portal>
      <Popover.Content
        customAnchor={pickerAnchor}
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={12}
        class="z-50 flex h-[min(26rem,calc(100dvh-6rem))] w-72 flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none"
      >
        <BlockPicker onpick={pick} autofocus class="h-full" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
{/if}

<style>
  .cp-page {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background: #ffffff;
    color: var(--cp-fg);
    font-family: var(--cp-body-font);
    font-size: var(--cp-body);
    line-height: var(--cp-lh);
    color-scheme: light;
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 0.06),
      0 1px 2px rgb(0 0 0 / 0.06),
      0 12px 32px -12px rgb(0 0 0 / 0.18);
  }
  .cp-blocks {
    display: flex;
    flex-direction: column;
  }
  .cp-watermark {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 72px;
    font-weight: 700;
    color: var(--cp-fg);
    opacity: 0.06;
    transform: rotate(-40deg);
    pointer-events: none;
    user-select: none;
  }
  .cp-chrome {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 8px;
    color: var(--cp-muted-fg);
  }
  .cp-header {
    padding-bottom: 8px;
    margin-bottom: 20px;
    border-bottom: 0.5px solid var(--cp-border);
  }
  .cp-footer {
    margin-top: auto;
    padding-top: 8px;
    border-top: 0.5px solid var(--cp-border);
  }
  .cp-add + .cp-footer {
    margin-top: auto;
  }

  .cp-frame {
    position: relative;
    border-radius: 3px;
  }
  .cp-interactive::before {
    content: "";
    position: absolute;
    inset: -4px -8px;
    border-radius: 6px;
    pointer-events: none;
    box-shadow: 0 0 0 1px transparent;
    transition: box-shadow 150ms;
  }
  .cp-interactive:hover::before {
    box-shadow: 0 0 0 1px rgb(16 185 129 / 0.35);
  }
  .cp-selected::before,
  .cp-selected:hover::before {
    box-shadow: 0 0 0 2px #10b981;
  }
  .cp-gutter {
    position: absolute;
    left: -44px;
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 150ms;
  }
  .cp-frame:hover .cp-gutter,
  .cp-selected .cp-gutter,
  .cp-gutter:focus-within {
    opacity: 1;
  }
  @media (pointer: coarse) {
    .cp-gutter {
      display: none;
    }
  }
  .cp-gutter-btn {
    display: grid;
    place-items: center;
    width: 20px;
    height: 22px;
    border-radius: 5px;
    color: #737373;
  }
  .cp-gutter-btn:hover {
    background: #f0f0f0;
    color: #171717;
  }
  .cp-gutter-btn:focus-visible {
    outline: 2px solid #10b981;
  }
  .cp-handle {
    cursor: grab;
  }
  :global(.cp-ghost) {
    opacity: 0.4;
  }
  .cp-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 8px;
    height: 34px;
    border: 1px dashed #d4d4d4;
    border-radius: 8px;
    font-family: Inter, system-ui, sans-serif;
    font-size: 12px;
    color: #737373;
    transition:
      border-color 150ms,
      color 150ms,
      background 150ms;
  }
  .cp-add:hover {
    border-color: #10b981;
    color: #047857;
    background: #f0fdf4;
  }
  .cp-add:focus-visible {
    outline: 2px solid #10b981;
    outline-offset: 2px;
  }

  .cp-page :global(.cp-text),
  .cp-page :global(.cp-editable) {
    outline: none;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    min-width: 1ch;
    border-radius: 2px;
  }
  .cp-page :global(.cp-editable) {
    box-shadow: 0 0 0 3px rgb(16 185 129 / 0.12);
    cursor: text;
  }
  .cp-page :global(.cp-text[role="textbox"]) {
    cursor: text;
  }
  .cp-page :global(.cp-editable:empty::before),
  .cp-page :global(.cp-empty::before) {
    content: attr(data-placeholder);
    color: #a3a3a3;
  }
  .cp-page :global(.cp-frame:not(.cp-selected) .cp-optional) {
    display: none;
  }
  .cp-page :global(.cp-field) {
    display: inline;
    padding: 0 3px;
    border-radius: 3px;
    background: #d1fae5;
    color: #065f46;
    font-weight: 600;
    box-decoration-break: clone;
  }
  .cp-page :global(.cp-field-filled) {
    background: transparent;
  }
  .cp-page :global(strong),
  .cp-page :global(.cp-strong) {
    font-weight: 700;
  }
  .cp-page :global(.cp-muted) {
    color: var(--cp-muted-fg);
  }
  .cp-page :global(.cp-small) {
    font-size: calc(var(--cp-body) - 1px);
  }
  .cp-page :global(.cp-tiny) {
    font-size: calc(var(--cp-body) - 2px);
  }
  .cp-page :global(.cp-mono) {
    font-family: "Courier New", Courier, monospace;
  }
  .cp-page :global(.cp-pre) {
    line-height: 1.45;
  }
  .cp-page :global(.cp-row) {
    display: flex;
  }
  .cp-page :global(.cp-col) {
    display: flex;
    flex-direction: column;
  }
  .cp-page :global(.cp-center) {
    align-items: center;
  }
  .cp-page :global(.cp-between) {
    justify-content: space-between;
    gap: 12px;
  }
  .cp-page :global(.cp-tight) {
    padding: 3px 0;
  }
  .cp-page :global(.cp-label) {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--cp-muted-fg);
    margin-bottom: 5px;
  }
  .cp-page :global(.cp-eyebrow) {
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--cp-primary);
    margin-bottom: 8px;
  }
  .cp-page :global(.cp-title-text) {
    font-family: var(--cp-heading-font);
    font-size: calc(var(--cp-h1) * 1.2);
    font-weight: var(--cp-hw);
    line-height: 1.1;
  }
  .cp-page :global(.cp-subtitle) {
    font-size: calc(var(--cp-body) + 2.5px);
    color: var(--cp-muted-fg);
    margin-top: 8px;
  }
  .cp-page :global(.cp-h) {
    font-family: var(--cp-heading-font);
    font-weight: var(--cp-hw);
    line-height: 1.25;
  }
  .cp-page :global(.cp-h1) {
    font-size: var(--cp-h1);
  }
  .cp-page :global(.cp-h2) {
    font-size: var(--cp-h2);
  }
  .cp-page :global(.cp-h3) {
    font-size: var(--cp-h3);
  }
  .cp-page :global(.cp-p-sm) {
    font-size: calc(var(--cp-body) - 1.5px);
  }
  .cp-page :global(.cp-p-lg) {
    font-size: calc(var(--cp-body) + 2px);
  }
  .cp-page :global(.cp-quote) {
    border-left: 3px solid var(--cp-primary);
    padding: 2px 0 2px 14px;
  }
  .cp-page :global(.cp-quote-text) {
    font-size: calc(var(--cp-body) + 2px);
    font-style: italic;
    line-height: 1.45;
    margin-bottom: 6px;
  }
  .cp-page :global(.cp-list) {
    margin: 0;
    padding-left: 16px;
    list-style: disc;
  }
  .cp-page :global(.cp-ol) {
    list-style: decimal;
  }
  .cp-page :global(.cp-list li) {
    margin-bottom: 3px;
    padding-left: 2px;
  }
  .cp-page :global(.cp-check-row) {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
  }
  .cp-page :global(.cp-box) {
    width: 10px;
    height: 10px;
    flex: none;
    border: 1px solid var(--cp-muted-fg);
    border-radius: 2px;
    background: #fff;
    cursor: pointer;
  }
  .cp-page :global(.cp-done .cp-box) {
    border-color: var(--cp-primary);
    background: var(--cp-primary);
  }
  .cp-page :global(.cp-done .cp-text) {
    color: var(--cp-muted-fg);
    text-decoration: line-through;
  }
  .cp-page :global(.cp-code) {
    margin: 0;
    padding: 12px;
    border-radius: var(--cp-radius);
    background: var(--cp-muted);
    font-family: "Courier New", Courier, monospace;
    font-size: calc(var(--cp-body) - 1px);
    line-height: 1.5;
  }
  .cp-page :global(.cp-fine) {
    font-size: calc(var(--cp-body) - 2px);
    color: var(--cp-muted-fg);
    line-height: 1.5;
  }
  .cp-page :global(.cp-spacer) {
    display: grid;
    place-items: center;
    background: repeating-linear-gradient(135deg, transparent 0 6px, rgb(16 185 129 / 0.06) 6px 12px);
    border-radius: 3px;
  }
  .cp-page :global(.cp-spacer span) {
    font: 600 9px Inter, system-ui, sans-serif;
    color: #10b981;
    opacity: 0;
  }
  .cp-page :global(.cp-frame:hover .cp-spacer span) {
    opacity: 1;
  }
  .cp-page :global(.cp-break) {
    position: relative;
    display: flex;
    justify-content: center;
    margin: 0 -24px;
    border-top: 1px dashed #a3a3a3;
  }
  .cp-page :global(.cp-break span) {
    position: relative;
    top: -8px;
    padding: 0 8px;
    background: #fff;
    font: 600 9px Inter, system-ui, sans-serif;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: #737373;
  }
  .cp-page :global(.cp-columns) {
    display: flex;
    gap: 18px;
  }
  .cp-page :global(.cp-columns > *) {
    min-width: 0;
  }
  .cp-page :global(.cp-card) {
    padding: 14px;
    border-radius: var(--cp-radius);
  }
  .cp-page :global(.cp-card-title) {
    font-family: var(--cp-heading-font);
    font-weight: 700;
    font-size: calc(var(--cp-body) + 1.5px);
    margin-bottom: 4px;
  }
  .cp-page :global(.cp-letterhead) {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 0.75px solid var(--cp-border);
  }
  .cp-page :global(.cp-brand) {
    font-family: var(--cp-heading-font);
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--cp-primary);
  }
  .cp-page :global(.cp-table) {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .cp-page :global(.cp-table th) {
    padding: 6px 8px;
    border-bottom: 1px solid var(--cp-fg);
    font-size: calc(var(--cp-body) - 1.5px);
    font-weight: 700;
    color: var(--cp-muted-fg);
  }
  .cp-page :global(.cp-table td) {
    padding: 6px 8px;
    border-bottom: 0.5px solid var(--cp-border);
    vertical-align: top;
  }
  .cp-page :global(.cp-kv) {
    display: flex;
    flex-direction: column;
  }
  .cp-page :global(.cp-kv-2) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .cp-page :global(.cp-kv-row) {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0;
    border-bottom: 0.5px solid var(--cp-border);
    width: 100%;
  }
  .cp-page :global(.cp-kv-2 .cp-kv-row) {
    width: 48%;
  }
  .cp-page :global(.cp-totals) {
    display: flex;
    justify-content: flex-end;
  }
  .cp-page :global(.cp-total) {
    margin-top: 4px;
    padding-top: 7px;
    font-weight: 700;
    font-size: calc(var(--cp-body) + 2px);
    color: var(--cp-primary);
  }
  .cp-page :global(.cp-stat) {
    flex: 1;
    min-width: 0;
    padding: 12px;
    border-radius: var(--cp-radius);
  }
  .cp-page :global(.cp-stat .cp-label) {
    margin-bottom: 4px;
  }
  .cp-page :global(.cp-stat-value) {
    font-family: var(--cp-heading-font);
    font-size: 20px;
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 3px;
  }
  .cp-page :global(.cp-track) {
    height: 5px;
    border-radius: 3px;
    overflow: hidden;
  }
  .cp-page :global(.cp-track > div) {
    height: 100%;
    border-radius: 3px;
  }
  .cp-page :global(.cp-bars) {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    height: 150px;
    padding-left: 24px;
    border-left: 0.75px solid var(--cp-fg);
    border-bottom: 0.75px solid var(--cp-fg);
  }
  .cp-page :global(.cp-bar-col) {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 2px;
  }
  .cp-page :global(.cp-bar) {
    width: 100%;
    min-height: 1px;
  }
  .cp-page :global(.cp-bar-labels) {
    display: flex;
    gap: 6px;
    padding-left: 24px;
    margin-top: 4px;
    font-size: 7.5px;
    color: var(--cp-muted-fg);
  }
  .cp-page :global(.cp-bar-labels span) {
    flex: 1;
    text-align: center;
  }
  .cp-page :global(.cp-pie) {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 50%;
  }
  .cp-page :global(.cp-pie div) {
    position: absolute;
    inset: 25%;
    border-radius: 50%;
    background: #fff;
  }
  .cp-page :global(.cp-legend) {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 8px;
  }
  .cp-page :global(.cp-legend span) {
    width: 8px;
    height: 8px;
  }
  .cp-page :global(.cp-tl-rail) {
    width: 9px;
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cp-page :global(.cp-tl-rail span) {
    width: 7px;
    height: 7px;
    margin-top: 4px;
    border-radius: 50%;
  }
  .cp-page :global(.cp-tl-rail i) {
    width: 1px;
    flex: 1;
    margin-top: 2px;
  }
  .cp-page :global(.cp-badge) {
    padding: 2px 8px;
    border-radius: 999px;
    font-size: calc(var(--cp-body) - 2px);
    font-weight: 700;
    line-height: 1.3;
  }
  .cp-page :global(.cp-placeholder) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    aspect-ratio: 16 / 10;
    border: 1px dashed #d4d4d4;
    border-radius: var(--cp-radius);
    background: #fafafa;
    color: #a3a3a3;
    font: 500 10px Inter, system-ui, sans-serif;
  }
  .cp-page :global(.cp-qr) {
    display: grid;
    place-items: center;
    color: var(--cp-fg);
  }
  .cp-page :global(.cp-barcode) {
    width: 190px;
    height: 44px;
    background: repeating-linear-gradient(90deg, var(--cp-fg) 0 2px, transparent 2px 4px, var(--cp-fg) 4px 5px, transparent 5px 8px, var(--cp-fg) 8px 11px, transparent 11px 12px);
  }
</style>
