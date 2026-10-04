<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { ALERT_ROLE, type AlertVariant, alert } from "./variants";

let {
	children,
	variant = "info",
	dismissible = false,
	class: classProp,
	...rest
}: {
	children?: Snippet;
	variant?: AlertVariant;
	dismissible?: boolean;
	class?: string;
} & HTMLAttributes<HTMLDivElement> = $props();

let open = $state(true);
</script>

{#if open}
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
				onclick={() => (open = false)}
				class="absolute top-2.5 right-2.5 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
			>
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-3.5">
					<path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		{/if}
	</div>
{/if}
