<script lang="ts">
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { dialogFrame } from "$components/ui/dialog/variants.js";
import { cn } from "$lib/cn.js";
import { getAlertDialog } from "./context";

let { children, class: classProp }: { children?: Snippet; class?: string } = $props();

const dialog = getAlertDialog();
const styles = $derived(dialogFrame({ variant: dialog.variant }));
let contentEl = $state<HTMLElement | null>(null);
</script>

<AlertDialogPrimitive.Portal>
	<AlertDialogPrimitive.Overlay data-slot="alert-dialog-backdrop" class={styles.backdrop()} />
	<AlertDialogPrimitive.Content
		bind:ref={contentEl}
		data-slot="alert-dialog-content"
		data-variant={dialog.variant}
		onOpenAutoFocus={(event) => {
			event.preventDefault();
			contentEl
				?.querySelector<HTMLElement>('[data-slot="alert-dialog-cancel"]')
				?.focus();
		}}
		class={cn(
			styles.popup(),
			styles.panel(),
			"w-[min(26rem,calc(100vw-2rem))]",
			classProp,
		)}
	>
		{#if dialog.variant === "framed"}
			<div class={styles.body()}>
				{@render children?.()}
			</div>
			{#if dialog.footer}
				<div
					data-slot="alert-dialog-footer"
					class={cn(dialogFrame({ variant: dialog.variant }).footer(), dialog.footer.class)}
				>
					{@render dialog.footer.children?.()}
				</div>
			{/if}
		{:else}
			{@render children?.()}
			{#if dialog.footer}
				<div
					data-slot="alert-dialog-footer"
					class={cn(dialogFrame({ variant: dialog.variant }).footer(), dialog.footer.class)}
				>
					{@render dialog.footer.children?.()}
				</div>
			{/if}
		{/if}
	</AlertDialogPrimitive.Content>
</AlertDialogPrimitive.Portal>
