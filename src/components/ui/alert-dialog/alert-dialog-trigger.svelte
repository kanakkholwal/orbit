<script lang="ts">
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: AlertDialogPrimitive.TriggerProps = $props();
</script>

<AlertDialogPrimitive.Trigger
	{...rest}
	data-slot="alert-dialog-trigger"
	class={cn("inline-flex", classProp)}
/>
