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
	/** Bindable: the `<textarea>` element. */
	ref?: HTMLTextAreaElement | null;
} & Omit<HTMLTextareaAttributes, "rows" | "value" | "class">;

let {
	value = $bindable(""),
	ref = $bindable(null),
	class: classProp,
	rows = 3,
	size = "default",
	variant = "outline",
	autoGrow = false,
	maxRows = 10,
	invalid = false,
	...rest
}: Props = $props();

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

<!-- A bare textarea, so it can replace a shadcn one; label it with Field, FieldLabel and FieldDescription. -->
<textarea
	data-slot="textarea"
	{...rest}
	bind:this={ref}
	bind:value
	{rows}
	aria-invalid={invalid || rest["aria-invalid"] || undefined}
	class={cn(textarea({ size, variant, autoGrow }), classProp)}
></textarea>
