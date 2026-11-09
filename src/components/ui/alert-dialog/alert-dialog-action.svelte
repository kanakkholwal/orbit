<script lang="ts">
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import { type ButtonVariant, button } from "$components/ui/button/variants.js";
import { cn } from "$lib/cn.js";

let {
	class: classProp,
	destructive = false,
	...rest
}: AlertDialogPrimitive.ActionProps & { destructive?: boolean } = $props();

const variant: ButtonVariant = $derived(destructive ? "destructive" : "default");
</script>

<AlertDialogPrimitive.Action
	{...rest}
	data-slot="alert-dialog-action"
	class={cn(button({ variant }), classProp)}
/>
