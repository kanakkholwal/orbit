<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { changelogFeedState } from "./context";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & { children?: Snippet } = $props();
const feed = changelogFeedState();
</script>

<div data-slot="changelog-feed-heading" {...rest} class={cn(feed.styles.heading(), classProp)}>
	{@render children?.()}
</div>
