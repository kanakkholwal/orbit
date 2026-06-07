<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { ArrowRight, LoaderCircle } from "@lucide/svelte";
  import { ExtractPagesState } from "./helper.svelte";

  const store = new ExtractPagesState();
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files[0])}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.state.file.name}
      count={store.state.pageCount}
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow name={store.state.file.name}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.state.file.size)}
        </span>
        <span class="text-muted-foreground/40">·</span>
        <span class="font-mono tabular-nums">
          {store.state.pageCount} pages
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Pages to extract">
      <div class="flex flex-col gap-2">
        <Label
          for="pages-input"
          class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          Range
        </Label>
        <Input
          id="pages-input"
          type="text"
          bind:value={store.state.pagesToExtract}
          placeholder="e.g. 1, 3-5, 8"
          class="h-10 rounded-sm font-mono text-sm"
        />
        <p
          class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60"
        >
          {store.state.pageCount} pages available
        </p>
      </div>

      <ul
        class="mt-4 flex flex-col divide-y divide-border/60 overflow-hidden rounded-sm border border-border/60 bg-muted/20 text-xs"
      >
        {#each [
          ["1, 2, 3", "Specific single pages"],
          ["1-5", "A range of pages"],
          ["1, 3-5, 8", "Mix of singles and ranges"],
        ] as [example, body]}
          <li class="flex items-center gap-3 px-4 py-2.5">
            <code
              class="rounded-xs bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground"
            >
              {example}
            </code>
            <span class="text-muted-foreground">{body}</span>
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing
        ? store.progressLabel
        : store.state.pagesToExtract
          ? `Extract ${store.state.pagesToExtract}`
          : "Enter a range to begin"}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.extract()}
        disabled={store.isProcessing || !store.state.pagesToExtract}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          Extract pages
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
