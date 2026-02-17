<script lang="ts">
  import {
    ChevronDown,
    ChevronRight,
    Crosshair,
    Edit2,
    GripVertical,
    Plus,
    Trash2,
  } from "@lucide/svelte";
  import { slide } from "svelte/transition";
  import type { BookmarkNode, BookmarkPdfState } from "./helper.svelte";

  let {
    node,
    store,
    depth = 0,
  } = $props<{ node: BookmarkNode; store: BookmarkPdfState; depth?: number }>();

  let isSelected = $derived(store.state.selectedIds.has(node.id));

  function toggleSelect() {
    if (store.state.selectedIds.has(node.id)) {
      store.state.selectedIds.delete(node.id);
    } else {
      store.state.selectedIds.add(node.id);
    }
    // Force reactivity on Set if needed, or rely on Svelte 5 deep reactivity
  }

  function toggleExpand() {
    store.updateBookmark(node.id, { isExpanded: !node.isExpanded });
  }

  // Styles based on node props
  const styleClass = $derived(
    [
      node.style?.includes("bold") ? "font-bold" : "",
      node.style?.includes("italic") ? "italic" : "",
      // Simple color mapping for text
      node.color === "red"
        ? "text-red-600"
        : node.color === "blue"
          ? "text-blue-600"
          : node.color === "green"
            ? "text-green-600"
            : node.color === "purple"
              ? "text-purple-600"
              : "",
    ].join(" "),
  );
</script>

<div class="flex flex-col select-none">
  <div
    class="group flex items-center gap-2 p-2 rounded border border-transparent hover:bg-muted/50 {isSelected
      ? 'bg-muted ring-1 ring-primary border-primary/20'
      : ''}"
    style="padding-left: {depth * 1.5 + 0.5}rem"
  >
    <div class="cursor-move text-muted-foreground/50 hover:text-foreground">
      <GripVertical size={14} />
    </div>

    {#if store.state.selectedIds.size > 0 || isSelected}
      <input
        type="checkbox"
        checked={isSelected}
        onclick={toggleSelect}
        class="h-4 w-4 rounded border-gray-300"
      />
    {/if}

    <button
      onclick={toggleExpand}
      class="p-0.5 rounded hover:bg-black/5 text-muted-foreground w-5 h-5 flex items-center justify-center"
      style="visibility: {node.children.length ? 'visible' : 'hidden'}"
    >
      {#if node.isExpanded}
        <ChevronDown size={14} />
      {:else}
        <ChevronRight size={14} />
      {/if}
    </button>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      tabindex="-1"
      role="button"
      class="flex-1 min-w-0 cursor-pointer"
      onclick={() => {
        store.state.currentPage = node.page;
        // Trigger view update in parent via state
      }}
    >
      <div class="flex items-center gap-2">
        <span class="text-sm {styleClass} truncate">{node.title}</span>
        {#if node.destX !== null}
          <Crosshair size={10} class="text-blue-500" />
        {/if}
      </div>
      <span class="text-[10px] text-muted-foreground">Page {node.page}</span>
    </div>

    <div
      class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <button
        class="p-1.5 hover:bg-background rounded shadow-sm border border-transparent hover:border-border"
        title="Add Child"
        onclick={() => {
          /* Open Modal for Child */ document.dispatchEvent(
            new CustomEvent("edit-bookmark", { detail: { parentId: node.id } }),
          );
        }}
      >
        <Plus size={12} />
      </button>
      <button
        class="p-1.5 hover:bg-background rounded shadow-sm border border-transparent hover:border-border"
        title="Edit"
        onclick={() => {
          /* Open Modal for Edit */ document.dispatchEvent(
            new CustomEvent("edit-bookmark", { detail: { nodeId: node.id } }),
          );
        }}
      >
        <Edit2 size={12} />
      </button>
      <button
        class="p-1.5 hover:bg-background rounded shadow-sm border border-transparent hover:border-border text-red-500"
        title="Delete"
        onclick={() => store.deleteBookmark(node.id)}
      >
        <Trash2 size={12} />
      </button>
    </div>
  </div>

  {#if node.isExpanded && node.children.length > 0}
    <div class="flex flex-col" transition:slide={{ duration: 200 }}>
      {#each node.children as child (child.id)}
        <svelte:self node={child} {store} depth={depth + 1} />
      {/each}
    </div>
  {/if}
</div>
