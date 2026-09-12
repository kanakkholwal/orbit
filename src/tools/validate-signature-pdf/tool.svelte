<script lang="ts">
  import { FileRow, OptionGroup, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconCertificate as Certificate,
    IconCheck as Check,
    IconCopy as Copy,
    IconLoader2 as Loader,
    IconPlus as Plus,
    IconShieldCheck as ShieldCheck,
    IconShieldExclamation as ShieldAlert,
    IconShieldQuestion as ShieldQuestion,
    IconShieldX as ShieldX,
    IconX as X,
  } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import { ValidateSignatureState, type SignatureValidationResult } from "./helper.svelte";

  const store = new ValidateSignatureState();
  let pickInput = $state<HTMLInputElement | null>(null);
  let certInput = $state<HTMLInputElement | null>(null);
  let copiedKey = $state<string | null>(null);

  type Verdict = "valid" | "warning" | "invalid" | "none";

  function formatDate(d: Date | undefined) {
    if (!d || isNaN(d.getTime()) || d.getTime() === 0) return "Unknown";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function verdictOf(r: SignatureValidationResult): Verdict {
    if (!r.isValid) return "invalid";
    if (r.isExpired || (r.isSelfSigned && !r.isTrusted) || r.coverageStatus === "partial") return "warning";
    return "valid";
  }

  const overall = $derived.by<Verdict>(() => {
    if (store.results.length === 0) return "none";
    const all = store.results.map(verdictOf);
    if (all.includes("invalid")) return "invalid";
    if (all.includes("warning")) return "warning";
    return "valid";
  });

  const count = $derived(store.results.length);
  const signatureWord = $derived(count === 1 ? "signature" : "signatures");

  const verdictCopy = $derived.by(() => {
    switch (overall) {
      case "valid":
        return {
          title: count === 1 ? "Signature found, no problems spotted" : `${count} signatures found, no problems spotted`,
          body:
            count === 1
              ? `Signed by ${store.results[0].signerName}.${store.results[0].coverageStatus === "full" ? " The signature covers the whole file." : ""} Orbit doesn't yet check the signature cryptographically, so confirm important documents in a dedicated signature checker.`
              : "Every signature could be read and none show changes made after signing. Orbit doesn't yet check signatures cryptographically, so confirm important documents in a dedicated signature checker.",
        };
      case "warning":
        return {
          title: "Signed, but check the details",
          body: "The signature is readable, but something needs your attention, such as an expired certificate, an unknown signer or changes made after signing.",
        };
      case "invalid":
        return {
          title: count === 1 ? "Signature can't be read" : "Some signatures can't be read",
          body: "At least one signature couldn't be read. The file may be damaged or the signature may be broken.",
        };
      default:
        return {
          title: "No signature found",
          body: "This PDF doesn't contain a digital signature. A drawn or pasted signature image doesn't count.",
        };
    }
  });

  const tone: Record<Verdict, string> = {
    valid: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    invalid: "bg-destructive/10 text-destructive",
    none: "bg-muted text-muted-foreground",
  };

  function statusLabel(r: SignatureValidationResult) {
    if (!r.isValid) return "Can't be read";
    if (r.coverageStatus === "partial") return "Changed after signing";
    if (r.isExpired) return "Certificate expired";
    if (r.isSelfSigned && !r.isTrusted) return "Signer not confirmed";
    return "No problems spotted";
  }

  function statusDetail(r: SignatureValidationResult) {
    if (!r.isValid) return r.errorMessage || "The signature data couldn't be read.";
    if (r.coverageStatus === "partial") return "Someone edited the file after this signature was added.";
    if (r.isExpired) return "The signer's certificate had expired or wasn't active yet when we checked.";
    if (r.isSelfSigned && !r.isTrusted)
      return "The signer made their own certificate, so we can't confirm who they are. Add their certificate to confirm it.";
    return r.isTrusted ? "Matches the certificate you added." : "The signature covers the whole file.";
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedKey = key;
      setTimeout(() => {
        if (copiedKey === key) copiedKey = null;
      }, 2000);
    } catch {
      toast.error("Couldn't copy to the clipboard.");
    }
  }
