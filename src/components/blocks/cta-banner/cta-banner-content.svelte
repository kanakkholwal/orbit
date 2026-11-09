<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { ctaBannerStyles } from "./context";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAttributes<HTMLDivElement> = $props();

const s = $derived(ctaBannerStyles());
</script>

<div {...rest} data-slot="cta-banner-content" class={cn(s.content(), classProp)}>
	{@render children?.()}
</div>
