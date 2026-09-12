<script lang="ts">
  import { cn } from "$lib/utils";
  import { type ToolbarRendererProps, getUIItemProps, useItemRenderer } from "@embedpdf/plugin-ui/svelte";
  import { chromeGap } from "./chrome";
  import CommandButton from "./CommandButton.svelte";
  import CommandTabButton from "./CommandTabButton.svelte";

  interface Props extends ToolbarRendererProps {
    className?: string;
  }

  let { schema, documentId, isOpen, className = "" }: Props = $props();

  const { getCustomComponent: renderCustomComponent } = useItemRenderer();

  type ToolbarItem = (typeof schema.items)[number];

  const vertical = $derived(schema.position.placement === "left" || schema.position.placement === "right");

  const placementClasses: Record<string, string> = {
    top: "min-h-12 border-b px-2 py-1.5",
    bottom: "min-h-12 border-t px-2 py-1.5",
    left: "w-12 flex-col border-r px-1.5 py-2",
    right: "w-12 flex-col border-l px-1.5 py-2",
  };

  const alignmentClasses: Record<string, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  };
</script>

{#snippet divider(item: ToolbarItem)}
  <div {...getUIItemProps(item)} aria-hidden="true">
    <div class={cn("bg-border", vertical ? "mx-auto my-1 h-px w-5" : "mx-1 h-5 w-px")}></div>
  </div>
{/snippet}

{#snippet custom(item: ToolbarItem & { type: "custom" })}
  {#if item.componentId}
    {@const Component = renderCustomComponent(item.componentId)}
    <div {...getUIItemProps(item)}>
      {#if Component}
        <Component {documentId} {...item.props} />
      {/if}
    </div>
  {/if}
{/snippet}

{#if isOpen}
  <div
    {...getUIItemProps(schema, { "data-toolbar-id": schema.id })}
    role="toolbar"
    aria-orientation={vertical ? "vertical" : "horizontal"}
    class={cn(
      "no-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto border-border bg-background",
      placementClasses[schema.position.placement],
      className
    )}
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
        <div
          {...getUIItemProps(item)}
          class={cn("flex items-center", alignmentClasses[item.alignment ?? "start"])}
        >
          <div role="tablist" class="flex h-9 gap-0.5 rounded-lg bg-muted p-0.5">
            {#each item.tabs as tab (tab.id)}
              {#if tab.commandId}
                <div {...getUIItemProps(tab)} class="h-full">
                  <CommandTabButton
                    commandId={tab.commandId}
                    {documentId}
                    itemId={tab.id}
                    variant={tab.variant === "icon" ? "icon" : "text"}
                  />
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {:else if item.type === "divider"}
        {@render divider(item)}
      {:else if item.type === "spacer"}
        <div {...getUIItemProps(item)} class={item.flex ? "flex-1" : "w-2"} aria-hidden="true"></div>
      {:else if item.type === "group"}
        <div
          {...getUIItemProps(item)}
          class={cn(
            "flex items-center",
            chromeGap[Math.min(item.gap ?? 1, 4)],
            alignmentClasses[item.alignment ?? "start"]
          )}
        >
          {#each item.items as childItem (childItem.id)}
            {#if childItem.type === "command-button"}
              <div {...getUIItemProps(childItem)}>
                <CommandButton
                  commandId={childItem.commandId}
                  {documentId}
                  variant={childItem.variant === "tab" ? "icon" : childItem.variant}
                  itemId={childItem.id}
                />
              </div>
            {:else if childItem.type === "divider"}
              {@render divider(childItem)}
            {:else if childItem.type === "custom"}
              {@render custom(childItem)}
            {/if}
          {/each}
        </div>
      {:else if item.type === "custom"}
        {@render custom(item)}
      {/if}
    {/each}
  </div>
{/if}
