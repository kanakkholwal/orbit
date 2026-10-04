<script lang="ts">
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: AlertDialogPrimitive.DescriptionProps = $props();
</script>

<AlertDialogPrimitive.Description
	{...rest}
	data-slot="alert-dialog-description"
	class={cn("text-muted-foreground text-sm leading-relaxed", classProp)}
/>
