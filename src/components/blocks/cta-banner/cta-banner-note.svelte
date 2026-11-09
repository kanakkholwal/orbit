<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { ctaBannerStyles } from "./context";

// A <strong> inside becomes an emphasised second line.
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

<p {...rest} data-slot="cta-banner-note" class={cn(s.note(), classProp)}>
	{@render children?.()}
</p>
