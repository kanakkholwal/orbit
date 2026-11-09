<script lang="ts">
import Badge from "$components/ui/badge/badge.svelte";
import { matchesCurrent } from "./match";
import {
	type DocsNavConnector,
	type DocsNavVariant,
	docsNav,
	markerWidth,
	rowState,
} from "./variants";
import type { DocsNavItem } from "./types";

let {
	items,
	current,
	variant,
	connector,
	rungs,
	onNavigate,
}: {
	items: DocsNavItem[];
	current?: string;
	variant: DocsNavVariant;
	connector: DocsNavConnector;
	rungs: boolean;
	onNavigate?: (href: string, event: MouseEvent) => void;
} = $props();

let list = $state<HTMLDivElement>();
let hovered = $state<number | null>(null);
let pill = $state<{ top: number; height: number } | null>(null);

function onEnter(event: PointerEvent, index: number) {
	if (!list) return;
	const row = (event.currentTarget as HTMLElement).getBoundingClientRect();
	const box = list.getBoundingClientRect();
	hovered = index;
	pill = { top: row.top - box.top, height: row.height };
}
</script>

<div
	bind:this={list}
	role="presentation"
	class={docsNav({ connector, variant }).list()}
	onpointerleave={() => (hovered = null)}
>
	{#if pill}
		<div
			aria-hidden="true"
			class={docsNav({ connector, variant, hovering: hovered !== null }).pill()}
			style:transform="translateY({pill.top}px)"
			style:height="{pill.height}px"
		></div>
	{/if}
	{#each items as item, index (item.href)}
		{@const active = matchesCurrent(item, current)}
		{@const state = rowState(active, hovered === index, hovered !== null)}
		{@const styles = docsNav({ connector, variant, rungs, state })}
		<div class={styles.row()}>
			<span
				aria-hidden="true"
				class={styles.marker()}
				style:width="{markerWidth(connector, rungs, state)}px"
			></span>
			{#if connector === "curve" && index < items.length - 1}
				<span aria-hidden="true" class={styles.rail()}></span>
			{/if}
			<a
				href={item.href}
				aria-current={active ? "page" : undefined}
				onclick={(event) => onNavigate?.(item.href, event)}
				onpointerenter={(event) => onEnter(event, index)}
				class={styles.link()}
			>
				<span class={styles.label()}>{item.label}</span>
				{#if item.badge}
					<Badge size="sm" variant={item.badgeVariant} class={styles.badge()}>
						{item.badge}
					</Badge>
				{/if}
			</a>
		</div>
	{/each}
</div>
