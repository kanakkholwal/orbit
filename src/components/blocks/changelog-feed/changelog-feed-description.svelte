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

<p data-slot="changelog-feed-description" {...rest} class={cn(feed.styles.description(), classProp)}>
	{@render children?.()}
</p>
