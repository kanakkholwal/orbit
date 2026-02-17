<script lang="ts">
  import AppSidebar from "$components/layout/AppSidebar.svelte";
  import MobileHeader from "$components/layout/MobileHeader.svelte";
  import * as Sidebar from "$components/ui/sidebar";
  let { children } = $props();
</script>

<Sidebar.Provider
  class="flex h-screen w-full flex-col bg-background text-foreground md:flex-row overflow-hidden"
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
