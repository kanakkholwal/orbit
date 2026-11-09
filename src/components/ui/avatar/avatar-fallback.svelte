<script lang="ts">
import { Avatar as AvatarPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { getAvatar } from "./context";

let { children, class: classProp, ...rest }: AvatarPrimitive.FallbackProps = $props();

const avatar = getAvatar();
</script>

{#if avatar.status !== "loaded"}
	<AvatarPrimitive.Fallback
		data-slot="avatar-fallback"
		class={cn("font-medium text-muted-foreground select-none", classProp)}
		{...rest}
	>
		{@render children?.()}
	</AvatarPrimitive.Fallback>
{/if}
