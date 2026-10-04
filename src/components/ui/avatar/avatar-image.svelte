<script lang="ts">
import { Avatar as AvatarPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { getAvatar } from "./context";

let { src, alt = "", class: classProp, ...rest }: AvatarPrimitive.ImageProps = $props();

const avatar = getAvatar();
</script>

{#if src && avatar.status !== "error"}
	<AvatarPrimitive.Image
		{src}
		{alt}
		data-slot="avatar-image"
		class={cn(
			"absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-(--duration-base) ease-[var(--ease-out)] data-[status=loaded]:opacity-100 motion-reduce:transition-none",
			classProp,
		)}
		{...rest}
	/>
{/if}
