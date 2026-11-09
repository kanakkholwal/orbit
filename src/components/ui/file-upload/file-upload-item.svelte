<script lang="ts">
import type { HTMLLiAttributes } from "svelte/elements";
import Button from "$components/ui/button/button.svelte";
import { cn } from "$lib/cn.js";
import { transitionMs } from "$lib/motion.js";
import { formatBytes, statusLabel, type UploadFile } from "./core";
import { fileUpload } from "./variants";
import { fileUploadState } from "./context";

let {
	file: item,
	onRemove,
	onRetry,
	class: classProp,
	...rest
}: Omit<HTMLLiAttributes, "children"> & {
	file: UploadFile;
	/** Shows a remove action; the row folds shut before this runs. */
	onRemove?: () => void;
	/** Shows a retry action on a failed upload. */
	onRetry?: () => void;
} = $props();

const ctx = fileUploadState("FileUploadItem");
const s = $derived(fileUpload({ size: ctx.size, status: item.status }));
const name = $derived(item.file.name);
const preview = $derived(ctx.previews[item.id]);
const clamped = $derived(Math.min(100, Math.max(0, item.progress)));
const uploading = $derived(item.status === "uploading");
const meta = $derived(
	item.status === "error"
		? (item.error ?? ctx.labels.failed)
		: uploading
			? `${Math.round(clamped)}%`
			: item.status === "done"
				? formatBytes(item.file.size)
				: ctx.labels.queued,
);
let root = $state<HTMLLIElement>();
let leaving = $state(false);

// Removal waits for the fold, then hands back; under reduced motion it runs at once.
$effect(() => {
	if (!leaving) return;
	const ms = root ? transitionMs(root) : 0;
	const timer = setTimeout(() => onRemove?.(), ms);
	return () => clearTimeout(timer);
});
</script>

<li
	bind:this={root}
	{...rest}
	data-slot="file-upload-item"
	data-status={item.status}
	data-leaving={leaving}
	class={cn(s.item(), classProp)}
>
	<!-- The clip folds to 0; the row's own padding and border could not. -->
	<div class="min-h-0 overflow-hidden">
	<div class={s.row()}>
		<span aria-hidden="true" class={s.thumb()}>
			{#if preview && item.status !== "error"}
				<img src={preview} alt="" class={s.thumbImage()} />
			{:else if item.status === "error"}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 8v5M12 16.5h.01" />
					<path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M14 3v4a1 1 0 0 0 1 1h4" />
					<path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
				</svg>
			{/if}
		</span>
		<span class={s.body()}>
			<span class={s.line()}>
				<span class={s.name()} title={name}>{name}</span>
				<span class={s.meta()}>{meta}</span>
			</span>
			<span class={s.progress()} inert={!uploading}>
				<span class="min-h-0 overflow-hidden">
					<span
						role="progressbar"
						aria-label="{name}, {ctx.labels[statusLabel(item.status)]}"
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={Math.round(clamped)}
						class={cn(s.track(), "block")}
					>
						<span class={cn(s.bar(), "block")} style:scale="{clamped / 100} 1"></span>
					</span>
				</span>
			</span>
		</span>
		<span class={s.actions()}>
			{#if item.status === "error" && onRetry}
				<Button size="icon-xs" variant="ghost" aria-label="{ctx.labels.retry} {name}" onclick={() => onRetry?.()}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4" />
						<path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
					</svg>
				</Button>
			{/if}
			{#if onRemove}
				<Button
					size="icon-xs"
					variant="ghost"
					aria-label="{ctx.labels.remove} {name}"
					disabled={leaving}
					onclick={() => (leaving = true)}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18M6 6l12 12" />
					</svg>
				</Button>
			{/if}
		</span>
	</div>
	</div>
</li>
