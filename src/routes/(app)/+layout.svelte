<script lang="ts">
  import AppSidebar from "$components/layout/AppSidebar.svelte";
  import MobileHeader from "$components/layout/MobileHeader.svelte";
  import * as Sidebar from "$components/ui/sidebar";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  let { children } = $props();

  // On desktop the app lives inside the title-bar frame (a flex-1 box), so the
  // shell fills its parent (h-full). On web it owns the viewport (h-screen).
  let isTauri = $derived(appState.isTauri);
</script>

<Sidebar.Provider
  class={cn(
    "flex w-full flex-col md:flex-row overflow-hidden",
    isTauri ? "h-full" : "h-screen"
  )}
>
  <AppSidebar />
  <main
    class="flex-1 overflow-y-auto overflow-x-hidden relative pt-0"
  >
    <MobileHeader />
    <div class="mx-auto max-w-app h-full flex flex-col p-4 md:p-6 lg:p-8">
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
