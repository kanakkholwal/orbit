<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { breadcrumbStyles } from "./context";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAttributes<HTMLSpanElement> = $props();

const s = $derived(breadcrumbStyles());
</script>

<span {...rest} data-slot="breadcrumb-page" aria-current="page" class={cn(s.page(), classProp)}>
	{@render children?.()}
</span>
