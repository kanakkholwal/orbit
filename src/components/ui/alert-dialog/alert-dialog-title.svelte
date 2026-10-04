<script lang="ts">
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: AlertDialogPrimitive.TitleProps = $props();
</script>

<AlertDialogPrimitive.Title
	{...rest}
	data-slot="alert-dialog-title"
	class={cn("font-medium text-foreground text-base", classProp)}
/>
