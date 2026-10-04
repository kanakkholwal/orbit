<script lang="ts">
import { Dialog as SheetPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: SheetPrimitive.CloseProps & { children?: Snippet } = $props();
</script>

<SheetPrimitive.Close
	{...rest}
	data-slot="sheet-close"
	aria-label={children ? undefined : "Close"}
	class={cn(
		"grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground",
		classProp,
	)}
>
	{#if children}
		{@render children()}
	{:else}
		<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4">
			<path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	{/if}
</SheetPrimitive.Close>
