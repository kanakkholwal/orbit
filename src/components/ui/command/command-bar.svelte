<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { getCommand } from "./context";

let { class: classProp, children, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
const command = getCommand();
</script>

<!-- A row for the input and its filters, as the launcher lays them side by side. -->
<div {...rest} data-slot="command-bar" class={cn(command.styles.bar(), classProp)}>
	{@render children?.()}
</div>
