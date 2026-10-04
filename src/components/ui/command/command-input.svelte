<script lang="ts">
import { Command as CommandPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { getCommand } from "./context";

let {
	placeholder = "Type a command or search…",
	hint,
	class: classProp,
	...rest
}: CommandPrimitive.InputProps & {
	/** A key cap at the end of the field, e.g. `⌘K` or `Esc`. */
	hint?: string;
} = $props();

const command = getCommand();
let spoken = $state("");

// Debounced so a live region does not narrate every keystroke, only where it settles.
$effect(() => {
	const count = command.resultCount;
	const timer = setTimeout(() => {
		spoken =
			count === 0
				? "No commands match."
				: `${count} ${count === 1 ? "command" : "commands"} available.`;
	}, 400);
	return () => clearTimeout(timer);
});
</script>

<div data-slot="command-input-wrapper" class={command.styles.inputWrap()}>
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class={command.styles.inputIcon()}>
		<circle cx="7.2" cy="7.2" r="4.2" stroke="currentColor" stroke-width="1.4" />
		<path d="m10.4 10.4 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
	</svg>
	<CommandPrimitive.Input
		autofocus
		data-slot="command-input"
		{placeholder}
		class={cn(command.styles.input(), classProp)}
		{...rest}
	/>
	<span class={command.styles.count()} aria-hidden="true">{command.resultCount}</span>
	{#if hint}
		<kbd aria-hidden="true" class={command.styles.kbd()}>{hint}</kbd>
	{/if}
	<span role="status" aria-live="polite" class="sr-only">{spoken}</span>
</div>
