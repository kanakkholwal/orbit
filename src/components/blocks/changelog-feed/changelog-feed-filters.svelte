<script lang="ts">
import { cn } from "$lib/cn.js";
import RollingDigits from "$components/text/rolling-digits/rolling-digits.svelte";
import ToggleGroup from "$components/ui/toggle-group/toggle-group.svelte";
import ToggleGroupItem from "$components/ui/toggle-group/toggle-group-item.svelte";
import { CHANGELOG_KINDS, kindCount } from "./changelog";
import { changelogFeedState } from "./context";

let { label = "Filter by kind", class: classProp }: { label?: string; class?: string } =
	$props();
const feed = changelogFeedState();
</script>

<!-- New / Improved / Fixed chips with counts, and a rolling total of what is shown. -->
<div data-slot="changelog-feed-filters" class={cn(feed.styles.toolbar(), classProp)}>
	<ToggleGroup
		type="multiple"
		variant="chip"
		size="sm"
		{label}
		bind:value={() => feed.kinds, (next) => feed.setKinds(next)}
	>
		{#each CHANGELOG_KINDS as kind (kind.id)}
			<ToggleGroupItem value={kind.id}>
				{kind.label}
				<span class={feed.styles.filterCount()}>{kindCount(feed.entries, kind.id)}</span>
			</ToggleGroupItem>
		{/each}
	</ToggleGroup>
	<p class={feed.styles.count()} aria-live="polite">
		<RollingDigits value={feed.shown.length} startOnView={false} /> updates
	</p>
</div>
