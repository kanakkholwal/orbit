<script lang="ts">
import { Tooltip as TooltipPrimitive } from "bits-ui";

let {
	open = $bindable(false),
	delay = 400,
	...rest
}: TooltipPrimitive.RootProps & { delay?: number } = $props();
</script>

<TooltipPrimitive.Root bind:open delayDuration={delay} {...rest} />
