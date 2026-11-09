<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { ctaBannerStyles } from "./context";

let {
	children,
	class: classProp,
	...rest
}: {
	children?: Snippet;
	class?: string;
} & HTMLAttributes<HTMLParagraphElement> = $props();

const s = $derived(ctaBannerStyles());
</script>

<p {...rest} data-slot="cta-banner-eyebrow" class={cn(s.eyebrow(), classProp)}>
	{@render children?.()}
</p>
