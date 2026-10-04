<script lang="ts">
import type { Snippet } from "svelte";
import { Drawer } from "vaul-svelte";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & Omit<
	Drawer.TriggerProps,
	"children"
> = $props();
</script>

<Drawer.Trigger data-slot="drawer-trigger" class={classProp} {...rest}>
	{@render children?.()}
</Drawer.Trigger>
