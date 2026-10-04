<script lang="ts">
import type { Snippet } from "svelte";
import { tick } from "svelte";
import { cn } from "$lib/cn.js";
import { type PillBox, pillCss, pressedBox } from "$lib/pill.js";
import ToggleGroup from "$components/ui/toggle-group/toggle-group.svelte";
import TooltipProvider from "$components/ui/tooltip/tooltip-provider.svelte";
import { getCommand } from "./context";

let {
	value = $bindable(""),
	onValueChange,
	label = "Filter results",
	class: classProp,
	children,
}: {
	/** Bindable. The palette never filters by it: render only the groups it allows. */
	value?: string;
	onValueChange?: (value: string) => void;
	label?: string;
	class?: string;
	children?: Snippet;
} = $props();

const command = getCommand();
let pill = $state<HTMLSpanElement>();
let box = $state<PillBox | null>(null);
let ready = $state(false);

// A single-choice tray never empties: pressing the active filter keeps it.
function pick(next: string | string[]) {
	const picked = Array.isArray(next) ? next[0] : next;
	if (!picked) return;
	value = picked;
	onValueChange?.(picked);
}

// The pill follows the pressed filter; it slides only once it has a first position.
$effect(() => {
	void value;
	const el = pill;
	if (!el) return;
	void tick().then(() => {
		box = pressedBox(el.parentElement);
		if (box && !ready) requestAnimationFrame(() => (ready = true));
	});
});
</script>

<TooltipProvider>
	<ToggleGroup
		type="single"
		bind:value={() => value, pick}
		{label}
		class={cn(command.styles.filters(), classProp)}
	>
		<span
			bind:this={pill}
			aria-hidden="true"
			data-ready={ready ? "" : undefined}
			class={command.styles.pill()}
			style={pillCss(box)}
		></span>
		{@render children?.()}
	</ToggleGroup>
</TooltipProvider>
