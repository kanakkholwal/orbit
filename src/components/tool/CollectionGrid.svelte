<script lang="ts">
  import { collections, collectionSpan } from "$constants/collections";
  import { IconArrowRight as ArrowRight } from "$lib/icons";
  import { getTool } from "$tools/list";
</script>

<!-- Six-column bento: one wide tile and four narrow ones, collapsing to one column on phones. -->
<ul class="grid grid-cols-1 gap-3 md:grid-cols-6">
  {#each collections as c, i (c.id)}
    <li class={`rise rounded-2xl border border-border bg-background p-1 ${collectionSpan[c.id] ?? "md:col-span-2"}`} style:--i={i + 1}>
      <div class="flex h-full flex-col gap-4 rounded-[11px] bg-card p-5">
        <div class="flex items-start justify-between gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-primary">
            <c.icon class="size-5" />
          </span>
          {#if c.category}
            <a
              href={`/explore?category=${c.category}`}
              class="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:min-h-11"
            >
              See all <ArrowRight class="size-3" />
            </a>
          {/if}
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="text-lg font-medium text-foreground">{c.title}</h3>
          <p class="text-pretty text-sm text-muted-foreground">{c.description}</p>
        </div>
        <ul class="mt-auto flex flex-wrap gap-2">
          {#each c.links.map((s) => getTool(s)).filter((t) => t !== null) as t (t.slug)}
            <li>
              <a
                href={`/tools/${t.slug}`}
                class="inline-flex h-8 items-center rounded-full border border-border bg-background px-3 text-sm text-foreground/80 outline-none transition-[color,border-color,scale] duration-(--duration-fast) hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-(--press-scale-sm) pointer-coarse:h-11"
              >
                {t.title}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </li>
  {/each}
</ul>
