<script lang="ts">
  import { FileRow, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconCheck as Check,
    IconChevronDown as ChevronDown,
    IconCopy as Copy,
    IconLoader2 as Loader,
  } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import { ViewMetadataState } from "./helper.svelte";

  const store = new ViewMetadataState();
  let pickInput = $state<HTMLInputElement | null>(null);
  let copiedKey = $state<string | null>(null);

  const friendly: Record<string, string> = {
    Title: "Title",
    Author: "Author",
    Subject: "Subject",
    Keywords: "Keywords",
    Creator: "Made with",
    Producer: "Saved as PDF by",
    CreationDate: "Created",
    ModDate: "Last changed",
    PDFFormatVersion: "PDF version",
    Language: "Language",
    IsLinearized: "Fast web view",
    IsAcroFormPresent: "Has fillable form",
    IsXFAPresent: "Has XFA form",
    IsCollectionPresent: "Is a PDF portfolio",
    IsSignaturesPresent: "Has signatures",
    EncryptFilterName: "Encryption",
  };

  const labelFor = (key: string) => friendly[key] ?? key;
  const isUnset = (value: string) => value === "- Not Set -" || value.trim() === "";
  const displayValue = (value: string) =>
    isUnset(value) ? "Not set" : value === "true" ? "Yes" : value === "false" ? "No" : value;

  const hasCopyable = $derived(Object.keys(store.flatMetadataRecord).length > 0);
  const infoCount = $derived(store.infoDictionary?.items.length ?? 0);
  const failed = $derived(!store.isProcessing && !store.infoDictionary);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedKey = key;
      setTimeout(() => {
        if (copiedKey === key) copiedKey = null;
      }, 2000);
    } catch {
      toast.error("Couldn't copy to the clipboard.");
    }
  }
</script>

