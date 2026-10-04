<script lang="ts">
import { Select as SelectPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: SelectPrimitive.GroupHeadingProps = $props();
</script>

<SelectPrimitive.GroupHeading
	{...rest}
	data-slot="select-label"
	class={cn("px-2.5 py-1.5 font-medium text-muted-foreground text-xs", classProp)}
/>
