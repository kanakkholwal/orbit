<script lang="ts">
  import { FileRow, OptionGroup, ResultCard, SegmentedControl, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { openFilesInTool } from "$lib/runtime/pending-files.svelte";
  import { PROXY_SOURCE_URL } from "$lib/runtime/proxy-url";
  import { formatBytes } from "$utils/helper";
  import {
    IconCertificate as Certificate,
    IconDownload as Download,
    IconEye as Eye,
    IconEyeOff as EyeOff,
    IconFileUpload as FileUp,
    IconRefresh as Refresh,
    IconRosetteDiscountCheck as BadgeCheck,
  } from "@tabler/icons-svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { SignPdfState, type CertMode } from "./helper.svelte";

  const store = new SignPdfState();
  const uid = $props.id();

  let certInput = $state<HTMLInputElement | null>(null);
  let showPassphrase = $state(false);

  const inputClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  const modes: { value: CertMode; label: string }[] = [
    { value: "upload", label: "Use my certificate" },
    { value: "generate", label: "Create one" },
  ];

  const detailFields = [
    { key: "reason", label: "Reason", placeholder: "I approve this document" },
    { key: "location", label: "Place", placeholder: "City or office" },
    { key: "contactInfo", label: "Contact", placeholder: "Email or name" },
  ] as const;

  const showResult = $derived(!store.isProcessing && store.result !== null);
  const generating = $derived(store.certMode === "generate");
  const generateBlocker = $derived(
    !store.genName.trim()
      ? "Enter your name to create a certificate."
      : store.passphrase.length < 4
        ? "Set a password of at least 4 characters first."
        : ""
  );

  const blocker = $derived(
    !store.hasCert
      ? generating
        ? "Create a certificate to continue"
        : "Choose your certificate file to continue"
      : store.passphrase.length === 0
        ? "Enter the certificate password to continue"
        : ""
  );

  function clearResult() {
    store.result = null;
  }

  function startOver() {
    store.reset();
    showPassphrase = false;
  }

  function sign() {
    store.sign().catch(() => {});
  }
</script>

{#if !store.hasPdf}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(f) => store.loadFile(f[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to sign</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Add a digital signature that proves who signed and shows if anything changes later. The file never leaves this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult && store.result}
      <ResultCard
        title="PDF signed"
        description={`${store.result.name} is downloaded. Editing it from now on will break the signature.`}
      >
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.downloadResult()}>
            <Download />
            Download again
          </Button>
          <Button variant="ghost" onclick={startOver}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-body text-muted-foreground">Want proof it worked? Open the signed copy in the checker.</p>
          <Button variant="outline" onclick={() => openFilesInTool(store.resultFiles, "validate-signature-pdf")}>
            <BadgeCheck />
            Check the signature
          </Button>
        </div>
      </ResultCard>
    {/if}

    <FileRow
      name={`${store.fileName}.pdf`}
      meta={formatBytes(store.pdfSize)}
      onRemove={store.isProcessing ? undefined : startOver}
    />

    <section class="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-5" oninput={clearResult}>
      <div class="flex flex-col gap-0.5">
        <h2 class="text-body-lg font-medium text-foreground">Your certificate</h2>
        <p class="text-body text-muted-foreground">
          A certificate is a small file that proves the signature is yours. Use one you have, or create one now.
        </p>
      </div>

      <SegmentedControl name="{uid}-cert-mode" options={modes} bind:value={store.certMode} />

      {#if !generating}
        <div class="flex flex-col gap-2">
          <input
            bind:this={certInput}
            type="file"
            accept=".p12,.pfx,application/x-pkcs12"
            class="hidden"
            onchange={(e) => {
              const f = e.currentTarget.files?.[0];
              if (f) {
                store.loadCert(f);
                clearResult();
              }
              e.currentTarget.value = "";
            }}
          />
          {#if store.hasCert}
            <FileRow name={store.p12Name} meta="Certificate ready" icon={Certificate}>
              {#snippet trailing()}
                <Button variant="ghost" size="sm" onclick={() => certInput?.click()}>Change</Button>
              {/snippet}
            </FileRow>
          {:else}
            <Button variant="outline" class="w-fit" onclick={() => certInput?.click()}>
              <FileUp />
              Choose certificate file
            </Button>
          {/if}
          <p class="text-caption text-muted-foreground">
            A .p12 or .pfx file, usually from your company or a certificate provider.
          </p>
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="flex flex-col gap-2">
            <label for="{uid}-gen-name" class="text-body font-medium text-foreground">Your name</label>
            <input id="{uid}-gen-name" type="text" bind:value={store.genName} placeholder="Jane Doe" class={inputClass} />
          </div>
          <div class="flex flex-col gap-2">
            <label for="{uid}-gen-org" class="text-body font-medium text-foreground">Organisation</label>
            <input id="{uid}-gen-org" type="text" bind:value={store.genOrg} placeholder="Optional" class={inputClass} />
          </div>
          <div class="flex flex-col gap-2">
            <label for="{uid}-gen-country" class="text-body font-medium text-foreground">Country code</label>
            <input
              id="{uid}-gen-country"
              type="text"
              bind:value={store.genCountry}
              placeholder="Like US or IN"
              maxlength={2}
              class={inputClass}
            />
          </div>
        </div>
      {/if}

      <div class="flex flex-col gap-2">
        <label for="{uid}-passphrase" class="text-body font-medium text-foreground">Certificate password</label>
        <div class="relative">
          <input
            id="{uid}-passphrase"
            type={showPassphrase ? "text" : "password"}
            autocomplete={generating ? "new-password" : "current-password"}
            bind:value={store.passphrase}
            aria-describedby="{uid}-passphrase-hint"
            class="{inputClass} pr-11"
          />
          <button
            type="button"
            class="absolute right-0.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={showPassphrase ? "Hide certificate password" : "Show certificate password"}
            aria-pressed={showPassphrase}
            onclick={() => (showPassphrase = !showPassphrase)}
          >
            {#if showPassphrase}<EyeOff class="size-4" />{:else}<Eye class="size-4" />{/if}
          </button>
        </div>
        <p id="{uid}-passphrase-hint" class="text-caption text-muted-foreground">
          {generating
            ? "Choose a password of at least 4 characters to protect the new certificate."
            : "The password that came with your certificate file."}
        </p>
      </div>

      {#if generating}
        <div class="flex flex-col gap-3 border-t border-border pt-4">
          <div class="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onclick={() => {
                store.generateCert();
                clearResult();
              }}
              disabled={store.generating || generateBlocker !== ""}
            >
              <BadgeCheck />
              {store.generating ? "Creating…" : store.hasCert ? "Create again" : "Create certificate"}
            </Button>
            {#if store.hasCert}
              <Button variant="ghost" onclick={() => store.downloadCert()}>
                <Download />
                Save certificate
              </Button>
            {/if}
          </div>
          <p class="text-caption text-muted-foreground">
            {#if generateBlocker}
              {generateBlocker}
            {:else if store.hasCert}
              Certificate ready. Save it to sign more files with the same identity.
            {/if}
            A certificate you create yourself shows changes to the file, but checkers will say your identity is not verified.
          </p>
        </div>
      {/if}
    </section>

    <p class="px-1 text-caption text-muted-foreground">
      Signing happens on this device, and your PDF and certificate are never uploaded. Only optional trusted timestamps
      go online, and they send a fingerprint of the file, never the file itself.
      <a
        href={PROXY_SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary underline-offset-2 hover:underline"
      >
        See the code that does this
      </a>
    </p>
  </div>

  <WorkspaceInspector title="Signature details">
    <div class="flex flex-col gap-6" oninput={clearResult}>
      <OptionGroup label="Shown with the signature" description="People checking the signature can see these. All are optional.">
        <div class="flex flex-col gap-3">
          {#each detailFields as field (field.key)}
            <div class="flex flex-col gap-1.5">
              <label for="{uid}-{field.key}" class="text-caption text-muted-foreground">{field.label}</label>
              <input
                id="{uid}-{field.key}"
                type="text"
                bind:value={store[field.key]}
                placeholder={field.placeholder}
                class={inputClass}
              />
            </div>
          {/each}
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      <span class="block truncate">
        {#if store.isProcessing}
          Signing your PDF…
        {:else if showResult}
          Signed and downloaded
        {:else if blocker}
          {blocker}
        {:else}
          Ready to sign with {store.p12Name}
        {/if}
      </span>
    {/snippet}

    <Button variant="primary" onclick={sign} disabled={!store.canSign}>
      {store.isProcessing ? "Signing…" : "Sign PDF"}
    </Button>
  </ToolFooter>
{/if}
