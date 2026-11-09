<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...rest} data-slot="sheet-footer" class={cn("mt-auto flex items-center justify-end gap-2", classProp)}>
	{@render children?.()}
</div>
