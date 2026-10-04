<script lang="ts">
import { Switch as SwitchPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { type SwitchSize, switchThumb, switchTrack } from "./variants";

type Props = Omit<
	SwitchPrimitive.RootProps,
	"checked" | "disabled" | "class" | "children"
> & {
	checked?: boolean;
	disabled?: boolean;
	size?: SwitchSize;
	label?: string;
	"aria-label"?: string;
	class?: string;
};

let {
	checked = $bindable(false),
	disabled = false,
	size = "md",
	label,
	"aria-label": ariaLabel,
	class: classProp,
	id: idProp,
	...rest
}: Props = $props();

const autoId = $props.id();
const id = $derived(idProp ?? autoId);
</script>

{#snippet control()}
	<SwitchPrimitive.Root
		{...rest}
		{id}
		{disabled}
		bind:checked
		aria-label={label ? undefined : (ariaLabel ?? "Toggle")}
		data-slot="switch"
		class={cn(switchTrack({ size }), !label && classProp)}
	>
		<SwitchPrimitive.Thumb class={switchThumb({ size })} />
	</SwitchPrimitive.Root>
{/snippet}

<!-- Bare, so this can replace a shadcn switch; the wrapper only appears with a label. -->
{#if label}
	<span class={cn("inline-flex items-center gap-2.5", classProp)}>
		{@render control()}
		<label for={id} class={cn("text-foreground text-sm", disabled && "opacity-50")}>
			{label}
		</label>
	</span>
{:else}
	{@render control()}
{/if}
