<script lang="ts">
import { Tooltip as TooltipPrimitive } from "bits-ui";

let { ...rest }: TooltipPrimitive.ProviderProps = $props();
</script>

<TooltipPrimitive.Provider {...rest} />
