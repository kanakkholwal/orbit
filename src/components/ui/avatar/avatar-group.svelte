<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { avatarGroup } from "./variants";

let {
	class: classProp,
	children,
	...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
	class?: string;
	children?: Snippet;
} = $props();
</script>

<div data-slot="avatar-group" class={cn(avatarGroup().root(), classProp)} {...rest}>{@render children?.()}</div>
