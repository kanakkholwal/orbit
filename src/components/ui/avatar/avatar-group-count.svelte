<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { type AvatarShape, type AvatarSize, avatar, avatarGroup } from "./variants";

let {
	size = "default",
	shape = "circle",
	class: classProp,
	children,
	...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
	size?: AvatarSize;
	shape?: AvatarShape;
	class?: string;
	children?: Snippet;
} = $props();
</script>

<div data-slot="avatar-group-count" class={cn(avatar({ size, shape }), avatarGroup().count(), classProp)} {...rest}>
	{@render children?.()}
</div>
