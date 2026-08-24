<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { arrayMove, sortableList } from "$lib/actions/sortable-list";
  import { cn } from "$lib/utils";
  import {
    IconArrowRight as ArrowRight,
    IconFileStack as FileStack,
    IconLayoutGrid as Grid,
    IconLoader2 as LoaderCircle,
    IconPlus as Plus,
  } from "@tabler/icons-svelte";
  import { setContext } from "svelte";
  import FileModeItem from "./FileModeItem.svelte";
  import { MERGE_STATE_KEY, MergeState } from "./helper.svelte";
  import PageModeThumbnail from "./PageModeThumbnail.svelte";

  const localStore = new MergeState();
  setContext(MERGE_STATE_KEY, localStore);

  let uploadArea: ReturnType<typeof UploadArea>;

  const fileListSort = {
    onReorder: (o: number, n: number) =>
      (localStore.files = arrayMove(localStore.files, o, n)),
    options: {
      handle: ".drag-handle",
      animation: 200,
      ghostClass: "opacity-40",
      dragClass: "cursor-grabbing",
    },
  };

  const pageGridSort = {
    onReorder: (o: number, n: number) =>
      (localStore.allPages = arrayMove(localStore.allPages, o, n)),
    options: {
      animation: 200,
      ghostClass: "opacity-40",
      dragClass: "cursor-grabbing",
      delay: 100,
      delayOnTouchOnly: true,
    },
  };
</script>

<UploadArea
  bind:this={uploadArea}
  onFilesSelected={(files) => localStore.addFiles(files)}
  class={localStore.files.length > 0 ? "hidden" : ""}
/>

{#if localStore.files.length > 0}
  <div class="flex flex-col gap-8">
    <ToolBar
      label={localStore.mode === "file" ? "File mode" : "Page mode"}
      count={localStore.mode === "file"
        ? localStore.files.length
        : localStore.allPages.length}
      onReset={() => localStore.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <div class="flex rounded-sm bg-muted/40 p-1">
          {#each [
            { id: "file", label: "Files", icon: FileStack },
            { id: "page", label: "Pages", icon: Grid },
          ] as opt}
            <button
              type="button"
              onclick={() => (localStore.mode = opt.id as any)}
              class={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 label-eyebrow transition-colors",
                localStore.mode === opt.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <opt.icon class="size-3" />
              {opt.label}
            </button>
          {/each}
        </div>

        <Button
          variant="outline"
          size="sm"
          onclick={() => uploadArea.click()}
          class="rounded-sm"
        >
          <Plus class="size-3.5" />
          <span class="hidden sm:inline">Add</span>
        </Button>
      {/snippet}
    </ToolBar>

    <ToolPanel
      title={localStore.mode === "file" ? "Files" : "Pages"}
      counter={localStore.mode === "file"
        ? localStore.files.length
        : localStore.allPages.length}
    >
      <div class="rounded-md border border-border bg-muted/10 p-3 sm:p-4">
        {#if localStore.mode === "file"}
          <div class="flex flex-col gap-2" use:sortableList={fileListSort}>
            {#each localStore.files as file (file.id)}
              <FileModeItem
                {file}
                onRemove={() => localStore.removeFile(file.id)}
              />
            {/each}
          </div>

          <div
            class="mt-6 flex items-start gap-3 rounded-sm border border-border bg-card px-4 py-3"
          >
            <span
              class="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary"
            >
              <FileStack class="size-3.5" />
            </span>
            <div class="flex flex-col gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <span class="label-eyebrow text-muted-foreground">
                Quick tips
              </span>
              <ul class="ml-4 list-disc space-y-1">
                <li>Drag the handle on the left to reorder files.</li>
                <li>
                  Type ranges like
                  <code class="rounded-xs bg-muted/60 px-1 font-mono text-caption text-foreground">1-3, 5</code>
                  to merge specific pages only.
                </li>
                <li>Leave the range blank to include the entire file.</li>
              </ul>
            </div>
          </div>
        {:else}
          <div
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            use:sortableList={pageGridSort}
          >
            {#each localStore.allPages as item (item.id)}
              <PageModeThumbnail {item} store={localStore} />
            {/each}
          </div>

          {#if localStore.allPages.length === 0}
            <div class="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <LoaderCircle class="size-4 animate-spin text-primary" />
              <p class="label-eyebrow text-muted-foreground">
                Loading pages
              </p>
            </div>
          {/if}
        {/if}
      </div>
    </ToolPanel>

    <ToolFooter
      hint={localStore.isProcessing
        ? localStore.progress.text || "Processing"
        : "Ready to merge"}
    >
      <Button
        size="lg"
        class="rounded-sm px-6"
        onclick={() => localStore.mergeAndDownload()}
        disabled={localStore.isProcessing}
      >
        {#if localStore.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {localStore.progress.text || "Processing"}
        {:else}
          Merge PDF
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
