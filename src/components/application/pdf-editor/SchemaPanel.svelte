<script lang="ts">
    import { useTranslations } from "@embedpdf/plugin-i18n/svelte";
    import {
        type SidebarRendererProps,
        useItemRenderer,
        useUICapability,
        useUIState,
    } from "@embedpdf/plugin-ui/svelte";
    import { XIcon } from "@lucide/svelte";
    import { onMount } from "svelte";

    type BottomSheetHeight = "half" | "full";

    interface Props extends SidebarRendererProps {}

    let { schema, documentId, isOpen, onClose }: Props = $props();

    const { provides } = useUICapability();
    const uiState = useUIState(() => documentId);
    const { translate } = useTranslations(() => documentId);
    const { getCustomComponent: renderCustomComponent } = useItemRenderer();

    const scope = $derived(provides ? provides.forDocument(documentId) : null);

    let isMobile = $state(
        typeof window !== "undefined" && window.innerWidth < 768,
    );

    let sheetHeight = $state<BottomSheetHeight>("half");
    let isDragging = $state(false);
    let startY = $state(0);
    let currentY = $state(0);

    let localActiveTabId = $state<string | null>(null);

    const resolvedActiveTabId = $derived.by(() => {
        if (schema.content.type !== "tabs") return null;
        const availableTabs = schema.content.tabs ?? [];
        const stateActive = uiState?.state?.sidebarTabs?.[schema.id];
        if (stateActive) return stateActive;
        const scopeActive = scope?.getSidebarTab?.(schema.id);
        if (scopeActive) return scopeActive;
        return (
            stateActive ??
            schema.content.defaultTab ??
            availableTabs[0]?.id ??
            null
        );
    });

    const activeTabId = $derived(localActiveTabId ?? resolvedActiveTabId);

    const activeTab = $derived.by(() => {
        if (schema.content.type !== "tabs") return null;
        const availableTabs = schema.content.tabs ?? [];
        return (
            availableTabs.find((tab) => tab.id === activeTabId) ??
            availableTabs.find((tab) => tab.id === resolvedActiveTabId) ??
            availableTabs[0]
        );
    });

    $effect(() => {
        if (
            localActiveTabId !== null &&
            resolvedActiveTabId === localActiveTabId
        ) {
            localActiveTabId = null;
        }
    });

    function handleTabSelect(tabId: string) {
        if (tabId === activeTabId) return;
        localActiveTabId = tabId;
        if (scope) scope.setSidebarTab(schema.id, tabId);
    }

    function handleTouchStart(e: TouchEvent) {
        if (!e.touches[0]) return;
        isDragging = true;
        startY = e.touches[0].clientY;
        currentY = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
        if (!isDragging || !e.touches[0]) return;
        currentY = e.touches[0].clientY;
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        const deltaY = currentY - startY;
        const threshold = 100;

        if (deltaY > threshold) {
            if (sheetHeight === "full") sheetHeight = "half";
            else onClose?.();
        } else if (deltaY < -threshold) {
            if (sheetHeight === "half") sheetHeight = "full";
        }
        startY = 0;
        currentY = 0;
    }

    function handleMouseDown(e: MouseEvent) {
        isDragging = true;
        startY = e.clientY;
        currentY = e.clientY;
    }

    function handleMouseMove(e: MouseEvent) {
        if (!isDragging) return;
        currentY = e.clientY;
    }

    function handleMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        const deltaY = currentY - startY;
        const threshold = 100;

        if (deltaY > threshold) {
            if (sheetHeight === "full") sheetHeight = "half";
            else onClose?.();
        } else if (deltaY < -threshold) {
            if (sheetHeight === "half") sheetHeight = "full";
        }
        startY = 0;
        currentY = 0;
    }

    onMount(() => {
        const checkMobile = () => {
            isMobile = window.innerWidth < 768;
        };
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    });

    $effect(() => {
        if (isDragging) {
            const handleMove = (e: MouseEvent) => handleMouseMove(e);
            const handleUp = () => handleMouseUp();
            document.addEventListener("mousemove", handleMove);
            document.addEventListener("mouseup", handleUp);
            return () => {
                document.removeEventListener("mousemove", handleMove);
                document.removeEventListener("mouseup", handleUp);
            };
        }
    });

    function getPositionClasses(
        placement: "left" | "right" | "top" | "bottom",
    ): string {
        switch (placement) {
            case "left":
                return "h-full border-r border-border bg-background";
            case "right":
                return "h-full border-l border-border bg-background";
            case "top":
                return "w-full border-b border-border bg-background";
            case "bottom":
                return "w-full border-t border-border bg-background";
            default:
                return "h-full bg-background";
        }
    }

    const positionClasses = $derived(
        getPositionClasses(schema.position?.placement ?? "left"),
    );
    const widthStyle = $derived(
        schema.width ? `width: ${schema.width}` : undefined,
    );
