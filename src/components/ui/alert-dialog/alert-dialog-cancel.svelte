<script lang="ts">
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import { button } from "$components/ui/button/variants.js";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: AlertDialogPrimitive.CancelProps = $props();
</script>

<AlertDialogPrimitive.Cancel
	{...rest}
	data-slot="alert-dialog-cancel"
	class={cn(button({ variant: "outline" }), classProp)}
/>
