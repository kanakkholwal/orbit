<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconLoader2 as LoaderCircle, IconBolt as Zap } from "@tabler/icons-svelte";
  import { HeaderFooterState } from "./helper.svelte";

  const store = new HeaderFooterState();

  type Slot = {
    label: string;
    placeholder: string;
    bind: "headerLeft" | "headerCenter" | "headerRight" | "footerLeft" | "footerCenter" | "footerRight";
  };

  const headerSlots: Slot[] = [
    { label: "Left", placeholder: "{page} of {total}", bind: "headerLeft" },
    { label: "Center", placeholder: "Document title", bind: "headerCenter" },
    { label: "Right", placeholder: "Date", bind: "headerRight" },
  ];
  const footerSlots: Slot[] = [
    { label: "Left", placeholder: "", bind: "footerLeft" },
    { label: "Center", placeholder: "- {page} -", bind: "footerCenter" },
    { label: "Right", placeholder: "", bind: "footerRight" },
  ];
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    onFilesSelected={(files) => store.loadFile(files)}
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
      <FileRow name={store.state.file.name} onRemove={() => store.reset()}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.state.originalSize)}
        </span>
        <span class="text-muted-foreground/40">·</span>
        <span class="font-mono tabular-nums">
          {store.state.pageCount} pages
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Formatting">
      <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div class="flex flex-col gap-2">
          <Label
            for="page-range"
            class="label-eyebrow text-muted-foreground"
          >
            Page range
          </Label>
          <Input
            id="page-range"
            type="text"
            placeholder="e.g. 1-3, 5"
            bind:value={store.state.pageRange}
            class="h-10 rounded-sm font-mono text-sm"
          />
          <p class="text-xs text-muted-foreground">
            Leave empty to apply to all pages.
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Label
            for="font-size"
            class="label-eyebrow text-muted-foreground"
          >
            Font size · pt
          </Label>
          <Input
            id="font-size"
            type="number"
            min="6"
            max="72"
            bind:value={store.state.fontSize}
            class="h-10 rounded-sm font-mono text-sm tabular-nums"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label
            for="font-color"
            class="label-eyebrow text-muted-foreground"
          >
            Color
          </Label>
          <div class="flex items-center gap-2">
            <Input
              id="font-color"
              type="color"
              class="h-10 w-16 cursor-pointer rounded-sm p-1"
              bind:value={store.state.fontColor}
            />
            <span class="font-mono text-xs uppercase tabular-nums text-muted-foreground">
              {store.state.fontColor}
            </span>
          </div>
        </div>
      </div>
    </ToolPanel>

    <ToolPanel title="Header">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        {#each headerSlots as slot}
          <div class="flex flex-col gap-2">
            <Label
              for={`hdr-${slot.bind}`}
              class="label-eyebrow text-muted-foreground"
            >
              {slot.label}
            </Label>
            <Input
              id={`hdr-${slot.bind}`}
              type="text"
              placeholder={slot.placeholder}
              bind:value={store.state[slot.bind]}
              class="h-10 rounded-sm font-mono text-sm"
            />
          </div>
        {/each}
      </div>
    </ToolPanel>

    <ToolPanel title="Footer">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        {#each footerSlots as slot}
          <div class="flex flex-col gap-2">
            <Label
              for={`ftr-${slot.bind}`}
              class="label-eyebrow text-muted-foreground"
            >
              {slot.label}
            </Label>
            <Input
              id={`ftr-${slot.bind}`}
              type="text"
              placeholder={slot.placeholder}
              bind:value={store.state[slot.bind]}
              class="h-10 rounded-sm font-mono text-sm"
            />
          </div>
        {/each}
      </div>
    </ToolPanel>

    <ToolPanel title="Variables">
      <ul
        class="flex flex-col divide-y divide-border/60 overflow-hidden rounded-sm border border-border/60 bg-muted/20 text-xs"
      >
        {#each [
          ["{page}", "Current page number"],
          ["{total}", "Total page count"],
        ] as [token, body]}
          <li class="flex items-center gap-3 px-4 py-2.5">
            <code
              class="rounded-xs bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground"
            >
              {token}
            </code>
            <span class="text-muted-foreground">{body}</span>
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolFooter hint={store.isProcessing ? "Processing" : "Apply header & footer"}>
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.process()}
        disabled={store.isProcessing}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          Processing
        {:else}
          <Zap class="size-4" />
          Apply
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
