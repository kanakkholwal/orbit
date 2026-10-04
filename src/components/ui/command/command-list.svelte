<script lang="ts">
import { Command as CommandPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { offsetBox, type PillBox, pillCss } from "$lib/pill.js";
import { getCommand } from "./context";

let { class: classProp, children, ...rest }: CommandPrimitive.ListProps = $props();

const command = getCommand();
let el = $state<HTMLDivElement | null>(null);
let box = $state<PillBox | null>(null);
let glide = $state(false);

$effect(() => {
	void command.activeValue;
	const row = el?.querySelector<HTMLElement>("[data-selected]");
	box = row ? offsetBox(row) : null;
});

// Arrow keys repeat too fast for motion to help; a pointer moving between rows can glide.
$effect(() => {
	const snap = () => (glide = false);
	window.addEventListener("keydown", snap, true);
	return () => window.removeEventListener("keydown", snap, true);
});
</script>

<CommandPrimitive.List
	bind:ref={el}
	data-slot="command-list"
	class={cn(command.styles.list(), classProp)}
	onpointermove={() => (glide = true)}
	{...rest}
>
	{#if box}
		<span
			aria-hidden="true"
			data-glide={glide ? "" : undefined}
			class={command.styles.marker()}
			style={pillCss(box)}
		></span>
	{/if}
	{@render children?.()}
</CommandPrimitive.List>
