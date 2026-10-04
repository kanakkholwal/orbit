<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { breadcrumbStyles } from "./context";

let { class: classProp, ...rest }: { class?: string } & HTMLAttributes<HTMLSpanElement> =
	$props();

const s = $derived(breadcrumbStyles());
</script>

<!-- Put it inside a DropdownMenuTrigger to open the hidden levels, as shadcn-svelte does. -->
<span
	{...rest}
	role="presentation"
	aria-hidden="true"
	data-slot="breadcrumb-ellipsis"
	class={cn(s.ellipsis(), classProp)}
>
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<circle cx="5" cy="12" r="1.75" />
		<circle cx="12" cy="12" r="1.75" />
		<circle cx="19" cy="12" r="1.75" />
	</svg>
	<span class="sr-only">More</span>
</span>
