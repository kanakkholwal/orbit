<script lang="ts">
import { LinkPreview as HoverCardPrimitive } from "bits-ui";

let {
	open = $bindable(false),
	openDelay = 300,
	closeDelay = 150,
	...rest
}: HoverCardPrimitive.RootProps = $props();
</script>

<HoverCardPrimitive.Root bind:open {openDelay} {closeDelay} {...rest} />
