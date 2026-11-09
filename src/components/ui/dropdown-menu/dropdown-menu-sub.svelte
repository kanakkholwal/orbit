<script lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

let { open = $bindable(false), ...rest }: DropdownMenuPrimitive.SubProps = $props();
</script>

<DropdownMenuPrimitive.Sub bind:open {...rest} />
