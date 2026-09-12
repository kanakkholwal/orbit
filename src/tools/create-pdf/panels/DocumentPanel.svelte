<script lang="ts">
  import SegmentedControl from "$components/tool/SegmentedControl.svelte";
  import { Input } from "$components/ui/input";
  import * as Select from "$components/ui/select";
  import { Switch } from "$components/ui/switch";
  import { cn } from "$lib/utils";
  import { IconCheck as Check } from "@tabler/icons-svelte";
  import { CSS_FONTS, THEMES } from "../model/themes";
  import type { DocSettings, PageSize } from "../model/types";
  import type { CreatorState } from "../state.svelte";

  let { studio }: { studio: CreatorState } = $props();

  const uid = $props.id();
  const doc = $derived(studio.doc);
  const ACCENTS = ["#047857", "#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#ca8a04", "#0f766e", "#0f172a"];
  const SIZES: { value: PageSize; label: string }[] = [
    { value: "A4", label: "A4 · 210 × 297 mm" },
    { value: "Letter", label: "US Letter · 8.5 × 11 in" },
    { value: "Legal", label: "US Legal · 8.5 × 14 in" },
    { value: "A5", label: "A5 · 148 × 210 mm" },
  ];

  function setting<K extends keyof DocSettings>(key: K, value: DocSettings[K], tag: string = key) {
    studio.change(`settings:${tag}`, (d) => {
      d.settings[key] = value;
    });
  }
</script>

