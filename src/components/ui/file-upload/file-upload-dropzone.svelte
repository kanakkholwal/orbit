<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLButtonAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { fileUpload } from "./variants";
import { fileUploadState } from "./context";

let {
	class: classProp,
	children,
	...rest
}: Omit<HTMLButtonAttributes, "children"> & {
	/** Replaces the default icon, title and hint. */
	children?: Snippet;
} = $props();

const ctx = fileUploadState("FileUploadDropzone");
const s = $derived(fileUpload({ variant: ctx.variant, size: ctx.size }));
const compact = $derived(
	ctx.variant === "inline" ||
		(ctx.compactAt !== undefined && ctx.files.length >= ctx.compactAt && !ctx.dragging),
);
let el = $state<HTMLButtonElement>();
$effect(() => ctx.setZone(el));
</script>

<button
	bind:this={el}
	type="button"
	data-slot="file-upload-dropzone"
	data-dragging={ctx.dragging}
	data-compact={compact}
	disabled={ctx.disabled}
	aria-describedby={ctx.hint ? ctx.hintId : undefined}
	class={cn(s.zone(), classProp)}
	onclick={ctx.browse}
	ondragenter={(e) => {
		e.preventDefault();
		ctx.setDragging(true);
	}}
	ondragover={(e) => e.preventDefault()}
	ondragleave={(e) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) ctx.setDragging(false);
	}}
	ondrop={(e) => {
		e.preventDefault();
		ctx.setDragging(false);
		ctx.take(e.dataTransfer?.files);
	}}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true" class={s.zoneIcon()}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
				<path d="M7 9l5-5 5 5" />
				<path d="M12 4v12" />
			</svg>
		</span>
		<span class={s.zoneTitle()}>{ctx.dragging ? ctx.labels.dropping : ctx.labels.title}</span>
		{#if ctx.hint}<span id={ctx.hintId} class={s.zoneHint()}>{ctx.hint}</span>{/if}
	{/if}
</button>
