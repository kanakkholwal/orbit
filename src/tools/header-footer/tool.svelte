<script lang="ts">
  import { FileRow, OptionGroup, ResultCard, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "@tabler/icons-svelte";
  import { HeaderFooterState } from "./helper.svelte";

  const store = new HeaderFooterState();
  const uid = $props.id();

  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const MARGIN = 40;
  const field =
    "h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  type SlotKey = "headerLeft" | "headerCenter" | "headerRight" | "footerLeft" | "footerCenter" | "footerRight";
  type Slot = { key: SlotKey; label: string; placeholder: string; align: "left" | "center" | "right" };

  const groups: { label: string; top: boolean; slots: Slot[] }[] = [
    {
      label: "Header",
      top: true,
      slots: [
        { key: "headerLeft", label: "Left", placeholder: "Company name", align: "left" },
        { key: "headerCenter", label: "Centre", placeholder: "Report title", align: "center" },
        { key: "headerRight", label: "Right", placeholder: "March 2026", align: "right" },
      ],
    },
    {
      label: "Footer",
      top: false,
      slots: [
        { key: "footerLeft", label: "Left", placeholder: "Confidential", align: "left" },
        { key: "footerCenter", label: "Centre", placeholder: "Page {page} of {total}", align: "center" },
        { key: "footerRight", label: "Right", placeholder: "", align: "right" },
      ],
    },
  ];
  const swatches = [
    { value: "#000000", label: "Black" },
    { value: "#6b6b6b", label: "Grey" },
    { value: "#0060c9", label: "Blue" },
  ];
  const lines = [100, 92, 96, 70, 0, 100, 88, 94, 60, 0, 100, 90, 82, 76];

  let lastSlot = $state<SlotKey>("footerCenter");

  const s = $derived(store.state);
  const busy = $derived(s.isProcessing);
  const targets = $derived(store.targetPages(s.pageRange));
  const hasText = $derived(groups.some((g) => g.slots.some((slot) => s[slot.key].trim() !== "")));
  const blocker = $derived(
    !hasText
      ? "Type some header or footer text to continue."
      : targets.length === 0
        ? `Those pages are not in this file. It has ${s.pageCount} pages.`
        : null
  );
  const samplePage = $derived((targets[0] ?? 0) + 1);
  const fill = (text: string) =>
    text.replace(/{page}/g, String(samplePage)).replace(/{total}/g, String(s.pageCount));
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const slotLabel = $derived(
    groups.flatMap((g) => g.slots.map((slot) => ({ key: slot.key, name: `${g.label.toLowerCase()} ${slot.label.toLowerCase()}` })))
  );

  function insert(token: string) {
    const current = store.state[lastSlot];
    store.state[lastSlot] = current ? `${current} ${token}` : token;
    document.getElementById(`${uid}-${lastSlot}`)?.focus();
  }
</script>

{#if !s.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to add a header or footer</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Put a title, date or page count at the top or bottom of every page.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !busy}
      <ResultCard title="Header and footer added" description={`${store.result.name} is downloaded.`}>
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="header-footer" />
      </ResultCard>
    {/if}

    <FileRow
      name={s.file.name}
      meta={`${formatBytes(s.originalSize)} · ${pageLabel(s.pageCount)}`}
      onRemove={busy ? undefined : () => store.reset()}
    />

    <section aria-label="Preview" class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-6 sm:py-10">
      <div
        class="@container relative w-full max-w-sm overflow-hidden rounded-sm shadow-sm"
        style:aspect-ratio="{PAGE_W} / {PAGE_H}"
        style:background-color="#ffffff"
        aria-hidden="true"
      >
        <div class="absolute inset-[14%] flex flex-col gap-[2.4cqw]">
          {#each lines as width, i (i)}
            <span class="h-[1.6cqw] rounded-full" style:width="{width}%" style:background-color="#e5e5e5"></span>
          {/each}
        </div>
        {#each groups as group (group.label)}
          {#each group.slots as slot (slot.key)}
            {#if s[slot.key]}
              <span
                class={cn("absolute whitespace-nowrap leading-none", slot.align === "center" && "-translate-x-1/2")}
                style:font-family="Helvetica, Arial, sans-serif"
                style:font-size="{(s.fontSize / PAGE_W) * 100}cqw"
                style:color={s.fontColor}
                style:left={slot.align === "left" ? `${(MARGIN / PAGE_W) * 100}%` : slot.align === "center" ? "50%" : undefined}
                style:right={slot.align === "right" ? `${(MARGIN / PAGE_W) * 100}%` : undefined}
                style:bottom="calc({((group.top ? PAGE_H - MARGIN : MARGIN) / PAGE_H) * 100}% - 0.21em)"
              >
                {fill(s[slot.key])}
              </span>
            {/if}
          {/each}
        {/each}
      </div>
      <p class="text-center text-caption text-muted-foreground">
        Preview of page {samplePage} on a standard page.
      </p>
    </section>
  </div>

  <WorkspaceInspector title="Header and footer">
    <div class="flex flex-col gap-6">
      {#each groups as group (group.label)}
        <OptionGroup label={group.label}>
          <div class="flex flex-col gap-2">
            {#each group.slots as slot (slot.key)}
              <div class="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2">
                <label for="{uid}-{slot.key}" class="text-body text-muted-foreground">
                  {slot.label}<span class="sr-only"> of the {group.label.toLowerCase()}</span>
                </label>
                <input
                  id="{uid}-{slot.key}"
                  type="text"
                  bind:value={store.state[slot.key]}
                  onfocus={() => (lastSlot = slot.key)}
                  placeholder={slot.placeholder}
                  class={field}
                />
              </div>
            {/each}
          </div>
        </OptionGroup>
      {/each}

      <OptionGroup
        label="Page numbers"
        description={`Adds to the ${slotLabel.find((x) => x.key === lastSlot)?.name}. Numbers fill in on each page.`}
      >
        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" onclick={() => insert("{page}")}>Page number</Button>
          <Button variant="outline" onclick={() => insert("{total}")}>Total pages</Button>
        </div>
      </OptionGroup>

      <OptionGroup label="Pages" description="Leave empty for every page, or type pages like 1-3, 5.">
        <label for="{uid}-range" class="sr-only">Pages</label>
        <input
          id="{uid}-range"
          type="text"
          bind:value={store.state.pageRange}
          placeholder={`All ${s.pageCount} pages`}
          aria-invalid={hasText && targets.length === 0}
          class={cn(field, hasText && targets.length === 0 && "border-destructive")}
        />
      </OptionGroup>

      <OptionGroup label="Colour">
        <div class="flex flex-wrap items-center gap-2">
          {#each swatches as swatch (swatch.value)}
            {@const active = s.fontColor.toLowerCase() === swatch.value}
            <button
              type="button"
              aria-label={swatch.label}
              aria-pressed={active}
              onclick={() => (store.state.fontColor = swatch.value)}
              class={cn(
                "size-10 rounded-full border border-border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              style:background-color={swatch.value}
            ></button>
          {/each}
          <label
            class="relative ml-1 flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-2 text-body text-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
          >
            <span class="size-5 rounded-full border border-border" style:background-color={s.fontColor}></span>
            <span class="uppercase tabular-nums">{s.fontColor}</span>
            <span class="sr-only">Pick a custom colour</span>
            <input type="color" bind:value={store.state.fontColor} class="absolute inset-0 size-full cursor-pointer opacity-0" />
          </label>
        </div>
      </OptionGroup>

      <div class="flex flex-col gap-1">
        <div class="flex items-baseline justify-between gap-3">
          <label for="{uid}-size" class="text-body font-medium text-foreground">Text size</label>
          <span class="text-body tabular-nums text-muted-foreground">{s.fontSize} pt</span>
        </div>
        <input id="{uid}-size" type="range" min="6" max="72" step="1" bind:value={store.state.fontSize} class="h-10 w-full cursor-pointer accent-primary" />
      </div>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if busy}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Adding header and footer…
        </span>
      {:else if blocker}
        <span class={cn("block truncate", hasText && "text-destructive")}>{blocker}</span>
      {:else}
        <span class="block truncate">Applies to {pageLabel(targets.length)} of {s.pageCount}</span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.process()} disabled={busy || blocker !== null}>
      {busy ? "Adding…" : `Add to ${pageLabel(targets.length)}`}
    </Button>
  </ToolFooter>
{/if}
