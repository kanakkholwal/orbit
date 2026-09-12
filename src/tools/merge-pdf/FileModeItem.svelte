<script lang="ts">
  import { Button } from "$components/ui/button";
  import { formatBytes } from "$utils/helper";
  import {
    IconArrowDown as ArrowDown,
    IconArrowUp as ArrowUp,
    IconGripVertical as GripVertical,
    IconX as X,
  } from "@tabler/icons-svelte";
  import type { MergeState, UploadedFile } from "./helper.svelte";

  type Props = {
    file: UploadedFile;
    index: number;
    total: number;
    store: MergeState;
  };

  let { file, index, total, store }: Props = $props();

  const issue = $derived(store.rangeIssue(file));
  const pages = $derived(store.pagesFor(file));
  const inputId = $props.id();
</script>

<div
  class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-card py-2 pl-1 pr-2 transition-colors duration-150 sm:flex-nowrap {issue
    ? 'border-destructive'
    : 'border-border'}"
>
  <div class="flex items-center">
    <span
      class="drag-handle grid size-9 cursor-grab place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
      aria-hidden="true"
    >
      <GripVertical class="size-4" />
    </span>
    <span class="grid size-8 place-items-center rounded-lg bg-muted text-body font-medium tabular-nums text-foreground">
      {index + 1}
    </span>
  </div>

  <div class="flex min-w-0 flex-1 flex-col gap-0.5">
    <span class="truncate text-body font-medium text-foreground" title={file.name}>{file.name}</span>
    <span class="text-caption tabular-nums text-muted-foreground">
      {formatBytes(file.size)} · {file.pageRange.trim() && !issue
        ? `${pages} of ${file.pageCount} pages`
        : `${file.pageCount} ${file.pageCount === 1 ? "page" : "pages"}`}
    </span>
  </div>

  <div class="order-last flex w-full flex-col gap-1 pl-10 sm:order-0 sm:w-40 sm:pl-0">
    <label for={inputId} class="sr-only">Pages to include from {file.name}</label>
    <input
      id={inputId}
      type="text"
      inputmode="numeric"
      bind:value={file.pageRange}
      placeholder={`All ${file.pageCount} pages`}
      aria-invalid={issue ? "true" : undefined}
      aria-describedby={issue ? `${inputId}-issue` : undefined}
      class="h-9 w-full rounded-lg border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring {issue
        ? 'border-destructive'
        : 'border-border'}"
    />
    {#if issue}
      <span id={`${inputId}-issue`} class="text-caption text-destructive">{issue}</span>
    {/if}
  </div>

  <div class="flex items-center">
    <Button
      variant="ghost"
      size="icon-sm"
      class="text-muted-foreground"
      disabled={index === 0}
      onclick={() => store.moveFile(index, -1)}
      aria-label={`Move ${file.name} up`}
    >
      <ArrowUp class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="text-muted-foreground"
      disabled={index === total - 1}
      onclick={() => store.moveFile(index, 1)}
      aria-label={`Move ${file.name} down`}
    >
      <ArrowDown class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      onclick={() => store.removeFile(file.id)}
      aria-label={`Remove ${file.name}`}
    >
      <X class="size-4" />
    </Button>
  </div>
</div>
