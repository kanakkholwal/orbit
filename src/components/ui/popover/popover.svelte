<script lang="ts">
import { Popover as PopoverPrimitive } from "bits-ui";

let { open = $bindable(false), ...rest }: PopoverPrimitive.RootProps = $props();
</script>

<PopoverPrimitive.Root bind:open {...rest} />
