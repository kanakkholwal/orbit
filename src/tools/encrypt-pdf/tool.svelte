<script lang="ts">
  import Button from "$components/ui/button/button.svelte";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { formatBytes } from "$utils/helper";
  import {
    ArrowRight,
    Eye,
    EyeOff,
    FileText,
    Loader2,
    Lock,
    Trash2,
  } from "@lucide/svelte";
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
  <div
    class="mx-auto flex max-w-2xl items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
  >
    <div class="flex items-center gap-4 overflow-hidden">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600"
      >
        <FileText size={20} />
      </div>
      <div class="min-w-0">
        <h3 class="truncate text-sm font-medium">
          {store.state.file.name}
        </h3>
        <p class="text-xs text-muted-foreground">
          {formatBytes(store.state.file.size)}
        </p>
      </div>
    </div>
    <button
      onclick={() => store.removeFile()}
      class="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
    >
      <Trash2 size={18} />
    </button>
  </div>

  <div class="flex-1 overflow-y-auto bg-muted/10 py-6">
    <div class="mx-auto max-w-lg space-y-8">
      <div
        class="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div class="flex items-center gap-2 border-b border-border pb-4 mb-4">
          <Lock size={18} class="text-primary" />
          <h3 class="font-semibold">Security Settings</h3>
        </div>

        <div class="space-y-2">
          <Label for="user-pwd">
            User Password <span class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <Input
              id="user-pwd"
              type={showUserPwd ? "text" : "password"}
              bind:value={store.state.userPassword}
              placeholder="Required to open the file"
              class="h-10 w-full rounded-md pr-10"
            />
            <button
              onclick={() => (showUserPwd = !showUserPwd)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {#if showUserPwd}
                <EyeOff size={16} />
              {:else}
                <Eye size={16} />
              {/if}
            </button>
          </div>
          <p class="text-[11px] text-muted-foreground">
            The recipient must enter this to view the PDF.
          </p>
        </div>

        <div class="space-y-2">
          <Label for="owner-pwd">
            Owner Password <span
              class="text-xs font-normal text-muted-foreground">(Optional)</span
            >
          </Label>
          <div class="relative">
            <Input
              id="owner-pwd"
              type={showOwnerPwd ? "text" : "password"}
              bind:value={store.state.ownerPassword}
              placeholder="Required to edit/print"
              class="h-10 w-full rounded-md pr-10"
            />
            <button
              onclick={() => (showOwnerPwd = !showOwnerPwd)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {#if showOwnerPwd}
                <EyeOff size={16} />
              {:else}
                <Eye size={16} />
              {/if}
            </button>
          </div>
          <p class="text-[11px] text-muted-foreground">
            If set, permissions (printing, editing) are restricted unless this
            password is used.
          </p>
        </div>
      </div>

      <div
        class="rounded-lg bg-blue-500/10 p-4 text-xs text-blue-600 dark:text-blue-400"
      >
        <ul class="list-disc pl-4 space-y-1">
          <li>256-bit AES Encryption (Highest Security)</li>
          <li>Files are processed locally in your browser.</li>
          <li>No data is ever sent to a server.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      size="lg"
      variant="dark"
      class="px-8 h-11 min-w-50"
      onclick={() => store.encrypt()}
      disabled={store.isProcessing || !store.state.userPassword}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin" /> {store.progress}
      {:else}
        Encrypt PDF <ArrowRight size={18} />
      {/if}
    </Button>
  </div>
{/if}
