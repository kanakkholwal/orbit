<script lang="ts">
import type { HTMLTextareaAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type TextareaSize, type TextareaVariant, textarea } from "./variants";

type Props = {
	value?: string;
	class?: string;
	rows?: number;
	size?: TextareaSize;
	variant?: TextareaVariant;
	autoGrow?: boolean;
	maxRows?: number;
	invalid?: boolean;
	label?: string;
	description?: string;
	maxlength?: number;
	showCount?: boolean;
	/** Bindable: the `<textarea>` element. */
	ref?: HTMLTextAreaElement | null;
} & Omit<HTMLTextareaAttributes, "rows" | "value" | "class" | "maxlength">;

let {
	value = $bindable(""),
	ref = $bindable(null),
	class: classProp,
	rows = 3,
	size = "md",
	variant = "outline",
	autoGrow = false,
	maxRows = 10,
	invalid = false,
	label,
	description,
	maxlength,
	showCount = false,
	...rest
}: Props = $props();

const autoId = $props.id();
const id = $derived(rest.id ?? autoId);
const wrapped = $derived(Boolean(label || description || showCount));

// Height follows content, never eases: easing lags behind the character just typed.
$effect(() => {
	void value;
	const el = ref;
	if (!autoGrow || !el) return;
	const line = Number.parseFloat(getComputedStyle(el).lineHeight) || 20;
	el.style.height = "auto";
	el.style.height = `${Math.min(el.scrollHeight, line * maxRows)}px`;
});
</script>

{#snippet field()}
	<textarea
		{...rest}
		{id}
		{maxlength}
		bind:this={ref}
		bind:value
		{rows}
		aria-invalid={invalid || rest["aria-invalid"] || undefined}
		aria-describedby={description ? `${id}-description` : rest["aria-describedby"]}
		class={cn(textarea({ size, variant, autoGrow }), classProp)}
	></textarea>
{/snippet}

<!-- Bare, so this can replace a shadcn textarea; the wrapper only appears with a label. -->
{#if wrapped}
	<div class="flex w-full flex-col gap-1.5">
		{#if label}
			<label for={id} class="font-medium text-foreground text-sm">{label}</label>
		{/if}

		{@render field()}

		{#if description || showCount}
			<div class="flex items-start justify-between gap-3">
				{#if description}
					<p id="{id}-description" class="text-muted-foreground text-xs leading-relaxed">
						{description}
					</p>
				{/if}
				{#if showCount}
					<p class="ml-auto shrink-0 font-mono text-muted-foreground text-xs tabular-nums">
						{value.length}{maxlength ? `/${maxlength}` : ""}
					</p>
				{/if}
			</div>
		{/if}
	</div>
{:else}
	{@render field()}
{/if}
