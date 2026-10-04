<script lang="ts" module>
import type { Snippet } from "svelte";
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { ButtonSize, ButtonVariant } from "./variants";

export type { ButtonSize, ButtonVariant };

export type ButtonProps = {
	variant?: ButtonVariant;
	size?: ButtonSize;
	href?: string;
	loading?: boolean;
	loadingLabel?: string;
	children?: Snippet;
	class?: string;
	/** Bindable: the rendered `<button>` or `<a>`. */
	ref?: HTMLElement | null;
} & Omit<HTMLButtonAttributes & HTMLAnchorAttributes, "class" | "children">;
</script>

<script lang="ts">
import { cn } from "$lib/cn.js";
import { button, isIconSize } from "./variants";

let {
	ref = $bindable(null),
	variant,
	size,
	href,
	loading = false,
	loadingLabel = "Loading…",
	children,
	class: classProp,
	onclick,
	...rest
}: ButtonProps = $props();

// The hidden face leaves the flow, so the button is sized by what it shows, not by "Loading…".
const FACE =
	"col-start-1 row-start-1 flex items-center justify-center gap-2 whitespace-nowrap transition-[opacity,transform,scale,translate,filter] duration-(--duration-base) ease-[var(--ease-out)] motion-reduce:transition-none data-[on=false]:pointer-events-none data-[on=false]:absolute data-[on=false]:inset-0 data-[on=false]:translate-y-[3px] data-[on=false]:opacity-0 data-[on=false]:blur-[3px]";

const classes = $derived(cn(button({ variant, size }), classProp));
const iconOnly = $derived(isIconSize(size));

function activate(event: MouseEvent) {
	if (loading) {
		event.preventDefault();
		return;
	}
	(onclick as ((e: MouseEvent) => void) | undefined)?.(event);
}
</script>

{#snippet faces()}
	<span class="relative grid place-items-center">
		<span class={FACE} data-on={!loading} aria-hidden={loading}>
			{@render children?.()}
		</span>
		<span class={FACE} data-on={loading} aria-hidden={!loading}>
			<svg
				viewBox="0 0 12 12"
				fill="none"
				aria-hidden="true"
				class="size-3.5 [animation:spin_850ms_linear_infinite] motion-reduce:animate-none"
				style:animation-play-state={loading ? "running" : "paused"}
			>
				<circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5" opacity="0.22" />
				<path
					d="M10.5 6A4.5 4.5 0 0 0 6 1.5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
			{#if iconOnly}<span class="sr-only">{loadingLabel}</span>{:else}{loadingLabel}{/if}
		</span>
	</span>
{/snippet}

{#if href !== undefined}
	<a
		bind:this={ref}
		data-slot="button"
		{...rest as HTMLAnchorAttributes}
		href={loading ? undefined : href}
		role={loading ? "link" : undefined}
		class={classes}
		aria-busy={loading || undefined}
		aria-disabled={loading || undefined}
		data-variant={variant}
		data-size={size}
		onclick={activate}
		onkeydown={(e) => {
			// Anchors don't activate on Space natively; the spec requires that they do.
			if (e.key === " ") {
				e.preventDefault();
				e.currentTarget.click();
			}
		}}
	>
		{@render faces()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		{...rest as HTMLButtonAttributes}
		type={(rest as HTMLButtonAttributes).type ?? "button"}
		class={classes}
		aria-busy={loading || undefined}
		aria-disabled={loading || undefined}
		data-variant={variant}
		data-size={size}
		onclick={activate}
	>
		{@render faces()}
	</button>
{/if}
