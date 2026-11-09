<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLLiAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { breadcrumbStyles } from "./context";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLLiAttributes = $props();

const s = $derived(breadcrumbStyles());
</script>

<li
	{...rest}
	role="presentation"
	aria-hidden="true"
	data-slot="breadcrumb-separator"
	class={cn(s.separator(), classProp)}
>
	{#if children}
		{@render children()}
	{:else}
		<svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
			<path d="M5.5 3.5 9 7l-3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{/if}
</li>
