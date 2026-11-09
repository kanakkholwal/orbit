<script lang="ts">
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { bannerPace } from "./banner";
import { ctaBannerStyles } from "./context";

let {
	x,
	y,
	delay = 0,
	duration = 6,
	class: classProp,
	children,
}: {
	/** Left edge, any CSS length. */
	x: string;
	/** Top edge, any CSS length. */
	y: string;
	/** Seconds before this floater's loop starts. */
	delay?: number;
	/** Loop length in seconds, before `speed` scales it. */
	duration?: number;
	class?: string;
	children: Snippet;
} = $props();

const s = $derived(ctaBannerStyles());
</script>

<span
	aria-hidden="true"
	data-slot="cta-banner-floater"
	class={cn(s.floater(), classProp)}
	style:left={x}
	style:top={y}
	style:animation-duration={bannerPace(duration)}
	style:animation-delay="{delay}s"
>
	{@render children()}
</span>
