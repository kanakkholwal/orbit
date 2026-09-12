<script lang="ts">
  import * as Drawer from "$components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { cn } from "$lib/utils";
  import { useTranslations } from "@embedpdf/plugin-i18n/svelte";
  import {
    type SidebarRendererProps,
    useItemRenderer,
    useUICapability,
    useUIState,
  } from "@embedpdf/plugin-ui/svelte";
  import { IconX as X } from "@tabler/icons-svelte";
  import { chromeButton } from "./chrome";

  let { schema, documentId, isOpen, onClose }: SidebarRendererProps = $props();

  const PANEL_TITLES: Record<string, string> = {
    "search-panel": "Search",
    "comment-panel": "Comments",
  };

  const isMobile = new IsMobile();
  const { provides } = useUICapability();
  const uiState = useUIState(() => documentId);
  const { translate } = useTranslations(() => documentId);
  const { getCustomComponent } = useItemRenderer();

  const scope = $derived(provides ? provides.forDocument(documentId) : null);
  const tabs = $derived(schema.content.type === "tabs" ? (schema.content.tabs ?? []) : []);
  const placement = $derived(schema.position?.placement ?? "left");

  let localTabId = $state<string | null>(null);

  const resolvedTabId = $derived.by(() => {
    if (schema.content.type !== "tabs") return null;
    return (
      uiState?.state?.sidebarTabs?.[schema.id] ??
      scope?.getSidebarTab?.(schema.id) ??
      schema.content.defaultTab ??
      tabs[0]?.id ??
      null
    );
  });

  const activeTab = $derived(
    tabs.find((t) => t.id === (localTabId ?? resolvedTabId)) ?? tabs.find((t) => t.id === resolvedTabId) ?? tabs[0]
  );

  $effect(() => {
    if (localTabId !== null && resolvedTabId === localTabId) localTabId = null;
  });

  function selectTab(tabId: string) {
    if (tabId === activeTab?.id) return;
    localTabId = tabId;
    scope?.setSidebarTab(schema.id, tabId);
  }

  const componentId = $derived(
    schema.content.type === "tabs"
      ? activeTab?.componentId
      : schema.content.type === "component"
        ? schema.content.componentId
        : undefined
  );
  const Body = $derived(componentId ? getCustomComponent(componentId) : undefined);
  const title = $derived(PANEL_TITLES[schema.id] ?? "Panel");
</script>

{#snippet header()}
  <div class="flex h-12 shrink-0 items-center gap-2 border-b border-border px-2">
    {#if tabs.length > 0}
      <div
        role="tablist"
        aria-label="Sidebar view"
        class="grid h-9 min-w-0 flex-1 gap-0.5 rounded-lg bg-muted p-0.5"
        style:grid-template-columns={`repeat(${tabs.length}, minmax(0, 1fr))`}
      >
        {#each tabs as tab (tab.id)}
          {@const active = tab.id === activeTab?.id}
          <button
            type="button"
            role="tab"
            aria-selected={active}
            onclick={() => selectTab(tab.id)}
            class={cn(
              "truncate rounded-md px-2 text-body outline-none transition-[background-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              active ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {translate(tab.labelKey || tab.id, { fallback: tab.label || tab.id })}
          </button>
        {/each}
      </div>
    {:else}
      <h2 class="min-w-0 flex-1 truncate px-2 text-body font-medium text-foreground">{title}</h2>
    {/if}
    <button type="button" onclick={() => onClose?.()} aria-label="Close panel" class={chromeButton({ shape: "icon" })}>
      <X class="size-4" />
    </button>
  </div>
{/snippet}

{#snippet body()}
  <div class="scrollbar-subtle min-h-0 flex-1 overflow-y-auto overscroll-contain">
    {#if Body}
      <Body {documentId} tabId={activeTab?.id} {onClose} />
    {/if}
  </div>
{/snippet}

{#if isMobile.current}
  <Drawer.Root
    open={isOpen}
    onOpenChange={(open) => {
      if (!open) onClose?.();
    }}
    direction="bottom"
    shouldScaleBackground={false}
  >
    <Drawer.Content class="h-[70dvh] max-h-[85dvh] rounded-t-3xl" data-panel-id={schema.id}>
      <Drawer.Title class="sr-only">{tabs.length > 0 ? (activeTab?.label ?? title) : title}</Drawer.Title>
      <div class="mt-2 flex min-h-0 flex-1 flex-col">
        {@render header()}
        {@render body()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{:else if isOpen}
  <aside
    data-panel-id={schema.id}
    aria-label={tabs.length > 0 ? "Pages" : title}
    class={cn(
      "flex h-full w-64 shrink-0 flex-col border-border bg-background",
      placement === "right" ? "border-l" : "border-r"
    )}
    style:width={schema.width}
  >
    {@render header()}
    {@render body()}
  </aside>
{/if}
