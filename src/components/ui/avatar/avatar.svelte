<script lang="ts">
import { Avatar as AvatarPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { type AvatarShape, type AvatarSize, avatar } from "./variants";
import { setAvatar } from "./context";

let {
	children,
	size = "default",
	shape = "circle",
	class: classProp,
	...rest
}: Omit<AvatarPrimitive.RootProps, "loadingStatus"> & {
	children?: Snippet;
	size?: AvatarSize;
	shape?: AvatarShape;
} = $props();

let status = $state<"loading" | "loaded" | "error">("loading");

setAvatar({
	get status() {
		return status;
	},
});
</script>

<AvatarPrimitive.Root
	bind:loadingStatus={status}
	data-slot="avatar"
	data-size={size}
	class={cn(avatar({ size, shape }), classProp)}
	{...rest}
>
	{@render children?.()}
</AvatarPrimitive.Root>
