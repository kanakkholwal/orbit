<script lang="ts">
import { Dialog as SheetPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: SheetPrimitive.TitleProps = $props();
</script>

<SheetPrimitive.Title
	{...rest}
	data-slot="sheet-title"
	class={cn("font-semibold text-foreground text-sm", classProp)}
/>
