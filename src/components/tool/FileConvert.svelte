<script lang="ts">
  import { FileRow, ProgressLine, ResultCard, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { downloadBlobFile as downloadBlob } from "$lib/download";
  import { IconDownload as Download, IconLoader2 as Loader, IconRefresh as Refresh } from "$lib/icons";
  import { formatBytes } from "$utils/helper";
  import type { Snippet } from "svelte";
  import { toast } from "svelte-sonner";

  type Output = { blob: Blob; name: string; summary?: string };
  type Progress = (current: number, total: number) => void;

  type Props = {
    accept: string;
    uploadTitle: string;
    uploadDescription: string;
    actionLabel: string;
    progressLabel?: string;
    doneTitle?: string;
    /** Shown above the options; use it for fidelity limits. */
    notice?: string;
    convert: (file: File, progress: Progress) => Promise<Output>;
    options?: Snippet;
  };

  let {
    accept,
    uploadTitle,
    uploadDescription,
    actionLabel,
    progressLabel = "Converting",
    doneTitle = "Your file is ready",
    notice,
    convert,
    options,
  }: Props = $props();

  let file = $state<File | null>(null);
  let busy = $state(false);
  let step = $state({ current: 0, total: 0 });
  let result = $state.raw<Output | null>(null);

  async function run() {
    if (!file || busy) return;
    busy = true;
    result = null;
    step = { current: 0, total: 0 };
    try {
      result = await convert(file, (current, total) => (step = { current, total }));
      downloadBlob(result.blob, result.name);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "The conversion failed.");
    } finally {
      busy = false;
    }
  }

  function reset() {
    file = null;
    result = null;
  }
</script>

{#if !file}
  <UploadArea {accept} multiple={false} onFilesSelected={(files) => (file = files[0])}>
    {#snippet title()}
      <h3 class="text-2xl font-medium text-foreground">{uploadTitle}</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-sm text-muted-foreground">{uploadDescription}</p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if result && !busy}
      <ResultCard title={doneTitle} description={result.summary ?? `${result.name} is downloaded.`}>
        {#snippet actions()}
          <Button variant="outline" onclick={() => result && downloadBlob(result.blob, result.name)}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={reset}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
      </ResultCard>
    {/if}

    <FileRow name={file.name} meta={formatBytes(file.size)} onRemove={busy ? undefined : reset} />

    {#if notice}
      <p class="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">{notice}</p>
    {/if}

    {@render options?.()}
  </div>

  <ToolFooter>
    {#snippet hint()}
      {#if busy && step.total > 0}
        <ProgressLine label={progressLabel} current={step.current} total={step.total} class="max-w-md" />
      {:else if busy}
        <span class="flex items-center gap-2 text-foreground">
          <Loader class="size-4 animate-spin text-primary" />
          Working…
        </span>
      {:else}
        <span class="block truncate">{file?.name}</span>
      {/if}
    {/snippet}

    <Button onclick={run} disabled={busy}>{busy ? "Working…" : actionLabel}</Button>
  </ToolFooter>
{/if}
