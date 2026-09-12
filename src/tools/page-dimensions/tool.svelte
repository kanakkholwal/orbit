<script lang="ts">
  import { FileRow, SegmentedControl, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconAlertTriangle as AlertTriangle,
    IconCheck as Check,
    IconCircleCheck as CircleCheck,
    IconCopy as Copy,
    IconDownload as Download,
    IconLoader2 as Loader,
  } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import { PageDimensionsState } from "./helper.svelte";

  const store = new PageDimensionsState();
  let pickInput = $state<HTMLInputElement | null>(null);
  let copied = $state(false);

  const units: { value: "in" | "mm" | "pt" | "px"; label: string }[] = [
    { value: "in", label: "Inches" },
    { value: "mm", label: "mm" },
    { value: "pt", label: "Points" },
    { value: "px", label: "Pixels" },
  ];

  const pages = $derived(store.analyzedPagesData);
  const stats = $derived(store.summaryStats);
  const pageLabel = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
  const firstSize = $derived(pages.length > 0 ? `${pages[0].standardSize} ${pages[0].orientation.toLowerCase()}` : "");

  async function copyTable() {
    const u = store.selectedUnit;
    const rows = [
      ["Page", `Width (${u})`, `Height (${u})`, "Size", "Orientation", "Rotation"].join("\t"),
      ...pages.map((p) =>
        [
          p.pageNum,
          store.convertPoints(p.width, u),
          store.convertPoints(p.height, u),
          p.standardSize,
          p.orientation,
          `${p.rotation}°`,
        ].join("\t")
      ),
    ];
    try {
      await navigator.clipboard.writeText(rows.join("\n"));
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      toast.error("Couldn't copy. Try downloading the CSV instead.");
    }
  }
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files).catch(() => {})}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to see its page sizes</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Find out how big every page is, whether they all match, and which paper size they use.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-6">
    <FileRow
      name={store.file.file.name}
      meta={pages.length > 0
        ? `${formatBytes(store.file.originalSize)} · ${pageLabel(pages.length)}`
        : formatBytes(store.file.originalSize)}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    {#if store.isProcessing}
      <p class="flex items-center gap-2 text-body text-muted-foreground" aria-live="polite">
        <Loader class="size-4 animate-spin text-primary" />
        Measuring pages
      </p>
    {:else if pages.length === 0}
      <div class="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
        <p class="text-body font-medium text-foreground">We couldn't read the pages in this file</p>
        <p class="text-body text-muted-foreground">It may be damaged or locked with a password. Try another PDF.</p>
      </div>
    {:else}
      <section aria-label="Summary" class="flex flex-col rounded-xl border border-border bg-card">
        <dl class="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div class="flex flex-col gap-0.5 px-4 py-3">
            <dt class="text-caption text-muted-foreground">Pages</dt>
            <dd class="text-subheading font-medium tabular-nums text-foreground">{stats.totalPages}</dd>
          </div>
          <div class="flex flex-col gap-0.5 px-4 py-3">
            <dt class="text-caption text-muted-foreground">Different sizes</dt>
            <dd class="text-subheading font-medium tabular-nums text-foreground">{stats.uniqueSizesCount}</dd>
          </div>
          <div class="flex flex-col gap-0.5 px-4 py-3">
            <dt class="text-caption text-muted-foreground">Consistency</dt>
            <dd class="flex items-center gap-2 text-subheading font-medium text-foreground">
              {#if stats.hasMixedSizes}
                <AlertTriangle class="size-5 shrink-0 text-warning" aria-hidden="true" />
                Sizes vary
              {:else}
                <CircleCheck class="size-5 shrink-0 text-success" aria-hidden="true" />
                All pages match
              {/if}
            </dd>
          </div>
        </dl>

        {#if stats.hasMixedSizes}
          <div class="flex flex-col gap-2 border-t border-border px-4 py-3">
            <p class="text-body text-muted-foreground">
              Pages come in more than one size, which can cause surprises when you print.
            </p>
            <ul class="flex flex-col gap-1 text-body">
              {#each stats.uniqueSizes as size (size.label + size.count)}
                <li class="flex items-center justify-between gap-3">
                  <span class="text-foreground">{size.label}</span>
                  <span class="tabular-nums text-muted-foreground">{pageLabel(size.count)}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </section>

      <section class="flex flex-col gap-3" aria-labelledby="page-dimensions-pages">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="page-dimensions-pages" class="text-body-lg font-medium text-foreground">Every page</h2>
          <div class="flex flex-wrap items-center gap-2">
            <SegmentedControl name="page-dimensions-unit" options={units} bind:value={store.selectedUnit} size="sm" class="w-72 max-w-full" />
            <Button variant="outline" size="sm" onclick={copyTable}>
              {#if copied}
                <Check class="size-4 text-success" />
                Copied
              {:else}
                <Copy class="size-4" />
                Copy
              {/if}
            </Button>
            <Button variant="outline" size="sm" onclick={() => store.exportToCSV()}>
              <Download class="size-4" />
              CSV
            </Button>
          </div>
        </div>

        <div class="scrollbar-subtle overflow-x-auto rounded-xl border border-border bg-card">
          <table class="w-full text-left text-body tabular-nums">
            <thead class="border-b border-border text-muted-foreground">
              <tr>
                <th scope="col" class="px-4 py-2.5 font-medium">Page</th>
                <th scope="col" class="px-4 py-2.5 font-medium">Width × height</th>
                <th scope="col" class="px-4 py-2.5 font-medium">Paper size</th>
                <th scope="col" class="px-4 py-2.5 font-medium">Orientation</th>
                <th scope="col" class="px-4 py-2.5 font-medium">Aspect ratio</th>
                <th scope="col" class="px-4 py-2.5 font-medium">Area</th>
                <th scope="col" class="px-4 py-2.5 font-medium">Rotation</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#each pages as page (page.pageNum)}
                <tr>
                  <td class="px-4 py-2.5 text-foreground">{page.pageNum}</td>
                  <td class="whitespace-nowrap px-4 py-2.5 text-foreground">
                    {store.convertPoints(page.width, store.selectedUnit)} × {store.convertPoints(page.height, store.selectedUnit)}
                    <span class="text-muted-foreground">{store.selectedUnit}</span>
                  </td>
                  <td class="px-4 py-2.5 {page.standardSize === 'Custom' ? 'text-muted-foreground' : 'text-foreground'}">
                    {page.standardSize}
                  </td>
                  <td class="px-4 py-2.5 text-foreground">{page.orientation}</td>
                  <td class="px-4 py-2.5 text-foreground">{store.getAspectRatio(page.width, page.height)}</td>
                  <td class="whitespace-nowrap px-4 py-2.5 text-foreground">
                    {store.calculateArea(page.width, page.height, store.selectedUnit)}
                  </td>
                  <td class="px-4 py-2.5 text-foreground">{page.rotation}°</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}

    <input
      bind:this={pickInput}
      type="file"
      accept=".pdf,application/pdf"
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) {
          store.reset();
          store.loadFile(picked).catch(() => {});
        }
        e.currentTarget.value = "";
      }}
    />
  </div>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="block truncate">Measuring pages…</span>
      {:else if pages.length > 0}
        <span class="block truncate tabular-nums">
          {pageLabel(pages.length)} · {stats.hasMixedSizes ? `${stats.uniqueSizesCount} different sizes` : firstSize}
        </span>
      {:else}
        <span class="block truncate">Choose another PDF to try again.</span>
      {/if}
    {/snippet}

    <Button variant="primary" disabled={store.isProcessing} onclick={() => pickInput?.click()}>
      Check another file
    </Button>
  </ToolFooter>
{/if}
