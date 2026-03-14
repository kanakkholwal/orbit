<script lang="ts">
    import Icons from "$components/Icons.svelte";
    import { useCommand } from "@embedpdf/plugin-commands/svelte";
    import { useTranslations } from "@embedpdf/plugin-i18n/svelte";
    import {
      type MenuItem,
      type MenuRendererProps,
      type MenuSchema,
      getUIItemProps,
      useUISchema,
    } from "@embedpdf/plugin-ui/svelte";
    import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@lucide/svelte";
    import { onMount } from "svelte";

    interface Props extends MenuRendererProps {}

    let { schema, documentId, anchorEl, onClose }: Props = $props();

    const uiSchema = useUISchema();
    const translations = useTranslations(() => documentId);

    interface MenuStackItem {
        menuId: string;
        schema: MenuSchema;
        title?: string;
    }

    let menuStack = $state<MenuStackItem[]>([]);

    $effect(() => {
        menuStack = [{ menuId: schema.id, schema, title: undefined }];
    });

    const currentMenu = $derived(menuStack[menuStack.length - 1]);

    function navigateToSubmenu(submenuId: string, title: string) {
        if (!uiSchema?.schema) return;
        const submenuSchema = uiSchema.schema.menus[submenuId];
        if (!submenuSchema) return;
        menuStack = [
            ...menuStack,
            { menuId: submenuId, schema: submenuSchema, title },
        ];
    }

    function navigateBack() {
        if (menuStack.length > 1) {
            menuStack = menuStack.slice(0, -1);
        }
    }

    let isMobile = $state(false);

    onMount(() => {
        const checkMobile = () => {
            isMobile = window.innerWidth < 768;
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    });

    let menuRef: HTMLDivElement | null = $state(null);
    let position = $state<{ top: number; left: number } | null>(null);

    $effect(() => {
        if (!anchorEl || isMobile) return;

        const updatePosition = () => {
            const rect = anchorEl.getBoundingClientRect();
            const menuWidth = menuRef?.offsetWidth || 200;

            let top = rect.bottom + 4;
            let left = rect.left;

            if (left + menuWidth > window.innerWidth) {
                left = window.innerWidth - menuWidth - 8;
            }
            if (left < 8) left = 8;

            position = { top, left };
        };

        updatePosition();
        window.addEventListener("scroll", updatePosition);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition);
            window.removeEventListener("resize", updatePosition);
        };
    });

    $effect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef &&
                !menuRef.contains(event.target as Node) &&
                anchorEl &&
                !anchorEl.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 0);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });

    onMount(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    });
</script>

