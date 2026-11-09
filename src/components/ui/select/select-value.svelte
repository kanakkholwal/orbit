<script lang="ts">
import { Select as SelectPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: SelectPrimitive.ValueProps = $props();
</script>

<SelectPrimitive.Value
	{...rest}
	data-slot="select-value"
	class={cn("whitespace-nowrap data-[placeholder]:text-muted-foreground", classProp)}
/>
