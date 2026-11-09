<script lang="ts">
import { Command as CommandPrimitive, useId } from "bits-ui";
import { cn } from "$lib/cn.js";
import { getCommand } from "./context";

let {
	children,
	heading,
	value,
	class: classProp,
	...rest
}: Omit<CommandPrimitive.GroupProps, "value"> & {
	heading?: string;
	value?: string;
} = $props();

const command = getCommand();
</script>

<CommandPrimitive.Group
	value={value ?? heading ?? `----${useId()}`}
	data-slot="command-group"
	class={cn(command.styles.group(), classProp)}
	{...rest}
>
	{#if heading}
		<CommandPrimitive.GroupHeading class={command.styles.groupHeading()}>
			{heading}
		</CommandPrimitive.GroupHeading>
	{/if}
	<CommandPrimitive.GroupItems class={command.styles.groupItems()}>
		{@render children?.()}
	</CommandPrimitive.GroupItems>
</CommandPrimitive.Group>
