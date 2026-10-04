<script lang="ts">
import { Tabs as TabsPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { getTabs } from "./context";
import { tabsFrame } from "./variants";

let { children, class: classProp, ...rest }: TabsPrimitive.ListProps = $props();

const tabs = getTabs();
const frame = $derived(tabsFrame({ variant: tabs.variant, size: tabs.size }));

let root = $state<HTMLDivElement>();
let viewport = $state<HTMLDivElement>();
let list = $state<HTMLDivElement | null>(null);
let rects = $state<Record<string, { left: number; width: number }>>({});
let edges = $state({ overflow: false, left: false, right: false });

const indicator = $derived(rects[tabs.value] ?? { left: 0, width: 0 });

function measure() {
	if (!list || !viewport || !root) return;
	const next: Record<string, { left: number; width: number }> = {};
	for (const el of list.querySelectorAll<HTMLElement>("[data-tab]")) {
		const id = el.dataset.tab;
		if (id) next[id] = { left: el.offsetLeft, width: el.offsetWidth };
	}
	rects = next;

	// Overlay arrows sit above the viewport, so they never shrink its scroll range.
	const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
	const from = Math.max(0, Math.min(max, Math.abs(viewport.scrollLeft)));
	edges = {
		overflow: viewport.scrollWidth > root.clientWidth + 1,
		left: from > 1,
		right: from < max - 1,
	};
}

$effect(() => {
	if (!root || !viewport || !list) return;
	measure();
	const observer = new ResizeObserver(measure);
	observer.observe(root);
	observer.observe(list);
	const port = viewport;
	port.addEventListener("scroll", measure, { passive: true });
	return () => {
		observer.disconnect();
		port.removeEventListener("scroll", measure);
	};
});

/** Keep the selected tab clear of the arrows that overlay the faded edges. */
$effect(() => {
	const el = list?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(tabs.value)}"]`);
	if (!el || !viewport || !edges.overflow) return;
	const frame = viewport.getBoundingClientRect();
	const item = el.getBoundingClientRect();
	const left = frame.left + (edges.left ? 36 : 0);
	const right = frame.right - (edges.right ? 36 : 0);
	const delta =
		item.left < left ? item.left - left : item.right > right ? item.right - right : 0;
	if (delta) viewport.scrollBy({ left: delta, behavior: "smooth" });
});

const mask = $derived(
	edges.overflow
		? `linear-gradient(to right, ${edges.left ? "transparent, black 40px" : "black, black 0"}, ${
				edges.right ? "black calc(100% - 40px), transparent" : "black 100%"
			})`
		: undefined,
);

function scroll(direction: number) {
	viewport?.scrollBy({
		left: direction * viewport.clientWidth * 0.8,
		behavior: "smooth",
	});
}

const ARROW =
	"absolute inset-y-0 z-20 inline-flex w-9 items-center justify-center text-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-0";
</script>

<div
	bind:this={root}
	class={cn(
		"relative isolate flex w-full min-w-0 max-w-full items-center",
		edges.overflow && tabs.variant === "pill" && "rounded-full bg-card",
		edges.overflow && tabs.variant === "segment" && "rounded-lg bg-card",
	)}
>
	{#if edges.overflow}
		<button
			type="button"
			aria-label="Scroll tabs left"
			disabled={!edges.left}
			onclick={() => scroll(-1)}
			class={cn(ARROW, "left-0 rounded-l-full")}
		>
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4">
				<path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
	{/if}

	<div
		bind:this={viewport}
		style:mask-image={mask}
		style:-webkit-mask-image={mask}
		class={cn(
			"scrollbar-none w-full min-w-0 overflow-x-auto",
			edges.overflow && "[border-radius:inherit]",
		)}
	>
		<TabsPrimitive.List
			bind:ref={list}
			data-slot="tabs-list"
			class={cn(frame.list(), classProp)}
			{...rest}
		>
			<span
				aria-hidden="true"
				style:transform="translateX({indicator.left}px)"
				style:width="{indicator.width}px"
				class={frame.indicator()}
			></span>

			{@render children?.()}
		</TabsPrimitive.List>
	</div>

	{#if edges.overflow}
		<button
			type="button"
			aria-label="Scroll tabs right"
			disabled={!edges.right}
			onclick={() => scroll(1)}
			class={cn(ARROW, "right-0 rounded-r-full")}
		>
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4">
				<path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
	{/if}
</div>
