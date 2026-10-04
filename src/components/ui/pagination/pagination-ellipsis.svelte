<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: { class?: string } & HTMLAttributes<HTMLSpanElement> =
	$props();
</script>

<span
	{...rest}
	role="presentation"
	aria-hidden="true"
	data-slot="pagination-ellipsis"
	class={cn("px-1 text-muted-foreground text-sm", classProp)}
>
	&hellip;
	<span class="sr-only">More pages</span>
</span>
