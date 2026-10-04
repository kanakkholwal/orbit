<script lang="ts">
import { Dialog as DialogPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: DialogPrimitive.TitleProps = $props();
</script>

<DialogPrimitive.Title
	{...rest}
	data-slot="dialog-title"
	class={cn(
		"flex items-center gap-2 font-semibold text-foreground text-lg [&>svg]:size-5 [&>svg]:text-muted-foreground",
		classProp,
	)}
/>
