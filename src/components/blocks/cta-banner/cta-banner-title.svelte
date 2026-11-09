<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { ctaBannerState, ctaBannerStyles } from "./context";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAttributes<HTMLHeadingElement> = $props();

const s = $derived(ctaBannerStyles());
const { titleId } = ctaBannerState();
</script>

<h2 id={titleId} {...rest} data-slot="cta-banner-title" class={cn(s.title(), classProp)}>
	{@render children?.()}
</h2>
