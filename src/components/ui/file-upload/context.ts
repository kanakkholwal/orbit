import { getContext, hasContext, setContext } from "svelte";
import type { FileRejection, FileUploadLabels, UploadFile } from "./core";
import type { FileUploadSize, FileUploadVariant } from "./variants";

export type FileUploadState = {
	files: UploadFile[];
	variant: FileUploadVariant;
	size: FileUploadSize;
	labels: FileUploadLabels;
	disabled: boolean;
	dragging: boolean;
	rejections: FileRejection[];
	maxSize?: number;
	maxFiles?: number;
	hint: string;
	hintId: string;
	compactAt?: number;
	previews: Record<string, string>;
	setDragging: (on: boolean) => void;
	setZone: (el: HTMLButtonElement | undefined) => void;
	browse: () => void;
	take: (list: FileList | null | undefined) => void;
};

const KEY = Symbol("file-upload");
/** The root's state behind getters, so every part reads the latest value. */
export const setFileUpload = (state: FileUploadState) => setContext(KEY, state);
export function fileUploadState(part: string): FileUploadState {
	if (!hasContext(KEY)) throw new Error(`${part} must be used inside <FileUpload>`);
	return getContext<FileUploadState>(KEY);
}
