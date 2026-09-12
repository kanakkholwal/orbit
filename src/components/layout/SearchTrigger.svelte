<script lang="ts">
  import { cn } from "$lib/utils";
  import { workspace } from "$stores/workspace.svelte";
  import { toolList } from "$tools/list";
  import { IconSearch as Search } from "@tabler/icons-svelte";

  let { class: className }: { class?: string } = $props();

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
</script>

<button
  type="button"
  onclick={() => (workspace.searchOpen = true)}
  aria-label="Search tools"
  aria-keyshortcuts="Control+K Meta+K"
  class={cn(
    "flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-left text-body text-muted-foreground transition-colors duration-150 hover:border-border-strong hover:text-foreground",
    className
  )}
>
  <Search class="size-4 shrink-0" />
  <span class="flex-1 truncate">Search {toolList.length} tools</span>
  <kbd class="hidden rounded-sm border border-border bg-muted px-1.5 font-sans text-caption font-medium sm:inline">
    {isMac ? "⌘" : "Ctrl"} K
  </kbd>
</button>
