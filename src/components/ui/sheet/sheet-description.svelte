<script lang="ts">
import { Dialog as SheetPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: SheetPrimitive.DescriptionProps = $props();
</script>

<SheetPrimitive.Description
	{...rest}
	data-slot="sheet-description"
	class={cn("text-muted-foreground text-sm", classProp)}
/>
