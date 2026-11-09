<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { avatarGroup } from "./variants";

let {
	class: classProp,
	children,
	...rest
}: Omit<HTMLAttributes<HTMLSpanElement>, "class" | "children"> & {
	class?: string;
	children?: Snippet;
} = $props();
</script>

<span data-slot="avatar-badge" class={cn(avatarGroup().badge(), classProp)} {...rest}>{@render children?.()}</span>
