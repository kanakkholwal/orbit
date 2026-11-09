<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { empty } from "./variants";

let {
	class: classProp,
	children,
	...rest
}: { class?: string; children?: Snippet } & Omit<
	HTMLAttributes<HTMLDivElement>,
	"class" | "children"
> = $props();
</script>

<div {...rest} data-slot="empty-description" class={cn(empty().description(), classProp)}>
	{@render children?.()}
</div>
