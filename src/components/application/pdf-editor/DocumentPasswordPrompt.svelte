<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import type { DocumentState } from "@embedpdf/core";
  import { PdfErrorCode } from "@embedpdf/models";
  import { useDocumentManagerCapability } from "@embedpdf/plugin-document-manager/svelte";
  import { IconAlertCircle as Alert, IconLock as Lock } from "@tabler/icons-svelte";

  interface DocumentPasswordPromptProps {
    documentState: DocumentState | null;
  }

  let { documentState }: DocumentPasswordPromptProps = $props();

  const documentManager = useDocumentManagerCapability();
  const uid = $props.id();

  let password = $state("");

  const needsPassword = $derived(documentState?.errorCode === PdfErrorCode.Password);
  const wrongPassword = $derived(needsPassword && !!documentState?.passwordProvided);

  function unlock(e: SubmitEvent) {
    e.preventDefault();
    if (!documentState?.id || !password) return;
    documentManager.provides?.retryDocument(documentState.id, { password });
    password = "";
  }
</script>

<div class="flex h-full items-center justify-center overflow-y-auto bg-canvas p-6">
  <div class="panel-card flex w-full max-w-sm flex-col gap-5 bg-background p-6">
    <div class="flex flex-col items-center gap-3 text-center">
      <span class="grid size-12 place-items-center rounded-xl bg-muted">
        {#if needsPassword}
          <Lock class="size-5 text-primary" />
        {:else}
          <Alert class="size-5 text-destructive" />
        {/if}
      </span>
      <div class="flex flex-col gap-1">
        <h2 class="text-subheading font-medium text-foreground">
          {needsPassword ? "This PDF is locked" : "This PDF can't be opened"}
        </h2>
        <p class="text-body text-muted-foreground">
          {#if needsPassword}
            Enter its password to view it. The password stays on this device.
          {:else}
            The file may be damaged or not a PDF. Close this tab and try another file.
          {/if}
        </p>
      </div>
    </div>

    {#if needsPassword}
      <form onsubmit={unlock} class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <Label for={`${uid}-password`}>Password</Label>
          <Input
            id={`${uid}-password`}
            type="password"
            bind:value={password}
            autocomplete="off"
            aria-invalid={wrongPassword ? "true" : undefined}
            aria-describedby={wrongPassword ? `${uid}-error` : undefined}
          />
          {#if wrongPassword}
            <p id={`${uid}-error`} class="text-body text-destructive">That password didn't work. Try again.</p>
          {/if}
        </div>
        <Button type="submit" variant="primary" class="w-full" disabled={!password}>Unlock</Button>
      </form>
    {/if}
  </div>
</div>
