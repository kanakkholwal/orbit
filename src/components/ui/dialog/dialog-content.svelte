<script lang="ts">
import { Dialog as DialogPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "$lib/cn.js";
import { getDialog } from "./context";
import { dialogFrame, dialogWidth } from "./variants";

let { children, class: classProp }: { children?: Snippet; class?: string } = $props();

const dialog = getDialog();
const styles = $derived(dialogFrame({ variant: dialog.variant }));
</script>

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay data-slot="dialog-backdrop" class={styles.backdrop()} />
	<DialogPrimitive.Content
		data-slot="dialog-content"
		data-variant={dialog.variant}
		onInteractOutside={(event) => {
			if (!dialog.dismissOnBackdrop) event.preventDefault();
		}}
		class={cn(
			styles.popup(),
			styles.panel(),
			"w-[min(32rem,calc(100vw-2rem))]",
			dialogWidth({ size: dialog.size }),
			classProp,
		)}
	>
		{#if dialog.variant === "framed"}
			<!-- Inset frame: the body sits on a lighter surface, the footer in the rim below it. -->
			<div class={styles.body()}>
				{@render children?.()}
			</div>
			{#if dialog.footer}
				<div
					data-slot="dialog-footer"
					class={cn(dialogFrame({ variant: dialog.variant }).footer(), dialog.footer.class)}
				>
					{@render dialog.footer.children?.()}
				</div>
			{/if}
		{:else}
			{@render children?.()}
			{#if dialog.footer}
				<div
					data-slot="dialog-footer"
					class={cn(dialogFrame({ variant: dialog.variant }).footer(), dialog.footer.class)}
				>
					{@render dialog.footer.children?.()}
				</div>
			{/if}
		{/if}
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
