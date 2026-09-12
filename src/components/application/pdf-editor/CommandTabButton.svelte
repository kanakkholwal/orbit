<script lang="ts">
  import Icons from "$components/Icons.svelte";
  import { cn } from "$lib/utils";
  import { useCommand } from "@embedpdf/plugin-commands/svelte";
  import { useRegisterAnchor } from "@embedpdf/plugin-ui/svelte";

  interface Props {
    commandId: string;
    documentId: string;
    itemId?: string;
    variant?: "icon" | "text";
  }

  let { commandId, documentId, itemId, variant = "text" }: Props = $props();

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
  const iconProps = $derived(cmd?.iconProps || {});
</script>

{#if cmd?.visible}
  <button
    use:registerAnchor
    type="button"
    class={cn(
      "flex h-full items-center justify-center rounded-md text-body outline-none transition-[background-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      variant === "icon" ? "w-8" : "px-3",
      cmd.active
        ? "bg-background font-medium text-foreground shadow-sm"
        : "cursor-pointer text-muted-foreground hover:text-foreground",
      cmd.disabled && "cursor-not-allowed text-placeholder hover:text-placeholder"
    )}
    onclick={() => {
      if (!cmd.disabled) cmd.execute();
    }}
    disabled={cmd.disabled}
    data-tab-id={itemId}
    role={variant === "icon" ? undefined : "tab"}
    aria-selected={variant === "icon" ? undefined : !!cmd.active}
    aria-label={variant === "icon" ? cmd.label : undefined}
    title={cmd.label}
  >
    {#if cmd.icon && variant === "icon"}
      <Icons
        name={cmd.icon}
        class="size-4"
        primaryColor={iconProps.primaryColor}
        secondaryColor={iconProps.secondaryColor}
      />
    {:else}
      <span class="truncate">{cmd.label}</span>
    {/if}
  </button>
{/if}
