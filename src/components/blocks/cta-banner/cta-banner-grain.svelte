<script lang="ts">
import { cn } from "$lib/cn.js";
import { BANNER_BANDS, BANNER_DEFAULTS, BANNER_LINES, BANNER_NOISE } from "./banner";
import { ctaBannerStyles } from "./context";

let {
	noise = BANNER_DEFAULTS.noise,
	lines = true,
	class: classProp,
}: {
	/** Noise opacity, 0 to 1. */
	noise?: number;
	/** The hairline grid. */
	lines?: boolean;
	class?: string;
} = $props();

const s = $derived(ctaBannerStyles());
</script>

<span aria-hidden="true" data-slot="cta-banner-grain" class={cn(s.layer(), classProp)}>
	<span class={s.layer()} style:background-image={BANNER_BANDS}></span>
	<span class={cn(s.layer(), "mix-blend-overlay")} style:background-image={BANNER_NOISE} style:opacity={noise}></span>
	{#if lines}
		{#each BANNER_LINES.x as x (x)}
			<span class={cn(s.line(), "inset-y-0 w-px")} style:left="{x}%"></span>
		{/each}
		{#each BANNER_LINES.y as y (y)}
			<span class={cn(s.line(), "inset-x-0 h-px")} style:top="{y}%"></span>
		{/each}
	{/if}
</span>
