<script lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

let { open = $bindable(false), ...rest }: DropdownMenuPrimitive.RootProps = $props();
</script>

<DropdownMenuPrimitive.Root bind:open {...rest} />
