<script lang="ts">
  import { ChoiceList, OptionGroup, OptionToggle, ProgressLine, ResultCard, ToolBar, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { arrayMove, sortableList } from "$lib/actions/sortable-list";
  import {
    IconArrowLeft as ArrowLeft,
    IconArrowRight as ArrowRight,
    IconCamera as CameraIcon,
    IconDownload as Download,
    IconPhotoPlus as PhotoPlus,
    IconRefresh as Refresh,
    IconRotateClockwise as RotateCw,
    IconScan as ScanIcon,
    IconX as X,
  } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import Camera from "./Camera.svelte";
  import { ACCEPTED_IMAGES, type PageSize, ScanToPdfState } from "./helper.svelte";

  const store = new ScanToPdfState();
  const uid = $props.id();

  let photoInput = $state<HTMLInputElement | null>(null);
  let captureInput = $state<HTMLInputElement | null>(null);
  let cameraOpen = $state(false);
  let useNativeCapture = $state(false);

  onMount(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    useNativeCapture = coarse || !navigator.mediaDevices?.getUserMedia;
    return () => store.reset();
  });

  const pageSizes: { value: PageSize; label: string; hint: string }[] = [
    { value: "a4", label: "A4", hint: "Standard paper in most countries" },
    { value: "letter", label: "US Letter", hint: "Standard paper in the US and Canada" },
    { value: "fit", label: "Match each photo", hint: "Pages keep the shape of the photo" },
  ];

  const gridSort = {
    onReorder: (o: number, n: number) => store.reorder(arrayMove(store.pages, o, n)),
    options: { animation: 200, ghostClass: "opacity-40", dragClass: "cursor-grabbing", delay: 150, delayOnTouchOnly: true },
  };

  const count = $derived(store.pages.length);
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;

  function openCamera() {
    if (useNativeCapture) captureInput?.click();
    else cameraOpen = true;
  }

  function pick(e: Event & { currentTarget: HTMLInputElement }) {
    const picked = Array.from(e.currentTarget.files ?? []);
    if (picked.length > 0) store.addImages(picked);
    e.currentTarget.value = "";
  }
</script>

