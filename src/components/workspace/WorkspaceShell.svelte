<script lang="ts">
  import { onNavigate } from "$app/navigation";
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
  import ShellRail from "./ShellRail.svelte";
  import ToolsPanel from "./ToolsPanel.svelte";

  let { tool = null, children }: { tool?: ToolConfig | null; children: Snippet } = $props();

  const isMobile = new IsMobile();
  const wideQuery = new MediaQuery("min-width: 1280px");
  const wide = $derived(wideQuery.current);
  const immersive = $derived(tool?.layout === "immersive");
  const showPanel = $derived(wide && workspace.panelPinned && !immersive);

  onNavigate(() => workspace.closeDrawers());

  $effect(() => {
    if (wide) workspace.closeDrawers();
  });
</script>

<Tooltip.Provider delayDuration={400}>
  <div class={cn("flex w-full overflow-hidden bg-canvas", appState.isTauri ? "h-full" : "h-dvh")}>
    <ShellRail {wide} class="hidden md:flex" />

    {#if showPanel}
      <aside aria-label="Tools" class="hidden w-64 shrink-0 xl:block">
        <ToolsPanel />
      </aside>
    {/if}

    <div
      class="flex min-w-0 flex-1 flex-col overflow-hidden bg-background md:my-2 md:mr-2 md:rounded-xl md:border md:border-border md:shadow-xs"
    >
      <ContextBar {tool} {wide} />

      <div class="flex min-h-0 flex-1">
        <main id="workspace" class="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {@render children()}
        </main>

        {#if workspace.inspector && wide}
          <aside
            aria-label={workspace.inspector.title}
            class="flex w-80 shrink-0 flex-col overflow-y-auto overscroll-contain border-l border-border"
          >
            <h2 class="px-4 pb-2 pt-4 text-body font-medium text-foreground">{workspace.inspector.title}</h2>
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

{#if !wide}
  <Drawer.Root
    bind:open={workspace.panelDrawerOpen}
    direction={isMobile.current ? "bottom" : "left"}
    shouldScaleBackground={false}
  >
    <Drawer.Content class={cn(isMobile.current ? "h-[85dvh] max-h-[85dvh] rounded-t-3xl" : "w-80 max-w-80 bg-canvas")}>
      <Drawer.Title class="sr-only">Tools</Drawer.Title>
      <ToolsPanel class="min-h-0 flex-1" onnavigate={() => (workspace.panelDrawerOpen = false)} />
    </Drawer.Content>
  </Drawer.Root>

  {#if workspace.inspector}
    <Drawer.Root
      bind:open={workspace.inspectorDrawerOpen}
      direction={isMobile.current ? "bottom" : "right"}
      shouldScaleBackground={false}
    >
      <Drawer.Content class={cn(isMobile.current ? "max-h-[85dvh] rounded-t-3xl" : "w-96 max-w-96")}>
        <Drawer.Title class="px-4 pb-2 pt-4 text-body font-medium text-foreground">{workspace.inspector.title}</Drawer.Title>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
          {@render workspace.inspector.content()}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{/if}

<SearchCommandMenu />
