<script lang="ts">
    import Icons from "$components/Icons.svelte";
    import { buttonVariants } from "$components/ui/button";
    import { cn } from "$lib/utils";
    import { useCommand } from "@embedpdf/plugin-commands/svelte";
    import { useRegisterAnchor } from "@embedpdf/plugin-ui/svelte";

    interface Props {
        commandId: string;
        documentId: string;
        variant?: "icon" | "text" | "icon-text";
        itemId?: string;
    }

    let { commandId, documentId, variant = "icon", itemId }: Props = $props();

    const command = useCommand(
        () => commandId,
        () => documentId,
    );

    const finalItemId = itemId || commandId;
    const registerAnchor = useRegisterAnchor(
        () => documentId,
        () => finalItemId,
    );

    function handleClick() {
        if (command && !command.current?.disabled) {
            command.current?.execute();
        }
    }

    const baseClasses = $derived.by(() => {
        switch (variant) {
            case "text":
                return "px-2.5 py-1 text-xs font-medium";
            case "icon-text":
                return "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium";
            default:
                return "p-1.5";
        }
    });

    const stateClasses = $derived.by(() => {
        const cmd = command?.current;
        if (!cmd || cmd.disabled) return "opacity-40 cursor-not-allowed";
        if (cmd.active)
            return "bg-primary/10 text-primary hover:bg-primary/15";
        return "text-muted-foreground hover:text-foreground hover:bg-accent";
    });

    const cmdIconProps = $derived(command?.current?.iconProps || {});
</script>

{#if command?.current?.visible}
    <button
        use:registerAnchor
        type="button"
        class={cn(
            "inline-flex items-center justify-center rounded-md transition-colors",
            baseClasses,
            stateClasses,
        )}
        onclick={handleClick}
        disabled={command.current?.disabled}
        data-item-id={itemId}
        title={command.current?.label}
    >
        {#if command.current?.icon && (variant === "icon" || variant === "icon-text")}
            <Icons
                name={command.current.icon}
                class="size-4"
                primaryColor={cmdIconProps.primaryColor}
                secondaryColor={cmdIconProps.secondaryColor}
            />
        {/if}
        {#if variant === "text" || variant === "icon-text"}
            <span>{command.current?.label}</span>
        {/if}
    </button>
{/if}
