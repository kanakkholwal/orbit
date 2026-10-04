<script lang="ts">
import { Dialog as DialogPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: DialogPrimitive.DescriptionProps = $props();
</script>

<DialogPrimitive.Description
	{...rest}
	data-slot="dialog-description"
	class={cn("text-muted-foreground text-sm", classProp)}
/>
