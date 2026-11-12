<script lang="ts">
  import { cn } from "$lib/utils";
  import { workspace } from "$stores/workspace.svelte";
  import { IconSearch as Search } from "$lib/icons";

  let { class: className }: { class?: string } = $props();

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
</script>

<button
  type="button"
  onclick={() => (workspace.searchOpen = true)}
  aria-label="Search tools"
  aria-keyshortcuts="Control+K Meta+K"
  class={cn(
    "flex h-9 items-center gap-2 rounded-full bg-muted px-3.5 text-left text-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-foreground/[0.07] hover:text-foreground",
    className
  )}
>
  <Search class="size-4 shrink-0" />
  <span class="flex-1 truncate">Search tools</span>
  <kbd class="hidden rounded-md bg-background px-1.5 py-0.5 font-sans text-xs font-medium text-muted-foreground sm:inline">
    {isMac ? "⌘" : "Ctrl"} K
  </kbd>
</button>
