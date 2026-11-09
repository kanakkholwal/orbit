<script lang="ts">
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { changelogFeedState } from "./context";

let { class: classProp, children }: { class?: string; children?: Snippet } = $props();
const feed = changelogFeedState();
</script>

<!-- Shown when the filters leave nothing; defaults to "No updates of that kind." -->
{#if feed.shown.length === 0}
	<p data-slot="changelog-feed-empty" class={cn(feed.styles.empty(), classProp)}>
		{#if children}{@render children()}{:else}No updates of that kind.{/if}
	</p>
{/if}
