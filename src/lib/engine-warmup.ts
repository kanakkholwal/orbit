import { browser } from "$app/environment";

export type EngineId =
	| "pdfjs"
	| "qpdf"
	| "pymupdf"
	| "jszip"
	| "forge"
	| "signpdf"
	| "forme";

const loaders: Record<EngineId, () => Promise<unknown>> = {
	pdfjs: async () => {
		const { loadPdfJs } = await import("./pdf/pdfjs");
		return loadPdfJs();
	},
	qpdf: async () => {
		const { initializeQpdf } = await import("$utils/helper");
		return initializeQpdf();
	},
	pymupdf: async () => {
		const { loadPyMuPDF } = await import("$utils/pymupdf-loader");
		return loadPyMuPDF();
	},
	jszip: () => import("jszip"),
	forge: () => import("node-forge"),
	signpdf: () =>
		Promise.all([
			import("@signpdf/signpdf"),
			import("@signpdf/signer-p12"),
			import("@signpdf/placeholder-pdf-lib"),
		]),
	forme: async () => {
		const { loadEngine } = await import("$tools/create-pdf/model/engine");
		return loadEngine();
	},
};

/** Engines each tool loads on demand, warmed once its body is on screen. */
const toolEngines: Record<string, EngineId[]> = {
	"add-watermark-pdf": [],
	"bates-numbering": ["jszip"],
	"bookmark-pdf": ["pdfjs"],
	"compare-pdf": ["pdfjs"],
	"compress-pdf": ["pdfjs", "pymupdf", "jszip"],
	"create-pdf": ["forme", "pdfjs"],
	"crop-pdf": ["pdfjs", "qpdf"],
	"decrypt-pdf": ["qpdf"],
	"delete-pages": ["pdfjs"],
	"deskew-pdf": ["pymupdf", "jszip"],
	"divide-pages": ["pdfjs"],
	"encrypt-pdf": ["qpdf"],
	"esign-pdf": ["pdfjs"],
	"excel-to-pdf": ["jszip"],
	"extract-images": ["pymupdf", "jszip"],
	"extract-pages": ["jszip"],
	"fill-pdf-form": ["pdfjs"],
	"flatten-pdf": ["jszip"],
	"insert-blank-pages": ["pdfjs"],
	"linearize-pdf": ["qpdf", "jszip"],
	"merge-pdf": ["pdfjs"],
	"multi-pdf": ["pdfjs", "jszip"],
	"organize-pdf": ["pdfjs", "qpdf"],
	"overlay-pdf": ["pdfjs"],
	"pdf-attachments": ["jszip"],
	"pdf-color-filters": ["pdfjs"],
	"pdf-for-ai": ["pymupdf", "jszip"],
	"pdf-to-docx": ["pymupdf", "jszip"],
	"pdf-to-excel": ["pymupdf", "jszip"],
	"pdf-to-img": ["pdfjs", "qpdf", "jszip"],
	"pdf-to-md": ["pdfjs"],
	"pdf-to-text": ["pymupdf", "jszip"],
	"rasterize-pdf": ["pdfjs"],
	"read-pdf-aloud": ["pdfjs"],
	"remove-blank-pages": ["pdfjs"],
	"repair-pdf": ["qpdf", "jszip"],
	"reverse-pages": ["jszip"],
	"rotate-pdf": ["pdfjs", "qpdf"],
	"sign-pdf": ["signpdf", "forge"],
	"split-pdf": ["pdfjs", "jszip"],
	"strip-pdf": ["jszip"],
	"txt-to-pdf": ["pymupdf"],
	"validate-signature-pdf": ["forge"],
	"view-metadata": ["pdfjs"],
};

const warmed = new Set<EngineId>();

/** Remote engines stay cold on a metered or offline connection. */
const remoteEngines: EngineId[] = ["pymupdf"];

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function connectionIsFrugal() {
	const connection = (
		navigator as Navigator & { connection?: NetworkInformation }
	).connection;
	if (!connection) return false;
	return (
		connection.saveData === true ||
		connection.effectiveType === "slow-2g" ||
		connection.effectiveType === "2g"
	);
}

function whenIdle(run: () => void) {
	if (typeof requestIdleCallback === "function") {
		const handle = requestIdleCallback(run, { timeout: 2000 });
		return () => cancelIdleCallback(handle);
	}
	const handle = setTimeout(run, 300);
	return () => clearTimeout(handle);
}

/**
 * Loads a tool's engines in the background so its first run is not the one
 * paying for the WASM download. Returns a cancel function for the idle wait.
 * Remote engines wait for `includeRemote`, since PyMuPDF pulls tens of MB.
 */
export function warmEnginesForTool(slug: string, includeRemote = false) {
	const engines = toolEngines[slug]?.filter(
		(engine) => includeRemote || !remoteEngines.includes(engine),
	);
	if (!browser || !engines?.length || connectionIsFrugal()) return () => {};

	return whenIdle(() => {
		for (const engine of engines) {
			if (warmed.has(engine)) continue;
			if (remoteEngines.includes(engine) && navigator.onLine === false) continue;
			warmed.add(engine);
			loaders[engine]().catch(() => {
				warmed.delete(engine);
			});
		}
	});
}

/** Warms the engines for the tool at a `/tools/<slug>` path, remote ones included. */
export function warmEnginesForPath(pathname: string) {
	const slug = pathname.startsWith("/tools/") ? pathname.slice(7) : "";
	if (slug) warmEnginesForTool(slug, true);
}
