<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { changelogFeedState } from "./context";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLElement> & { children?: Snippet } = $props();
const feed = changelogFeedState();
</script>

<header data-slot="changelog-feed-header" {...rest} class={cn(feed.styles.header(), classProp)}>
	{@render children?.()}
</header>
