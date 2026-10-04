<script lang="ts">
import { Dialog as DialogPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { dialogFrame } from "./variants";

let {
	children,
	class: classProp,
	...rest
}: DialogPrimitive.CloseProps & { children?: Snippet } = $props();
</script>

<DialogPrimitive.Close
	{...rest}
	data-slot="dialog-close"
	aria-label={children ? undefined : "Close"}
	class={cn(!children && dialogFrame().close(), classProp)}
>
	{#if children}
		{@render children()}
	{:else}
		<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4">
			<path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	{/if}
</DialogPrimitive.Close>
