<script lang="ts">
  import { FileRow, ResultCard, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconDownload as Download,
    IconEye as Eye,
    IconEyeOff as EyeOff,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { DecryptPdfState } from "./helper.svelte";

  const store = new DecryptPdfState();
  const uid = $props.id();

  let showPassword = $state(false);

  const showResult = $derived(!store.isProcessing && store.result !== null);

  function startOver() {
    store.removeFile();
    showPassword = false;
  }
</script>

{#if !store.state.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.setFile(files[0])}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to unlock</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Enter its password once and save a copy that opens without it. The file never leaves this device.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if showResult && store.result}
      <ResultCard
        title="Password removed"
        description={`${store.result.name} is downloaded and opens without a password.`}
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
        <FileSuggestions files={store.resultFiles} heading="Continue with" exclude="decrypt-pdf" />
      </ResultCard>
    {/if}

    <FileRow
      name={store.state.file.name}
      meta={formatBytes(store.state.file.size)}
      onRemove={store.isProcessing ? undefined : startOver}
    />

    <form
      class="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 sm:p-5"
      onsubmit={(e) => {
        e.preventDefault();
        if (store.state.password && !store.isProcessing) store.decrypt();
      }}
    >
      <div class="flex flex-col gap-0.5">
        <h2 class="text-body-lg font-medium text-foreground">Enter the password</h2>
        <p class="text-body text-muted-foreground">Use the password you type to open this file.</p>
      </div>

      <div class="flex flex-col gap-2">
        <label for="{uid}-password" class="text-body font-medium text-foreground">Password</label>
        <div class="relative">
          <input
            id="{uid}-password"
            type={showPassword ? "text" : "password"}
            autocomplete="current-password"
            bind:value={store.state.password}
            oninput={() => {
              store.error = "";
              store.result = null;
            }}
            aria-invalid={store.error !== ""}
            aria-describedby="{uid}-password-hint"
            class="h-10 w-full rounded-lg border border-border bg-background px-3 pr-11 text-body text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring aria-invalid:border-destructive"
          />
          <button
            type="button"
            class="absolute right-0.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onclick={() => (showPassword = !showPassword)}
          >
            {#if showPassword}<EyeOff class="size-4" />{:else}<Eye class="size-4" />{/if}
          </button>
        </div>
        <p
          id="{uid}-password-hint"
          class="text-caption {store.error ? 'text-destructive' : 'text-muted-foreground'}"
          aria-live="polite"
        >
          {store.error || "The copy you save will open without asking for it."}
        </p>
      </div>

      <p class="border-t border-border pt-4 text-caption text-muted-foreground">
        Unlocking happens on this device. Your file and password are never sent anywhere.
      </p>
    </form>
  </div>

  <ToolFooter>
    {#snippet hint()}
      <span class="block truncate">
        {#if store.isProcessing}
          {store.state.progress}
        {:else if showResult}
          Unlocked and downloaded
        {:else if store.error}
          Try the password again
        {:else if !store.state.password}
          Enter the password to continue
        {:else}
          Ready to save a copy without the password
        {/if}
      </span>
    {/snippet}

    <Button
      variant="primary"
      onclick={() => store.decrypt()}
      disabled={store.isProcessing || !store.state.password}
    >
      {store.isProcessing ? "Unlocking…" : "Remove password"}
    </Button>
  </ToolFooter>
{/if}
