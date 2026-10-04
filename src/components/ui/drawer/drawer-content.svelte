<script lang="ts">
import type { Snippet } from "svelte";
import { Drawer } from "vaul-svelte";
import { cn } from "$lib/cn.js";
import { type DrawerVariant, drawerFrame } from "./variants";

let {
	children,
	class: classProp,
	handle = true,
	variant = "default",
	...rest
}: {
	children?: Snippet;
	class?: string;
	/** Hide the drag handle; only sensible with `dismissible={false}`. */
	handle?: boolean;
	variant?: DrawerVariant;
} & Omit<Drawer.ContentProps, "children"> = $props();

const frame = $derived(drawerFrame({ variant }));
</script>

<Drawer.Portal>
	<Drawer.Overlay data-slot="drawer-overlay" class={frame.overlay()} />
	<!-- The frame is the rim (`framed`) or the surface itself (`default`). -->
	<Drawer.Content
		data-slot="drawer-content"
		data-variant={variant}
		class={cn(frame.panel(), classProp)}
		{...rest}
	>
		{#if handle}
			{#if variant === "framed"}
				<Drawer.Handle class={frame.handle()} />
			{:else}
				<div aria-hidden="true" class={frame.handleBar()}></div>
			{/if}
		{/if}
		<!-- data-vaul-no-drag: dragging should only start from the rail, not anywhere in the
		body, since vaul otherwise treats the whole panel as a drag target. -->
		<div data-slot="drawer-surface" data-vaul-no-drag class={frame.surface()}>
			{@render children?.()}
		</div>
	</Drawer.Content>
</Drawer.Portal>
