<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import { workspace } from "$stores/workspace.svelte";
  import {
    IconCompass as Compass,
    IconHome as Home,
    IconLayoutGrid as Grid,
    IconSearch as Search,
  } from "$lib/icons";

  let { class: className }: { class?: string } = $props();

  const path = $derived(page.url.pathname);
  const item =
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-(--duration-fast)";
</script>

<nav
  aria-label="Workspace"
  class={cn("flex shrink-0 border-t border-border bg-background/90 backdrop-blur-xl", className)}
  style="padding-bottom: env(safe-area-inset-bottom);"
>
  <a href="/home" aria-current={path === "/home" ? "page" : undefined} class={cn(item, path === "/home" ? "text-primary" : "text-muted-foreground")}>
    <Home class="size-5" />
    Home
  </a>
  <a
    href="/explore"
    aria-current={path.startsWith("/explore") ? "page" : undefined}
    class={cn(item, path.startsWith("/explore") ? "text-primary" : "text-muted-foreground")}
  >
    <Compass class="size-5" />
    Explore
  </a>
  <button type="button" onclick={() => (workspace.searchOpen = true)} class={cn(item, "text-muted-foreground")}>
    <Search class="size-5" />
    Search
  </button>
  <button
    type="button"
    onclick={() => (workspace.panelDrawerOpen = true)}
    class={cn(item, path.startsWith("/tools/") ? "text-primary" : "text-muted-foreground")}
  >
    <Grid class="size-5" />
    Tools
  </button>
</nav>
