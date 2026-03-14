<script lang="ts">
    import Icons from "$components/Icons.svelte";
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
        () => documentId,
    );

    const finalItemId = $derived(itemId || commandId);
    const registerAnchor = useRegisterAnchor(
        () => documentId,
        () => finalItemId,
    );

    function handleClick() {
        if (command && !command.current?.disabled) {
            command.current?.execute();
        }
    }

    const className = $derived.by(() => {
        const base =
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors";
        const state = command?.current?.active
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground";
        const disabled = command?.current?.disabled
            ? "opacity-40 cursor-not-allowed"
            : "cursor-pointer";
        return `${base} ${state} ${disabled}`;
    });

    const cmdIconProps = $derived(command?.current?.iconProps || {});
</script>

{#if command?.current?.visible}
    <button
        use:registerAnchor
        type="button"
        class={className}
        onclick={handleClick}
        disabled={command.current?.disabled}
        data-tab-id={itemId}
        role="tab"
        aria-selected={command.current?.active}
        title={command.current?.label}
    >
        {#if command.current?.icon && variant === "icon"}
            <Icons
                name={command.current.icon}
                class="size-4"
                primaryColor={cmdIconProps.primaryColor}
                secondaryColor={cmdIconProps.secondaryColor}
            />
        {:else}
            <span>{command.current?.label}</span>
        {/if}
    </button>
{/if}
