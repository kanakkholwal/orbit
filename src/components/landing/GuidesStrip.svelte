<script lang="ts">
  import { articles } from "$constants/articles";
  import { IconArrowRight as ArrowRight } from "$lib/icons";

  /** Guides for the newest tools come first. */
  const latest = [...articles].sort((a, b) => b.published.localeCompare(a.published)).slice(0, 3);
</script>

<ul class="grid grid-cols-1 gap-3 md:grid-cols-3">
  {#each latest as a, i (a.slug)}
    <li class="rise" style:--i={i + 1}>
      <a
        href={`/articles/${a.slug}`}
        class="group flex h-full flex-col rounded-2xl border border-border bg-background p-1 outline-none transition-[border-color,scale] duration-(--duration-base) hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring active:scale-(--press-scale-row)"
      >
        <span class="flex h-full flex-col gap-3 rounded-[11px] bg-card p-5">
          <span class="text-xs tabular-nums text-muted-foreground">{a.readingMinutes} min read</span>
          <span class="text-pretty text-base font-medium text-foreground">{a.title}</span>
          <span class="line-clamp-3 text-pretty text-sm text-muted-foreground">{a.description}</span>
          <span class="mt-auto inline-flex items-center gap-1 pt-2 text-sm text-foreground">
            Read the guide
            <ArrowRight class="size-4 transition-transform duration-(--duration-base) group-hover:translate-x-0.5" />
          </span>
        </span>
      </a>
    </li>
  {/each}
</ul>
