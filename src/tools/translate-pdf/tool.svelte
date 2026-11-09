<script lang="ts">
  import { AiGate, FileRow, ProgressLine } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { chunkText, createTranslator, detectLanguage, translatorAvailability } from "$lib/chrome-ai";
  import { downloadBlobFile } from "$lib/download";
  import { IconCopy as Copy, IconDownload as Download } from "$lib/icons";
  import { extractPdfText } from "$lib/pdf/extract-text";
  import { formatBytes } from "$utils/helper";
  import { toast } from "svelte-sonner";

  const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "pt", label: "Portuguese" },
    { value: "hi", label: "Hindi" },
    { value: "ja", label: "Japanese" },
    { value: "zh", label: "Chinese" },
  ];

  let file = $state<File | null>(null);
  let target = $state("es");
  let busy = $state(false);
  let step = $state({ label: "", current: 0, total: 0 });
  let result = $state("");
  let controller: AbortController | null = null;

  const label = (code: string) => LANGUAGES.find((l) => l.value === code)?.label ?? code;

  async function run() {
    if (!file || busy) return;
    busy = true;
    result = "";
    controller = new AbortController();
    try {
      step = { label: "Reading the PDF", current: 0, total: 1 };
      const { text } = await extractPdfText(file, (current, total) => (step = { label: "Reading the PDF", current, total }));
      if (text.trim().length < 40) throw new Error("This PDF has no readable text. Run OCR first if it is a scan.");

      const source = (await detectLanguage(text)) ?? "en";
      if (source === target) throw new Error(`The document already looks like ${label(target)}. Pick another language.`);
      const availability = await translatorAvailability(source, target);
      if (availability === "unavailable" || availability === "unsupported") throw new Error(`Chrome cannot translate ${label(source)} to ${label(target)} on this device.`);

      const translator = await createTranslator(source, target, (f) => (step = { label: "Chrome is preparing its model", current: Math.round(f * 100), total: 100 }));
      const chunks = chunkText(text, 1500);
      const out: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        if (controller.signal.aborted) throw new DOMException("Cancelled", "AbortError");
        step = { label: "Translating", current: i + 1, total: chunks.length };
        out.push(await translator.translate(chunks[i], { signal: controller.signal }));
      }
      translator.destroy?.();
      result = out.join("\n\n");
    } catch (error) {
      if ((error as Error).name !== "AbortError") toast.error(error instanceof Error ? error.message : "The translation failed.");
    } finally {
      busy = false;
      controller = null;
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Translation copied");
  };
</script>

<AiGate api="Chrome's Translator" availability={() => translatorAvailability("en", "es")}>
  {#if !file}
    <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => (file = files[0])}>
      {#snippet title()}
        <h3 class="text-2xl font-medium text-foreground">Drop a PDF to translate</h3>
      {/snippet}
      {#snippet description()}
        <p class="max-w-sm text-pretty text-sm text-muted-foreground">
          Translate the text of a PDF with the translation model built into Chrome. The result is plain text.
        </p>
      {/snippet}
    </UploadArea>
  {:else}
    <div class="flex flex-col gap-4">
      <FileRow name={file.name} meta={formatBytes(file.size)} onRemove={busy ? undefined : () => ((file = null), (result = ""))} />

      <div class="flex flex-wrap items-center gap-3">
        <label for="translate-target" class="text-sm text-muted-foreground">Translate to</label>
        <select
          id="translate-target"
          bind:value={target}
          disabled={busy}
          class="h-9 rounded-lg border border-input bg-(--field) px-3 text-sm text-foreground outline-none focus-visible:border-ring"
        >
          {#each LANGUAGES as lang (lang.value)}
            <option value={lang.value}>{lang.label}</option>
          {/each}
        </select>
        {#if busy}
          <Button variant="outline" size="sm" onclick={() => controller?.abort()}>Cancel</Button>
        {:else}
          <Button onclick={run}>Translate</Button>
        {/if}
      </div>

      {#if busy}
        <ProgressLine label={step.label} current={step.current} total={step.total} />
      {/if}

      {#if result}
        <section class="rounded-2xl border border-border bg-background p-1" aria-live="polite">
          <div class="flex flex-col gap-3 rounded-[11px] bg-card p-4">
            <h2 class="text-sm font-medium text-foreground">Translation ({label(target)})</h2>
            <p class="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">{result}</p>
            <div class="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onclick={copy}><Copy />Copy</Button>
              <Button
                variant="outline"
                size="sm"
                onclick={() => downloadBlobFile(new Blob([result], { type: "text/plain;charset=utf-8" }), `${file?.name.replace(/\.pdf$/i, "")}-${target}.txt`)}
              >
                <Download />
                Save as text
              </Button>
            </div>
          </div>
        </section>
      {/if}
    </div>
  {/if}
</AiGate>