{#if currentMenu}
    {#if isMobile}
        <button
            class="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onclick={onClose}
            tabindex="-1"
            title="Close"
        ></button>

        <div
            bind:this={menuRef}
            {...getUIItemProps(currentMenu.schema)}
            class="animate-slide-up fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-background pb-safe shadow-2xl"
            role="menu"
        >
            {#if menuStack.length > 1}
                <div class="flex items-center border-b border-border px-4 py-3">
                    <button
                        onclick={navigateBack}
                        class="flex items-center gap-1.5 text-sm font-medium text-primary"
                    >
                        <ChevronLeftIcon class="size-4" />
                        Back
                    </button>
                    {#if currentMenu.title}
                        <span class="ml-auto text-xs font-medium text-muted-foreground">
                            {currentMenu.title}
                        </span>
                    {/if}
                </div>
            {:else}
                <div class="flex justify-center py-3">
                    <div class="h-1 w-8 rounded-full bg-muted-foreground/25"></div>
                </div>
            {/if}

            <div class="px-1.5 pb-2">
                {#each currentMenu.schema.items as item, index (item.type + "-" + index)}
                    {@render MenuItemRenderer({
                        item,
                        documentId,
                        onClose,
                        isMobile,
                        onNavigateToSubmenu: navigateToSubmenu,
                    })}
                {/each}
            </div>
        </div>
    {:else}
        <div
            bind:this={menuRef}
            {...getUIItemProps(currentMenu.schema)}
            class="animate-fade-in fixed z-50 min-w-45 rounded-lg border border-border bg-background shadow-lg"
            style:top={position ? `${position.top}px` : undefined}
            style:left={position ? `${position.left}px` : undefined}
            role="menu"
        >
            {#if menuStack.length > 1}
                <div class="flex items-center border-b border-border px-2 py-1.5">
                    <button
                        onclick={navigateBack}
                        class="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
                    >
                        <ChevronLeftIcon class="size-3.5" />
                        Back
                    </button>
                    {#if currentMenu.title}
                        <span class="ml-auto text-xs text-muted-foreground">
                            {currentMenu.title}
                        </span>
                    {/if}
                </div>
            {/if}

            <div class="p-1">
                {#each currentMenu.schema.items as item, index (item.type + "-" + index)}
                    {@render MenuItemRenderer({
                        item,
                        documentId,
                        onClose,
                        isMobile: false,
                        onNavigateToSubmenu: navigateToSubmenu,
                    })}
                {/each}
            </div>
        </div>
    {/if}
{/if}

{#snippet MenuItemRenderer({
    item,
    documentId,
    onClose,
    isMobile,
    onNavigateToSubmenu,
}: {
    item: MenuItem;
    documentId: string;
    onClose: () => void;
    isMobile: boolean;
    onNavigateToSubmenu?: (submenuId: string, title: string) => void;
})}
    {#if item.type === "command"}
        {@render CommandMenuItem({ item, documentId, onClose, isMobile })}
    {:else if item.type === "submenu"}
        {@render SubmenuItem({
            item,
            documentId,
            isMobile,
            onNavigateToSubmenu,
        })}
    {:else if item.type === "divider"}
        <div
            {...getUIItemProps(item)}
            class="my-1 h-px bg-border"
        ></div>
    {:else if item.type === "section"}
        {@render MenuSection({
            item,
            documentId,
            onClose,
            isMobile,
            onNavigateToSubmenu,
        })}
    {/if}
{/snippet}

{#snippet CommandMenuItem({
    item,
    documentId,
    onClose,
    isMobile,
}: {
    item: Extract<MenuItem, { type: "command" }>;
    documentId: string;
    onClose: () => void;
    isMobile: boolean;
})}
    {@const command = useCommand(
        () => item.commandId,
        () => documentId,
    )}

    {#if command?.current?.visible}
        {@const iconProps = command.current?.iconProps || {}}

        <button
            {...getUIItemProps(item)}
            onclick={() => {
                if (!command.current?.disabled) {
                    command.current?.execute();
                    onClose();
                }
            }}
            disabled={command.current?.disabled}
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors
                {isMobile ? 'py-2.5 text-base' : ''}
                {command.current?.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                {command.current?.active ? 'text-primary' : 'text-foreground'}
                hover:bg-accent"
            role="menuitem"
        >
            {#if command.current?.icon}
                <Icons
                    name={command.current.icon}
                    class={isMobile ? "size-5" : "size-4"}
                    primaryColor={iconProps.primaryColor}
                    secondaryColor={iconProps.secondaryColor}
                />
            {/if}
            <span class="flex-1">{command.current?.label}</span>
            {#if command.current?.active}
                <CheckIcon class="size-3.5 text-primary" />
            {/if}
            {#if command.current?.shortcuts && command.current.shortcuts.length > 0 && !isMobile}
                <kbd class="text-[10px] tracking-wide text-muted-foreground">
                    {command.current.shortcuts[0]}
                </kbd>
            {/if}
        </button>
    {/if}
{/snippet}

{#snippet SubmenuItem({
    item,
    documentId,
    isMobile,
    onNavigateToSubmenu,
}: {
    item: Extract<MenuItem, { type: "submenu" }>;
    documentId: string;
    isMobile: boolean;
    onNavigateToSubmenu?: (submenuId: string, title: string) => void;
})}
    <button
        {...getUIItemProps(item)}
        onclick={() => {
            onNavigateToSubmenu?.(
                item.menuId,
                translations.translate(item.labelKey || item.id, {
                    fallback: item.label || item.id,
                }),
            );
        }}
        class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent
            {isMobile ? 'py-2.5 text-base' : ''}"
        role="menuitem"
    >
        {#if item.icon}
            <Icons name={item.icon} class={isMobile ? "size-5" : "size-4"} />
        {/if}
        <span class="flex-1">
            {translations.translate(item.labelKey || item.id, {
                fallback: item.label || item.id,
            })}
        </span>
        <ChevronRightIcon class={isMobile ? "size-4" : "size-3.5"} />
    </button>
{/snippet}

{#snippet MenuSection({
    item,
    documentId,
    onClose,
    isMobile,
    onNavigateToSubmenu,
}: {
    item: Extract<MenuItem, { type: "section" }>;
    documentId: string;
    onClose: () => void;
    isMobile: boolean;
    onNavigateToSubmenu?: (submenuId: string, title: string) => void;
})}
    <div {...getUIItemProps(item)} class="py-1">
        {#if item.labelKey || item.label}
            <div
                class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
                {translations.translate(item.labelKey || item.id, {
                    fallback: item.label || item.id,
                })}
            </div>
        {/if}
        {#each item.items as subItem, index (subItem.type + "-" + index)}
            {@render MenuItemRenderer({
                item: subItem,
                documentId,
                onClose,
                isMobile,
                onNavigateToSubmenu,
            })}
        {/each}
    </div>
{/snippet}
