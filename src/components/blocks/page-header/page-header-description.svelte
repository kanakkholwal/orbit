<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { pageHeader } from "./variants";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & { children?: Snippet } = $props();

const s = pageHeader();
</script>

<!-- One line under the title; folds away while the bar is condensed. -->
<div {...rest} data-slot="page-header-description" class={s.fold()}>
	<div class={s.foldInner()}>
		<p class={cn(s.description(), classProp)}>{@render children?.()}</p>
	</div>
</div>
