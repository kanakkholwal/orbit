<script lang="ts">
  import { FileRow, OptionGroup, OptionToggle, ResultCard, StatusPill, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconAlertCircle as AlertCircle,
    IconAlertTriangle as AlertTriangle,
    IconDownload as Download,
    IconInfoCircle as InfoCircle,
    IconRefresh as Refresh,
    IconShieldCheck as ShieldCheck,
  } from "@tabler/icons-svelte";
  import type { Finding, Severity } from "./privacy";
  import { PrivacyCheckState } from "./helper.svelte";

  const store = new PrivacyCheckState();
  const MAX_ITEMS = 6;

  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const findings = $derived(store.findings);
  const willRemove = (f: Finding) => f.handling === "removed" || (f.handling === "optional" && store.options.comments);
  const removable = $derived(findings.filter(willRemove));
  const showResult = $derived(!store.isProcessing && store.result !== null);
  const leftAfter = $derived(store.result?.after ?? []);

  const severity: Record<Severity, { label: string; tone: string; icon: typeof InfoCircle }> = {
    high: { label: "High", tone: "bg-destructive/10 text-destructive", icon: AlertTriangle },
    medium: { label: "Medium", tone: "bg-warning/10 text-warning", icon: AlertCircle },
    low: { label: "Low", tone: "bg-muted text-muted-foreground", icon: InfoCircle },
  };

  function handlingLabel(f: Finding): string {
    if (willRemove(f)) return "Removed when you clean";
    if (f.handling === "optional") return "Kept unless you turn on Remove comments";
    return "Kept";
  }
</script>

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to check before you share it</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        See names, hidden files, scripts and other details tucked inside, then remove them in one step. The file never leaves this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult && store.result}
      <ResultCard
        title="Cleaned copy downloaded"
        description={leftAfter.length === 0
          ? "Nothing on the checklist is left inside."
          : `Still inside, as chosen: ${leftAfter.map((f) => f.title.toLowerCase()).join(", ")}.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Check another
          </Button>
        {/snippet}
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="pdf-privacy-check" />
      </ResultCard>
    {/if}

    <FileRow name={store.file.name} onRemove={store.isProcessing ? undefined : () => store.reset()}>
      <span>{formatBytes(store.file.size)}</span>
      {#if store.scan}
        <span aria-hidden="true">·</span>
        <span>{plural(store.scan.pages, "page")}</span>
      {/if}
      {#snippet trailing()}
        {#if store.isScanning}
          <StatusPill status="processing" label="Checking" />
        {:else if store.error && !store.scan}
          <StatusPill status="error" label="Could not check" />
        {:else if store.scan}
          <StatusPill status={findings.length > 0 ? "idle" : "done"} label={findings.length > 0 ? plural(findings.length, "finding") : "Nothing found"} />
        {/if}
      {/snippet}
    </FileRow>

    {#if store.error}
      <p role="alert" class="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-body text-destructive">
        {store.error}
      </p>
    {/if}

    {#if store.scan && findings.length === 0}
      <section class="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck class="size-5" />
        </span>
        <div class="flex flex-col gap-0.5">
          <h2 class="text-body-lg font-medium text-foreground">Nothing hidden found</h2>
          <p class="text-body text-muted-foreground">
            No document details, attached files, scripts, comments, form fields or links. What you see on the pages is what you share.
          </p>
        </div>
      </section>
    {:else if store.scan}
      <p class="text-body text-muted-foreground">
        Found in this file, most serious first. Text and images on the pages are never changed.
      </p>
      <ul class="flex flex-col gap-2">
        {#each findings as finding (finding.id)}
          {@const level = severity[finding.severity]}
          <li class="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="flex min-w-0 flex-col gap-0.5">
                <h3 class="text-body font-medium text-foreground">{finding.title}</h3>
                <p class="text-body text-muted-foreground">{finding.detail}</p>
              </div>
              <span class={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium", level.tone)}>
                <level.icon class="size-3.5" />
                {level.label}
              </span>
            </div>
            {#if finding.items.length > 0}
              <ul class="flex flex-wrap gap-1.5">
                {#each finding.items.slice(0, MAX_ITEMS) as item, i (i)}
                  <li class="max-w-full truncate rounded-md bg-muted px-2 py-0.5 text-caption text-foreground" title={item}>{item}</li>
                {/each}
                {#if finding.items.length > MAX_ITEMS}
                  <li class="px-1 py-0.5 text-caption text-muted-foreground">and {finding.items.length - MAX_ITEMS} more</li>
                {/if}
              </ul>
            {/if}
            <p class={cn("text-caption", willRemove(finding) ? "text-primary" : "text-muted-foreground")}>{handlingLabel(finding)}</p>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  {#if store.scan}
    <WorkspaceInspector title="Clean">
      <div class="flex flex-col gap-6">
        <OptionGroup
          label="Always removed"
          description="Document details, hidden metadata, attached files, scripts and actions that run on their own, private app data and earlier saved versions."
        >
          <p class="text-caption text-muted-foreground">
            Form fields and links are kept so the document still works. Text and images on the pages are not checked, so read them yourself.
          </p>
        </OptionGroup>

        <OptionGroup label="Optional">
          <div class="-my-2.5 flex flex-col divide-y divide-border">
            <OptionToggle
              label="Remove comments"
              description="Notes, highlights and drawings, and the names of who added them"
              bind:checked={store.options.comments}
            />
          </div>
        </OptionGroup>
      </div>
    </WorkspaceInspector>

    <ToolFooter>
      {#snippet hint()}
        <span class="block truncate">
          {#if store.isProcessing}
            Cleaning…
          {:else if removable.length === 0}
            Nothing to remove with these settings
          {:else}
            {plural(removable.length, "finding")} will be removed
          {/if}
        </span>
      {/snippet}

      <Button variant="primary" onclick={() => store.clean()} disabled={store.isProcessing || removable.length === 0}>
        {store.isProcessing ? "Cleaning…" : "Clean and download"}
      </Button>
    </ToolFooter>
  {/if}
{/if}