{#snippet copyButton(text: string, key: string, label: string)}
  <Button
    variant="ghost"
    size="icon-sm"
    class="text-muted-foreground hover:text-foreground focus-visible:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
    aria-label={copiedKey === key ? "Copied" : `Copy ${label}`}
    onclick={() => copy(text, key)}
  >
    {#if copiedKey === key}
      <Check class="size-4 text-success" />
    {:else}
      <Copy class="size-4" />
    {/if}
  </Button>
{/snippet}

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to see its details</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        See who made it, when it was created and changed, and any hidden details stored inside.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-6">
    <FileRow
      name={store.file.file.name}
      meta={formatBytes(store.file.originalSize)}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    {#if store.isProcessing}
      <p class="flex items-center gap-2 text-body text-muted-foreground" aria-live="polite">
        <Loader class="size-4 animate-spin text-primary" />
        Reading details
      </p>
    {:else if failed}
      <div class="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
        <p class="text-body font-medium text-foreground">We couldn't read this file's details</p>
        <p class="text-body text-muted-foreground">It may be damaged or locked with a password. Try another PDF.</p>
      </div>
    {:else}
      <section class="flex flex-col gap-3" aria-labelledby="view-metadata-document">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="view-metadata-document" class="text-body-lg font-medium text-foreground">Document details</h2>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasCopyable}
            onclick={() => copy(JSON.stringify(store.flatMetadataRecord, null, 2), "__all")}
          >
            {#if copiedKey === "__all"}
              <Check class="size-4 text-success" />
              Copied
            {:else}
              <Copy class="size-4" />
              Copy all
            {/if}
          </Button>
        </div>

        {#if infoCount === 0}
          <p class="rounded-xl border border-border bg-card px-4 py-3 text-body text-muted-foreground">
            This file doesn't store any document details.
          </p>
        {:else}
          <dl class="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {#each store.infoDictionary?.items ?? [] as item (item.key)}
              <div class="group grid grid-cols-1 items-center gap-x-4 pl-4 pr-1.5 pt-2 sm:grid-cols-[12rem_1fr] sm:pt-0">
                <dt class="text-body text-muted-foreground">{labelFor(item.key)}</dt>
                <dd class="flex min-h-11 items-center justify-between gap-2">
                  <span
                    class="min-w-0 wrap-break-word text-body tabular-nums {isUnset(item.value)
                      ? 'text-muted-foreground'
                      : 'text-foreground'}"
                  >
                    {displayValue(item.value)}
                  </span>
                  {#if !isUnset(item.value)}
                    {@render copyButton(item.value, `info:${item.key}`, labelFor(item.key))}
                  {/if}
                </dd>
              </div>
            {/each}
          </dl>
        {/if}
      </section>

      {#if store.formFields && store.formFields.items.length > 0}
        <section class="flex flex-col gap-3" aria-labelledby="view-metadata-fields">
          <h2 id="view-metadata-fields" class="text-body-lg font-medium text-foreground">
            Form fields
            <span class="text-body font-normal tabular-nums text-muted-foreground">{store.formFields.items.length}</span>
          </h2>
          <dl class="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {#each store.formFields.items as item (item.key)}
              <div class="grid grid-cols-1 gap-x-4 gap-y-0.5 px-4 py-2.5 sm:grid-cols-[12rem_1fr]">
                <dt class="min-w-0 wrap-break-word text-body text-muted-foreground">{item.key}</dt>
                <dd
                  class="min-w-0 wrap-break-word text-body tabular-nums {isUnset(item.value)
                    ? 'text-muted-foreground'
                    : 'text-foreground'}"
                >
                  {isUnset(item.value) ? "Empty" : item.value}
                </dd>
              </div>
            {/each}
          </dl>
        </section>
      {/if}

      {#if store.xmpMetadata && (store.xmpMetadata.items.length > 0 || store.xmpMetadata.rawString)}
        <details class="group/xmp rounded-xl border border-border bg-card">
          <summary
            class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
          >
            <span class="flex flex-col">
              <span class="text-body font-medium text-foreground">Extra details (XMP)</span>
              <span class="text-caption text-muted-foreground">Extended information some apps save inside the file</span>
            </span>
            <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform group-open/xmp:rotate-180" />
          </summary>

          <div class="border-t border-border">
            {#if store.xmpMetadata.items.length === 0}
              <div class="flex flex-col gap-2 p-4">
                <p class="text-body text-muted-foreground">We couldn't organise these details, so here they are as stored.</p>
                <pre
                  class="scrollbar-subtle max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-3 font-mono text-caption text-foreground">{store.xmpMetadata.rawString}</pre>
              </div>
            {:else}
              <dl class="flex flex-col divide-y divide-border">
                {#each store.xmpMetadata.items as item, i (`${i}:${item.key}`)}
                  <div
                    class="grid grid-cols-1 gap-x-4 gap-y-0.5 py-2.5 pr-4 sm:grid-cols-[14rem_1fr]"
                    style:padding-left={`${1 + item.indentLevel * 1.25}rem`}
                  >
                    {#if item.value === ""}
                      <dt class="col-span-full text-body font-medium text-foreground">{item.key}</dt>
                    {:else}
                      <dt class="min-w-0 wrap-break-word text-body text-muted-foreground">{item.key}</dt>
                      <dd class="min-w-0 wrap-break-word text-body tabular-nums text-foreground">{item.value}</dd>
                    {/if}
                  </div>
                {/each}
              </dl>
            {/if}
          </div>
        </details>
      {/if}
    {/if}

    <input
      bind:this={pickInput}
      type="file"
      accept=".pdf,application/pdf"
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) {
          store.reset();
          store.loadFile(picked);
        }
        e.currentTarget.value = "";
      }}
    />
  </div>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="block truncate">Reading details…</span>
      {:else if failed}
        <span class="block truncate">Choose another PDF to try again.</span>
      {:else}
        <span class="block truncate tabular-nums">
          {infoCount} {infoCount === 1 ? "detail" : "details"}{store.formFields?.items.length
            ? ` · ${store.formFields.items.length} form fields`
            : ""}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" disabled={store.isProcessing} onclick={() => pickInput?.click()}>
      Check another file
    </Button>
  </ToolFooter>
{/if}
