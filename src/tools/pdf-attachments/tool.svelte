<script lang="ts">
  import { FileRow, ResultCard, StatusPill, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Checkbox } from "$components/ui/checkbox";
  import { Input } from "$components/ui/input";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconArrowBackUp as Undo,
    IconDownload as Download,
    IconFile as FileIcon,
    IconFileZip as FileZip,
    IconLoader2 as Loader,
    IconLock as Lock,
    IconPaperclip as Paperclip,
    IconPlus as Plus,
    IconRefresh as Refresh,
    IconTrash as Trash,
  } from "@tabler/icons-svelte";
  import { AttachmentsState } from "./helper.svelte";

  const store = new AttachmentsState();
  const uid = $props.id();
  let addInput = $state<HTMLInputElement | null>(null);

  const selectable = $derived(store.attachments.filter((a) => !store.removed.includes(a.id)));
  const allSelected = $derived(selectable.length > 0 && selectable.every((a) => store.selected.includes(a.id)));
  const someSelected = $derived(store.selected.length > 0 && !allSelected);
  const showResult = $derived(!store.isProcessing && store.result !== null);

  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  const changeSummary = $derived.by(() => {
    const parts: string[] = [];
    if (store.pending.length > 0) parts.push(`${plural(store.pending.length, "file", "files")} to add`);
    if (store.removed.length > 0) parts.push(`${store.removed.length} to remove`);
    return parts.join(" · ");
  });

  const resultDescription = $derived.by(() => {
    const r = store.result;
    if (!r) return "";
    const parts: string[] = [];
    if (r.added > 0) parts.push(`${plural(r.added, "file", "files")} added`);
    if (r.removed > 0) parts.push(`${plural(r.removed, "file", "files")} removed`);
    return `${parts.join(" and ")}. ${r.name} is downloaded.`;
  });

  function describeKind(mime: string, name: string): string {
    const ext = name.includes(".") ? name.split(".").pop()?.toUpperCase() : "";
    if (ext && ext.length <= 5) return `${ext} file`;
    if (mime) return mime;
    return "File";
  }
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet icon()}
      <Paperclip class="size-6" stroke={1.75} />
    {/snippet}
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to see its attachments</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Save the files tucked inside a PDF, remove the ones you don't want, or attach new ones.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard title="Attachments saved" description={resultDescription}>
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="pdf-attachments" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.name}
      meta={`${formatBytes(store.file.size)} · ${plural(store.pageCount, "page", "pages")}`}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    {#if store.loading}
      <div class="flex items-center gap-2 rounded-2xl border border-border bg-card p-5 text-body text-muted-foreground">
        <Loader class="size-4 animate-spin text-primary" />
        Looking for attachments…
      </div>
    {:else if store.locked}
      <section class="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
          <Lock class="size-5" stroke={1.75} />
        </span>
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <h2 class="text-body-lg font-medium text-foreground">This PDF is locked</h2>
            <p class="max-w-prose text-body text-muted-foreground">
              Attachments in a password-protected PDF can't be read. Unlock it first, then open the unlocked copy here.
            </p>
          </div>
          <div><Button variant="outline" href="/tools/decrypt-pdf">Unlock the PDF</Button></div>
        </div>
      </section>
    {:else}
      <ToolBar
        label="Attachments"
        count={store.attachments.length}
        meta={store.attachments.length > 0 ? formatBytes(store.totalSize) : undefined}
      >
        {#snippet actions()}
          {#if store.selected.length > 0}
            <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => store.removeSelected()}>
              <Trash />
              Remove {store.selected.length}
            </Button>
          {/if}
          {#if store.attachments.length > 1}
            <Button variant="outline" size="sm" onclick={() => store.downloadAll()}>
              <FileZip />
              Download all
            </Button>
          {/if}
          <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => addInput?.click()}>
            <Plus />
            Add files
          </Button>
        {/snippet}
      </ToolBar>

      {#if store.attachments.length === 0 && store.pending.length === 0}
        <section class="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-5 py-10 text-center">
          <span class="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
            <Paperclip class="size-5" stroke={1.75} />
          </span>
          <div class="flex flex-col gap-1">
            <h2 class="text-body-lg font-medium text-foreground">No attachments in this PDF</h2>
            <p class="max-w-sm text-pretty text-body text-muted-foreground">
              Add spreadsheets, images or any other file to carry them inside the PDF.
            </p>
          </div>
          <Button variant="outline" onclick={() => addInput?.click()}>
            <Plus />
            Add files
          </Button>
        </section>
      {:else}
        {#if selectable.length > 1}
          <label class="flex w-fit cursor-pointer items-center gap-2.5 px-3 text-body text-muted-foreground">
            <Checkbox checked={allSelected} indeterminate={someSelected} onCheckedChange={(v) => store.selectAll(v)} />
            Select all
          </label>
        {/if}

        <ul class="flex flex-col gap-2">
          {#each store.attachments as attachment (attachment.id)}
            {@const removed = store.removed.includes(attachment.id)}
            {@const checkId = `${uid}-check-${attachment.id}`}
            <li class="flex items-center gap-3 rounded-xl border border-border bg-card py-2 pl-3 pr-2">
              <Checkbox
                id={checkId}
                checked={store.selected.includes(attachment.id)}
                onCheckedChange={(v) => store.toggleSelected(attachment.id, v)}
                disabled={removed || store.isProcessing}
                aria-label={`Select ${attachment.name}`}
              />
              <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <FileIcon class="size-5" stroke={1.75} />
              </span>
              <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                <span class={cn("truncate text-body font-medium", removed ? "text-muted-foreground line-through" : "text-foreground")} title={attachment.name}>
                  {attachment.name}
                </span>
                <span class="flex flex-wrap items-center gap-x-2 text-caption tabular-nums text-muted-foreground">
                  <span>{formatBytes(attachment.size)}</span>
                  <span>· {describeKind(attachment.mimeType, attachment.name)}</span>
                  {#if attachment.source === "page" && attachment.pageIndex !== undefined}
                    <span>· Pinned to page {attachment.pageIndex + 1}</span>
                  {/if}
                </span>
                {#if attachment.description}
                  <span class="truncate text-caption text-muted-foreground" title={attachment.description}>{attachment.description}</span>
                {/if}
              </div>
              <div class="flex shrink-0 items-center gap-1">
                {#if removed}
                  <StatusPill status="idle" label="Will be removed" class="hidden sm:inline-flex" />
                  <Button variant="ghost" size="sm" onclick={() => store.toggleRemoved(attachment.id)} disabled={store.isProcessing}>
                    <Undo />
                    Keep
                  </Button>
                {:else}
                  <Button variant="ghost" size="icon-sm" aria-label={`Download ${attachment.name}`} onclick={() => store.download(attachment)}>
                    <Download class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${attachment.name}`}
                    disabled={store.isProcessing}
                    onclick={() => store.toggleRemoved(attachment.id)}
                  >
                    <Trash class="size-4" />
                  </Button>
                {/if}
              </div>
            </li>
          {/each}

          {#each store.pending as item (item.id)}
            <li class="flex flex-col gap-2 rounded-xl border border-primary/40 bg-primary/5 p-2 pl-3 sm:flex-row sm:items-center sm:gap-3">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Plus class="size-5" stroke={1.75} />
                </span>
                <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span class="truncate text-body font-medium text-foreground" title={item.file.name}>{item.file.name}</span>
                  <span class="text-caption tabular-nums text-muted-foreground">{formatBytes(item.file.size)} · Added when you save</span>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <label for="{uid}-desc-{item.id}" class="sr-only">Description for {item.file.name}</label>
                <Input id="{uid}-desc-{item.id}" bind:value={item.description} placeholder="Description (optional)" class="h-9 sm:w-56" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Don't add ${item.file.name}`}
                  disabled={store.isProcessing}
                  onclick={() => store.removePending(item.id)}
                >
                  <Trash class="size-4" />
                </Button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}

      <input
        bind:this={addInput}
        type="file"
        multiple
        class="hidden"
        onchange={(e) => {
          const picked = Array.from(e.currentTarget.files ?? []);
          if (picked.length > 0) store.addFiles(picked);
          e.currentTarget.value = "";
        }}
      />
    {/if}
  </div>

  {#if !store.locked && !store.loading}
    <ToolFooter>
      {#snippet hint()}
        <span class="block truncate">
          {#if store.isProcessing}
            Saving the PDF…
          {:else if store.hasChanges}
            {changeSummary}
          {:else if store.attachments.length > 0}
            Download files, or add and remove some to save a new copy
          {:else}
            Add files to attach them
          {/if}
        </span>
      {/snippet}
      <Button variant="primary" onclick={() => store.save()} disabled={store.isProcessing || !store.hasChanges}>
        {store.isProcessing ? "Saving…" : "Save PDF"}
      </Button>
    </ToolFooter>
  {/if}
{/if}
