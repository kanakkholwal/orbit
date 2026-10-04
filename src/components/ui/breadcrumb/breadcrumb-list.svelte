<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLOlAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { breadcrumbStyles } from "./context";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLOlAttributes = $props();

const s = $derived(breadcrumbStyles());
</script>

<ol {...rest} data-slot="breadcrumb-list" class={cn(s.list(), classProp)}>
	{@render children?.()}
</ol>
