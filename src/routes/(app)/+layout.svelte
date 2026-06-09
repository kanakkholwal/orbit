<script lang="ts">
  import { page } from "$app/state";
  import AppSidebar from "$components/layout/AppSidebar.svelte";
  import MobileHeader from "$components/layout/MobileHeader.svelte";
  import * as Sidebar from "$components/ui/sidebar";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  let { children } = $props();

  // On desktop the app lives inside the title-bar frame (a flex-1 box), so the
  // shell fills its parent (h-full). On web it owns the viewport (h-screen).
  let isTauri = $derived(appState.isTauri);
  let isPdfViewerRoute = $derived(page.url.pathname === "/tools/view-pdf");
</script>

<Sidebar.Provider
  class={cn(
    "flex w-full flex-col overflow-hidden bg-background-inset md:flex-row",
    isTauri ? "h-full" : "h-screen"
  )}
>
  {#if !isPdfViewerRoute}
    <AppSidebar />
  {/if}
  <main
    class={cn(
      "relative flex-1 overflow-y-auto overflow-x-hidden bg-background pt-0",
      !isPdfViewerRoute && "md:border-l md:border-border/60",
    )}
  >
    {#if !isPdfViewerRoute}
      <MobileHeader />
    {/if}
    <div
      class={cn(
        "flex h-full flex-col",
        isPdfViewerRoute
          ? "w-full"
          : "mx-auto max-w-[min(1720px,96vw)] px-4 py-4 md:px-8 md:py-6 lg:px-10 lg:py-8 xl:px-12",
      )}
    >
      {@render children?.()}
    </div>
  </main>
</Sidebar.Provider>

<style>
  /* Optional: Smooth scroll for the main content area */
  main {
    scroll-behavior: smooth;
  }
</style>
