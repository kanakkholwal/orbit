<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$components/ui/button";
  import * as Dialog from "$components/ui/dialog";
  import { IconAlertTriangle as AlertTriangle, IconCheck as Check } from "$lib/icons";
  import { wasmStore } from "$stores/wasm-store.svelte";

  let isOpen = $derived(wasmStore.dialogState.isOpen);
  let pkg = $derived(wasmStore.dialogState.packageName);

  let displayName = $derived(pkg ? wasmStore.getDisplayName(pkg) : "");
  let features = $derived(pkg ? wasmStore.getFeatures(pkg) : []);

  function handleConfigure() {
    wasmStore.closeDialog();
    goto("/settings/wasm");
  }
</script>

<Dialog.Root
  bind:open={() => isOpen && !!pkg, (next) => !next && wasmStore.closeDialog()}
  variant="framed"
  motion="slide-up"
>
  <Dialog.Content>
    <Dialog.Header>
      <div class="mb-2 grid size-10 place-items-center rounded-xl bg-warning/15 text-warning-strong">
        <AlertTriangle class="size-5" />
      </div>
      <Dialog.Title>Advanced feature required</Dialog.Title>
      <Dialog.Description>
        This feature needs <strong class="font-medium text-foreground">{displayName}</strong> to be configured.
      </Dialog.Description>
    </Dialog.Header>

    <div class="mt-4 rounded-xl border border-border bg-card p-4">
      <p class="mb-2 text-sm text-muted-foreground">Features enabled by this module</p>
      <ul class="flex flex-col gap-1.5 text-sm text-foreground">
        {#each features.slice(0, 4) as feature (feature)}
          <li class="flex items-center gap-2">
            <Check class="size-4 text-success-strong" />
            {feature}
          </li>
        {/each}
        {#if features.length > 4}
          <li class="pl-6 text-muted-foreground">+ {features.length - 4} more</li>
        {/if}
      </ul>
    </div>

    <p class="mt-4 text-xs text-muted-foreground">
      This module is licensed under AGPL-3.0. By configuring it, you agree to its license terms.
    </p>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => wasmStore.closeDialog()}>Cancel</Button>
      <Button onclick={handleConfigure}>Configure</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
