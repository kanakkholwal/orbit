<script lang="ts">
import { Checkbox as CheckboxPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { type CheckboxSize, type CheckboxVariant, checkbox } from "./variants";

type Props = {
	checked?: boolean;
	indeterminate?: boolean;
	disabled?: boolean;
	/** `default` square, `circle` for task lists, or `card`: the labelled tile is the hit area. */
	variant?: CheckboxVariant;
	size?: CheckboxSize;
	label?: string;
	description?: string;
	"aria-label"?: string;
	class?: string;
	name?: string;
	id?: string;
	onCheckedChange?: (checked: boolean) => void;
};

let {
	checked = $bindable(false),
	indeterminate = $bindable(false),
	disabled = false,
	variant = "default",
	size = "default",
	label,
	description,
	"aria-label": ariaLabel,
	class: classProp,
	name,
	id: idProp,
	onCheckedChange,
}: Props = $props();

const frame = $derived(checkbox({ variant, size }));
const autoId = $props.id();
const id = $derived(idProp ?? autoId);
</script>

{#snippet control()}
	<CheckboxPrimitive.Root
		{id}
		{name}
		{disabled}
		bind:checked
		bind:indeterminate
		onCheckedChange={(v) => onCheckedChange?.(v)}
		aria-label={label ? undefined : ariaLabel}
		data-slot="checkbox"
		data-variant={variant}
		class={cn(frame.box(), !label && !description && classProp)}
	>
		{#snippet children({ checked: isChecked, indeterminate: isIndeterminate })}
			<!-- One path for both marks, so the tick morphs into the dash instead of swapping. -->
			<svg
				viewBox="0 0 12 12"
				fill="none"
				aria-hidden="true"
				data-on={isChecked || isIndeterminate}
				data-mixed={isIndeterminate}
				class={cn("checkbox-check text-primary-foreground", frame.mark())}
			>
				<path
					d="M2.5 6.2 L4.8 8.5 L9.5 3.6"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		{/snippet}
	</CheckboxPrimitive.Root>
{/snippet}

<!-- Bare, so this can replace a shadcn checkbox; the wrapper only appears with a label. -->
{#if label || description}
	<div class={cn(frame.root(), disabled && "opacity-50", classProp)}>
		{@render control()}
		<label for={id} class={frame.label()}>
			{#if label}<span class={frame.text()}>{label}</span>{/if}
			{#if description}
				<span class="block text-muted-foreground text-xs leading-relaxed">{description}</span>
			{/if}
		</label>
	</div>
{:else}
	{@render control()}
{/if}
