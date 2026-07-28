<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { PROXY_SOURCE_URL } from "$lib/runtime/proxy-url";
  import { cn } from "$lib/utils";
  import {
    IconRosetteDiscountCheck as BadgeCheck,
    IconDownload as DownloadIcon,
    IconExternalLink as ExternalLink,
    IconFileUpload as FileUp,
    IconInfoCircle as Info,
    IconLoader2 as LoaderCircle,
    IconShieldCheck as ShieldCheck,
  } from "@tabler/icons-svelte";
  import { SignPdfState } from "./helper.svelte";

  const store = new SignPdfState();

  let certInput: HTMLInputElement;

  const fieldLabel =
    "label-eyebrow text-muted-foreground";
  const fieldInput = "h-10 rounded-md";
</script>

{#if !store.hasPdf}
  <UploadArea
    accept="application/pdf"
    multiple={false}
    onFilesSelected={(f) => store.loadFile(f[0])}
  >
    {#snippet title()}
      <h3 class="text-display-sm text-foreground">Digitally sign a PDF</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-md text-sm leading-relaxed text-muted-foreground">
        Apply a real, cryptographic (PAdES) digital signature with your
        certificate — tamper-evident and verifiable. Everything happens on your
        device; your document and private key never leave the browser.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label="Sign · {store.fileName}.pdf"
      onReset={() => store.reset()}
      resetLabel="Start over"
    />

    <!-- Certificate -->
    <ToolPanel title="Certificate">
      <div class="flex flex-col gap-5">
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            onclick={() => (store.certMode = "upload")}
            class={cn(
              "rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
              store.certMode === "upload"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            Use my certificate
          </button>
          <button
            type="button"
            onclick={() => (store.certMode = "generate")}
            class={cn(
              "rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
              store.certMode === "generate"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            Create a self-signed one
          </button>
        </div>

        {#if store.certMode === "upload"}
          <div class="flex flex-col gap-3">
            <input
              bind:this={certInput}
              type="file"
              accept=".p12,.pfx,application/x-pkcs12"
              class="hidden"
              onchange={(e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) store.loadCert(f);
                (e.target as HTMLInputElement).value = "";
              }}
            />
            <Button
              variant="outline"
              class="w-fit rounded-md"
              onclick={() => certInput.click()}
            >
              <FileUp class="size-4" />
              {store.p12Name || "Choose .p12 / .pfx file"}
            </Button>
            <p class="text-xs text-muted-foreground">
              A PKCS#12 certificate file, typically issued by a certificate
              authority. It is read locally and never uploaded.
            </p>
          </div>
        {:else}
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="flex flex-col gap-1.5">
              <Label for="gen-name" class={fieldLabel}>Name *</Label>
              <Input
                id="gen-name"
                bind:value={store.genName}
                placeholder="Jane Doe"
                class={fieldInput}
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <Label for="gen-org" class={fieldLabel}>Organisation</Label>
              <Input
                id="gen-org"
                bind:value={store.genOrg}
                placeholder="Optional"
                class={fieldInput}
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <Label for="gen-country" class={fieldLabel}>Country</Label>
              <Input
                id="gen-country"
                bind:value={store.genCountry}
                placeholder="e.g. US"
                maxlength={2}
                class={fieldInput}
              />
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              class="rounded-md"
              onclick={() => store.generateCert()}
              disabled={store.generating}
            >
              {#if store.generating}
                <LoaderCircle class="size-4 animate-spin" />
                Generating…
              {:else}
                <BadgeCheck class="size-4" />
                {store.hasCert ? "Regenerate" : "Generate certificate"}
              {/if}
            </Button>
            {#if store.hasCert}
              <Button
                variant="ghost"
                class="rounded-md text-muted-foreground"
                onclick={() => store.downloadCert()}
              >
                <DownloadIcon class="size-4" />
                Save .p12
              </Button>
            {/if}
          </div>
          <p class="text-xs leading-relaxed text-muted-foreground">
            A self-signed certificate makes the signature tamper-evident, but is
            not backed by a trusted authority, so validators will show "identity
            not verified". Set the passphrase below before generating.
          </p>
        {/if}

        <div class="flex flex-col gap-1.5">
          <Label for="passphrase" class={fieldLabel}>Certificate passphrase *</Label>
          <Input
            id="passphrase"
            type="password"
            bind:value={store.passphrase}
            placeholder="••••••••"
            class={fieldInput}
          />
        </div>
      </div>
    </ToolPanel>

    <!-- Signature details -->
    <ToolPanel title="Signature details">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <Label for="reason" class={fieldLabel}>Reason</Label>
          <Input id="reason" bind:value={store.reason} class={fieldInput} />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="location" class={fieldLabel}>Location</Label>
          <Input
            id="location"
            bind:value={store.location}
            placeholder="Optional"
            class={fieldInput}
          />
        </div>
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <Label for="contact" class={fieldLabel}>Contact info</Label>
          <Input
            id="contact"
            bind:value={store.contactInfo}
            placeholder="Optional — email or name"
            class={fieldInput}
          />
        </div>
      </div>
    </ToolPanel>

    <!-- Trust & verification disclosure -->
    <div
      class="flex flex-col gap-3 rounded-lg border border-border bg-background-muted/40 p-5"
    >
      <div class="flex items-center gap-2">
        <ShieldCheck class="size-4 text-primary" />
        <span class="label-eyebrow text-foreground">Privacy & verification</span>
      </div>
      <p class="text-sm leading-relaxed text-muted-foreground">
        Signing runs entirely in your browser — your PDF and private key are
        never uploaded. The resulting signature is independently verifiable
        (try the
        <a href="/tools/validate-signature-pdf" class="text-primary underline-offset-2 hover:underline">Validate Signature</a>
        tool).
      </p>
      <div class="flex items-start gap-2 rounded-md bg-card/60 p-3">
        <Info class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <p class="text-xs leading-relaxed text-muted-foreground">
          <span class="font-medium text-foreground">Optional trusted timestamps & revocation checks</span>
          (RFC&nbsp;3161 / OCSP) are the only steps that would ever contact the
          outside world. Because browsers can't reach those authorities
          directly, Orbit routes just a hash — never your document — through a
          tiny same-origin proxy. The signature itself is produced fully offline.
          The proxy is open source and auditable:
          <a
            href={PROXY_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
          >
            view the proxy source
            <ExternalLink class="size-3" />
          </a>.
        </p>
      </div>
    </div>

    <ToolFooter
      hint={store.isProcessing
        ? store.progressLabel
        : !store.hasCert
          ? "Add or generate a certificate to sign"
          : store.passphrase.length === 0
            ? "Enter the certificate passphrase"
            : "Ready to sign"}
    >
      <Button
        size="lg"
        class="rounded-md bg-primary px-6 text-primary-foreground hover:bg-primary-active"
        onclick={() => store.sign()}
        disabled={!store.canSign}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          <ShieldCheck class="size-4" />
          Sign PDF
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
