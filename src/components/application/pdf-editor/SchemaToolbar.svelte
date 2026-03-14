<script lang="ts">
    import {
        type ToolbarRendererProps,
        getUIItemProps,
    } from "@embedpdf/plugin-ui/svelte";
    import { useItemRenderer } from "@embedpdf/plugin-ui/svelte";
    import CommandButton from "./CommandButton.svelte";
    import CommandTabButton from "./CommandTabButton.svelte";

    interface Props extends ToolbarRendererProps {
        className?: string;
    }

    let { schema, documentId, isOpen, className = "" }: Props = $props();

    const { getCustomComponent: renderCustomComponent } = useItemRenderer();

    const isSecondarySlot = $derived(schema.position.slot === "secondary");

    function getPlacementClasses(
        placement: "top" | "bottom" | "left" | "right",
    ): string {
        switch (placement) {
            case "top":
                return "border-b border-border bg-background px-3 py-1.5";
            case "bottom":
                return "border-t border-border bg-background px-3 py-1.5";
            case "left":
                return "border-r border-border bg-background px-1.5 py-3 flex-col";
            case "right":
                return "border-l border-border bg-background px-1.5 py-3 flex-col";
        }
    }

    function getAlignmentClass(alignment?: "start" | "center" | "end"): string {
        switch (alignment) {
            case "center":
                return "justify-center";
            case "end":
                return "justify-end";
            default:
                return "justify-start";
        }
    }

    const placementClasses = $derived(
        getPlacementClasses(schema.position.placement),
    );
    const slotClasses = $derived(isSecondarySlot ? "bg-muted/40" : "");
</script>

{#if isOpen}
    <div
        {...getUIItemProps(schema, { "data-toolbar-id": schema.id })}
        class="flex items-center gap-1 {placementClasses} {slotClasses} {className}"
    >
        {#each schema.items as item (item.id)}
            {#if item.type === "command-button"}
                <div {...getUIItemProps(item)}>
                    <CommandButton
                        commandId={item.commandId}
                        {documentId}
                        variant={item.variant === "tab" ? "icon" : item.variant}
                        itemId={item.id}
                    />
                </div>
            {:else if item.type === "tab-group"}
                {@const alignmentClass = getAlignmentClass(item.alignment)}
                <div
                    {...getUIItemProps(item)}
                    class="flex items-center {alignmentClass}"
                    role="tablist"
                >
                    <div class="flex rounded-lg bg-muted p-0.5">
                        {#each item.tabs as tab (tab.id)}
                            {#if tab.commandId}
                                <div {...getUIItemProps(tab)}>
                                    <CommandTabButton
                                        commandId={tab.commandId}
                                        {documentId}
                                        itemId={tab.id}
                                        variant={tab.variant === "icon"
                                            ? "icon"
                                            : "text"}
                                    />
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
            {:else if item.type === "divider"}
                <div {...getUIItemProps(item)}>
                    <div class="mx-0.5 h-5 w-px bg-border"></div>
                </div>
            {:else if item.type === "spacer"}
                <div
                    {...getUIItemProps(item)}
                    class={item.flex ? "flex-1" : "w-3"}
                    aria-hidden="true"
                ></div>
            {:else if item.type === "group"}
                {@const gapClass = item.gap ? `gap-${item.gap}` : "gap-1"}
                {@const alignmentClass = getAlignmentClass(item.alignment)}
                <div
                    {...getUIItemProps(item)}
                    class="flex items-center {gapClass} {alignmentClass}"
                >
                    {#each item.items as childItem (childItem.id)}
                        {#if childItem.type === "command-button"}
                            <div {...getUIItemProps(childItem)}>
                                <CommandButton
                                    commandId={childItem.commandId}
                                    {documentId}
                                    variant={childItem.variant === "tab"
                                        ? "icon"
                                        : childItem.variant}
                                    itemId={childItem.id}
                                />
                            </div>
                        {:else if childItem.type === "divider"}
                            <div {...getUIItemProps(childItem)}>
                                <div class="mx-0.5 h-5 w-px bg-border"></div>
                            </div>
                        {:else if childItem.type === "custom"}
                            {#if childItem.componentId}
                                {@const Component = renderCustomComponent(
                                    childItem.componentId,
                                )}
                                <div {...getUIItemProps(childItem)}>
                                    {#if Component}
                                        <Component
                                            {documentId}
                                            {...childItem.props}
                                        />
                                    {/if}
                                </div>
                            {/if}
                        {/if}
                    {/each}
                </div>
            {:else if item.type === "custom"}
                {#if item.componentId}
                    {@const Component = renderCustomComponent(item.componentId)}
                    <div {...getUIItemProps(item)}>
                        {#if Component}
                            <Component {documentId} {...item.props} />
                        {/if}
                    </div>
                {/if}
            {/if}
        {/each}
    </div>
{/if}
