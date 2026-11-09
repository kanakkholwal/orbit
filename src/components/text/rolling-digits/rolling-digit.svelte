<script lang="ts">
import { untrack } from "svelte";
import { cn } from "$lib/cn.js";
import { rollsUp } from "./format";
import type { RollingDigitsDirection } from "./variants";

let {
	char,
	direction,
	offset,
	class: classProp,
	glyphClass,
}: {
	char: string;
	direction: RollingDigitsDirection;
	offset: number;
	class: string;
	glyphClass: string;
} = $props();

type Exit = { id: number; char: string; to: number };

// svelte-ignore state_referenced_locally -- seeded once; later changes flow through the effect
let shown = $state({ char, id: 0, from: 0 });
let exits = $state<Exit[]>([]);

$effect.pre(() => {
	const next = char;
	untrack(() => {
		if (shown.char === next) return;
		const up = rollsUp(shown.char, next, direction);
		exits = [...exits, { id: shown.id, char: shown.char, to: up ? -offset : offset }];
		shown = { char: next, id: shown.id + 1, from: up ? offset : -offset };
	});
});
</script>

<span class={classProp}>
	{#each exits as exit (exit.id)}
		<span
			aria-hidden="true"
			class={cn(glyphClass, "rolling-digits-out")}
			style:--rd-to="{exit.to}px"
			onanimationend={() => (exits = exits.filter((e) => e.id !== exit.id))}>{exit.char}</span
		>
	{/each}
	{#key shown.id}
		<span
			class={cn(glyphClass, shown.id > 0 && "rolling-digits-in")}
			style:--rd-from="{shown.from}px">{shown.char}</span
		>
	{/key}
</span>
