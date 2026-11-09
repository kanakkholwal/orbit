<script lang="ts">
import { Select as SelectPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: SelectPrimitive.GroupProps = $props();
</script>

<SelectPrimitive.Group {...rest} data-slot="select-group" class={cn("py-0.5", classProp)} />
