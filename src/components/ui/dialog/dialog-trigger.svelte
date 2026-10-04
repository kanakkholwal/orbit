<script lang="ts">
import { Dialog as DialogPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: DialogPrimitive.TriggerProps = $props();
</script>

<DialogPrimitive.Trigger
	{...rest}
	data-slot="dialog-trigger"
	class={cn("inline-flex", classProp)}
/>
