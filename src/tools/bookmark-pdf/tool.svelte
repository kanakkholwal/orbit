<script lang="ts">
  import Button from "$components/ui/button/button.svelte";
  import * as Dialog from "$components/ui/dialog";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { FolderTree, Plus, Redo, Save, Undo } from "@lucide/svelte";
  import { onMount } from "svelte";
  import BookmarkItem from "./BookmarkItem.svelte";
  import { BookmarkPdfState, type BookmarkNode } from "./helper.svelte";
  import Viewer from "./Viewer.svelte";
  const store = new BookmarkPdfState();

  // Modal State
  let showModal = $state(false);
  let editingId = $state<string | null>(null);
  let parentId = $state<string | null>(null);
  let modalTitle = $state("");

  // Listen for events from children
  onMount(() => {
    const handleEdit = (e: any) => {
      if (e.detail.nodeId) {
        // Edit existing
        const findNode = (nodes: BookmarkNode[]): BookmarkNode | undefined => {
          for (const n of nodes) {
            if (n.id === e.detail.nodeId) return n;
            const f = findNode(n.children);
            if (f) return f;
          }
        };
        const node = findNode(store.state.bookmarks);
        if (node) {
          editingId = node.id;
          modalTitle = node.title;
          parentId = null;
          showModal = true;
        }
      } else if (e.detail.parentId) {
        // Add Child
        editingId = null;
        parentId = e.detail.parentId;
        modalTitle = "";
        showModal = true;
      }
    };

    document.addEventListener("edit-bookmark", handleEdit);
    return () => document.removeEventListener("edit-bookmark", handleEdit);
  });

  function saveModal() {
    if (editingId) {
      store.updateBookmark(editingId, { title: modalTitle });
    } else {
      // Find parent node object if parentId exists
      let parentNode: BookmarkNode | null = null;
      if (parentId) {
        const findNode = (nodes: BookmarkNode[]): BookmarkNode | undefined => {
          for (const n of nodes) {
            if (n.id === parentId) return n;
            const f = findNode(n.children);
            if (f) return f;
          }
        };
        parentNode = findNode(store.state.bookmarks) || null;
      }
      store.addBookmark(parentNode, modalTitle);
    }
    showModal = false;
  }
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
  />
{:else}
  <div class="flex flex-col h-full lg:flex-row bg-muted/10 overflow-hidden">
    <div class="w-full lg:w-96 flex flex-col border-r bg-background">
      <div class="p-3 border-b flex items-center justify-between">
        <div class="font-semibold flex items-center gap-2">
          <FolderTree size={18} /> Bookmarks
        </div>
        <div class="flex gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            onclick={() => store.undo()}
            disabled={store.state.historyIndex <= 0}
          >
            <Undo size={16} />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            onclick={() => store.redo()}
            disabled={store.state.historyIndex >=
              store.state.history.length - 1}
          >
            <Redo size={16} />
          </Button>
        </div>
      </div>

      <div class="p-3 border-b bg-muted/10">
        <div class="flex gap-2">
          <input
            bind:value={modalTitle}
            placeholder="New bookmark..."
            class="flex-1 px-2 py-1 text-sm border rounded"
            onkeydown={(e) =>
              e.key === "Enter" && store.addBookmark(null, modalTitle)}
          />
          <button
            onclick={() => store.addBookmark(null, modalTitle)}
            class="bg-primary text-primary-foreground p-1.5 rounded"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-2">
        {#if store.state.bookmarks.length === 0}
          <div class="text-center text-muted-foreground text-sm mt-10">
            No bookmarks yet. <br />
            <Button
              variant="default_soft"
              class="mt-2"
              onclick={() => store.extractExisting()}>Extract from PDF</Button
            >
          </div>
        {:else}
          {#each store.state.bookmarks as node (node.id)}
            <BookmarkItem {node} {store} />
          {/each}
        {/if}
      </div>

      <div class="p-4 border-t bg-background">
        <Button variant="dark" onclick={() => store.save()}>
          <Save size={18} /> Download PDF
        </Button>
      </div>
    </div>

    <div class="flex-1 relative min-w-0">
      <Viewer {store} />
    </div>
  </div>
{/if}
<Dialog.Root bind:open={showModal}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{editingId ? "Edit Bookmark" : "Add Child"}</Dialog.Title>
      <Dialog.Description>
        {editingId
          ? "Edit the title of the bookmark. Destination will remain unchanged."
          : "Add a new child bookmark under the selected parent."}
      </Dialog.Description>
    </Dialog.Header>
    <input
      bind:value={modalTitle}
      class="w-full border p-2 rounded mb-4"
      placeholder="Title"
      
    />
    <div class="flex justify-end gap-2">
      <button
        onclick={() => (showModal = false)}
        class="px-4 py-2 hover:bg-muted rounded">Cancel</button
      >
      <button
        onclick={saveModal}
        class="px-4 py-2 bg-primary text-primary-foreground rounded"
        >Save</button
      >
    </div>
  </Dialog.Content>
</Dialog.Root>
