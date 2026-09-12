import { goto } from "$app/navigation";
import { getTool, type ToolConfig } from "$tools/list";

const PDF_TOOLS = [
	"compress-pdf",
	"merge-pdf",
	"esign-pdf",
	"split-pdf",
	"organize-pdf",
	"pdf-to-docx",
	"pdf-to-img",
	"ocr-pdf",
	"encrypt-pdf",
	"add-watermark-pdf",
	"rotate-pdf",
	"view-pdf",
];
const IMAGE_TOOLS = ["img-to-pdf"];

let pending: { files: File[]; path: string } | null = null;

export type FileKind = "pdf" | "image" | "other";

export function fileKind(file: File): FileKind {
	const name = file.name.toLowerCase();
	if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
	if (file.type.startsWith("image/")) return "image";
	return "other";
}

/** Tools that can open the given files right away, most common first. */
export function suggestTools(files: File[]): ToolConfig[] {
	if (files.length === 0) return [];
	const kinds = new Set(files.map(fileKind));
	if (kinds.size !== 1 || kinds.has("other")) return [];
	const slugs = kinds.has("pdf") ? PDF_TOOLS : IMAGE_TOOLS;
	return slugs
		.map((slug) => getTool(slug))
		.filter((t): t is ToolConfig => t !== null);
}

/** Carries files to a tool; its primary UploadArea picks them up on mount. */
export function openFilesInTool(files: File[], slug: string) {
	const path = `/tools/${slug}`;
	pending = { files, path };
	return goto(path);
}

/** Returns and clears files handed to `path`. Files for another page are dropped. */
export function takePendingFiles(path: string): File[] {
	if (!pending) return [];
	const { files, path: target } = pending;
	pending = null;
	return target === path ? files : [];
}
