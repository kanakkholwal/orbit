<script lang="ts">
import { cn } from "$lib/cn.js";
import {
	type RevealTextDirection,
	type RevealTextSize,
	type RevealTextSplit,
	type RevealTextStaggerFrom,
	type RevealTextTrigger,
	type RevealTextVariant,
	revealText,
	revealUnits,
} from "./variants";

let {
	text,
	variant = "default",
	split = "word",
	trigger = "mount",
	once = true,
	revealed: revealedProp,
	onRevealedChange,
	staggerMs = 90,
	delayMs = 0,
	blur = 12,
	direction = "up",
	staggerFrom = "start",
	mask = false,
	size = "inherit",
	as = "span",
	class: className,
}: {
	/** One string, or one per line. */
	text: string | string[];
	/** `tracking` letters converge from loose spacing (splits by character); `wipe` uncovers through a soft edge. */
	variant?: RevealTextVariant;
	split?: RevealTextSplit;
	/** Reveal on mount, or when scrolled into view. */
	trigger?: RevealTextTrigger;
	/** With `trigger="view"`: reveal only the first time instead of every entry. */
	once?: boolean;
	/** Controlled: whether the text shows. Omit to follow `trigger`. */
	revealed?: boolean;
	onRevealedChange?: (revealed: boolean) => void;
	/** Gap between units, in ms. */
	staggerMs?: number;
	delayMs?: number;
	/** Starting blur in px; skipped on touch screens and reduced motion. */
	blur?: number;
	/** The side each unit travels in from. */
	direction?: RevealTextDirection;
	/** Where the stagger wave starts. */
	staggerFrom?: RevealTextStaggerFrom;
	/** Clip each unit so it rises out of its own line box. */
	mask?: boolean;
	size?: RevealTextSize;
	as?: string;
	class?: string;
} = $props();

let node = $state<HTMLElement | null>(null);
let internal = $state(false);
const revealed = $derived(revealedProp ?? internal);
const lines = $derived((Array.isArray(text) ? text : [text]).filter(Boolean));
const unitSplit = $derived(variant === "tracking" ? "char" : split);
const units = $derived(
	revealUnits(
		lines,
		unitSplit,
		delayMs,
		staggerMs,
		staggerFrom,
		variant === "tracking" ? 0.06 : 0,
	),
);
const styles = $derived(
	revealText({ variant, split: unitSplit, trigger, direction, mask, staggerFrom, size }),
);

function set(next: boolean) {
	internal = next;
	onRevealedChange?.(next);
}

$effect(() => {
	if (trigger === "mount") {
		const frame = requestAnimationFrame(() => set(true));
		return () => cancelAnimationFrame(frame);
	}
	const el = node;
	if (!el) return;
	const reveal = once;
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry?.isIntersecting) {
				set(true);
				if (reveal) observer.disconnect();
			} else if (!reveal) set(false);
		},
		{ rootMargin: "0px 0px -4% 0px" },
	);
	observer.observe(el);
	return () => observer.disconnect();
});
</script>

<svelte:element
	this={as}
	bind:this={node}
	data-slot="reveal-text"
	data-revealed={revealed ? "true" : "false"}
	class={cn(styles.root(), className)}
	style:--reveal-blur-amount="{blur}px"
>
	<span class={styles.srOnly()}>{lines.join(" ")}</span>
	<span aria-hidden="true">
		{#each units as line, l (l)}
			<span class={styles.line()}>
				{#each line as unit (unit.key)}
					<span class={styles.mask()}
						><span class={styles.unit()} style:--reveal-delay="{unit.delay}ms" style:--reveal-track="{unit.track}em">{unit.text}</span></span
					>
				{/each}
			</span>
		{/each}
	</span>
</svelte:element>
