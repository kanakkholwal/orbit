<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		"data-slot": dataSlot = "input",
		...restProps
	}: Props = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"selection:bg-primary selection:text-primary-foreground placeholder:text-placeholder flex h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground outline-none transition-colors duration-150 file:mr-3 file:border-0 file:bg-transparent file:text-body file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
			"focus-visible:border-ring",
			"aria-invalid:border-destructive",
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"selection:bg-primary selection:text-primary-foreground placeholder:text-placeholder flex h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 md:text-body",
			"focus-visible:border-ring",
			"aria-invalid:border-destructive",
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
