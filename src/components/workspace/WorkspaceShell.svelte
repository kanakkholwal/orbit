<script lang="ts">
  import { afterNavigate, onNavigate } from "$app/navigation";
  import SearchCommandMenu from "$components/layout/SearchCommandMenu.svelte";
  import * as Drawer from "$components/ui/drawer";
  import * as Tooltip from "$components/ui/tooltip";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { workspace } from "$stores/workspace.svelte";
  import type { ToolConfig } from "$tools/list";
  import type { Snippet } from "svelte";
  import { MediaQuery } from "svelte/reactivity";
  import ContextBar from "./ContextBar.svelte";
  import MobileTabBar from "./MobileTabBar.svelte";
  import Sidebar from "./Sidebar.svelte";

  let { tool = null, children }: { tool?: ToolConfig | null; children: Snippet } = $props();

  const isMobile = new IsMobile();
  const desktopQuery = new MediaQuery("min-width: 1024px");
  const wideQuery = new MediaQuery("min-width: 1280px");
  /** The options panel sits beside the content from 1280 px; below that it is a drawer. */
  const wide = $derived(wideQuery.current);
  const immersive = $derived(tool?.layout === "immersive");
  /** The sidebar is part of the page from 1024 px; below that it opens as a drawer. */
  const inlineSidebar = $derived(desktopQuery.current && !immersive);
  const sidebarOpen = $derived(inlineSidebar && workspace.panelPinned);

  onNavigate(() => {
    workspace.closeDrawers();
  });

  // The workspace pane scrolls, not the window, so SvelteKit cannot restore the top.
  afterNavigate(({ type, to }) => {
    if (type === "popstate" || to?.url.hash) return;
    document.getElementById("workspace")?.scrollTo({ top: 0 });
  });

  $effect(() => {
    if (inlineSidebar) workspace.closeDrawers();
  });

  // Opening search from inside the drawer should not leave the drawer on top of it.
  $effect(() => {
    if (workspace.searchOpen) workspace.panelDrawerOpen = false;
  });
</script>

<Tooltip.Provider delayDuration={400}>
  <div class={cn("flex min-h-0 w-full overflow-clip bg-background", appState.isTauri ? "h-full" : "fixed inset-0")}>
    {#if inlineSidebar}
      <aside
        aria-label="Sidebar"
        inert={!sidebarOpen}
        class={cn(
          "shrink-0 overflow-hidden border-border transition-[width] duration-(--duration-slow) ease-(--ease-ui-out) motion-reduce:transition-none",
          sidebarOpen ? "w-68 border-r" : "w-0"
        )}
      >
        <Sidebar class="w-68" />
      </aside>
    {/if}

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-clip bg-background">
      <ContextBar {tool} {wide} {inlineSidebar} {sidebarOpen} />

      <div class="flex min-h-0 flex-1">
        <main id="workspace" class="scrollbar-subtle relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {@render children()}
        </main>

        {#if workspace.inspector && wide}
          <aside
            aria-label={workspace.inspector.title}
            class="scrollbar-subtle flex w-80 shrink-0 flex-col overflow-y-auto overscroll-contain border-l border-border"
          >
            <h2 class="px-4 pb-2 pt-4 text-sm font-medium text-foreground">{workspace.inspector.title}</h2>
            <div class="px-4 pb-4">{@render workspace.inspector.content()}</div>
          </aside>
        {/if}
      </div>

      {#if workspace.actionBar}
        <div
          class="shrink-0 border-t border-border bg-background/90 px-3 py-2.5 backdrop-blur-xl md:px-4"
          style="padding-bottom: max(env(safe-area-inset-bottom), 0.625rem);"
        >
          {@render workspace.actionBar()}
        </div>
      {/if}

      {#if !immersive}
        <MobileTabBar class="md:hidden" />
      {/if}
    </div>
  </div>
</Tooltip.Provider>

{#if !inlineSidebar}
  <Drawer.Root
    bind:open={workspace.panelDrawerOpen}
    direction={isMobile.current ? "bottom" : "left"}
    shouldScaleBackground={false}
  >
    <Drawer.Content class={cn(isMobile.current ? "max-h-[85dvh] rounded-t-2xl" : "w-80 max-w-80 rounded-none bg-card")}>
      <Drawer.Title class="sr-only">Menu</Drawer.Title>
      <Sidebar mode={isMobile.current ? "sheet" : "drawer"} class="min-h-0 flex-1" onnavigate={() => (workspace.panelDrawerOpen = false)} />
    </Drawer.Content>
  </Drawer.Root>
{/if}

{#if !wide}
  {#if workspace.inspector}
    <Drawer.Root
      bind:open={workspace.inspectorDrawerOpen}
      direction={isMobile.current ? "bottom" : "right"}
      shouldScaleBackground={false}
    >
      <Drawer.Content class={cn(isMobile.current ? "max-h-[85dvh] rounded-t-3xl" : "w-96 max-w-96")}>
        <Drawer.Title class="px-4 pb-2 pt-4 text-sm font-medium text-foreground">{workspace.inspector.title}</Drawer.Title>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
          {@render workspace.inspector.content()}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{/if}

<SearchCommandMenu />
