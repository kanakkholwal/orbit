<script lang="ts">
  import {
    ChoiceList,
    OptionGroup,
    ProgressLine,
    ResultCard,
    SegmentedControl,
    ToolBar,
    ToolFooter,
  } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { arrayMove, sortableList } from "$lib/actions/sortable-list";
  import { formatBytes } from "$utils/helper";
  import {
    IconArrowLeft as ArrowLeft,
    IconArrowRight as ArrowRight,
    IconDownload as Download,
    IconPhoto as Photo,
    IconPlus as Plus,
    IconRefresh as Refresh,
    IconX as X,
  } from "@tabler/icons-svelte";
  import {
    ACCEPTED_FORMATS,
    JpgToPdfState,
    type MarginSize,
    type Orientation,
    type PageSize,
  } from "./helper.svelte";

  const store = new JpgToPdfState();
  const uid = $props.id();
  let addInput = $state<HTMLInputElement | null>(null);

  const accept = ACCEPTED_FORMATS.join(",");

  const pageSizes: { value: PageSize; label: string; hint: string }[] = [
    { value: "fit", label: "Match each image", hint: "Every page takes the size of its image" },
    { value: "a4", label: "A4", hint: "Standard paper in most countries" },
    { value: "letter", label: "US Letter", hint: "Standard paper in the US and Canada" },
    { value: "legal", label: "US Legal", hint: "Taller paper for contracts and forms" },
  ];

  const orientations: { value: Orientation; label: string }[] = [
    { value: "auto", label: "Auto" },
    { value: "portrait", label: "Portrait" },
    { value: "landscape", label: "Landscape" },
  ];

  const margins: { value: MarginSize; label: string }[] = [
    { value: "none", label: "None" },
    { value: "small", label: "Small" },
    { value: "large", label: "Large" },
  ];

  const gridSort = {
    onReorder: (o: number, n: number) => store.reorder(arrayMove(store.files, o, n)),
    options: { animation: 200, ghostClass: "opacity-40", dragClass: "cursor-grabbing", delay: 150, delayOnTouchOnly: true },
  };

  const count = $derived(store.files.length);
  const totalSize = $derived(store.files.reduce((sum, f) => sum + f.file.size, 0));
  const imageLabel = (n: number) => `${n} ${n === 1 ? "image" : "images"}`;
  const resultFiles = $derived(store.resultFiles);
  const fitted = $derived(store.settings.pageSize === "fit");
</script>

{#if count === 0}
  <UploadArea {accept} onFilesSelected={(files) => store.addFiles(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop images to make a PDF</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Photos, scans and screenshots become one PDF, one page per image, in the order you choose.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard
        title={`Made a ${store.result.pages}-page PDF`}
        description={`${store.result.name} is downloaded.`}
      >
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
        <FileSuggestions files={resultFiles} heading="Continue with" exclude="img-to-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label="Images"
      {count}
      meta={formatBytes(totalSize)}
      onReset={store.isProcessing ? undefined : () => store.reset()}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => addInput?.click()}>
          <Plus />
          <span class="hidden sm:inline">Add images</span>
          <span class="sr-only sm:hidden">Add images</span>
        </Button>
      {/snippet}
    </ToolBar>

    <p class="text-body text-muted-foreground">
      Pages follow this order. Drag an image or use the arrows to move it.
    </p>

    <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" use:sortableList={gridSort}>
      {#each store.files as item, i (item.id)}
        <li
          class="group flex cursor-grab flex-col gap-1.5 rounded-xl border border-border bg-card p-1.5 transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-sm active:cursor-grabbing"
          title={item.file.name}
        >
          <div class="relative grid aspect-3/4 place-items-center overflow-hidden rounded-lg bg-muted">
            {#if item.previewUrl}
              <img src={item.previewUrl} alt={item.file.name} loading="lazy" class="h-full w-full object-contain" />
            {:else}
              <span class="flex flex-col items-center gap-1 text-muted-foreground">
                <Photo class="size-6" stroke={1.75} />
                <span class="text-caption">{item.file.name.split(".").pop()?.toUpperCase()}</span>
              </span>
            {/if}
            <span class="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-caption font-medium tabular-nums text-foreground shadow-xs">
              {i + 1}
            </span>
            <button
              type="button"
              onclick={() => store.removeFile(item.id)}
              disabled={store.isProcessing}
              aria-label={`Remove ${item.file.name}`}
              class="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-lg bg-background/90 text-muted-foreground shadow-xs outline-none transition-opacity hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring disabled:hidden pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
            >
              <X class="size-4" />
            </button>
          </div>
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground"
              disabled={i === 0 || store.isProcessing}
              onclick={() => store.moveFile(i, -1)}
              aria-label={`Move ${item.file.name} earlier`}
            >
              <ArrowLeft />
            </Button>
            <span class="min-w-0 flex-1 truncate text-center text-caption tabular-nums text-muted-foreground">
              {formatBytes(item.file.size)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground"
              disabled={i === count - 1 || store.isProcessing}
              onclick={() => store.moveFile(i, 1)}
              aria-label={`Move ${item.file.name} later`}
            >
              <ArrowRight />
            </Button>
          </div>
        </li>
      {/each}
    </ul>

    <input
      bind:this={addInput}
      type="file"
      {accept}
      multiple
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) store.addFiles(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Pages">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Page size">
        <ChoiceList name="{uid}-size" choices={pageSizes} bind:value={store.settings.pageSize} />
      </OptionGroup>

      <OptionGroup
        label="Orientation"
        description={fitted ? "Choose a paper size to set the orientation." : "Auto turns the page to suit each image."}
      >
        <fieldset disabled={fitted} class="disabled:opacity-50">
          <legend class="sr-only">Orientation</legend>
          <SegmentedControl name="{uid}-orientation" options={orientations} bind:value={store.settings.orientation} />
        </fieldset>
      </OptionGroup>

      <OptionGroup label="Margins" description="White space around each image.">
        <SegmentedControl name="{uid}-margin" options={margins} bind:value={store.settings.margin} />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine
          label={store.progress.text || "Preparing images"}
          current={store.progress.current}
          total={store.progress.total}
          class="max-w-md"
        />
      {:else}
        <span class="block truncate">
          {imageLabel(count)} · {pageSizes.find((p) => p.value === store.settings.pageSize)?.label}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.convert()} disabled={store.isProcessing}>
      {store.isProcessing ? "Creating PDF…" : `Create PDF from ${imageLabel(count)}`}
    </Button>
  </ToolFooter>
{/if}