</script>

{#snippet verdictGlyph(v: Verdict, cls: string)}
  {#if v === "valid"}
    <ShieldCheck class={cls} aria-hidden="true" />
  {:else if v === "warning"}
    <ShieldAlert class={cls} aria-hidden="true" />
  {:else if v === "invalid"}
    <ShieldX class={cls} aria-hidden="true" />
  {:else}
    <ShieldQuestion class={cls} aria-hidden="true" />
  {/if}
{/snippet}

{#snippet row(label: string, value: string, muted = false)}
  <div class="grid grid-cols-1 gap-x-4 gap-y-0.5 px-4 py-2.5 sm:grid-cols-[11rem_1fr]">
    <dt class="text-body text-muted-foreground">{label}</dt>
    <dd class={cn("min-w-0 wrap-break-word text-body tabular-nums", muted ? "text-muted-foreground" : "text-foreground")}>
      {value}
    </dd>
  </div>
{/snippet}

{#if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a signed PDF to check it</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        See who signed it, when, and whether the signature covers the whole file.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-6">
    <FileRow
      name={store.file.file.name}
      meta={formatBytes(store.file.originalSize)}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    {#if store.isProcessing}
      <p class="flex items-center gap-2 text-body text-muted-foreground" aria-live="polite">
        <Loader class="size-4 animate-spin text-primary" />
        Checking signatures
      </p>
    {:else if store.failed}
      <div class="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
        <p class="text-body font-medium text-foreground">We couldn't check this file</p>
        <p class="text-body text-muted-foreground">It may be damaged or locked with a password. Try another PDF.</p>
      </div>
    {:else if store.checked}
      <section aria-live="polite" class="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <span class={cn("grid size-12 shrink-0 place-items-center rounded-xl", tone[overall])}>
          {@render verdictGlyph(overall, "size-6")}
        </span>
        <div class="flex min-w-0 flex-col gap-1">
          <h2 class="text-subheading font-medium text-foreground">{verdictCopy.title}</h2>
          <p class="text-body text-muted-foreground">{verdictCopy.body}</p>
          {#if count > 1}
            <p class="text-caption tabular-nums text-muted-foreground">{count} {signatureWord} in this file</p>
          {/if}
        </div>
      </section>

      {#each store.results as result (result.signatureIndex)}
        {@const v = verdictOf(result)}
        <article class="flex flex-col rounded-xl border border-border bg-card" aria-label={`Signature ${result.signatureIndex + 1}`}>
          <header class="flex items-start gap-3 border-b border-border px-4 py-3">
            <span class={cn("grid size-9 shrink-0 place-items-center rounded-lg", tone[v])}>
              {@render verdictGlyph(v, "size-5")}
            </span>
            <div class="flex min-w-0 flex-col gap-0.5">
              <h3 class="text-body font-medium text-foreground">
                {count > 1 ? `Signature ${result.signatureIndex + 1}: ` : ""}{statusLabel(result)}
              </h3>
              <p class="text-body text-muted-foreground">{statusDetail(result)}</p>
            </div>
          </header>

          <dl class="flex flex-col divide-y divide-border">
            {@render row("Signed by", result.signerName, result.signerName === "Unknown")}
            {#if result.signerOrg}{@render row("Organisation", result.signerOrg)}{/if}
            {#if result.signerEmail}{@render row("Email", result.signerEmail)}{/if}
            {@render row("Signed on", formatDate(result.signatureDate), !result.signatureDate)}
            {#if result.reason}{@render row("Reason", result.reason)}{/if}
            {#if result.location}{@render row("Location", result.location)}{/if}
            {#if result.contactInfo}{@render row("Contact", result.contactInfo)}{/if}
            {@render row(
              "Certificate issued by",
              result.issuerOrg ? `${result.issuer}, ${result.issuerOrg}` : result.issuer,
              result.issuer === "Unknown"
            )}
            {@render row("Certificate valid from", formatDate(result.validFrom))}
            <div class="grid grid-cols-1 gap-x-4 gap-y-0.5 px-4 py-2.5 sm:grid-cols-[11rem_1fr]">
              <dt class="text-body text-muted-foreground">Certificate valid until</dt>
              <dd class="flex items-center gap-1.5 text-body tabular-nums text-foreground">
                {formatDate(result.validTo)}
                {#if result.isExpired}
                  <span class="inline-flex items-center gap-1 text-warning">
                    <ShieldAlert class="size-4" aria-hidden="true" />
                    Expired
                  </span>
                {/if}
              </dd>
            </div>
            {@render row(
              "Covers",
              result.coverageStatus === "full"
                ? "The whole file"
                : result.coverageStatus === "partial"
                  ? "Part of the file (changed after signing)"
                  : "Unknown",
              result.coverageStatus === "unknown"
            )}
            {@render row("Method", `${result.algorithms.signature}, ${result.algorithms.digest}`)}
            {#if result.serialNumber}
              <div class="grid grid-cols-1 items-center gap-x-4 pl-4 pr-1.5 pt-2 sm:grid-cols-[11rem_1fr] sm:pt-0">
                <dt class="text-body text-muted-foreground">Serial number</dt>
                <dd class="flex min-h-11 items-center justify-between gap-2">
                  <span class="min-w-0 break-all font-mono text-body text-foreground">{result.serialNumber}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="text-muted-foreground hover:text-foreground"
                    aria-label={copiedKey === `serial:${result.signatureIndex}` ? "Copied" : "Copy serial number"}
                    onclick={() => copy(result.serialNumber, `serial:${result.signatureIndex}`)}
                  >
                    {#if copiedKey === `serial:${result.signatureIndex}`}
                      <Check class="size-4 text-success" />
                    {:else}
                      <Copy class="size-4" />
                    {/if}
                  </Button>
                </dd>
              </div>
            {/if}
          </dl>
        </article>
      {/each}
    {/if}

    <input
      bind:this={pickInput}
      type="file"
      accept=".pdf,application/pdf"
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) store.loadFile(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>

  <WorkspaceInspector title="Check">
    <OptionGroup
      label="Trusted certificate"
      description="Optional. Add the signer's certificate to confirm who they are. We check the file again straight away."
    >
      {#if store.certFile}
        <div class="flex items-center gap-3 rounded-xl border border-border bg-card py-1.5 pl-2 pr-1.5">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Certificate class="size-5" />
          </span>
          <span class="min-w-0 flex-1 truncate text-body font-medium text-foreground" title={store.certFile.name}>
            {store.certFile.name}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove ${store.certFile.name}`}
            disabled={store.isProcessing}
            onclick={() => store.removeCert()}
          >
            <X class="size-4" />
          </Button>
        </div>
      {:else}
        <Button variant="outline" class="w-full" disabled={store.isProcessing} onclick={() => certInput?.click()}>
          <Plus class="size-4" />
          Add certificate
        </Button>
        <p class="text-caption text-muted-foreground">.pem, .crt or .cer file</p>
      {/if}
      <input
        bind:this={certInput}
        type="file"
        accept=".pem,.crt,.cer"
        class="hidden"
        onchange={(e) => {
          const picked = Array.from(e.currentTarget.files ?? []);
          if (picked.length > 0) store.loadCertFile(picked);
          e.currentTarget.value = "";
        }}
      />
    </OptionGroup>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="block truncate">Checking signatures…</span>
      {:else if store.failed}
        <span class="block truncate">Choose another PDF to try again.</span>
      {:else if store.checked}
        <span class="block truncate">{verdictCopy.title}</span>
      {/if}
    {/snippet}

    <Button variant="primary" disabled={store.isProcessing} onclick={() => pickInput?.click()}>
      Check another file
    </Button>
  </ToolFooter>
{/if}
