<script lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { setDropdownMenu } from "./context";

let { open = $bindable(false), ...rest }: DropdownMenuPrimitive.RootProps = $props();

const uid = $props.id();
setDropdownMenu(`${uid}-trigger`);
</script>

<DropdownMenuPrimitive.Root bind:open {...rest} />
