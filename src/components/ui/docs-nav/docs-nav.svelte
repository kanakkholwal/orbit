<script lang="ts">
import Collapsible from "$components/ui/collapsible/collapsible.svelte";
import CollapsibleContent from "$components/ui/collapsible/collapsible-content.svelte";
import CollapsibleTrigger from "$components/ui/collapsible/collapsible-trigger.svelte";
import { cn } from "$lib/cn.js";
import { matchesCurrent } from "./match";
import { revealCurrent } from "./scroll";
import { type DocsNavConnector, type DocsNavVariant, docsNav } from "./variants";
import DocsNavList from "./docs-nav-list.svelte";
import type { DocsNavSection } from "./types";

let {
	sections,
	current,
	open = $bindable(),
	onOpenChange,
	variant = "default",
	connector = "tick",
	rungs = false,
	onNavigate,
	label = "Documentation",
	class: className,
}: {
	sections: DocsNavSection[];
	/** href of the page being viewed; that link is marked current. */
	current?: string;
	/** Ids of the expanded sections; bindable. Every section when omitted. */
	open?: string[];
	onOpenChange?: (open: string[]) => void;
	variant?: DocsNavVariant;
	connector?: DocsNavConnector;
	/** Adds a continuous hairline ladder beside the links; works with either connector. */
	rungs?: boolean;
	/** Fires on link click, e.g. to close a mobile drawer or route client-side. */
	onNavigate?: (href: string, event: MouseEvent) => void;
	/** Accessible name of the navigation landmark. */
	label?: string;
	class?: string;
} = $props();

let root = $state<HTMLElement>();
const styles = $derived(docsNav({ connector, variant }));
const expanded = $derived(
	open ?? sections.filter((section) => !section.href).map((section) => section.id),
);

function setSection(id: string, next: boolean) {
	const list = next
		? [...expanded.filter((o) => o !== id), id]
		: expanded.filter((o) => o !== id);
	open = list;
	onOpenChange?.(list);
}

$effect(() => {
	void current;
	void expanded;
	return revealCurrent(root);
});
</script>

<nav bind:this={root} aria-label={label} data-slot="docs-nav" class={cn(styles.root(), className)}>
	{#each sections as section (section.id)}
		{@const items = section.items ?? []}
		{@const href = section.href}
		{@const sectionCurrent = href
			? matchesCurrent({ href, match: section.match }, current)
			: items.some((item) => matchesCurrent(item, current))}
		{@const sectionStyles = docsNav({ connector, variant, sectionCurrent })}
		{@const Icon = section.icon}
		{#if href}
			<div class={sectionStyles.section()}>
				<a
					{href}
					aria-current={sectionCurrent ? "page" : undefined}
					onclick={(event) => onNavigate?.(href, event)}
					class={sectionStyles.topLink()}
				>
					{#if Icon}<Icon size={16} aria-hidden={true} class={sectionStyles.sectionIcon()} />{/if}
					<span class={sectionStyles.sectionLabel()}>{section.label}</span>
					{#if section.count !== undefined}
						<span class={sectionStyles.count()}>{section.count}</span>
					{/if}
				</a>
			</div>
		{:else}
			<Collapsible
				class={sectionStyles.section()}
				bind:open={() => expanded.includes(section.id), (next) => setSection(section.id, next)}
			>
				<CollapsibleTrigger class={sectionStyles.trigger()}>
					{#if Icon}<Icon size={16} aria-hidden={true} class={sectionStyles.sectionIcon()} />{/if}
					<span class={sectionStyles.sectionLabel()}>{section.label}</span>
				{#if section.count !== undefined}
					<span class={sectionStyles.count()}>{section.count}</span>
				{/if}
				</CollapsibleTrigger>
				<CollapsibleContent class={sectionStyles.content()}>
					<DocsNavList {items} {current} {variant} {connector} {rungs} {onNavigate} />
				</CollapsibleContent>
			</Collapsible>
		{/if}
	{/each}
</nav>
