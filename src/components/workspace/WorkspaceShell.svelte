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
  const inlinePanel = $derived(wide && !immersive);
  const panelOpen = $derived(workspace.panelPinned && !immersive);

  onNavigate(() => {
    workspace.closeDrawers();
  });

  $effect(() => {
    if (inlinePanel) workspace.closeDrawers();
  });
</script>

<Tooltip.Provider delayDuration={400}>
  <div class={cn("flex w-full overflow-clip bg-canvas", appState.isTauri ? "h-full" : "h-dvh")}>
    <ShellRail wide={inlinePanel} class="hidden md:flex" />

    {#if wide}
      <aside
        aria-label="Tools"
        inert={!panelOpen}
        class={cn(
          "shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-craft",
          panelOpen ? "w-64 opacity-100" : "w-0 opacity-0"
        )}
      >
        <ToolsPanel class="w-64" />
      </aside>
    {/if}

    {#if inlinePanel}
      <button
        type="button"
        onclick={() => workspace.togglePanel(true)}
        aria-label={panelOpen ? "Collapse tools panel" : "Expand tools panel"}
        aria-expanded={panelOpen}
        title={panelOpen ? "Collapse tools panel" : "Expand tools panel"}
        class={cn(
          "group relative w-2 shrink-0 outline-none",
          panelOpen ? "cursor-w-resize" : "cursor-e-resize"
        )}
      >
        <span
          aria-hidden="true"
          class="absolute inset-y-4 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-transparent transition-colors duration-150 group-hover:bg-border-strong group-focus-visible:bg-ring"
        ></span>
      </button>
    {/if}

    <div
      class="workspace-surface flex min-w-0 flex-1 flex-col overflow-clip md:my-2 md:mr-2 md:rounded-xl md:border md:border-border md:shadow-xs"
    >
      <ContextBar {tool} {wide} />

      <div class="flex min-h-0 flex-1">
        <main id="workspace" class="scrollbar-subtle relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {@render children()}
        </main>

        {#if workspace.inspector && wide}
          <aside
            aria-label={workspace.inspector.title}
            class="scrollbar-subtle flex w-80 shrink-0 flex-col overflow-y-auto overscroll-contain border-l border-border"
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

{#if !inlinePanel}
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

{/if}

{#if !wide}
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