</script>

{#snippet TabsHeader(availableTabs: any[])}
    <div class="flex border-b border-border">
        {#each availableTabs as tab (tab.id)}
            {@const isActive = tab.id === (activeTab?.id ?? activeTabId)}
            <button
                type="button"
                class="relative flex-1 px-3 py-2 text-xs font-medium transition-colors {isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'}"
                onclick={() => handleTabSelect(tab.id)}
                role="tab"
                aria-selected={isActive}
            >
                {translate(tab.labelKey || tab.id, {
                    fallback: tab.label || tab.id,
                })}
                {#if isActive}
                    <span class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"></span>
                {/if}
            </button>
        {/each}
    </div>
{/snippet}

{#snippet TabContent()}
    {#if activeTab?.componentId}
        {@const Component = renderCustomComponent(activeTab.componentId)}
        <div class="flex-1 overflow-auto">
            {#if Component}
                <Component
                    {documentId}
                    tabId={activeTab.id}
                    {onClose}
                />
            {/if}
        </div>
    {/if}
{/snippet}

{#if isOpen}
    {#if isMobile}
        {@const heightClass = sheetHeight === "full" ? "h-[100vh]" : "h-[50vh]"}
        {@const dragOffset = isDragging ? Math.max(0, currentY - startY) : 0}

        <div
            class="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onclick={onClose}
            role="button"
            tabindex="-1"
        />

        <div
            class="fixed bottom-0 left-0 right-0 z-50 {heightClass} flex flex-col rounded-t-2xl bg-background shadow-2xl transition-all duration-300"
            style:transform="translateY({dragOffset}px)"
            data-panel-id={schema.id}
        >
            <div
                class="flex cursor-grab items-center justify-between px-4 py-3 active:cursor-grabbing"
                ontouchstart={handleTouchStart}
                ontouchmove={handleTouchMove}
                ontouchend={handleTouchEnd}
                onmousedown={handleMouseDown}
                role="button"
                tabindex="-1"
            >
                <div class="flex flex-1 justify-center">
                    <div class="h-1 w-8 rounded-full bg-muted-foreground/25" />
                </div>
                <button
                    onclick={onClose}
                    class="ml-2 rounded-md p-1 transition-colors hover:bg-accent"
                    aria-label="Close panel"
                >
                    <XIcon class="size-4 text-muted-foreground" />
                </button>
            </div>

            {#if schema.content.type === "tabs"}
                {@const availableTabs = schema.content.tabs ?? []}
                {@render TabsHeader(availableTabs)}
                {@render TabContent()}
            {:else if schema.content.type === "component"}
                {#if schema.content.componentId}
                    {@const Component = renderCustomComponent(schema.content.componentId)}
                    <div class="flex-1 overflow-auto">
                        {#if Component}
                            <Component {documentId} {onClose} />
                        {/if}
                    </div>
                {/if}
            {/if}
        </div>
    {:else}
        {#if schema.content.type === "tabs"}
            {@const availableTabs = schema.content.tabs ?? []}
            <div
                class="{positionClasses} flex h-full flex-col"
                style={widthStyle}
                data-panel-id={schema.id}
            >
                {@render TabsHeader(availableTabs)}
                {@render TabContent()}
            </div>
        {:else if schema.content.type === "component"}
            {#if schema.content.componentId}
                {@const Component = renderCustomComponent(schema.content.componentId)}
                <div
                    class="{positionClasses} h-full"
                    style={widthStyle}
                    data-panel-id={schema.id}
                >
                    {#if Component}
                        <Component {documentId} {onClose} />
                    {/if}
                </div>
            {/if}
        {/if}
    {/if}
{/if}
