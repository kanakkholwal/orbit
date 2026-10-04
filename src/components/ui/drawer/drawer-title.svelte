<script lang="ts">
import type { Snippet } from "svelte";
import { Drawer } from "vaul-svelte";
import { cn } from "$lib/cn.js";

let {
	children,
	class: classProp,
	...rest
}: { children?: Snippet; class?: string } & Omit<
	Drawer.TitleProps,
	"children"
> = $props();
</script>

<Drawer.Title
	data-slot="drawer-title"
	class={cn(
		"flex items-center gap-2 font-semibold text-foreground text-lg [&>svg]:size-5 [&>svg]:text-muted-foreground",
		classProp,
	)}
	{...rest}
>
	{@render children?.()}
</Drawer.Title>
