<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAnchorAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { breadcrumbStyles } from "./context";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAnchorAttributes = $props();

const s = $derived(breadcrumbStyles());
</script>

<a {...rest} data-slot="breadcrumb-link" class={cn(s.link(), classProp)}>
	{@render children?.()}
</a>
