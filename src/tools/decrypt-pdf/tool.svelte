<script lang="ts">
  import { Button } from "$components/ui/button";
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
    Trash2,
    Unlock,
  } from "@lucide/svelte";
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
  <div
    class="mx-auto flex max-w-2xl items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
  >
    <div class="flex items-center gap-4 overflow-hidden">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
      >
        <FileText size={20} />
      </div>
      <div class="min-w-0">
        <h3 class="truncate text-sm font-medium">{store.state.file.name}</h3>
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
          <Unlock size={18} class="text-primary" />
          <h3 class="font-semibold">Unlock PDF</h3>
        </div>

        <div class="space-y-2">
          <Label
            for="pwd-input"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            PDF Password <span class="text-red-500">*</span>
          </Label>
          <div class="relative">
            <Input
              id="pwd-input"
              type={showPassword ? "text" : "password"}
              bind:value={store.state.password}
              placeholder="Enter the password to decrypt"
              class="h-10 w-full rounded-md pr-10"
            />
            <button
              onclick={() => (showPassword = !showPassword)}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {#if showPassword}
                <EyeOff size={16} />
              {:else}
                <Eye size={16} />
              {/if}
            </button>
          </div>
          <p class="text-[11px] text-muted-foreground">
            The password will be removed permanently from the downloaded file.
          </p>
        </div>
      </div>

      <div
        class="rounded-lg bg-yellow-500/10 p-4 text-xs text-yellow-600 dark:text-yellow-400"
      >
        <p class="font-medium mb-1">Security Note:</p>
        <p>
          Decryption happens entirely in your browser. Your file and password
          are never sent to any server.
        </p>
      </div>
    </div>
  </div>

  <div class="border-t border-border p-4 text-center">
    <Button
      size="lg"
      variant="dark"
      class="px-8 h-11 min-w-50"
      onclick={() => store.decrypt()}
      disabled={store.isProcessing || !store.state.password}
    >
      {#if store.isProcessing}
        <Loader2 class="animate-spin" /> {store.progress}
      {:else}
        Decrypt PDF <ArrowRight size={18} />
      {/if}
    </Button>
  </div>
{/if}
