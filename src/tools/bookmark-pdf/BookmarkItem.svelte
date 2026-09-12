<script lang="ts">
  import { Button } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import {
    IconChevronRight as ChevronRight,
    IconLink as Link,
    IconPencil as Pencil,
    IconPlus as Plus,
    IconTrash as Trash,
  } from "@tabler/icons-svelte";
  import BookmarkItem from "./BookmarkItem.svelte";
  import type { BookmarkNode, BookmarkPdfState } from "./helper.svelte";

  let {
    node,
    store,
    depth = 0,
    selectedId,
    editingId,
    onselect,
    onedit,
  }: {
    node: BookmarkNode;
    store: BookmarkPdfState;
    depth?: number;
    selectedId: string | null;
    editingId: string | null;
    onselect: (id: string | null) => void;
    onedit: (id: string | null) => void;
  } = $props();

  const uid = $props.id();
  const selected = $derived(selectedId === node.id);
  const editing = $derived(editingId === node.id);
  const hasChildren = $derived(node.children.length > 0);
  const onCurrentPage = $derived(node.page === store.state.currentPage);

  let draft = $state("");

  function startEdit() {
    draft = node.title;
    onedit(node.id);
  }

  function commit() {
    if (!editing) return;
    const title = draft.trim();
    if (title && title !== node.title) store.updateBookmark(node.id, { title });
    onedit(null);
  }

  function addInside() {
    const id = store.addBookmark(node, "New bookmark");
    onselect(id);
    onedit(id);
  }

  function focusOnMount(el: HTMLInputElement) {
    if (draft === "") draft = node.title;
    el.focus();
    el.select();
  }
</script>

<li class="flex flex-col">
  <div
    class={cn("flex items-center gap-0.5 rounded-lg pr-1 transition-colors", selected ? "bg-muted" : "hover:bg-muted/60")}
    style:padding-left={`${depth * 0.75}rem`}
  >
    {#if hasChildren}
      <Button
        variant="ghost"
        size="icon-sm"
        class="text-muted-foreground hover:bg-transparent hover:text-foreground"
        aria-expanded={node.isExpanded ?? false}
        aria-label={`${node.isExpanded ? "Hide" : "Show"} bookmarks inside ${node.title}`}
        onclick={() => store.toggleExpanded(node.id)}
      >
        <ChevronRight class={cn("transition-transform", node.isExpanded && "rotate-90")} />
      </Button>
    {:else}
      <span class="size-9 shrink-0" aria-hidden="true"></span>
    {/if}

    {#if editing}
      <label for={`${uid}-title`} class="sr-only">Bookmark name</label>
      <input
        id={`${uid}-title`}
        type="text"
        bind:value={draft}
        {@attach focusOnMount}
        onblur={commit}
        onkeydown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") onedit(null);
        }}
        class="my-0.5 h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 text-body text-foreground outline-none transition-colors focus:border-ring"
      />
    {:else}
      <button
        type="button"
        onclick={() => {
          onselect(selected ? null : node.id);
          store.setPage(node.page);
        }}
        ondblclick={startEdit}
        aria-pressed={selected}
        class="flex min-h-9 min-w-0 flex-1 flex-col justify-center rounded-md px-1.5 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span
          class={cn(
            "truncate text-body text-foreground",
            node.style?.includes("bold") && "font-medium",
            node.style?.includes("italic") && "italic"
          )}
        >
          {node.title}
        </span>
        <span class={cn("text-caption tabular-nums", onCurrentPage ? "text-primary" : "text-muted-foreground")}>
          Page {node.page}
        </span>
      </button>
    {/if}
  </div>

  {#if selected && !editing}
    <div class="flex flex-wrap gap-1 pb-1.5 pt-0.5" style:padding-left={`${depth * 0.75 + 2.25}rem`}>
      <Button variant="ghost" size="sm" onclick={startEdit}>
        <Pencil />
        Rename
      </Button>
      <Button variant="ghost" size="sm" onclick={addInside}>
        <Plus />
        Add inside
      </Button>
      {#if !onCurrentPage}
        <Button variant="ghost" size="sm" onclick={() => store.updateBookmark(node.id, { page: store.state.currentPage })}>
          <Link />
          Use page {store.state.currentPage}
        </Button>
      {/if}
      <Button
        variant="ghost"
        size="sm"
        class="text-destructive hover:bg-destructive/10"
        onclick={() => {
          store.deleteBookmark(node.id);
          onselect(null);
        }}
      >
        <Trash />
        Remove
      </Button>
    </div>
  {/if}

  {#if node.isExpanded && hasChildren}
    <ul class="flex flex-col">
      {#each node.children as child (child.id)}
        <BookmarkItem node={child} {store} depth={depth + 1} {selectedId} {editingId} {onselect} {onedit} />
      {/each}
    </ul>
  {/if}
</li>
