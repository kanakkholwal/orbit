<script lang="ts">
import type { ComponentProps } from "svelte";
import { Toaster as Sonner, type ToasterProps } from "svelte-sonner";
import { cn } from "$lib/cn.js";
import { TOAST_CLASSES } from "$lib/toast-classes.js";

// svelte-sonner's `Snippet` and this file's resolve to the same runtime shape but a
// different type identity across the package boundary; erase it through `unknown`.
type IconProp = ComponentProps<typeof Sonner>["successIcon"];

let {
	position = "bottom-right",
	visibleToasts = 4,
	duration = 4000,
	closeButton = true,
	expand = true,
	gap = 8,
	offset = { top: 16, right: 16, bottom: 24, left: 16 },
	toastOptions,
	class: classProp,
	...rest
}: ToasterProps = $props();

const STROKE = {
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
} as const;
</script>

<!-- One glyph per status; svelte-sonner owns stacking, swipe and timing. -->
{#snippet successIcon()}
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5">
		<path d="m3.5 8.5 3 3 6-7" {...STROKE} stroke-linejoin="round" />
	</svg>
{/snippet}
{#snippet errorIcon()}
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5">
		<circle cx="8" cy="8" r="6.25" {...STROKE} />
		<path d="M8 5v3.5M8 11h.01" {...STROKE} />
	</svg>
{/snippet}
{#snippet warningIcon()}
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5">
		<path d="M8 2.5 14 13H2z" {...STROKE} stroke-linejoin="round" />
		<path d="M8 6.5v3M8 11.5h.01" {...STROKE} />
	</svg>
{/snippet}
{#snippet infoIcon()}
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5">
		<circle cx="8" cy="8" r="6.25" {...STROKE} />
		<path d="M8 7.5V11M8 5h.01" {...STROKE} />
	</svg>
{/snippet}
{#snippet loadingIcon()}
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5 animate-spin motion-reduce:animate-none">
		<path d="M14 8a6 6 0 0 0-6-6" {...STROKE} />
	</svg>
{/snippet}

<Sonner
	{position}
	{visibleToasts}
	{duration}
	{closeButton}
	{expand}
	{gap}
	{offset}
	class={cn("font-sans!", classProp)}
	successIcon={successIcon as unknown as IconProp}
	errorIcon={errorIcon as unknown as IconProp}
	warningIcon={warningIcon as unknown as IconProp}
	infoIcon={infoIcon as unknown as IconProp}
	loadingIcon={loadingIcon as unknown as IconProp}
	toastOptions={{ unstyled: true, classes: TOAST_CLASSES, ...toastOptions }}
	{...rest}
/>
