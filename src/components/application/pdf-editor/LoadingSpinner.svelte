<script lang="ts">
    import { LoaderCircleIcon } from "@lucide/svelte";

    interface LoadingSpinnerProps {
        size?: "sm" | "md" | "lg";
        message?: string;
        class?: string;
    }

    let {
        size = "md",
        message,
        class: className = "",
    }: LoadingSpinnerProps = $props();

    const sizeMap = {
        sm: "size-3.5",
        md: "size-4",
        lg: "size-6",
    };
</script>

<div class="flex items-center gap-2 text-muted-foreground {className}">
    <LoaderCircleIcon class="{sizeMap[size]} animate-spin" />
    {#if message}
        <span class="text-sm">{message}</span>
    {/if}
</div>
