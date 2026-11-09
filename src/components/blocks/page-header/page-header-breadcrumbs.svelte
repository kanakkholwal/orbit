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

<!-- Holds a Breadcrumb; folds away while the bar is condensed. -->
<div {...rest} data-slot="page-header-breadcrumbs" class={cn(s.fold(), s.crumbs(), classProp)}>
	<div class={s.foldInner()}>{@render children?.()}</div>
</div>
