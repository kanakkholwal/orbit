import type { FileUploadStatus } from "./variants";

/** One file the parent is tracking. The parent owns uploading and updates `progress` (0-100). */
export interface UploadFile {
	id: string;
	file: File;
	progress: number;
	status: FileUploadStatus;
	error?: string;
}

export type FileRejectionReason = "type" | "size" | "count";

export interface FileRejection {
	file: File;
	reason: FileRejectionReason;
}

export interface FileUploadLabels {
	title: string;
	/** `{accept}` and `{size}` are filled from the props; unset parts are dropped. */
	hint: string;
	dropping: string;
	remove: string;
	retry: string;
	queued: string;
	uploading: string;
	done: string;
	failed: string;
	rejectType: string;
	rejectSize: string;
	rejectCount: string;
	/** Polite summary, e.g. "2 of 3 uploaded". */
	summary: string;
}

export const FILE_UPLOAD_LABELS: FileUploadLabels = {
	title: "Drop files or click to browse",
	hint: "{accept} up to {size}",
	dropping: "Release to add",
	remove: "Remove",
	retry: "Retry",
	queued: "Waiting",
	uploading: "Uploading",
	done: "Uploaded",
	failed: "Failed",
	rejectType: "{name} is not an accepted file type.",
	rejectSize: "{name} is larger than {size}.",
	rejectCount: "{name} was not added: the limit is {max} files.",
	summary: "{done} of {total} uploaded",
};

/** `accept` works like the input attribute: extensions, exact types and `type/*`. */
export function acceptsFile(file: File, accept?: string): boolean {
	if (!accept) return true;
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return accept
		.split(",")
		.map((rule) => rule.trim().toLowerCase())
		.filter(Boolean)
		.some((rule) => {
			if (rule.startsWith(".")) return name.endsWith(rule);
			if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
			return type === rule;
		});
}

/** Splits a drop into files to add and files to report, in order. */
export function splitFiles(
	incoming: File[],
	opts: { accept?: string; maxSize?: number; maxFiles?: number; current: number },
): { accepted: File[]; rejected: FileRejection[] } {
	const accepted: File[] = [];
	const rejected: FileRejection[] = [];
	for (const file of incoming) {
		if (!acceptsFile(file, opts.accept)) rejected.push({ file, reason: "type" });
		else if (opts.maxSize !== undefined && file.size > opts.maxSize)
			rejected.push({ file, reason: "size" });
		else if (
			opts.maxFiles !== undefined &&
			opts.current + accepted.length >= opts.maxFiles
		)
			rejected.push({ file, reason: "count" });
		else accepted.push(file);
	}
	return { accepted, rejected };
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const units = ["KB", "MB", "GB"];
	let value = bytes / 1024;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit++;
	}
	return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

const fill = (template: string, values: Record<string, string | number>) =>
	template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

export function rejectionMessage(
	rejection: FileRejection,
	labels: FileUploadLabels,
	opts: { maxSize?: number; maxFiles?: number },
): string {
	const values = {
		name: rejection.file.name,
		size: opts.maxSize === undefined ? "" : formatBytes(opts.maxSize),
		max: opts.maxFiles ?? "",
	};
	if (rejection.reason === "type") return fill(labels.rejectType, values);
	if (rejection.reason === "size") return fill(labels.rejectSize, values);
	return fill(labels.rejectCount, values);
}

/** "PNG, JPG up to 5 MB" from `accept` and `maxSize`; empty when neither is set. */
export function uploadHint(
	labels: FileUploadLabels,
	accept?: string,
	maxSize?: number,
): string {
	const types = accept
		?.split(",")
		.map((rule) => rule.trim().replace(/^\./, "").replace(/\/\*$/, "").toUpperCase())
		.filter(Boolean)
		.join(", ");
	if (!types && maxSize === undefined) return "";
	if (!types) return `Up to ${formatBytes(maxSize ?? 0)}`;
	if (maxSize === undefined) return types;
	return fill(labels.hint, { accept: types, size: formatBytes(maxSize) });
}

export function uploadSummary(files: UploadFile[], labels: FileUploadLabels): string {
	if (!files.length) return "";
	const done = files.filter((f) => f.status === "done").length;
	return fill(labels.summary, { done, total: files.length });
}

export const isImage = (file: File) => file.type.startsWith("image/");

/** The label key for a status: `error` reads as `failed`. */
export const statusLabel = (status: FileUploadStatus) =>
	status === "error" ? "failed" : status;
