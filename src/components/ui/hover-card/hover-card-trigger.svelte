<script lang="ts">
import { LinkPreview as HoverCardPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: HoverCardPrimitive.TriggerProps = $props();
</script>

<HoverCardPrimitive.Trigger
	{...rest}
	data-slot="hover-card-trigger"
	class={cn("inline-flex", classProp)}
/>
