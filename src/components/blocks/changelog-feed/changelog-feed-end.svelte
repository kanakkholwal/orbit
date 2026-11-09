<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { changelogFeedState } from "./context";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLParagraphElement> & { children?: Snippet } = $props();
const feed = changelogFeedState();
</script>

<!-- A closing line after the last entry; hidden while the filters leave nothing. -->
{#if feed.shown.length > 0}
	<p data-slot="changelog-feed-end" {...rest} class={cn(feed.styles.end(), classProp)}>
		{@render children?.()}
	</p>
{/if}
