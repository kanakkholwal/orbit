<script lang="ts">
  import { type SelectionMenuRendererProps, getUIItemProps } from "@embedpdf/plugin-ui/svelte";
  import { chromeFloating } from "./chrome";
  import SelectionMenuItemRenderer from "./SelectionMenuItemRenderer.svelte";

  let { schema, documentId, props }: SelectionMenuRendererProps = $props();

  const top = $derived(props.placement?.suggestTop ? "-52px" : `${props.rect.size.height + 8}px`);
</script>

<div style={props.menuWrapperProps.style} use:props.menuWrapperProps.action {...getUIItemProps(schema)}>
  <div
    role="toolbar"
    aria-label="Selection actions"
    class="{chromeFloating} pointer-events-auto absolute left-1/2 flex -translate-x-1/2 cursor-default items-center gap-0.5 p-1"
    style:top
  >
    {#each schema.items as item (item.id)}
      <SelectionMenuItemRenderer {item} {documentId} {props} />
    {/each}
  </div>
</div>
