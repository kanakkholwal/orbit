<script lang="ts">
import { Command as CommandPrimitive, computeCommandScore } from "bits-ui";
import { cn } from "$lib/cn.js";
import { getCommandDialogState, setCommand } from "./context";
import { rankCommandMatch } from "./score";
import { type CommandVariant, commandFrame } from "./variants";

let {
	children,
	value = $bindable(""),
	variant: variantProp,
	filter = (item: string, search: string, keywords?: string[]) =>
		rankCommandMatch(computeCommandScore(item, search, keywords), item, search),
	class: classProp,
	...rest
}: Omit<CommandPrimitive.RootProps, "value" | "onStateChange"> & {
	value?: string;
	variant?: CommandVariant;
} = $props();

let resultCount = $state(0);
const dialogState = getCommandDialogState();
const variant = $derived(variantProp ?? dialogState?.variant ?? "default");
const styles = $derived(commandFrame({ variant }));

setCommand({
	get resultCount() {
		return resultCount;
	},
	get activeValue() {
		return value;
	},
	get variant() {
		return variant;
	},
	get styles() {
		return styles;
	},
});
</script>

<CommandPrimitive.Root
	bind:value
	{filter}
	onStateChange={(state) => {
		resultCount = state.filtered.count;
	}}
	data-slot="command"
	data-variant={variant}
	class={cn(styles.body(), classProp)}
	{...rest}
>
	{@render children?.()}
</CommandPrimitive.Root>
