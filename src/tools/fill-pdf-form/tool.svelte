<script lang="ts">
  import { ChoiceList, FileRow, OptionGroup, ResultCard, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Checkbox } from "$components/ui/checkbox";
  import { Input } from "$components/ui/input";
  import * as RadioGroup from "$components/ui/radio-group";
  import * as Select from "$components/ui/select";
  import { Textarea } from "$components/ui/textarea";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconChevronLeft as ChevronLeft,
    IconChevronRight as ChevronRight,
    IconDownload as Download,
    IconFileAlert as FileAlert,
    IconForms as Forms,
    IconLoader2 as Loader,
    IconLock as Lock,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import type { FormFieldInfo } from "./form";
  import { FillFormState, type SaveMode } from "./helper.svelte";

  const store = new FillFormState();
  const uid = $props.id();
  const NONE = "__none__";

  const saveModes: { value: SaveMode; label: string; hint: string }[] = [
    { value: "editable", label: "Keep fields editable", hint: "You or others can still change the answers later" },
    { value: "flatten", label: "Flatten", hint: "Answers become part of the page and can't be changed" },
  ];

  let canvas = $state<HTMLCanvasElement | null>(null);
  let previewWidth = $state(0);

  const groups = $derived.by(() => {
    const map = new Map<number, { field: FormFieldInfo; index: number }[]>();
    store.fields.forEach((field, index) => {
      const list = map.get(field.pageIndex) ?? [];
      list.push({ field, index });
      map.set(field.pageIndex, list);
    });
    return [...map.entries()].map(([page, items]) => ({ page, items }));
  });

  const fieldIndex = $derived(new Map(store.fields.map((f, i) => [f.name, i])));
  const pageFieldCount = $derived(store.fields.filter((f) => f.widgets.some((w) => w.pageIndex === store.previewPage)).length);
  const showResult = $derived(!store.isProcessing && store.result !== null);
  const skippedNote = $derived.by(() => {
    const s = store.summary?.skipped;
    if (!s) return "";
    const parts: string[] = [];
    if (s.signatures > 0) parts.push(`${s.signatures} signature ${s.signatures === 1 ? "box" : "boxes"}`);
    if (s.buttons > 0) parts.push(`${s.buttons} ${s.buttons === 1 ? "button" : "buttons"}`);
    return parts.length > 0 ? `${parts.join(" and ")} can't be filled here and stay as they are.` : "";
  });

  $effect(() => {
    const target = canvas;
    const page = store.previewPage;
    const width = Math.round(previewWidth);
    if (!target || width <= 0 || store.fields.length === 0) return;
    const timer = setTimeout(() => store.renderPreview(target, page, width), 80);
    return () => clearTimeout(timer);
  });

  const inputId = (index: number, option?: number) => `${uid}-field-${index}${option !== undefined ? `-${option}` : ""}`;

  function focusFromBox(name: string, option?: string) {
    const index = fieldIndex.get(name);
    if (index === undefined) return;
    const field = store.fields[index];
    const optionIndex = option !== undefined ? field.options.indexOf(option) : -1;
    const el = document.getElementById(optionIndex >= 0 ? inputId(index, optionIndex) : inputId(index));
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    store.focusField(name);
  }

  function asString(name: string): string {
    const v = store.values[name];
    return typeof v === "string" ? v : Array.isArray(v) ? (v[0] ?? "") : "";
  }

  function asList(name: string): string[] {
    const v = store.values[name];
    return Array.isArray(v) ? v : typeof v === "string" && v ? [v] : [];
  }

  function toggleInList(name: string, option: string, on: boolean) {
    const list = asList(name).filter((o) => o !== option);
    store.setValue(name, on ? [...list, option] : list);
  }
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet icon()}
      <Forms class="size-6" stroke={1.75} />
    {/snippet}
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF form to fill</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Type into the form's own boxes, tick the checkboxes, then download a filled copy.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult}
      <ResultCard
        title="Form filled"
        description={`${store.result?.name} is downloaded${store.saveMode === "flatten" ? " with the answers flattened into the pages" : " and can still be edited"}.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="fill-pdf-form" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.name}
      meta={`${formatBytes(store.file.size)} · ${store.pageCount} ${store.pageCount === 1 ? "page" : "pages"}${store.fields.length > 0 ? ` · ${store.fields.length} ${store.fields.length === 1 ? "field" : "fields"}` : ""}`}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    {#if store.loading}
      <div class="flex items-center gap-2 rounded-2xl border border-border bg-card p-5 text-body text-muted-foreground">
        <Loader class="size-4 animate-spin text-primary" />
        Reading the form…
      </div>
    {:else if store.locked}
      {@render notice(Lock, "This PDF is locked", "Its fields can't be changed while it has a password. Unlock it first, then open the unlocked copy here.", "/tools/decrypt-pdf", "Unlock the PDF")}
    {:else if store.fields.length === 0 && store.summary?.hasXfa}
      {@render notice(
        FileAlert,
        "This form uses a format that isn't supported",
        "It was built as a dynamic XFA form, usually in Adobe LiveCycle or Designer. Those forms only work in Adobe Acrobat and Reader, so open it there to fill it. If you can, ask the sender for a standard PDF form.",
      )}
    {:else if store.fields.length === 0}
      {@render notice(
        Forms,
        "No fillable fields in this PDF",
        "The form looks like boxes on the page, but it doesn't have real fields to type into. You can still add your answers as text on top of the page.",
        "/tools/edit-pdf",
        "Add text with Edit PDF",
      )}
    {:else}
      {#if store.summary?.hasXfa}
        <p class="text-body text-muted-foreground">
          This form also has an XFA version for Adobe apps. The filled copy keeps the standard fields only, so it looks the same in every viewer.
        </p>
      {/if}

      <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div class="flex min-w-0 flex-col gap-4">
          {#each groups as group (group.page)}
            <section class="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="{uid}-page-{group.page}">
              <div class="flex items-baseline justify-between gap-2">
                <h2 id="{uid}-page-{group.page}" class="text-body-lg font-medium text-foreground">
                  {group.page >= 0 ? `Page ${group.page + 1}` : "Not placed on a page"}
                </h2>
                <span class="text-caption tabular-nums text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? "field" : "fields"}
                </span>
              </div>

              {#each group.items as { field, index } (field.name)}
                {@const bad = store.badCharacters(field.name)}
                <div
                  class="flex flex-col gap-2"
                  role="group"
                  aria-labelledby="{inputId(index)}-label"
                  onfocusin={() => store.focusField(field.name)}
                >
                  <div class="flex items-baseline justify-between gap-2">
                    <label id="{inputId(index)}-label" for={inputId(index)} class="min-w-0 truncate text-body font-medium text-foreground" title={field.name}>
                      {field.label}
                      {#if field.required}<span class="text-destructive" aria-label="required">*</span>{/if}
                    </label>
                    {#if field.readOnly}
                      <span class="shrink-0 text-caption text-muted-foreground">Locked</span>
                    {:else if store.isChanged(field.name)}
                      <span class="shrink-0 text-caption text-primary">Changed</span>
                    {/if}
                  </div>

                  {#if field.kind === "text"}
                    <Input
                      id={inputId(index)}
                      value={asString(field.name)}
                      oninput={(e) => store.setValue(field.name, e.currentTarget.value)}
                      maxlength={field.maxLength}
                      disabled={field.readOnly}
                      aria-invalid={bad.length > 0}
                    />
                  {:else if field.kind === "multiline"}
                    <Textarea
                      id={inputId(index)}
                      value={asString(field.name)}
                      oninput={(e) => store.setValue(field.name, e.currentTarget.value)}
                      maxlength={field.maxLength}
                      disabled={field.readOnly}
                      aria-invalid={bad.length > 0}
                    />
                  {:else if field.kind === "checkbox"}
                    <div class="flex items-center gap-2.5">
                      <Checkbox
                        id={inputId(index)}
                        checked={store.values[field.name] === true}
                        onCheckedChange={(v) => store.setValue(field.name, v)}
                        disabled={field.readOnly}
                      />
                      <span class="text-body text-muted-foreground">{store.values[field.name] === true ? "Ticked" : "Not ticked"}</span>
                    </div>
                  {:else if field.kind === "radio"}
                    <RadioGroup.Root
                      value={asString(field.name)}
                      onValueChange={(v) => store.setValue(field.name, v)}
                      disabled={field.readOnly}
                      class="flex flex-wrap gap-x-5 gap-y-2"
                      aria-labelledby="{inputId(index)}-label"
                    >
                      {#each field.options as option, o (option)}
                        <label class="flex cursor-pointer items-center gap-2 text-body text-foreground">
                          <RadioGroup.Item id={o === 0 ? inputId(index) : inputId(index, o)} value={option} />
                          {option}
                        </label>
                      {/each}
                    </RadioGroup.Root>
                  {:else if field.kind === "dropdown" && field.editable && !field.multiSelect}
                    <Input
                      id={inputId(index)}
                      list="{inputId(index)}-options"
                      value={asString(field.name)}
                      oninput={(e) => store.setValue(field.name, e.currentTarget.value ? [e.currentTarget.value] : [])}
                      disabled={field.readOnly}
                      placeholder="Choose or type"
                      aria-invalid={bad.length > 0}
                    />
                    <datalist id="{inputId(index)}-options">
                      {#each field.options as option (option)}<option value={option}></option>{/each}
                    </datalist>
                  {:else if field.kind === "dropdown" && !field.multiSelect}
                    <Select.Root
                      type="single"
                      value={asString(field.name) || NONE}
                      onValueChange={(v) => store.setValue(field.name, v === NONE ? [] : [v])}
                      disabled={field.readOnly}
                    >
                      <Select.Trigger id={inputId(index)} class="w-full">
                        <span class={cn("truncate", !asString(field.name) && "text-placeholder")}>{asString(field.name) || "No choice"}</span>
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value={NONE} label="No choice" />
                        {#each field.options as option (option)}
                          <Select.Item value={option} label={option} />
                        {/each}
                      </Select.Content>
                    </Select.Root>
                  {:else if field.multiSelect}
                    <div class="flex flex-col gap-2 rounded-lg border border-border p-3">
                      {#each field.options as option, o (option)}
                        <label class="flex cursor-pointer items-center gap-2.5 text-body text-foreground">
                          <Checkbox
                            id={o === 0 ? inputId(index) : inputId(index, o)}
                            checked={asList(field.name).includes(option)}
                            onCheckedChange={(v) => toggleInList(field.name, option, v)}
                            disabled={field.readOnly}
                          />
                          {option}
                        </label>
                      {/each}
                    </div>
                  {:else}
                    <RadioGroup.Root
                      value={asString(field.name)}
                      onValueChange={(v) => store.setValue(field.name, [v])}
                      disabled={field.readOnly}
                      class="flex flex-col gap-2 rounded-lg border border-border p-3"
                      aria-labelledby="{inputId(index)}-label"
                    >
                      {#each field.options as option, o (option)}
                        <label class="flex cursor-pointer items-center gap-2.5 text-body text-foreground">
                          <RadioGroup.Item id={o === 0 ? inputId(index) : inputId(index, o)} value={option} />
                          {option}
                        </label>
                      {/each}
                    </RadioGroup.Root>
                  {/if}

                  {#if bad.length > 0}
                    <p class="text-caption text-destructive">
                      The PDF can't show {bad.slice(0, 6).join(" ")}. Use plain Latin letters here.
                    </p>
                  {/if}
                </div>
              {/each}
            </section>
          {/each}

          {#if skippedNote}
            <p class="text-caption text-muted-foreground">{skippedNote}</p>
          {/if}
        </div>

        <section class="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-3 lg:sticky lg:top-4" aria-label="Page preview">
          <div class="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={store.previewPage <= 0}
              onclick={() => (store.previewPage -= 1)}
            >
              <ChevronLeft class="size-4" />
            </Button>
            <div class="flex flex-col items-center">
              <span class="text-body font-medium tabular-nums text-foreground">Page {store.previewPage + 1} of {store.pageCount}</span>
              <span class="text-caption tabular-nums text-muted-foreground">
                {pageFieldCount === 0 ? "No fields on this page" : `${pageFieldCount} ${pageFieldCount === 1 ? "field" : "fields"} · click a box to jump to it`}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={store.previewPage >= store.pageCount - 1}
              onclick={() => (store.previewPage += 1)}
            >
              <ChevronRight class="size-4" />
            </Button>
          </div>

          <div class="relative overflow-hidden rounded-lg border border-border bg-white" bind:clientWidth={previewWidth}>
            <canvas bind:this={canvas} class={cn("block h-auto w-full transition-opacity duration-200", store.previewReady ? "opacity-100" : "opacity-0")}></canvas>
            {#if !store.previewReady}
              <div class="absolute inset-0 grid min-h-64 place-items-center">
                <Loader class="size-5 animate-spin text-muted-foreground" />
              </div>
            {:else}
              {#each store.previewBoxes as box, i (i)}
                {@const active = store.activeField === box.field}
                <button
                  type="button"
                  class={cn(
                    "absolute rounded-[3px] border outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-primary bg-primary/30" : "border-primary/70 bg-primary/10 hover:bg-primary/20"
                  )}
                  style:left="{box.left}%"
                  style:top="{box.top}%"
                  style:width="{box.width}%"
                  style:height="{box.height}%"
                  aria-label={`Go to ${store.fields[fieldIndex.get(box.field) ?? 0]?.label ?? box.field}${box.option ? `, ${box.option}` : ""}`}
                  onclick={() => focusFromBox(box.field, box.option)}
                ></button>
              {/each}
            {/if}
          </div>
          <p class="text-caption text-muted-foreground">Boxes show where each field sits. Your answers appear in the downloaded file.</p>
        </section>
      </div>
    {/if}
  </div>

  {#if store.fields.length > 0}
    <WorkspaceInspector title="Download">
      <div class="flex flex-col gap-6">
        <OptionGroup label="After filling" description="Flatten when you're sending a final copy.">
          <ChoiceList name="{uid}-save-mode" choices={saveModes} bind:value={store.saveMode} />
        </OptionGroup>
        <OptionGroup label="Answers" description={store.changedCount === 0 ? "Nothing changed yet." : `${store.changedCount} ${store.changedCount === 1 ? "field" : "fields"} changed.`}>
          <Button variant="outline" class="w-full" disabled={store.changedCount === 0 || store.isProcessing} onclick={() => store.resetValues()}>
            <Refresh />
            Undo all changes
          </Button>
        </OptionGroup>
      </div>
    </WorkspaceInspector>

    <ToolFooter>
      {#snippet hint()}
        <span class="block truncate">
          {#if store.isProcessing}
            Saving your answers…
          {:else if store.problems.length > 0}
            Fix the highlighted fields to download
          {:else if store.changedCount === 0}
            Fill in a field to get started
          {:else}
            {store.changedCount} {store.changedCount === 1 ? "field" : "fields"} filled · {store.saveMode === "flatten" ? "flattened" : "stays editable"}
          {/if}
        </span>
      {/snippet}
      <Button variant="primary" onclick={() => store.save()} disabled={store.isProcessing || store.problems.length > 0}>
        {store.isProcessing ? "Saving…" : "Download filled PDF"}
      </Button>
    </ToolFooter>
  {/if}
{/if}

{#snippet notice(Icon: typeof Forms, title: string, body: string, href?: string, action?: string)}
  <section class="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row">
    <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
      <Icon class="size-5" stroke={1.75} />
    </span>
    <div class="flex min-w-0 flex-1 flex-col gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-body-lg font-medium text-foreground">{title}</h2>
        <p class="max-w-prose text-body text-muted-foreground">{body}</p>
      </div>
      {#if href && action}
        <div><Button variant="outline" {href}>{action}</Button></div>
      {/if}
    </div>
  </section>
{/snippet}
