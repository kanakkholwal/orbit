<script lang="ts">
import type { ComponentProps } from "svelte";
import Input from "$components/ui/input/input.svelte";
import { cn } from "$lib/cn.js";
import { inputGroup } from "./variants";

let {
	ref = $bindable(null),
	value = $bindable(""),
	class: classProp,
	...rest
}: ComponentProps<typeof Input> = $props();
</script>

<Input
	bind:ref
	bind:value
	data-slot="input-group-control"
	class={cn(inputGroup().control(), classProp)}
	{...rest}
/>
