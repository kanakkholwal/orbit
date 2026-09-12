<script lang="ts">
  import SegmentedControl from "$components/tool/SegmentedControl.svelte";
  import { Button } from "$components/ui/button";
  import * as Drawer from "$components/ui/drawer";
  import * as DropdownMenu from "$components/ui/dropdown-menu";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { openFilesInTool } from "$lib/runtime/pending-files.svelte";
  import { cn } from "$lib/utils";
  import {
    IconAdjustmentsHorizontal as Adjust,
    IconArrowBackUp as Undo,
    IconArrowForwardUp as Redo,
    IconArrowLeft as Back,
    IconCloudCheck as Saved,
    IconCloudOff as SaveError,
    IconDots as More,
    IconDownload as Download,
    IconEye as Eye,
    IconFileExport as ExportJson,
    IconLayoutSidebarLeftExpand as Library,
    IconLoader2 as Loader,
    IconPlus as Plus,
  } from "@tabler/icons-svelte";
  import { MediaQuery } from "svelte/reactivity";
  import PageView from "./canvas/PageView.svelte";
  import { pageBox } from "./model/themes";
  import BlockInspector from "./panels/BlockInspector.svelte";
  import BlockPicker from "./panels/BlockPicker.svelte";
  import DocumentPanel from "./panels/DocumentPanel.svelte";
  import FieldsPanel from "./panels/FieldsPanel.svelte";
  import PreviewDrawer from "./PreviewDrawer.svelte";
  import type { CreatorState } from "./state.svelte";

  let { studio }: { studio: CreatorState } = $props();

  const isMobile = new IsMobile();
  const wideQuery = new MediaQuery("min-width: 1280px");
  const mediumQuery = new MediaQuery("min-width: 1024px");
  const leftInline = $derived(wideQuery.current);
  const rightInline = $derived(mediumQuery.current);

  let leftTab = $state<"blocks" | "fields">("blocks");
  let libraryOpen = $state(false);
  let inspectorOpen = $state(false);
  let previewOpen = $state(false);
  let canvasWidth = $state(0);

  const doc = $derived(studio.doc);
  const box = $derived(doc ? pageBox(doc.settings.size, doc.settings.orientation) : { width: 595, height: 842 });
  const gutter = $derived(isMobile.current ? 24 : 120);
  const zoom = $derived(canvasWidth > 0 ? Math.max(0.4, Math.min(1.3, (canvasWidth - gutter) / box.width)) : 1);

  function addBlock(type: Parameters<CreatorState["insert"]>[0]) {
    const block = studio.insert(type);
    libraryOpen = false;
    studio.focusBlock(block);
    requestAnimationFrame(() => document.querySelector(`[data-block-id="${block.id}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" }));
  }

  function isEditable(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
  }

  function onkeydown(event: KeyboardEvent) {
    const mod = event.metaKey || event.ctrlKey;
    const editing = isEditable(event.target);
    if (mod && event.key.toLowerCase() === "z" && !editing) {
      event.preventDefault();
      if (event.shiftKey) studio.redo();
      else studio.undo();
    } else if (mod && event.key.toLowerCase() === "y" && !editing) {
      event.preventDefault();
      studio.redo();
    } else if (mod && event.key.toLowerCase() === "s") {
      event.preventDefault();
      studio.flushSave();
    } else if (!editing && studio.selectedId) {
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        studio.remove(studio.selectedId);
      } else if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault();
        studio.duplicate(studio.selectedId);
      } else if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        event.preventDefault();
        studio.nudge(studio.selectedId, event.key === "ArrowUp" ? -1 : 1);
      } else if (event.key === "Escape") {
        studio.selectedId = null;
      }
    }
  }

  async function openInViewer() {
    const blob = await studio.render();
    if (blob) openFilesInTool([new File([blob], `${studio.fileName}.pdf`, { type: "application/pdf" })], "view-pdf");
  }
</script>

<svelte:window {onkeydown} />

{#snippet leftPanel()}
  <div class="flex h-full min-h-0 flex-col">
    <div class="shrink-0 border-b border-border p-2">
      <SegmentedControl
        size="sm"
        name="creator-left-tab"
        bind:value={leftTab}
        options={[{ value: "blocks", label: "Blocks" }, { value: "fields", label: `Fields${studio.fields.length ? ` ${studio.fields.length}` : ""}` }]}
      />
    </div>
    {#if leftTab === "blocks"}
      <BlockPicker onpick={addBlock} descriptions class="min-h-0 flex-1" />
    {:else}
      <div class="scrollbar-subtle min-h-0 flex-1 overflow-y-auto"><FieldsPanel {studio} /></div>
    {/if}
  </div>
{/snippet}

{#snippet rightPanel()}
  {#if studio.selected}
    {#key studio.selected.id}
      <BlockInspector {studio} block={studio.selected} />
    {/key}
  {:else}
    <div class="border-b border-border px-4 py-3">
      <h2 class="text-body font-medium text-foreground">Document</h2>
      <p class="text-caption text-muted-foreground">Select a block on the page to edit it.</p>
    </div>
    <DocumentPanel {studio} />
  {/if}
{/snippet}

{#if doc}
  <div class="flex h-full min-h-0 flex-col bg-background">
    <div class="no-scrollbar flex h-12 shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-2">
      <Button variant="ghost" size="icon-sm" aria-label="Back to templates" title="Back to templates" onclick={() => studio.close()}><Back /></Button>
      <input
        value={doc.name}
        aria-label="Document name"
        oninput={(e) => {
          const value = e.currentTarget.value;
          studio.change("name", (d) => {
            d.name = value;
          });
        }}
        class="h-9 w-32 min-w-24 shrink rounded-lg border border-transparent bg-transparent px-2 text-body font-medium text-foreground outline-none transition-colors hover:border-border focus:border-ring sm:w-56"
      />
      <span class="hidden items-center gap-1.5 whitespace-nowrap px-1 text-caption text-muted-foreground md:flex" role="status">
        {#if studio.saveState === "saving"}
          <Loader class="size-3.5 animate-spin" />Saving
        {:else if studio.saveState === "error"}
          <SaveError class="size-3.5 text-destructive" />Not saved
        {:else}
          <Saved class="size-3.5" />Saved on this device
        {/if}
      </span>

      <div class="min-w-2 flex-1"></div>

      <Button variant="ghost" size="icon-sm" aria-label="Undo" title="Undo (Ctrl Z)" disabled={!studio.canUndo} onclick={() => studio.undo()}><Undo /></Button>
      <Button variant="ghost" size="icon-sm" aria-label="Redo" title="Redo (Ctrl Shift Z)" disabled={!studio.canRedo} onclick={() => studio.redo()}><Redo /></Button>
      <div class="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true"></div>
      {#if !leftInline && !isMobile.current}
        <Button variant="ghost" size="icon-sm" aria-label="Blocks and fields" title="Blocks and fields" onclick={() => (libraryOpen = true)}><Library /></Button>
      {/if}
      {#if !rightInline && !isMobile.current}
        <Button variant="ghost" size="icon-sm" aria-label={studio.selected ? "Edit block" : "Document settings"} title="Settings" onclick={() => (inspectorOpen = true)}><Adjust /></Button>
      {/if}
      <Button variant="outline" size="sm" onclick={() => (previewOpen = true)}>
        <Eye />
        <span class="hidden sm:inline">Preview</span>
      </Button>
      <Button variant="primary" size="sm" disabled={studio.isProcessing} onclick={() => studio.downloadPdf()}>
        {#if studio.isProcessing}<Loader class="animate-spin" />{:else}<Download />{/if}
        <span class="hidden sm:inline">{studio.isProcessing ? "Building" : "Download PDF"}</span>
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="ghost" size="icon-sm" aria-label="More actions"><More /></Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-60 rounded-xl p-1 shadow-lg">
          <DropdownMenu.Item class="min-h-9 rounded-lg px-2.5 text-body" onclick={() => studio.downloadJson()}><ExportJson />Save draft as file</DropdownMenu.Item>
          <DropdownMenu.Item class="min-h-9 rounded-lg px-2.5 text-body" onclick={openInViewer}><Eye />Open PDF in View PDF</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    <div class="flex min-h-0 flex-1">
      {#if leftInline}
        <aside aria-label="Blocks and fields" class="flex w-64 shrink-0 flex-col border-r border-border">{@render leftPanel()}</aside>
      {/if}

      <div
        class="scrollbar-subtle relative min-w-0 flex-1 overflow-auto overscroll-contain bg-canvas"
        bind:clientWidth={canvasWidth}
        role="presentation"
        onclick={(e) => {
          if (e.target === e.currentTarget) studio.selectedId = null;
        }}
      >
        <div
          class={cn("mx-auto flex w-fit flex-col items-center", isMobile.current ? "px-3 pb-24 pt-4" : "px-14 pb-24 pt-10")}
          role="presentation"
          onclick={(e) => {
            if (e.target === e.currentTarget) studio.selectedId = null;
          }}
        >
          <PageView {doc} {studio} {zoom} />
          <p class="mt-4 text-caption text-muted-foreground">The editor shows one long page. Preview shows the real page breaks.</p>
        </div>
      </div>

      {#if rightInline}
        <aside aria-label="Settings" class="scrollbar-subtle w-80 shrink-0 overflow-y-auto overscroll-contain border-l border-border">{@render rightPanel()}</aside>
      {/if}
    </div>

    {#if isMobile.current}
      <div class="flex shrink-0 gap-2 border-t border-border bg-background p-2" style="padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);">
        <Button variant="outline" class="flex-1" onclick={() => (libraryOpen = true)}><Plus />Add block</Button>
        <Button variant="outline" class="flex-1" onclick={() => (inspectorOpen = true)}><Adjust />{studio.selected ? "Edit block" : "Document"}</Button>
      </div>
    {/if}
  </div>

  {#if !leftInline}
    <Drawer.Root bind:open={libraryOpen} direction={isMobile.current ? "bottom" : "left"} shouldScaleBackground={false}>
      <Drawer.Content class={isMobile.current ? "h-[80dvh] max-h-[80dvh] rounded-t-3xl" : "w-80 max-w-80"}>
        <Drawer.Title class="sr-only">Blocks and fields</Drawer.Title>
        <div class="mt-2 flex min-h-0 flex-1 flex-col">{@render leftPanel()}</div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}

  {#if !rightInline}
    <Drawer.Root bind:open={inspectorOpen} direction={isMobile.current ? "bottom" : "right"} shouldScaleBackground={false}>
      <Drawer.Content class={isMobile.current ? "h-[85dvh] max-h-[85dvh] rounded-t-3xl" : "w-96 max-w-96"}>
        <Drawer.Title class="sr-only">{studio.selected ? "Edit block" : "Document settings"}</Drawer.Title>
        <div class="scrollbar-subtle mt-2 min-h-0 flex-1 overflow-y-auto pb-[max(env(safe-area-inset-bottom),1rem)]">{@render rightPanel()}</div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}

  <PreviewDrawer {studio} bind:open={previewOpen} />
{/if}
