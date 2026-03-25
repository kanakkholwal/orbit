<script lang="ts">
  import { toolList, toolsByCategory, CATEGORY_LABELS } from '../../tools/manifest';
  import type { ExtToolConfig } from '../../tools/manifest';
  import { getIcon } from '../../tools/icons';
  import { ArrowRight } from '@lucide/svelte';

  interface Props {
    search: string;
    orbitUrl: string;
  }

  const { search, orbitUrl }: Props = $props();

  const filtered = $derived(
    (() => {
      const q = search.trim().toLowerCase();
      if (!q) return null;
      return toolList.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords?.some((k) => k.includes(q)),
      );
    })(),
  );

  function openTool(slug: string) {
    window.open(`${orbitUrl}/tools/${slug}`, '_blank', 'noopener,noreferrer');
  }
</script>

{#if filtered !== null && filtered.length === 0}
  <div class="flex flex-col items-center justify-center gap-1 py-16 text-center">
    <p class="text-sm text-muted-foreground">No tools match "<span class="text-foreground">{search}</span>"</p>
  </div>

{:else if filtered !== null}
  <!-- Flat search results -->
  <div class="flex flex-col gap-2 p-3">
    {#each filtered as tool (tool.slug)}
      {@render toolCard(tool)}
    {/each}
  </div>

{:else}
  <!-- Grouped by category -->
  {#each Object.entries(toolsByCategory) as [category, tools]}
    <div class="px-3 pt-4 first:pt-3">
      <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {CATEGORY_LABELS[category as ExtToolConfig['category']] ?? category}
      </p>
      <div class="flex flex-col gap-2">
        {#each tools as tool (tool.slug)}
          {@render toolCard(tool)}
        {/each}
      </div>
    </div>
  {/each}
  <div class="h-4"></div>
{/if}

{#snippet toolCard(tool: ExtToolConfig)}
  {@const Icon = getIcon(tool.iconName)}
  <button
    type="button"
    onclick={() => openTool(tool.slug)}
    class="group relative flex w-full flex-col rounded-2xl border border-white/5 bg-card p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30"
  >
    <!-- subtle hover glow matching web app -->
    <div class="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

    <div class="relative flex items-start gap-3">
      <!-- icon box, matching web app's tool card style -->
      <div class="flex size-8 shrink-0 items-center justify-center rounded-xl shadow-inner ring-1 ring-white/10 {tool.color}">
        {#if Icon}
          <Icon size={16} strokeWidth={1.5} class="transition-transform duration-300 group-hover:rotate-12" />
        {/if}
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold tracking-tight text-foreground">{tool.title}</p>
        <p class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
          {tool.description}
        </p>
      </div>
    </div>

    <div class="relative mt-3 flex items-center gap-1 text-xs font-medium text-primary">
      <span class="relative">
        Open tool
        <span class="absolute -bottom-px left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </span>
      <ArrowRight size={12} class="transition-transform duration-300 group-hover:translate-x-0.5" />
    </div>
  </button>
{/snippet}