{#if cameraOpen}
  <div class="mb-4">
    <Camera
      captured={count}
      onCapture={(photo) => store.addCapture(photo)}
      onClose={() => (cameraOpen = false)}
      onChoosePhotos={() => {
        cameraOpen = false;
        photoInput?.click();
      }}
    />
  </div>
{/if}

{#if count === 0 && !cameraOpen}
  <div class="flex flex-col gap-3">
    <UploadArea accept={ACCEPTED_IMAGES} onFilesSelected={(files) => store.addImages(files)}>
      {#snippet icon()}
        <ScanIcon class="size-6" stroke={1.75} />
      {/snippet}
      {#snippet title()}
        <h3 class="text-heading-sm font-medium text-foreground">
          {store.adding > 0 ? "Reading photos…" : "Drop photos of your pages"}
        </h3>
      {/snippet}
      {#snippet description()}
        <p class="max-w-sm text-pretty text-body text-muted-foreground">
          Receipts, forms, notes and letters become one PDF. Photos stay on this device.
        </p>
      {/snippet}
    </UploadArea>

    <div class="flex flex-col items-center gap-1.5 text-center">
      <Button variant="outline" onclick={openCamera}>
        <CameraIcon />
        {useNativeCapture ? "Take a photo" : "Use your camera"}
      </Button>
      <p class="text-caption text-muted-foreground">Take a picture of each page, one after another.</p>
    </div>
  </div>
{:else if count > 0 || store.adding > 0}
  <div class="flex flex-col gap-4">
    {#if store.result && !store.isProcessing}
      <ResultCard title={`Made a ${pageLabel(store.result.pages)} PDF`} description={`${store.result.name} is downloaded.`}>
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button
            variant="ghost"
            onclick={() => {
              cameraOpen = false;
              store.reset();
            }}
          >
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="scan-to-pdf" />
      </ResultCard>
    {/if}

    <ToolBar
      label="Pages"
      {count}
      meta={store.adding > 0 ? "Adding photos…" : undefined}
      onReset={store.isProcessing
        ? undefined
        : () => {
            cameraOpen = false;
            store.reset();
          }}
      resetLabel="Clear all"
    >
      {#snippet actions()}
        {#if !cameraOpen}
          <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={openCamera}>
            <CameraIcon />
            <span class="hidden sm:inline">Camera</span>
            <span class="sr-only sm:hidden">Take a photo</span>
          </Button>
        {/if}
        <Button variant="outline" size="sm" disabled={store.isProcessing} onclick={() => photoInput?.click()}>
          <PhotoPlus />
          <span class="hidden sm:inline">Add photos</span>
          <span class="sr-only sm:hidden">Add photos</span>
        </Button>
      {/snippet}
    </ToolBar>

    <p class="text-body text-muted-foreground">Pages follow this order. Drag a page or use the arrows to move it.</p>

    <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" use:sortableList={gridSort}>
      {#each store.pages as page, i (page.id)}
        <li
          class="group flex cursor-grab flex-col gap-1.5 rounded-xl border border-border bg-card p-1.5 transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-sm active:cursor-grabbing"
          title={page.name}
        >
          <div class="relative grid aspect-3/4 place-items-center overflow-hidden rounded-lg bg-muted">
            {#if page.thumbUrl}
              <img src={page.thumbUrl} alt={`Page ${i + 1}`} class="h-full w-full object-contain" draggable="false" />
            {/if}
            <span class="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-caption font-medium tabular-nums text-foreground shadow-xs">
              {i + 1}
            </span>
            <button
              type="button"
              onclick={() => store.removePage(page.id)}
              disabled={store.isProcessing}
              aria-label={`Delete page ${i + 1}`}
              class="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-lg bg-background/90 text-muted-foreground shadow-xs outline-none transition-opacity hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring disabled:hidden pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
            >
              <X class="size-4" />
            </button>
          </div>
          <div class="flex items-center justify-between gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground"
              disabled={i === 0 || store.isProcessing}
              onclick={() => store.movePage(i, -1)}
              aria-label={`Move page ${i + 1} earlier`}
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground"
              disabled={store.isProcessing}
              onclick={() => store.rotate(page.id)}
              aria-label={`Rotate page ${i + 1}`}
              title="Rotate"
            >
              <RotateCw />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              class="text-muted-foreground"
              disabled={i === count - 1 || store.isProcessing}
              onclick={() => store.movePage(i, 1)}
              aria-label={`Move page ${i + 1} later`}
            >
              <ArrowRight />
            </Button>
          </div>
        </li>
      {/each}
    </ul>
  </div>

  <WorkspaceInspector title="Scan">
    <div class="flex flex-col gap-6">
      <OptionGroup label="Look" description="Doesn't straighten or crop pages. Photograph them flat and close.">
        <div class="-my-2.5 flex flex-col divide-y divide-border">
          <OptionToggle
            label="Enhance for documents"
            description="Black and white with brighter paper and darker text"
            bind:checked={() => store.settings.enhance, (on) => store.setEnhance(on)}
            disabled={store.isProcessing}
          />
        </div>
      </OptionGroup>

      <OptionGroup label="Page size">
        <ChoiceList name="{uid}-size" choices={pageSizes} bind:value={store.settings.pageSize} />
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text || "Preparing pages"} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else}
        <span class="block truncate">
          {pageLabel(count)} · {pageSizes.find((p) => p.value === store.settings.pageSize)?.label}{store.settings.enhance ? " · Enhanced" : ""}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={() => store.convert()} disabled={store.isProcessing || count === 0 || store.adding > 0}>
      {store.isProcessing ? "Creating PDF…" : `Create PDF from ${pageLabel(count)}`}
    </Button>
  </ToolFooter>
{/if}

<input bind:this={photoInput} type="file" accept={ACCEPTED_IMAGES} multiple class="hidden" onchange={pick} />
<input bind:this={captureInput} type="file" accept="image/*" capture="environment" class="hidden" onchange={pick} />
