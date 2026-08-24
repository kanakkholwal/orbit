<script lang="ts">
  import { FileRow, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$components/ui/select";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconKeyboard as Keyboard,
    IconLoader2 as LoaderCircle,
    IconCloudUpload as UploadCloud,
    IconBolt as Zap,
  } from "@tabler/icons-svelte";
  import { TxtToPdfState } from "./helper.svelte";

  const store = new TxtToPdfState();

  const fontMap: Record<string, string> = {
    helv: "Helvetica · sans-serif",
    tiro: "Tiro · serif",
    cour: "Courier · monospace",
    times: "Times · serif",
  };
</script>

<div class="flex flex-col gap-8">
  <ToolPanel title="Source">
    <div class="grid grid-cols-2 gap-1 rounded-sm bg-muted/40 p-1">
      {#each [
        { id: "upload", label: "Upload", icon: UploadCloud },
        { id: "text", label: "Type", icon: Keyboard },
      ] as opt}
        <button
          type="button"
          onclick={() => (store.mode = opt.id as any)}
          class={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 label-eyebrow transition-colors",
            store.mode === opt.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <opt.icon class="size-3" />
          {opt.label}
        </button>
      {/each}
    </div>

    <div class="mt-5">
      {#if store.mode === "upload"}
        {#if store.files.length === 0}
          <UploadArea
            accept=".txt, text/plain"
            multiple={true}
            onFilesSelected={(files) => store.addFiles(files)}
          />
        {:else}
          <div class="flex flex-col gap-3">
            <ul class="flex flex-col gap-2">
              {#each store.files as file (file.id)}
                <li>
                  <FileRow
                    name={file.file.name}
                    onRemove={() => store.removeFile(file.id)}
                  >
                    <span class="font-mono tabular-nums">
                      {formatBytes(file.originalSize)}
                    </span>
                  </FileRow>
                </li>
              {/each}
            </ul>
            <UploadArea
              accept=".txt, text/plain"
              multiple={true}
              onFilesSelected={(files) => store.addFiles(files)}
            />
          </div>
        {/if}
      {:else}
        <textarea
          bind:value={store.textContent}
          dir={store.textDirection}
          rows="12"
          class="w-full resize-y rounded-sm border border-border bg-card p-3 font-mono text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          placeholder="Start typing or paste text…"
        ></textarea>
        <p
          class="mt-2 label-eyebrow text-muted-foreground"
        >
          Auto-detects RTL · Arabic · Hebrew · Persian
        </p>
      {/if}
    </div>
  </ToolPanel>

  <ToolPanel title="Formatting">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="flex flex-col gap-2">
        <Label
          for="font-family"
          class="label-eyebrow text-muted-foreground"
        >
          Font family
        </Label>
        <Select type="single" bind:value={store.settings.fontFamily}>
          <SelectTrigger id="font-family" class="h-10 rounded-sm">
            {fontMap[store.settings.fontFamily] || "Helvetica"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="helv">Helvetica · sans-serif</SelectItem>
            <SelectItem value="tiro">Tiro · serif</SelectItem>
            <SelectItem value="cour">Courier · monospace</SelectItem>
            <SelectItem value="times">Times · serif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex flex-col gap-2">
        <Label
          for="font-size"
          class="label-eyebrow text-muted-foreground"
        >
          Size · pt
        </Label>
        <Input
          id="font-size"
          type="number"
          min="6"
          max="72"
          bind:value={store.settings.fontSize}
          class="h-10 rounded-sm font-mono text-sm tabular-nums"
        />
      </div>

      <div class="flex flex-col gap-2">
        <Label
          for="text-color"
          class="label-eyebrow text-muted-foreground"
        >
          Color
        </Label>
        <div class="flex items-center gap-2">
          <Input
            id="text-color"
            type="color"
            class="h-10 w-16 cursor-pointer rounded-sm p-1"
            bind:value={store.settings.textColor}
          />
          <span class="font-mono text-xs uppercase tabular-nums text-muted-foreground">
            {store.settings.textColor}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label
          for="page-size"
          class="label-eyebrow text-muted-foreground"
        >
          Page size
        </Label>
        <Select type="single" bind:value={store.settings.pageSize}>
          <SelectTrigger id="page-size" class="h-10 rounded-sm">
            {store.settings.pageSize}
          </SelectTrigger>
          <SelectContent class="max-h-72 overflow-y-auto">
            <SelectItem value="A3">A3</SelectItem>
            <SelectItem value="A4">A4</SelectItem>
            <SelectItem value="A5">A5</SelectItem>
            <SelectItem value="Letter">Letter</SelectItem>
            <SelectItem value="Legal">Legal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </ToolPanel>

  <ToolFooter
    hint={store.isProcessing
      ? store.progress.text
      : store.mode === "upload"
        ? `${store.files.length} file${store.files.length === 1 ? "" : "s"}`
        : "Compose PDF from text"}
  >
    <Button
      size="lg"
      class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
      onclick={() => store.process()}
      disabled={store.isProcessing ||
        (store.mode === "upload" && store.files.length === 0) ||
        (store.mode === "text" && !store.textContent)}
    >
      {#if store.isProcessing}
        <LoaderCircle class="size-4 animate-spin" />
        {store.progress.text}
      {:else}
        <Zap class="size-4" />
        Convert to PDF
      {/if}
    </Button>
  </ToolFooter>
</div>
