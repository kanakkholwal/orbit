<script lang="ts">
import { Command as CommandPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { getCommand } from "./context";

let { children, class: classProp, ...rest }: CommandPrimitive.EmptyProps = $props();
const command = getCommand();
</script>

<CommandPrimitive.Empty
	data-slot="command-empty"
	class={cn(command.styles.empty(), classProp)}
	{...rest}
>
	{@render children?.()}
</CommandPrimitive.Empty>
