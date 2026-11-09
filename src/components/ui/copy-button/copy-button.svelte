<script lang="ts">
import type { HTMLButtonAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";

let {
	text,
	label = "Copy",
	copiedLabel = "Copied",
	iconOnly = false,
	class: classProp,
	onclick,
	...rest
}: Omit<HTMLButtonAttributes, "children" | "type"> & {
	text: string;
	label?: string;
	copiedLabel?: string;
	iconOnly?: boolean;
} = $props();

let copied = $state(false);
let failed = $state(false);
let timer: ReturnType<typeof setTimeout>;

async function copy() {
	clearTimeout(timer);
	try {
		await navigator.clipboard.writeText(text);
		copied = true;
		failed = false;
	} catch {
		// Clipboard access is denied outside a secure context; say so rather than lying.
		failed = true;
	}
	timer = setTimeout(() => {
		copied = false;
		failed = false;
	}, 1600);
}
</script>

<button
	data-slot="copy-button"
	data-state={copied ? "copied" : "idle"}
	{...rest}
	type="button"
	onclick={(event) => {
		copy();
		onclick?.(event);
	}}
	aria-label={iconOnly ? (copied ? copiedLabel : label) : undefined}
	class={cn(
		"inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card font-medium text-muted-foreground text-xs transition-[color,transform,scale,translate] duration-[var(--duration-press)] ease-[var(--ease-ui-out)] hover:text-foreground active:scale-[var(--press-scale)]",
		iconOnly ? "w-8 justify-center" : "px-2.5",
		classProp,
	)}
>
	{#if copied}
		<svg viewBox="0 0 14 14" fill="none" aria-hidden="true" class="size-3.5">
			<path d="M3 7.4 5.6 10 11 4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{:else}
		<svg viewBox="0 0 14 14" fill="none" aria-hidden="true" class="size-3.5">
			<rect x="4.5" y="4.5" width="7.5" height="7.5" rx="1.6" stroke="currentColor" stroke-width="1.3" />
			<path d="M9.5 2.5H3.1A1.6 1.6 0 0 0 1.5 4.1v6.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
		</svg>
	{/if}
	{#if !iconOnly}{failed ? "Press Ctrl+C" : copied ? copiedLabel : label}{/if}
	<span role="status" class="sr-only">{copied ? copiedLabel : ""}</span>
</button>
