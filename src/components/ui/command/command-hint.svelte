<script lang="ts">
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { getCommand } from "./context";

let {
	keys,
	class: classProp,
	children,
}: {
	/** One key cap each, e.g. `["↑", "↓"]`. */
	keys: string[];
	class?: string;
	children?: Snippet;
} = $props();

/** The `KeyboardEvent.key` behind each glyph a hint may show. */
const KEY_NAME: Record<string, string> = {
	"↑": "ArrowUp",
	"↓": "ArrowDown",
	"←": "ArrowLeft",
	"→": "ArrowRight",
	"↵": "Enter",
	Esc: "Escape",
	Tab: "Tab",
};

const command = getCommand();
let held = $state<string[]>([]);

// Caps depress while their key is held, so the footer answers the keyboard.
$effect(() => {
	const down = (event: KeyboardEvent) => {
		if (!held.includes(event.key)) held = [...held, event.key];
	};
	const up = (event: KeyboardEvent) => {
		held = held.filter((key) => key !== event.key);
	};
	const clear = () => (held = []);
	window.addEventListener("keydown", down);
	window.addEventListener("keyup", up);
	window.addEventListener("blur", clear);
	return () => {
		window.removeEventListener("keydown", down);
		window.removeEventListener("keyup", up);
		window.removeEventListener("blur", clear);
	};
});
</script>

<span data-slot="command-hint" class={cn(command.styles.hint(), classProp)}>
	{#each keys as key (key)}
		<kbd
			data-pressed={held.includes(KEY_NAME[key] ?? key) ? "" : undefined}
			class={command.styles.kbd()}>{key}</kbd
		>
	{/each}
	{@render children?.()}
</span>
