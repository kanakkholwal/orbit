<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { ctaBannerStyles } from "./context";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAttributes<HTMLSpanElement> = $props();

const s = $derived(ctaBannerStyles());
</script>

<span {...rest} data-slot="cta-banner-badge" class={cn(s.badge(), classProp)}>
	{@render children?.()}
</span>
