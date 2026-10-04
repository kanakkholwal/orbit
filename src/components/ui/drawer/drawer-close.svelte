<script lang="ts">
import type { Snippet } from "svelte";
import { Drawer } from "vaul-svelte";
import { cn } from "$lib/cn.js";
import { drawerFrame } from "./variants";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & Omit<
	Drawer.CloseProps,
	"children"
> = $props();
</script>

<Drawer.Close
	data-slot="drawer-close"
	aria-label={children ? undefined : "Close"}
	class={cn(!children && drawerFrame().close(), classProp)}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4">
			<path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	{/if}
</Drawer.Close>
