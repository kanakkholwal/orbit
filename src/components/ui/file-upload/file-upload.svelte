<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import {
	FILE_UPLOAD_LABELS,
	type FileRejection,
	type FileUploadLabels,
	isImage,
	splitFiles,
	type UploadFile,
	uploadHint,
	uploadSummary,
} from "./core";
import { type FileUploadSize, type FileUploadVariant, fileUpload } from "./variants";
import { setFileUpload } from "./context";

let {
	files,
	onFilesAdded,
	onReject,
	accept,
	maxSize,
	maxFiles,
	multiple = true,
	disabled = false,
	variant = "default",
	size = "default",
	labels: labelsProp,
	compactAt,
	class: classProp,
	children,
	...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "ondrop" | "children"> & {
	/** Files the parent is tracking; it owns uploading and progress. */
	files: UploadFile[];
	/** Accepted files from a drop or the picker, already validated. */
	onFilesAdded: (files: File[]) => void;
	/** Files turned away by `accept`, `maxSize` or `maxFiles`; FileUploadError lists them too. */
	onReject?: (rejections: FileRejection[]) => void;
	/** Same syntax as the input attribute: `"image/*,.pdf"`. */
	accept?: string;
	/** Largest file in bytes. */
	maxSize?: number;
	maxFiles?: number;
	multiple?: boolean;
	disabled?: boolean;
	/** `default`: a roomy drop zone; `inline`: a slim bar from the start. */
	variant?: FileUploadVariant;
	size?: FileUploadSize;
	labels?: Partial<FileUploadLabels>;
	/** Once the list holds this many files, the drop zone folds to a slim bar; a drag brings it back. */
	compactAt?: number;
	children?: Snippet;
} = $props();

const labels = $derived({ ...FILE_UPLOAD_LABELS, ...labelsProp });
const hintId = $props.id();
let input = $state<HTMLInputElement>();
let zone: HTMLButtonElement | undefined;
let dragging = $state(false);
let rejections = $state<FileRejection[]>([]);

// Object URLs for image files, revoked when a file leaves the list or on unmount.
let cache = new Map<string, string>();
const previews = $derived.by(() => {
	const next = new Map<string, string>();
	for (const item of files) {
		if (!isImage(item.file)) continue;
		next.set(item.id, cache.get(item.id) ?? URL.createObjectURL(item.file));
	}
	for (const [id, url] of cache) if (!next.has(id)) URL.revokeObjectURL(url);
	cache = next;
	return Object.fromEntries(next);
});
$effect(() => () => {
	for (const url of cache.values()) URL.revokeObjectURL(url);
	cache.clear();
});

function take(list: FileList | null | undefined) {
	if (!list?.length || disabled) return;
	const { accepted, rejected } = splitFiles(Array.from(list), {
		accept,
		maxSize,
		maxFiles,
		current: files.length,
	});
	rejections = rejected;
	if (rejected.length && zone) {
		// Restart the shake on every refusal.
		zone.dataset.nudge = "false";
		zone.getBoundingClientRect();
		zone.dataset.nudge = "true";
	}
	if (rejected.length) onReject?.(rejected);
	if (accepted.length) onFilesAdded(accepted);
}

setFileUpload({
	get files() {
		return files;
	},
	get variant() {
		return variant;
	},
	get size() {
		return size;
	},
	get labels() {
		return labels;
	},
	get disabled() {
		return disabled;
	},
	get dragging() {
		return dragging;
	},
	get rejections() {
		return rejections;
	},
	get maxSize() {
		return maxSize;
	},
	get maxFiles() {
		return maxFiles;
	},
	get hint() {
		return uploadHint(labels, accept, maxSize);
	},
	hintId,
	get compactAt() {
		return compactAt;
	},
	get previews() {
		return previews;
	},
	setDragging: (on) => (dragging = on),
	setZone: (el) => (zone = el),
	browse: () => input?.click(),
	take,
});
</script>

<div
	data-slot="file-upload"
	data-variant={variant}
	class={cn(fileUpload({ variant, size }).root(), classProp)}
	{...rest}
>
	{@render children?.()}
	<input
		bind:this={input}
		type="file"
		tabindex={-1}
		aria-hidden="true"
		class="sr-only"
		{accept}
		{multiple}
		{disabled}
		onchange={(e) => {
			take(e.currentTarget.files);
			e.currentTarget.value = "";
		}}
	/>
	<p aria-live="polite" class="sr-only">{uploadSummary(files, labels)}</p>
</div>
