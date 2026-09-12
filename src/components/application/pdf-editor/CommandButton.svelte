<script lang="ts">
  import Icons from "$components/Icons.svelte";
  import { cn } from "$lib/utils";
  import { useCommand } from "@embedpdf/plugin-commands/svelte";
  import { useRegisterAnchor } from "@embedpdf/plugin-ui/svelte";
  import { chromeButton } from "./chrome";

  interface Props {
    commandId: string;
    documentId: string;
    variant?: "icon" | "text" | "icon-text";
    itemId?: string;
    class?: string;
  }

  let { commandId, documentId, variant = "icon", itemId, class: className }: Props = $props();

  const command = useCommand(
    () => commandId,
    () => documentId
  );

  const finalItemId = $derived(itemId || commandId);
  const registerAnchor = useRegisterAnchor(
    () => documentId,
    () => finalItemId
  );

  const cmd = $derived(command?.current);
  const state = $derived(!cmd || cmd.disabled ? "disabled" : cmd.active ? "active" : "idle");
  const iconProps = $derived(cmd?.iconProps || {});
  const shortcut = $derived(cmd?.shortcuts?.[0]);
</script>

{#if cmd?.visible}
  <button
    use:registerAnchor
    type="button"
    class={cn(chromeButton({ shape: variant, state }), className)}
    onclick={() => {
      if (!cmd.disabled) cmd.execute();
    }}
    disabled={cmd.disabled}
    aria-label={variant === "icon" ? cmd.label : undefined}
    aria-pressed={cmd.active ? true : undefined}
    data-item-id={itemId}
    title={shortcut ? `${cmd.label} (${shortcut})` : cmd.label}
  >
    {#if cmd.icon && variant !== "text"}
      <Icons
        name={cmd.icon}
        class="size-4.5 shrink-0"
        primaryColor={iconProps.primaryColor}
        secondaryColor={iconProps.secondaryColor}
      />
    {/if}
    {#if variant !== "icon"}
      <span class="truncate">{cmd.label}</span>
    {/if}
  </button>
{/if}
