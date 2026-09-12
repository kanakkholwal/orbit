<script lang="ts">
  import { FileRow, OptionGroup, OptionToggle, ResultCard, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconEye as Eye,
    IconEyeOff as EyeOff,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { EncryptPdfState } from "./helper.svelte";

  const store = new EncryptPdfState();
  const uid = $props.id();

  let confirmPassword = $state("");
  let restrict = $state(false);
  let showPassword = $state(false);
  let showOwnerPassword = $state(false);

  const inputClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 pr-11 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring disabled:cursor-not-allowed disabled:opacity-50";
  const eyeClass =
    "absolute right-0.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const userPassword = $derived(store.state.userPassword);
  const mismatch = $derived(confirmPassword.length > 0 && confirmPassword !== userPassword);

  const blocker = $derived.by(() => {
    if (!userPassword) return "Enter a password to continue";
    if (confirmPassword !== userPassword) {
      return confirmPassword ? "The two passwords do not match" : "Type the password again to confirm it";
    }
    if (restrict && !store.state.ownerPassword) return "Enter a second password for editing and printing";
    if (restrict && store.state.ownerPassword === userPassword) {
      return "Use a different password for editing and printing";
    }
    return "";
  });

  const showResult = $derived(!store.isProcessing && store.result !== null);

  function clearResult() {
    store.result = null;
  }

  function startOver() {
    store.removeFile();
    confirmPassword = "";
    restrict = false;
    showPassword = false;
    showOwnerPassword = false;
  }

  function protect() {
    if (!restrict) store.state.ownerPassword = "";
    store.encrypt();
  }
</script>

{#if !store.state.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.setFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to protect</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Add a password so only people you trust can open it. The file never leaves this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult && store.result}
      <ResultCard
        title="Your PDF is protected"
        description={`${store.result.name} is downloaded. Keep the password somewhere safe; it cannot be recovered.`}
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
      </ResultCard>
    {/if}

    <FileRow
      name={store.state.file.name}
      meta={formatBytes(store.state.file.size)}
      onRemove={store.isProcessing ? undefined : startOver}
    />

    <section
      class="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-5"
      oninput={clearResult}
    >
      <div class="flex flex-col gap-0.5">
        <h2 class="text-body-lg font-medium text-foreground">Choose a password</h2>
        <p class="text-body text-muted-foreground">Anyone who opens the file will need to type it.</p>
      </div>

      <div class="flex flex-col gap-2">
        <label for="{uid}-password" class="text-body font-medium text-foreground">Password</label>
        <div class="relative">
          <input
            id="{uid}-password"
            type={showPassword ? "text" : "password"}
            autocomplete="new-password"
            bind:value={store.state.userPassword}
            class={inputClass}
          />
          <button
            type="button"
            class={eyeClass}
            aria-label={showPassword ? "Hide passwords" : "Show passwords"}
            aria-pressed={showPassword}
            onclick={() => (showPassword = !showPassword)}
          >
            {#if showPassword}<EyeOff class="size-4" />{:else}<Eye class="size-4" />{/if}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="{uid}-confirm" class="text-body font-medium text-foreground">Type it again</label>
        <input
          id="{uid}-confirm"
          type={showPassword ? "text" : "password"}
          autocomplete="new-password"
          bind:value={confirmPassword}
          aria-invalid={mismatch}
          aria-describedby="{uid}-confirm-hint"
          class="{inputClass} pr-3 aria-invalid:border-destructive"
        />
        <p id="{uid}-confirm-hint" class="text-caption {mismatch ? 'text-destructive' : 'text-muted-foreground'}">
          {mismatch ? "The passwords do not match yet." : "Orbit cannot recover a forgotten password."}
        </p>
      </div>

      <p class="border-t border-border pt-4 text-caption text-muted-foreground">
        Protected with 256-bit AES encryption, right here on this device. Nothing is uploaded.
      </p>
    </section>
  </div>

  <WorkspaceInspector title="Protection">
    <div class="flex flex-col gap-6" oninput={clearResult}>
      <OptionGroup
        label="Editing and printing"
        description="With a second password, people can read the file but need that password to edit, copy or print it."
      >
        <div class="-my-2.5 flex flex-col">
          <OptionToggle
            label="Lock editing and printing"
            description="Uses a separate password"
            bind:checked={restrict}
          />
        </div>
      </OptionGroup>

      <OptionGroup
        label="Second password"
        description={restrict ? "Must be different from the opening password." : "Turn on the lock above to set this."}
      >
        <div class="relative">
          <label for="{uid}-owner" class="sr-only">Password for editing and printing</label>
          <input
            id="{uid}-owner"
            type={showOwnerPassword ? "text" : "password"}
            autocomplete="new-password"
            disabled={!restrict}
            bind:value={store.state.ownerPassword}
            class={inputClass}
          />
          <button
            type="button"
            class={eyeClass}
            disabled={!restrict}
            aria-label={showOwnerPassword ? "Hide second password" : "Show second password"}
            aria-pressed={showOwnerPassword}
            onclick={() => (showOwnerPassword = !showOwnerPassword)}
          >
            {#if showOwnerPassword}<EyeOff class="size-4" />{:else}<Eye class="size-4" />{/if}
          </button>
        </div>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <span class="block truncate">{store.state.progress}</span>
      {:else if showResult}
        <span class="block truncate">Protected and downloaded</span>
      {:else if blocker}
        <span class="block truncate">{blocker}</span>
      {:else}
        <span class="block truncate">
          {restrict ? "Opening, editing and printing need a password" : "Opening the file needs a password"}
        </span>
      {/if}
    {/snippet}

    <Button variant="primary" onclick={protect} disabled={store.isProcessing || blocker !== ""}>
      {store.isProcessing ? "Protecting…" : "Protect PDF"}
    </Button>
  </ToolFooter>
{/if}
