<script lang="ts">
import { untrack } from "svelte";
import { cn } from "$lib/cn.js";
import {
	activeRange,
	buildTrack,
	idsInRange,
	itemPad,
	itemRail,
	movedUp,
	rangeFromIds,
	type TocItem,
	type TocRange,
	type TocRow,
	type TocTrack,
	thumbStyle,
} from "./toc-core";
import { type TableOfContentsVariant, tableOfContents } from "./variants";

let {
	items,
	scrollOffset = 56,
	label = "On this page",
	activeIds = $bindable(),
	onActiveChange,
	root,
	variant = "curve",
	indicator = true,
	class: className,
}: {
	items: TocItem[];
	/** Height of any sticky header: a heading above this line counts as scrolled past. */
	scrollOffset?: number;
	/** Accessible name of the navigation landmark. */
	label?: string;
	/** Ids of the headings shown as in view. Bind to read the scroll spy; set it to override. */
	activeIds?: string[];
	onActiveChange?: (ids: string[]) => void;
	/** Scroll container holding the headings; the window when omitted. */
	root?: HTMLElement | null;
	variant?: TableOfContentsVariant;
	/** A dot that rides the rail to the edge of the headings in view. */
	indicator?: boolean;
	class?: string;
} = $props();

const styles = $derived(tableOfContents({ variant, indicator }));
const curve = $derived(variant === "curve");

let list = $state<HTMLElement>();
let track = $state<TocTrack | null>(null);
let spied = $state<TocRange | null>(null);
let up = $state(false);

const range = $derived((activeIds && rangeFromIds(items, activeIds)) ?? spied);

function measure() {
	if (!list || list.clientHeight === 0) {
		track = null;
		return;
	}
	const rows: TocRow[] = [];
	for (const item of items) {
		const link = list.querySelector<HTMLElement>(`a[href="#${CSS.escape(item.id)}"]`);
		if (!link) continue;
		const pad = getComputedStyle(link);
		rows.push({
			depth: item.depth,
			top: link.offsetTop + Number.parseFloat(pad.paddingTop),
			bottom: link.offsetTop + link.clientHeight - Number.parseFloat(pad.paddingBottom),
		});
	}
	track = buildTrack(rows, curve);
}

$effect(() => {
	void items;
	void curve;
	if (!list) return;
	const observer = new ResizeObserver(measure);
	observer.observe(list);
	measure();
	return () => observer.disconnect();
});

$effect(() => {
	const els = items.map((item) => document.getElementById(item.id));
	const container = root ?? null;
	const offset = scrollOffset;
	let frame = 0;
	const update = () => {
		frame = 0;
		const base = container ? container.getBoundingClientRect().top : 0;
		const viewport = container ? container.clientHeight : innerHeight;
		const tops = els.map((el) => (el ? el.getBoundingClientRect().top - base : null));
		const next = activeRange(tops, offset, viewport);
		if (spied && next[0] === spied[0] && next[1] === spied[1]) return;
		up = movedUp(spied, next, up);
		spied = next;
		const ids = idsInRange(items, next);
		if (activeIds !== undefined) activeIds = ids;
		onActiveChange?.(ids);
	};
	const onScroll = () => {
		if (!frame) frame = requestAnimationFrame(update);
	};
	const target: HTMLElement | Window = container ?? window;
	// update() reads and writes the range; tracking it here would re-run this effect forever.
	untrack(update);
	target.addEventListener("scroll", onScroll, { passive: true });
	addEventListener("resize", onScroll);
	return () => {
		target.removeEventListener("scroll", onScroll);
		removeEventListener("resize", onScroll);
		cancelAnimationFrame(frame);
	};
});

const thumb = $derived(track && range ? thumbStyle(track, range, up) : "");
</script>

{#if variant === "minimap"}
	<nav
		data-slot="table-of-contents-minimap"
		aria-label={label}
		class={cn(styles.minimap(), className)}
	>
		<ul class={styles.minimapList()}>
			{#each items as item, i (item.id)}
				{@const current = range !== null && i >= range[0] && i <= range[1]}
				<li>
					<a
						href="#{item.id}"
						data-depth={item.depth}
						data-active={current ? "" : undefined}
						aria-current={current ? "location" : undefined}
						class={styles.minimapLink()}
					>
						<span class={styles.minimapLabel()}>{item.label}</span>
						<span aria-hidden="true" class={styles.minimapTick()}></span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{:else}
<nav
	data-slot="table-of-contents"
	aria-label={label}
	bind:this={list}
	class={cn(styles.root(), className)}
>
	{#if track}
		<div
			aria-hidden="true"
			class={styles.accent()}
			style="width:{track.width}px;height:{track.height}px;{thumb}"
		>
			<svg
				viewBox="0 0 {track.width} {track.height}"
				class={styles.accentRail()}
				style="width:{track.width}px;height:{track.height}px;clip-path:polygon(0 var(--track-top,0), 100% var(--track-top,0), 100% var(--track-bottom,0), 0 var(--track-bottom,0))"
			>
				<path d={track.d} class="stroke-primary" stroke-width="1" fill="none" />
			</svg>
			<div class={styles.dot()} style="offset-path:path('{track.d}')"></div>
		</div>
	{/if}
	{#each items as item, i (item.id)}
		{@const r = itemRail(items, i, curve)}
		{@const current = range !== null && i >= range[0] && i <= range[1]}
		<a
			data-slot="table-of-contents-link"
			href="#{item.id}"
			aria-current={current ? "location" : undefined}
			class={[styles.link(), i === 0 && "pt-0", i === items.length - 1 && "pb-0"]}
			style="padding-inline-start:{itemPad(item.depth)}px"
		>
			<svg
				aria-hidden="true"
				class={[styles.rail(), r.l1 !== r.l2 && "bottom-1.5 h-full"]}
				style="width:{Math.max(r.l0, r.l1) + 9}px"
			>
				{#if r.bend}
					<path d={r.bend} stroke-width="1" fill="none" class={styles.railLine()} />
				{/if}
				<line
					x1={r.l1 + 0.5}
					y1={r.l0 === r.l1 ? 6 : 12}
					x2={r.l1 + 0.5}
					y2="100%"
					stroke-width="1"
					class={styles.railLine()}
				/>
			</svg>
			{item.label}
		</a>
	{/each}
</nav>
{/if}
