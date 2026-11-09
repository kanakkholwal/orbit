<script lang="ts">
  import { AiGate, FileRow, ProgressLine } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { chunkText, createSummarizer, summarizerAvailability } from "$lib/chrome-ai";
  import { downloadBlobFile } from "$lib/download";
  import { IconCopy as Copy, IconDownload as Download, IconRefresh as Refresh } from "$lib/icons";
  import { extractPdfText } from "$lib/pdf/extract-text";
  import { formatBytes } from "$utils/helper";
  import { toast } from "svelte-sonner";

  let file = $state<File | null>(null);
  let busy = $state(false);
  let step = $state({ label: "", current: 0, total: 0 });
  let summary = $state("");
  let controller: AbortController | null = null;

  async function run() {
    if (!file || busy) return;
    busy = true;
    summary = "";
    controller = new AbortController();
    try {
      step = { label: "Reading the PDF", current: 0, total: 1 };
      const { text } = await extractPdfText(file, (current, total) => (step = { label: "Reading the PDF", current, total }));
      if (text.trim().length < 80) throw new Error("This PDF has no readable text. Run OCR first if it is a scan.");

      const summarizer = await createSummarizer({ type: "key-points", length: "medium", context: "A document converted from PDF." }, (f) => (step = { label: "Chrome is preparing its model", current: Math.round(f * 100), total: 100 }));
      const quota = Math.min(summarizer.inputQuota ?? 6000, 6000);
      const chunks = chunkText(text, Math.max(1500, quota - 500));
      const parts: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        step = { label: "Summarizing", current: i + 1, total: chunks.length };
        parts.push(await summarizer.summarize(chunks[i], { signal: controller.signal }));
      }
      summary = parts.length === 1 ? parts[0] : await summarizer.summarize(parts.join("\n\n").slice(0, quota), { signal: controller.signal });
      summarizer.destroy?.();
    } catch (error) {
      if ((error as Error).name !== "AbortError") toast.error(error instanceof Error ? error.message : "The summary failed.");
    } finally {
      busy = false;
      controller = null;
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(summary);
    toast.success("Summary copied");
  };
</script>

<AiGate api="Chrome's Summarizer" availability={summarizerAvailability}>
  {#if !file}
    <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => (file = files[0])}>
      {#snippet title()}
        <h3 class="text-2xl font-medium text-foreground">Drop a PDF to summarize</h3>
      {/snippet}
      {#snippet description()}
        <p class="max-w-sm text-pretty text-sm text-muted-foreground">
          Get the key points of a long document, written by the AI model built into Chrome.
        </p>
      {/snippet}
    </UploadArea>
  {:else}
    <div class="flex flex-col gap-4">
      <FileRow name={file.name} meta={formatBytes(file.size)} onRemove={busy ? undefined : () => ((file = null), (summary = ""))} />

      {#if summary}
        <section class="rounded-2xl border border-border bg-background p-1" aria-live="polite">
          <div class="flex flex-col gap-3 rounded-[11px] bg-card p-4">
            <h2 class="text-sm font-medium text-foreground">Key points</h2>
            <p class="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{summary}</p>
            <div class="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onclick={copy}><Copy />Copy</Button>
              <Button
                variant="outline"
                size="sm"
                onclick={() => downloadBlobFile(new Blob([summary], { type: "text/plain;charset=utf-8" }), `${file?.name.replace(/\.pdf$/i, "")}-summary.txt`)}
              >
                <Download />
                Save as text
              </Button>
              <Button variant="ghost" size="sm" onclick={run} disabled={busy}><Refresh />Summarize again</Button>
            </div>
          </div>
        </section>
      {/if}

      {#if busy}
        <ProgressLine label={step.label} current={step.current} total={step.total} />
        <Button variant="outline" size="sm" class="w-fit" onclick={() => controller?.abort()}>Cancel</Button>
      {:else if !summary}
        <Button class="w-fit" onclick={run}>Summarize</Button>
      {/if}
    </div>
  {/if}
</AiGate>
