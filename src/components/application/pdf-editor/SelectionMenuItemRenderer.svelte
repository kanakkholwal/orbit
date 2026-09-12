<script lang="ts">
  import { cn } from "$lib/utils";
  import { type SelectionMenuItem, type SelectionMenuPropsBase, getUIItemProps } from "@embedpdf/plugin-ui/svelte";
  import { chromeGap } from "./chrome";
  import CommandButtonItem from "./CommandButtonItem.svelte";
  import Self from "./SelectionMenuItemRenderer.svelte";

  interface Props {
    item: SelectionMenuItem;
    documentId: string;
    props: SelectionMenuPropsBase;
  }

  let { item, documentId, props }: Props = $props();
</script>

{#if item.type === "command-button"}
  <CommandButtonItem {item} {documentId} />
{:else if item.type === "divider"}
  <div {...getUIItemProps(item)} aria-hidden="true">
    <div class="mx-0.5 h-5 w-px bg-border"></div>
  </div>
{:else if item.type === "group"}
  <div {...getUIItemProps(item)} class={cn("flex items-center", chromeGap[Math.min(item.gap ?? 1, 4)])}>
    {#each item.items as child (child.id)}
      <Self item={child} {documentId} {props} />
    {/each}
  </div>
{/if}
