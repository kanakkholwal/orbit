<script lang="ts">
  import { Button } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import { IconFileImport as Import, IconTrash as Trash } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import PageView from "./canvas/PageView.svelte";
  import { PRESET_ICONS } from "./icons";
  import { docFromPreset, type PresetGroup, PRESETS } from "./model/presets";
  import { BLOCK_LIST } from "./model/blocks";
  import { getTheme, pageBox, THEMES } from "./model/themes";
  import type { CreatorDoc } from "./model/types";
  import type { CreatorState } from "./state.svelte";

  let { studio }: { studio: CreatorState } = $props();

  const GROUPS: ("All" | PresetGroup)[] = ["All", "Business", "Work", "Personal", "Events"];
  const samples = PRESETS.map((preset) => ({ preset, doc: docFromPreset(preset) }));

  let group = $state<(typeof GROUPS)[number]>("All");
  let importInput = $state<HTMLInputElement | null>(null);
  let cardWidth = $state(0);

  const visible = $derived(samples.filter((s) => group === "All" || s.preset.group === group));

  onMount(() => {
    studio.loadDrafts();
  });

  const updated = (time: number) => {
    const minutes = Math.round((Date.now() - time) / 60000);
    if (minutes < 1) return "Edited just now";
    if (minutes < 60) return `Edited ${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `Edited ${hours} h ago`;
    return `Edited ${new Date(time).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
  };
</script>

{#snippet thumbnail(doc: CreatorDoc)}
  {@const box = pageBox(doc.settings.size, doc.settings.orientation)}
  <div class="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 origin-top" inert>
    <PageView {doc} zoom={cardWidth > 0 ? Math.min(0.5, (cardWidth - 40) / box.width) : 0.36} />
  </div>
{/snippet}

<input
  bind:this={importInput}
  type="file"
  accept=".json,application/json"
  class="hidden"
  onchange={(e) => {
    const file = e.currentTarget.files?.[0];
    if (file) studio.importJson(file);
    e.currentTarget.value = "";
  }}
/>

<div class="scrollbar-subtle h-full overflow-y-auto">
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-8 md:py-14">
    <header class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div class="flex max-w-2xl flex-col items-start">
        <span class="mb-4 w-fit -rotate-2 rounded-md border border-border bg-background px-2.5 py-1 text-caption font-semibold text-foreground">
          {BLOCK_LIST.length} blocks · {PRESETS.length} templates · {THEMES.length} themes
        </span>
        <h1 class="text-balance text-heading font-medium text-foreground md:text-heading-lg">Create a PDF from scratch</h1>
        <p class="mt-3 text-pretty text-body text-muted-foreground md:text-body-lg">
          Pick a template, type straight onto the page, and download a crisp PDF. Everything stays on this device.
        </p>
      </div>
      <Button variant="outline" onclick={() => importInput?.click()}>
        <Import />
        Open a draft file
      </Button>
    </header>

    {#if studio.drafts.length > 0}
      <section class="flex flex-col gap-4" aria-labelledby="drafts-heading">
        <h2 id="drafts-heading" class="text-subheading font-medium text-foreground">Continue editing</h2>
        <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {#each studio.drafts.slice(0, 6) as draft (draft.id)}
            {@const theme = getTheme(draft.theme, draft.accent)}
            <li class="group relative flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-sm">
              <span class="grid size-10 shrink-0 place-items-center rounded-lg text-body font-semibold text-white" style:background={theme.colors.primary}>
                {draft.name.trim().charAt(0).toUpperCase() || "D"}
              </span>
              <button type="button" class="flex min-w-0 flex-1 flex-col text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring" onclick={() => studio.open(structuredClone(draft))}>
                <span class="truncate text-body font-medium text-foreground">{draft.name || "Untitled document"}</span>
                <span class="truncate text-caption text-muted-foreground">{updated(draft.updatedAt)} · {draft.blocks.length} blocks</span>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                class="relative z-10 text-muted-foreground pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100"
                aria-label={`Delete draft ${draft.name}`}
                onclick={() => studio.removeDraft(draft.id)}
              >
                <Trash />
              </Button>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <section class="flex flex-col gap-5" aria-labelledby="templates-heading">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 id="templates-heading" class="text-subheading font-medium text-foreground">Start from a template</h2>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Template type">
          {#each GROUPS as g (g)}
            <button
              type="button"
              aria-pressed={group === g}
              onclick={() => (group = g)}
              class={cn(
                "h-9 rounded-lg px-3 text-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                group === g ? "bg-foreground font-medium text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {g}
            </button>
          {/each}
        </div>
      </div>

      <ul class="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each visible as { preset, doc }, i (preset.id)}
          {@const Icon = PRESET_ICONS[preset.id]}
          {@const theme = getTheme(doc.theme)}
          <li>
            <button
              type="button"
              onclick={() => studio.openPreset(preset)}
              class="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left outline-none transition-[border-color,box-shadow,transform] duration-200 ease-craft hover:border-border-strong hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
            >
              {#if i === 0}
                <div class="relative aspect-4/3 w-full overflow-hidden border-b border-border bg-canvas" bind:clientWidth={cardWidth}>
                  {@render thumbnail(doc)}
                </div>
              {:else}
                <div class="relative aspect-4/3 w-full overflow-hidden border-b border-border bg-canvas">
                  {@render thumbnail(doc)}
                </div>
              {/if}
              <div class="flex items-start gap-3 p-4">
                <span class="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors group-hover:text-primary">
                  {#if Icon}<Icon class="size-4.5" />{/if}
                </span>
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="truncate text-body-lg font-medium text-foreground">{preset.name}</span>
                  <span class="line-clamp-2 text-body text-muted-foreground">{preset.description}</span>
                  <span class="mt-1.5 flex items-center gap-1.5 text-caption text-muted-foreground">
                    <span class="size-2 rounded-full" style:background={theme.colors.primary}></span>
                    {theme.name} theme
                  </span>
                </span>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    </section>
  </div>
</div>
