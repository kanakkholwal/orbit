<script lang="ts">
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import {
	BANNER_DEFAULTS,
	BANNER_RUN,
	bannerPace,
	bannerRows,
	tickerRows,
} from "./banner";
import { ctaBannerStyles } from "./context";

let {
	word,
	mark,
	angle = BANNER_DEFAULTS.angle,
	rows = BANNER_DEFAULTS.rows,
	veil = true,
	class: classProp,
}: {
	/** The word that runs in rows. */
	word: string;
	/** A mark set between repetitions of the word. */
	mark?: Snippet;
	/** The rows' angle in degrees. */
	angle?: number;
	/** How many rows run, 4 to 48. */
	rows?: number;
	/** Blur the rows where they pass behind the copy. */
	veil?: boolean;
	class?: string;
} = $props();

const s = $derived(ctaBannerStyles());
const starts = $derived(tickerRows(bannerRows(rows)));
let field = $state<HTMLDivElement | null>(null);
let seen = $state(false);

// Rows only run while the field is on screen.
$effect(() => {
	if (!field) return;
	const observer = new IntersectionObserver(
		([entry]) => (seen = Boolean(entry?.isIntersecting)),
	);
	observer.observe(field);
	return () => observer.disconnect();
});
</script>

<div bind:this={field} aria-hidden="true" data-slot="cta-banner-ticker" class={cn(s.tickerField(), classProp)}>
	<div class={s.tickerRows()} style:rotate="{angle}deg">
		{#each starts as start, row (row)}
			<div class={s.tickerRow()}>
				<div
					class={s.tickerRun()}
					style:margin-left="{-start}em"
					style:animation-direction={row % 2 ? "reverse" : "normal"}
					style:animation-duration={bannerPace(160)}
					style:animation-play-state={seen ? "running" : "paused"}
				>
					{#each BANNER_RUN as key (key)}
						<span class={s.tickerWord()}><span>{word}</span>{#if mark}{@render mark()}{/if}</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
{#if veil}<span aria-hidden="true" class={s.tickerVeil()}></span>{/if}
