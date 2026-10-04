<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: { class?: string } & HTMLAttributes<HTMLHRElement> =
	$props();
</script>

<hr {...rest} data-slot="dropdown-menu-separator" class={cn("-mx-1 my-1 border-border", classProp)} />
