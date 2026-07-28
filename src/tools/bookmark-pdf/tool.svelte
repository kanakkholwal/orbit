<script lang="ts">
  import { Button } from "$components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "$components/ui/dialog";
  import { Input } from "$components/ui/input";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { IconFolders as FolderTree, IconPlus as Plus, IconArrowForwardUp as Redo, IconDeviceFloppy as Save, IconArrowBackUp as Undo } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import BookmarkItem from "./BookmarkItem.svelte";
  import { BookmarkPdfState, type BookmarkNode } from "./helper.svelte";
  import Viewer from "./Viewer.svelte";
  const store = new BookmarkPdfState();

  let showModal = $state(false);
  let editingId = $state<string | null>(null);
  let parentId = $state<string | null>(null);
  let modalTitle = $state("");

  onMount(() => {
    const handleEdit = (e: any) => {
      if (e.detail.nodeId) {
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
  <div
    class="flex h-full flex-col gap-3 overflow-hidden lg:flex-row"
  >
    <aside
      class="flex w-full flex-col overflow-hidden rounded-md border border-border/60 bg-card lg:w-96"
    >
      <header class="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <div class="flex items-center gap-2">
          <span
            class="inline-flex size-7 items-center justify-center rounded-sm bg-primary/10 text-primary"
          >
            <FolderTree class="size-3.5" />
          </span>
          <span
            class="label-eyebrow text-foreground"
          >
            Bookmarks
          </span>
        </div>
        <div class="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            class="rounded-sm text-muted-foreground hover:text-foreground"
            onclick={() => store.undo()}
            disabled={store.state.historyIndex <= 0}
            title="Undo"
          >
            <Undo class="size-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            class="rounded-sm text-muted-foreground hover:text-foreground"
            onclick={() => store.redo()}
            disabled={store.state.historyIndex >= store.state.history.length - 1}
            title="Redo"
          >
            <Redo class="size-3.5" />
          </Button>
        </div>
      </header>

      <div class="flex items-center gap-2 border-b border-border/60 bg-muted/10 px-3 py-2.5">
        <Input
          bind:value={modalTitle}
          placeholder="New bookmark…"
          class="h-9 flex-1 rounded-sm font-mono text-sm"
          onkeydown={(e) =>
            e.key === "Enter" && store.addBookmark(null, modalTitle)}
        />
        <Button
          variant="outline"
          size="icon-sm"
          class="rounded-sm"
          onclick={() => store.addBookmark(null, modalTitle)}
        >
          <Plus class="size-3.5" />
        </Button>
      </div>

      <div class="flex-1 overflow-y-auto p-2">
        {#if store.state.bookmarks.length === 0}
          <div class="mt-10 flex flex-col items-center gap-3 text-center">
            <p
              class="label-eyebrow text-muted-foreground"
            >
              No bookmarks yet
            </p>
            <Button
              variant="outline"
              size="sm"
              class="rounded-sm bg-primary/10 text-primary hover:bg-primary/15"
              onclick={() => store.extractExisting()}
            >
              Extract from PDF
            </Button>
          </div>
        {:else}
          {#each store.state.bookmarks as node (node.id)}
            <BookmarkItem {node} {store} />
          {/each}
        {/if}
      </div>

      <footer class="border-t border-border/60 p-3">
        <Button
          class="w-full rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
          onclick={() => store.save()}
        >
          <Save class="size-4" />
          Download PDF
        </Button>
      </footer>
    </aside>

    <div class="relative min-w-0 flex-1 overflow-hidden rounded-md border border-border/60 bg-card">
      <Viewer {store} />
    </div>
  </div>
{/if}

<Dialog bind:open={showModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{editingId ? "Edit bookmark" : "Add child"}</DialogTitle>
      <DialogDescription>
        {editingId
          ? "Edit the title. The destination remains unchanged."
          : "Add a new child bookmark under the selected parent."}
      </DialogDescription>
    </DialogHeader>
    <Input
      bind:value={modalTitle}
      class="mt-3 h-10 rounded-sm font-mono text-sm"
      placeholder="Title"
    />
    <div class="mt-4 flex justify-end gap-2">
      <Button
        variant="ghost"
        class="rounded-sm"
        onclick={() => (showModal = false)}
      >
        Cancel
      </Button>
      <Button
        class="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
        onclick={saveModal}
      >
        Save
      </Button>
    </div>
  </DialogContent>
</Dialog>
