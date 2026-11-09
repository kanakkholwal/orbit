<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { changelogFeedState } from "./context";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLHeadingElement> & { children?: Snippet } = $props();
const feed = changelogFeedState();
</script>

<h2
	data-slot="changelog-feed-title"
	id={feed.titleId}
	{...rest}
	class={cn(feed.styles.title(), classProp)}
>
	{@render children?.()}
</h2>
