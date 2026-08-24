<script lang="ts">
  import { FileRow, ToolBar, ToolFooter, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    IconArrowRight as ArrowRight,
    IconEye as Eye,
    IconEyeOff as EyeOff,
    IconLoader2 as LoaderCircle,
    IconShieldCheck as ShieldCheck,
  } from "@tabler/icons-svelte";
  import { EncryptPdfState } from "./helper.svelte";

  const store = new EncryptPdfState();

  let showUserPwd = $state(false);
  let showOwnerPwd = $state(false);
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
      label="Encrypt"
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

    <ToolPanel title="Security">
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <Label
            for="user-pwd"
            class="label-eyebrow text-muted-foreground"
          >
            User password
            <span class="text-destructive">*</span>
          </Label>
          <div class="relative">
            <Input
              id="user-pwd"
              type={showUserPwd ? "text" : "password"}
              bind:value={store.state.userPassword}
              placeholder="Required to open the file"
              class="h-10 rounded-sm pr-10 font-mono text-sm"
            />
            <button
              type="button"
              onclick={() => (showUserPwd = !showUserPwd)}
              class="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              aria-label={showUserPwd ? "Hide password" : "Show password"}
            >
              {#if showUserPwd}
                <EyeOff class="size-3.5" />
              {:else}
                <Eye class="size-3.5" />
              {/if}
            </button>
          </div>
          <p class="text-xs leading-relaxed text-muted-foreground">
            The recipient must enter this to view the PDF.
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <Label
            for="owner-pwd"
            class="flex items-center gap-2 label-eyebrow text-muted-foreground"
          >
            Owner password
            <span class="label-eyebrow text-muted-foreground">
              · Optional
            </span>
          </Label>
          <div class="relative">
            <Input
              id="owner-pwd"
              type={showOwnerPwd ? "text" : "password"}
              bind:value={store.state.ownerPassword}
              placeholder="Required to edit / print"
              class="h-10 rounded-sm pr-10 font-mono text-sm"
            />
            <button
              type="button"
              onclick={() => (showOwnerPwd = !showOwnerPwd)}
              class="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              aria-label={showOwnerPwd ? "Hide password" : "Show password"}
            >
              {#if showOwnerPwd}
                <EyeOff class="size-3.5" />
              {:else}
                <Eye class="size-3.5" />
              {/if}
            </button>
          </div>
          <p class="text-xs leading-relaxed text-muted-foreground">
            If set, printing and editing require this password.
          </p>
        </div>
      </div>
    </ToolPanel>

    <ToolPanel title="Notes">
      <ul
        class="flex flex-col divide-y divide-border overflow-hidden rounded-sm border border-border bg-muted/20"
      >
        {#each [
          ["Algorithm", "256-bit AES (highest security)"],
          ["Processing", "Local — runs entirely in your browser"],
          ["Privacy", "No data leaves the device"],
        ] as [k, v]}
          <li class="grid grid-cols-3 gap-3 px-4 py-2.5 sm:grid-cols-4">
            <span
              class="col-span-1 label-eyebrow text-muted-foreground"
            >
              {k}
            </span>
            <span class="col-span-2 text-sm text-foreground sm:col-span-3">
              {v}
            </span>
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolFooter
      hint={store.isProcessing
        ? store.progressLabel
        : store.state.userPassword
          ? "Lock the document"
          : "Set a user password to continue"}
    >
      <Button
        size="lg"
        class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        onclick={() => store.encrypt()}
        disabled={store.isProcessing || !store.state.userPassword}
      >
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
          {store.progressLabel}
        {:else}
          <ShieldCheck class="size-4" />
          Encrypt
          <ArrowRight class="size-4" />
        {/if}
      </Button>
    </ToolFooter>
  </div>
{/if}
