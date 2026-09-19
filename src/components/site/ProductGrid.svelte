<script lang="ts">
  import { siblingProducts } from "$constants/products";
  import { cn } from "$lib/utils";
  import { IconArrowUpRight as ArrowUpRight } from "@tabler/icons-svelte";

  let { class: className }: { class?: string } = $props();
</script>

<ul class={cn("grid gap-3 sm:grid-cols-2", className)}>
  {#each siblingProducts as product (product.href)}
    <li>
      <a
        href={product.href}
        target="_blank"
        rel="noopener noreferrer"
        class="group flex h-full flex-col gap-1.5 rounded-2xl border border-border bg-card p-5 transition-colors duration-200 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-background"
      >
        <span class="flex items-center gap-2">
          <span class="text-body-lg font-medium text-foreground">{product.name}</span>
          <ArrowUpRight
            class="size-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary"
          />
        </span>
        <span class="text-caption uppercase tracking-[0.08em] text-primary">{product.tagline}</span>
        <span class="text-body leading-relaxed text-muted-foreground">{product.summary}</span>
      </a>
    </li>
  {/each}
</ul>
