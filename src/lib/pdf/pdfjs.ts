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
		keepLargestPageCount(lib);
		return lib;
	})().catch((error) => {
		ready = null;
		throw error;
	});
	return ready;
}

/**
 * Workaround (upstream bug, pdfjs-dist 5.4.x): the page count is one global shared by every
 * open document, so loading a shorter file makes getPage reject pages of a longer one.
 * Keep the largest count; the worker still rejects pages a document does not have.
 */
function keepLargestPageCount(lib: typeof PDFJS) {
	const proto = Object.getPrototypeOf(lib.PagesMapper.instance);
	const desc = Object.getOwnPropertyDescriptor(proto, "pagesNumber");
	if (!desc?.get || !desc.set) return;
	const { get, set } = desc;
	Object.defineProperty(proto, "pagesNumber", {
		configurable: true,
		get,
		set(this: unknown, n: number) {
			if (n === 0 || n > get.call(this)) set.call(this, n);
		},
	});
}
