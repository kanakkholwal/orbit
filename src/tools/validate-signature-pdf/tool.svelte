<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconRosetteDiscountCheck as BadgeCheck,
    IconBuilding as Building2,
    IconCalendar as Calendar,
    IconSignature as FileSignature,
    IconHash as Hash,
    IconLoader2 as LoaderCircle,
    IconShieldExclamation as ShieldAlert,
    IconShieldCheck as ShieldCheck,
    IconShieldQuestion as ShieldQuestion,
    IconShieldX as ShieldX,
    IconCircleX as XCircle,
  } from "@tabler/icons-svelte";
  import { ValidateSignatureState } from "./helper.svelte";

  const store = new ValidateSignatureState();

  function formatDate(d: Date | undefined) {
    if (!d || isNaN(d.getTime())) return "Unknown";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  type Tone = "ok" | "warn" | "bad";
  function tone(result: ValidateSignatureState["results"][number]): Tone {
    if (!result.isValid) return "bad";
    if (result.isExpired || (result.isSelfSigned && !result.isTrusted))
      return "warn";
    return "ok";
  }
</script>

{#if !store.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.loadFile(files)}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label={store.file.file.name}
      onReset={() => store.reset()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow name={store.file.file.name}>
        <span class="font-mono tabular-nums">
          {formatBytes(store.file.originalSize)}
        </span>
      </FileRow>
    </ToolPanel>

    {#if store.results.length === 0}
      <ToolPanel
        title="Trust certificate"
        description="Optional. Upload a public key (.pem, .crt) to verify internal signatures."
      >
        {#if !store.certFile}
          <UploadArea
            accept=".pem,.crt,.cer"
            multiple={false}
            onFilesSelected={(files) => store.loadCertFile(files)}
          />
        {:else}
          <div
            class="flex items-center justify-between rounded-sm border border-primary/20 bg-primary/5 px-3 py-2.5"
          >
            <div class="flex items-center gap-2.5">
              <span class="inline-flex size-7 items-center justify-center rounded-sm bg-primary/15 text-primary">
                <BadgeCheck class="size-3.5" />
              </span>
              <span class="font-mono text-xs tabular-nums text-primary">
                {store.certFile.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              class="rounded-sm text-primary hover:bg-primary/10"
              onclick={() => store.removeCert()}
              aria-label="Remove certificate"
            >
              <XCircle class="size-3.5" />
            </Button>
          </div>
        {/if}
      </ToolPanel>
    {:else}
      <ToolPanel title="Results" counter={store.results.length}>
        <div class="flex flex-col gap-4">
          {#each store.results as result}
            {@const t = tone(result)}
            <article
              class="overflow-hidden rounded-sm border border-border/60 bg-card"
            >
              <header
                class={cn(
                  "flex items-center gap-3 border-b border-border/60 px-4 py-3",
                  t === "ok" && "bg-success/5",
                  t === "warn" && "bg-warning/5",
                  t === "bad" && "bg-destructive/5"
                )}
              >
                <span
                  class={cn(
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-sm",
                    t === "ok" && "bg-success/15 text-success",
                    t === "warn" && "bg-warning/15 text-warning",
                    t === "bad" && "bg-destructive/15 text-destructive"
                  )}
                >
                  {#if t === "bad"}
                    <ShieldX class="size-4" />
                  {:else if t === "warn" && result.isExpired}
                    <ShieldAlert class="size-4" />
                  {:else if t === "warn"}
                    <ShieldQuestion class="size-4" />
                  {:else}
                    <ShieldCheck class="size-4" />
                  {/if}
                </span>
                <div class="flex flex-col gap-0.5">
                  <h3
                    class={cn(
                      "label-eyebrow",
                      t === "ok" && "text-success",
                      t === "warn" && "text-warning",
                      t === "bad" && "text-destructive"
                    )}
                  >
                    {#if !result.isValid}
                      Invalid signature
                    {:else if result.isExpired}
                      Certificate expired
                    {:else if result.isSelfSigned && !result.isTrusted}
                      Unknown issuer
                    {:else}
                      Valid signature
                    {/if}
                  </h3>
                  <p class="text-xs leading-relaxed text-muted-foreground">
                    {#if !result.isValid}
                      {result.errorMessage || "Cryptographic check failed."}
                    {:else if result.isExpired}
                      The certificate used for this signature has expired.
                    {:else if result.isSelfSigned && !result.isTrusted}
                      Mathematically valid, but identity cannot be verified
                      against a trusted authority.
                    {:else}
                      Document integrity and signer identity verified.
                    {/if}
                  </p>
                </div>
              </header>

              <div class="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="label-eyebrow text-muted-foreground"
                    >
                      Signer
                    </span>
                    <p class="text-sm font-medium text-foreground">
                      {result.signerName}
                    </p>
                    {#if result.signerOrg}
                      <p
                        class="flex items-center gap-1 text-xs text-muted-foreground"
                      >
                        <Building2 class="size-3" />
                        {result.signerOrg}
                      </p>
                    {/if}
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="label-eyebrow text-muted-foreground"
                    >
                      Issuer
                    </span>
                    <p class="text-sm text-foreground">{result.issuer}</p>
                    {#if result.issuerOrg}
                      <p class="text-xs text-muted-foreground">
                        {result.issuerOrg}
                      </p>
                    {/if}
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="label-eyebrow text-muted-foreground"
                    >
                      Reason / Location
                    </span>
                    <p class="text-sm text-foreground">
                      {result.reason || "Not specified"}
                    </p>
                    {#if result.location}
                      <p class="text-xs text-muted-foreground">
                        {result.location}
                      </p>
                    {/if}
                  </div>
                </div>

                <dl
                  class="flex flex-col divide-y divide-border/60 overflow-hidden rounded-sm border border-border/60 bg-muted/20"
                >
                  <div class="flex items-center justify-between px-3 py-2">
                    <dt
                      class="flex items-center gap-1.5 label-eyebrow text-muted-foreground"
                    >
                      <Calendar class="size-3" />
                      Valid from
                    </dt>
                    <dd class="font-mono text-xs tabular-nums text-foreground">
                      {formatDate(result.validFrom)}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between px-3 py-2">
                    <dt
                      class="flex items-center gap-1.5 label-eyebrow text-muted-foreground"
                    >
                      <Calendar class="size-3" />
                      Valid to
                    </dt>
                    <dd
                      class={cn(
                        "font-mono text-xs tabular-nums",
                        result.isExpired
                          ? "font-bold text-destructive"
                          : "text-foreground"
                      )}
                    >
                      {formatDate(result.validTo)}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between px-3 py-2">
                    <dt
                      class="flex items-center gap-1.5 label-eyebrow text-muted-foreground"
                    >
                      <Hash class="size-3" />
                      Algorithms
                    </dt>
                    <dd class="font-mono text-xs tabular-nums text-foreground">
                      {result.algorithms.signature} / {result.algorithms.digest}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-3 px-3 py-2">
                    <dt
                      class="flex items-center gap-1.5 label-eyebrow text-muted-foreground"
                    >
                      <FileSignature class="size-3" />
                      Coverage
                    </dt>
                    <dd
                      class={cn(
                        "text-right font-mono text-xs tabular-nums",
                        result.coverageStatus === "partial"
                          ? "text-warning"
                          : "text-foreground"
                      )}
                    >
                      {#if result.coverageStatus === "full"}
                        Entire document
                      {:else if result.coverageStatus === "partial"}
                        Partial · modified
                      {:else}
                        Unknown
                      {/if}
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          {/each}
        </div>
      </ToolPanel>
    {/if}

    {#if store.results.length === 0}
      <ToolFooter
        hint={store.isProcessing ? "Analyzing signatures" : "Verify signatures"}
      >
        <Button
          size="lg"
          class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
          onclick={() => store.process()}
          disabled={store.isProcessing}
        >
          {#if store.isProcessing}
            <LoaderCircle class="size-4 animate-spin" />
            Analyzing
          {:else}
            <ShieldCheck class="size-4" />
            Validate signatures
          {/if}
        </Button>
      </ToolFooter>
    {/if}
  </div>
{/if}
