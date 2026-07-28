<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import { IconArrowRight as ArrowRight, IconEye as Eye, IconEyeOff as EyeOff, IconLoader2 as LoaderCircle, IconLockOpen as Unlock } from "@tabler/icons-svelte";
  import { DecryptPdfState } from "./helper.svelte";

  const store = new DecryptPdfState();

  let showPassword = $state(false);
</script>

{#if !store.state.file}
  <UploadArea
    accept=".pdf"
    multiple={false}
    onFilesSelected={(files) => store.setFile(files[0])}
  />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar
      label="Decrypt"
      onReset={() => store.removeFile()}
      resetLabel="Clear"
    />

    <ToolPanel title="Source">
      <FileRow
        name={store.state.file.name}
        onRemove={() => store.removeFile()}
      >
        <span class="font-mono tabular-nums">
          {formatBytes(store.state.file.size)}
        </span>
      </FileRow>
    </ToolPanel>

    <ToolPanel title="Password">
      <div class="flex flex-col gap-2">
        <Label
          for="pwd-input"
          class="label-eyebrow text-muted-foreground"
        >
          PDF password
          <span class="text-destructive">*</span>
        </Label>
        <div class="relative">
          <Input
            id="pwd-input"
            type={showPassword ? "text" : "password"}
            bind:value={store.state.password}
            placeholder="Enter the password to decrypt"
            class="h-10 rounded-sm pr-10 font-mono text-sm"
          />
          <button
            type="button"
            onclick={() => (showPassword = !showPassword)}
            class="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {#if showPassword}
              <EyeOff class="size-3.5" />
            {:else}
              <Eye class="size-3.5" />
            {/if}
          </button>
        </div>
        <p class="text-xs leading-relaxed text-muted-foreground">
          The password is permanently removed from the downloaded file.
        </p>
      </div>

      <div
        class="mt-5 flex items-start gap-3 rounded-sm border border-warning/30 bg-warning/5 px-4 py-3"
      >
        <span
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-sm bg-warning/15 text-warning"
        >
          <Unlock class="size-3.5" />
        </span>
        <div class="flex flex-col gap-1">
          <span
            class="label-eyebrow text-warning"
          >
            Local only
          </span>
          <p class="text-xs leading-relaxed text-muted-foreground">
            Decryption runs entirely in your browser. The file and password are
            never sent to a server.
          </p>
        </div>
      </div>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing
        ? store.progressLabel
        : store.state.password
          ? "Unlock the document"
          : "Enter the password to continue"}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.decrypt()}
        disabled={store.isProcessing || !store.state.password}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          <Unlock class="size-4" />
          Decrypt
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
