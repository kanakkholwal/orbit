<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { watchCondensed } from "./header";
import { type PageHeaderVariant, pageHeader } from "./variants";
import { setPageHeader } from "./context";

let {
	variant = "static",
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & {
	/** `sticky` pins the bar and condenses it once the page scrolls; `static` scrolls away. */
	variant?: PageHeaderVariant;
	children?: Snippet;
} = $props();

let sentinel = $state<HTMLDivElement | null>(null);
let condensed = $state(false);
setPageHeader({
	get condensed() {
		return condensed;
	},
});

$effect(() => {
	if (!sentinel || variant !== "sticky") {
		condensed = false;
		return;
	}
	return watchCondensed(sentinel, (next) => (condensed = next));
});
</script>

<!-- An app page header from parts; wrap them in Tabs to give it panels. -->
<div
	{...rest}
	data-slot="page-header"
	data-variant={variant}
	class={cn(pageHeader({ variant }).root(), classProp)}
>
	<div bind:this={sentinel} aria-hidden="true" class={pageHeader().sentinel()}></div>
	{@render children?.()}
</div>