{#if doc}
  <div class="flex flex-col gap-7 p-4">
    <section class="flex flex-col gap-3" aria-labelledby={`${uid}-theme`}>
      <h3 id={`${uid}-theme`} class="text-body font-medium text-foreground">Theme</h3>
      <div class="grid grid-cols-2 gap-2">
        {#each THEMES as theme (theme.id)}
          {@const active = doc.theme === theme.id}
          <button
            type="button"
            aria-pressed={active}
            onclick={() => studio.change("theme", (d) => (d.theme = theme.id))}
            class={cn(
              "relative flex flex-col gap-2 rounded-xl border p-2.5 text-left outline-none transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
              active ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-border hover:border-border-strong"
            )}
          >
            <span class="flex h-9 items-end gap-1 rounded-md border border-black/5 bg-white px-2 pb-1.5">
              <span class="text-[15px] leading-none text-neutral-900" style:font-family={CSS_FONTS[theme.fonts.heading]} style:font-weight={theme.headingWeight}>Aa</span>
              <span class="mb-0.5 ml-auto size-2.5 rounded-full" style:background={theme.colors.primary}></span>
              <span class="mb-0.5 size-2.5 rounded-full" style:background={theme.colors.accent}></span>
            </span>
            <span class="text-caption font-medium text-foreground">{theme.name}</span>
            {#if active}
              <span class="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground"><Check class="size-3" stroke={3} /></span>
            {/if}
          </button>
        {/each}
      </div>
    </section>

    <section class="flex flex-col gap-3" aria-labelledby={`${uid}-accent`}>
      <div class="flex items-baseline justify-between">
        <h3 id={`${uid}-accent`} class="text-body font-medium text-foreground">Accent colour</h3>
        {#if doc.accent}
          <button type="button" class="text-caption text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" onclick={() => studio.change("accent", (d) => (d.accent = null))}>
            Use theme colour
          </button>
        {/if}
      </div>
      <div class="flex flex-wrap items-center gap-2">
        {#each ACCENTS as color (color)}
          <button
            type="button"
            aria-label={`Accent ${color}`}
            aria-pressed={doc.accent === color}
            onclick={() => studio.change("accent", (d) => (d.accent = color))}
            class={cn(
              "size-7 rounded-full outline-none ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring",
              doc.accent === color && "ring-2 ring-foreground"
            )}
            style:background={color}
          ></button>
        {/each}
        <label class="relative grid size-7 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-border-strong text-caption text-muted-foreground" title="Custom colour">
          +
          <input
            type="color"
            class="absolute inset-0 cursor-pointer opacity-0"
            value={doc.accent ?? "#047857"}
            aria-label="Custom accent colour"
            oninput={(e) => studio.change("accent", (d) => (d.accent = e.currentTarget.value))}
          />
        </label>
      </div>
    </section>

    <section class="flex flex-col gap-4" aria-labelledby={`${uid}-page`}>
      <h3 id={`${uid}-page`} class="text-body font-medium text-foreground">Page</h3>
      <Select.Root type="single" value={doc.settings.size} onValueChange={(v) => setting("size", v as PageSize)}>
        <Select.Trigger class="w-full" aria-label="Paper size">{SIZES.find((s) => s.value === doc.settings.size)?.label}</Select.Trigger>
        <Select.Content>
          {#each SIZES as size (size.value)}
            <Select.Item value={size.value} label={size.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <SegmentedControl
        size="sm"
        name={`${uid}-orientation`}
        value={doc.settings.orientation}
        options={[{ value: "portrait", label: "Portrait" }, { value: "landscape", label: "Landscape" }]}
        onchange={(v) => setting("orientation", v)}
      />
      <div class="flex flex-col gap-2">
        <span class="text-caption text-muted-foreground">Margins</span>
        <SegmentedControl
          size="sm"
          name={`${uid}-margin`}
          value={doc.settings.margin}
          options={[{ value: "narrow", label: "Narrow" }, { value: "normal", label: "Normal" }, { value: "wide", label: "Wide" }]}
          onchange={(v) => setting("margin", v)}
        />
      </div>
    </section>

    <section class="flex flex-col gap-3" aria-label="Header">
      <div class="flex items-center justify-between gap-4">
        <label for={`${uid}-header`} class="text-body font-medium text-foreground">Header on every page</label>
        <Switch id={`${uid}-header`} checked={doc.settings.header.enabled} onCheckedChange={(v) => setting("header", { ...doc.settings.header, enabled: v })} />
      </div>
      {#if doc.settings.header.enabled}
        <div class="grid grid-cols-2 gap-2">
          <Input value={doc.settings.header.left} placeholder="Left" aria-label="Header left text" oninput={(e) => setting("header", { ...doc.settings.header, left: e.currentTarget.value })} />
          <Input value={doc.settings.header.right} placeholder="Right" aria-label="Header right text" oninput={(e) => setting("header", { ...doc.settings.header, right: e.currentTarget.value })} />
        </div>
      {/if}
    </section>

    <section class="flex flex-col gap-3" aria-label="Footer">
      <div class="flex items-center justify-between gap-4">
        <label for={`${uid}-footer`} class="text-body font-medium text-foreground">Footer on every page</label>
        <Switch id={`${uid}-footer`} checked={doc.settings.footer.enabled} onCheckedChange={(v) => setting("footer", { ...doc.settings.footer, enabled: v })} />
      </div>
      {#if doc.settings.footer.enabled}
        <Input value={doc.settings.footer.left} placeholder="Footer text" aria-label="Footer text" oninput={(e) => setting("footer", { ...doc.settings.footer, left: e.currentTarget.value })} />
        <div class="flex items-center justify-between gap-4">
          <label for={`${uid}-numbers`} class="text-body text-foreground">Page numbers</label>
          <Switch id={`${uid}-numbers`} checked={doc.settings.footer.pageNumbers} onCheckedChange={(v) => setting("footer", { ...doc.settings.footer, pageNumbers: v })} />
        </div>
      {/if}
    </section>

    <section class="flex flex-col gap-3" aria-label="Watermark">
      <div class="flex items-center justify-between gap-4">
        <label for={`${uid}-watermark`} class="text-body font-medium text-foreground">Watermark</label>
        <Switch id={`${uid}-watermark`} checked={doc.settings.watermark.enabled} onCheckedChange={(v) => setting("watermark", { ...doc.settings.watermark, enabled: v })} />
      </div>
      {#if doc.settings.watermark.enabled}
        <Input value={doc.settings.watermark.text} placeholder="DRAFT" aria-label="Watermark text" oninput={(e) => setting("watermark", { ...doc.settings.watermark, text: e.currentTarget.value })} />
      {/if}
    </section>
  </div>
{/if}
