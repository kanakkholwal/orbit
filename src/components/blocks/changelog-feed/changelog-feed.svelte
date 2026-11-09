<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import {
	CHANGELOG_KINDS,
	type ChangelogEntry,
	type ChangelogKind,
	changelogMonths,
	kindShown,
} from "./changelog";
import { type ChangelogFeedVariant, changelogFeed } from "./variants";
import { setChangelogFeed } from "./context";

let {
	entries,
	variant = "list",
	kinds = $bindable(),
	onKindsChange,
	value = $bindable(),
	onValueChange,
	locale,
	class: className,
	children,
	...rest
}: Omit<HTMLAttributes<HTMLElement>, "children"> & {
	/** Release notes; grouped by month, newest first. */
	entries: ChangelogEntry[];
	/** `timeline` threads entries on a rail; `list` is plain rows. */
	variant?: ChangelogFeedVariant;
	/** Kinds shown; empty shows all. Bindable. */
	kinds?: ChangelogKind[];
	onKindsChange?: (kinds: ChangelogKind[]) => void;
	/** Open entry ids; defaults to the newest. Bindable. */
	value?: string[];
	onValueChange?: (value: string[]) => void;
	locale?: string;
	children?: Snippet;
} = $props();

const titleId = $props.id();
const styles = $derived(changelogFeed({ variant }));
let ownKinds = $state<ChangelogKind[]>([]);
// svelte-ignore state_referenced_locally
const newest = changelogMonths(entries)[0]?.items[0];
let ownOpen = $state<string[]>(newest ? [newest.id] : []);
const activeKinds = $derived(kinds ?? ownKinds);
const open = $derived(value ?? ownOpen);
const shown = $derived(entries.filter((entry) => kindShown(entry, activeKinds)));

setChangelogFeed({
	get entries() {
		return entries;
	},
	get locale() {
		return locale;
	},
	titleId,
	get kinds() {
		return activeKinds;
	},
	get open() {
		return open;
	},
	get shown() {
		return shown;
	},
	get styles() {
		return styles;
	},
	setKinds(next) {
		const list = (Array.isArray(next) ? next : [next]).flatMap((v) =>
			CHANGELOG_KINDS.filter((k) => k.id === v).map((k) => k.id),
		);
		if (kinds === undefined) ownKinds = list;
		else kinds = list;
		onKindsChange?.(list);
	},
	setOpen(next) {
		const list = Array.isArray(next) ? next : next ? [next] : [];
		if (value === undefined) ownOpen = list;
		else value = list;
		onValueChange?.(list);
	},
});
</script>

<!-- ChangelogFeedHeader, ChangelogFeedFilters, ChangelogFeedList, ChangelogFeedEmpty and ChangelogFeedEnd. -->
<section
	data-slot="changelog-feed"
	data-variant={variant}
	aria-labelledby={titleId}
	{...rest}
	class={cn(styles.root(), className)}
>
	<div class={styles.inner()}>{@render children?.()}</div>
</section>
