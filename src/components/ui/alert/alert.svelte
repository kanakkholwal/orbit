<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { ALERT_ROLE, type AlertVariant, alert, alertCollapse } from "./variants";

let {
	children,
	variant = "info",
	dismissible = false,
	open = $bindable(),
	onOpenChange,
	class: classProp,
	...rest
}: {
	children?: Snippet;
	variant?: AlertVariant;
	dismissible?: boolean;
	/** Shown or folded away; an alert that can close collapses its row instead of vanishing. Bindable. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	class?: string;
} & HTMLAttributes<HTMLDivElement> = $props();

let ownOpen = $state(true);
const shown = $derived(open ?? ownOpen);
const foldable = $derived(dismissible || open !== undefined);
const c = alertCollapse();
function close() {
	if (open === undefined) ownOpen = false;
	else open = false;
	onOpenChange?.(false);
}
</script>

{#snippet body()}
	<div
		{...rest}
		data-slot="alert"
		role={ALERT_ROLE[variant]}
		class={cn("alert-in", alert({ variant }), dismissible && "pr-10", classProp)}
	>
		{@render children?.()}
		{#if dismissible}
			<button
				type="button"
				aria-label="Dismiss"
				onclick={close}
				class="absolute top-2.5 right-2.5 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
			>
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5">
					<path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		{/if}
	</div>
{/snippet}

<!-- A plain alert keeps its bare markup; only one that can close gets the folding wrapper. -->
{#if foldable}
	<div data-slot="alert-collapse" data-open={shown} inert={!shown} class={c.root()}>
		<div class={c.inner()}>{@render body()}</div>
	</div>
{:else}
	{@render body()}
{/if}
