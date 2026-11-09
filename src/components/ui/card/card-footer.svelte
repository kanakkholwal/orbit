<script lang="ts">
import { type Snippet, untrack } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { getCardWell } from "./context";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & HTMLAttributes<HTMLDivElement> = $props();

const well = getCardWell();
// Set during init, not in an effect, so the server render already has it in the rim.
if (well) well.footer = untrack(() => ({ children, class: classProp, ...rest }));
$effect(() => {
	if (!well) return;
	well.footer = { children, class: classProp, ...rest };
	return () => {
		well.footer = undefined;
	};
});
</script>

{#if !well}
	<div {...rest} data-slot="card-footer" class={cn("flex items-center gap-2 px-6 [.border-t]:pt-6", classProp)}>
		{@render children?.()}
	</div>
{/if}
