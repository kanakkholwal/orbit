<script lang="ts">
import { Dialog as DialogPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { dialogFrame } from "$components/ui/dialog/variants.js";
import { cn } from "$lib/cn.js";
import { setCommandDialogState } from "./context";
import { type CommandVariant, commandFrame } from "./variants";

let {
	children,
	open = $bindable(false),
	label = "Command palette",
	description = "Search for a command to run…",
	variant = "default",
	class: classProp,
}: {
	children?: Snippet;
	open?: boolean;
	label?: string;
	description?: string;
	variant?: CommandVariant;
	class?: string;
} = $props();

let header = $state<{ children?: Snippet; class?: string }>();
const styles = $derived(commandFrame({ variant }));

setCommandDialogState({
	get open() {
		return open;
	},
	get variant() {
		return variant;
	},
	get header() {
		return header;
	},
	set header(next) {
		header = next;
	},
});
</script>

<DialogPrimitive.Root bind:open>
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay
			data-slot="command-dialog-backdrop"
			class={cn(dialogFrame().backdrop(), "backdrop-blur-md backdrop-saturate-150")}
		/>
		<DialogPrimitive.Content
			data-slot="command-dialog"
			data-variant={variant}
			class={cn(styles.popup(), styles.panel(), classProp)}
		>
			<!-- Matches shadcn's own CommandDialog: a real Title/Description carries the
			accessible name/description, sr-only since the search input is the visible label. -->
			<DialogPrimitive.Title class="sr-only">{label}</DialogPrimitive.Title>
			<DialogPrimitive.Description class="sr-only">{description}</DialogPrimitive.Description>
			{#if variant === "framed" && header}
				<div data-slot="command-header" class={cn(styles.header(), header.class)}>
					<p class="font-medium text-foreground text-sm">{@render header.children?.()}</p>
					<span class="flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs">
						<kbd class={styles.kbd()}>esc</kbd>
						close
					</span>
				</div>
			{/if}
			{@render children?.()}
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>
