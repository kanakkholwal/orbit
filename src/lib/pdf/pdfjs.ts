import type * as PDFJS from "pdfjs-dist";

let ready: Promise<typeof PDFJS> | null = null;

/** Loads pdf.js once per page and points it at the bundled worker. */
export function loadPdfJs(): Promise<typeof PDFJS> {
	ready ??= (async () => {
		const lib = await import("pdfjs-dist");
		if (!lib.GlobalWorkerOptions.workerSrc) {
			lib.GlobalWorkerOptions.workerSrc = new URL(
				"pdfjs-dist/build/pdf.worker.min.mjs",
				import.meta.url,
			).toString();
		}
		return lib;
	})().catch((error) => {
		ready = null;
		throw error;
	});
	return ready;
}
