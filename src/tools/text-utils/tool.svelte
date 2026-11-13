<script lang="ts">
  import { OptionGroup, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { CopyButton } from "$components/ui/copy-button";
  import { Textarea } from "$components/ui/textarea";
  import { IconDownload as Download, IconFileUpload as FileUp, IconRefresh as Refresh } from "$lib/icons";
  import { untrack } from "svelte";
  import { getTextDef } from "./defs";

  let { slug = "json-formatter" }: { slug?: string } = $props();

  const def = getTextDef(untrack(() => slug)) ?? getTextDef("json-formatter")!;
  let input = $state("");
  let fileName = $state("");
  let fileInput = $state<HTMLInputElement | null>(null);

  const result = $derived.by(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      return { output: def.run(input), error: "" };
    } catch (err) {
      return { output: "", error: err instanceof Error ? err.message : "Could not convert this text." };
    }
  });

  async function load(file: File) {
    input = await file.text();
    fileName = file.name;
  }

  function download() {
    const base = (fileName || "orbit").replace(/\.[^.]+$/, "");
    const url = URL.createObjectURL(new Blob([result.output], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.${def.outExt}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
</script>

<div class="grid gap-4 lg:grid-cols-2">
  <ToolPanel title={def.inputLabel}>
    <div class="flex flex-col gap-3">
      <Textarea bind:value={input} rows={14} spellcheck={false} placeholder={def.placeholder} aria-label={def.inputLabel} class="font-mono text-sm" />
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" onclick={() => fileInput?.click()}>
          <FileUp />
          Open a file
        </Button>
        {#if input}
          <Button
            variant="ghost"
            onclick={() => {
              input = "";
              fileName = "";
            }}
          >
            <Refresh />
            Clear
          </Button>
        {/if}
      </div>
      <input
        bind:this={fileInput}
        type="file"
        accept={def.accept}
        class="hidden"
        onchange={(e) => {
          const picked = e.currentTarget.files?.[0];
          if (picked) void load(picked);
          e.currentTarget.value = "";
        }}
      />
    </div>
  </ToolPanel>

  <ToolPanel title={def.outputLabel}>
    <div class="flex flex-col gap-3">
      <Textarea value={result.output} readonly rows={14} spellcheck={false} aria-label={def.outputLabel} invalid={!!result.error} class="font-mono text-sm" />
      {#if result.error}
        <p role="alert" class="text-sm text-destructive-strong">{result.error}</p>
      {/if}
      <div class="flex flex-wrap gap-2">
        <CopyButton text={result.output} disabled={!result.output} />
        <Button disabled={!result.output} onclick={download}>
          <Download />
          Download .{def.outExt}
        </Button>
      </div>
    </div>
  </ToolPanel>
</div>
