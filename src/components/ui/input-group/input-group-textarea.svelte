<script lang="ts">
import type { ComponentProps } from "svelte";
import { cn } from "$lib/cn.js";
import Textarea from "$components/ui/textarea/textarea.svelte";
import { inputGroup } from "./variants";

let {
	ref = $bindable(null),
	value = $bindable(""),
	class: classProp,
	...rest
}: ComponentProps<typeof Textarea> = $props();

const s = inputGroup();
</script>

<Textarea
	bind:ref
	bind:value
	data-slot="input-group-control"
	class={cn(s.control(), s.textarea(), classProp)}
	{...rest}
/>
