<script lang="ts">
import type { Snippet } from "svelte";
import { Drawer } from "vaul-svelte";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & Omit<
	Drawer.DescriptionProps,
	"children"
> = $props();
</script>

<Drawer.Description
	data-slot="drawer-description"
	class={cn("text-muted-foreground text-sm", classProp)}
	{...rest}
>
	{@render children?.()}
</Drawer.Description>
