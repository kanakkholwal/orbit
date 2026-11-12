import { browser } from "$app/environment";
import { config } from "$constants/app";
import { getTool } from "$tools/list";

export type EngineId =
	| "pdfjs"
	| "qpdf"
	| "pymupdf"
	| "jszip"
	| "forge"
	| "signpdf"
	| "forme"
	| "mediabunny"
	| "heic2any"
	| "pandoc";

const loaders: Record<EngineId, () => Promise<unknown>> = {
	// Downloaded in full so the service worker stores it; it is only started when a document is converted.
	pandoc: async () => {
		const { PANDOC_WASM_URL } = await import("$lib/docs/convert");
		const response = await fetch(PANDOC_WASM_URL);
		if (!response.ok) throw new Error("pandoc download failed");
		await response.blob();
	},
	mediabunny: () =>
		Promise.all([
			import("mediabunny"),
			import("@mediabunny/mp3-encoder"),
			import("@mediabunny/flac-encoder"),
		]),
	heic2any: () => import("heic2any"),
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

/** Image and media tools share engines, so their slugs are mapped by menu group. */
function enginesFor(slug: string): EngineId[] | undefined {
	if (toolEngines[slug]) return toolEngines[slug];
	const category = getTool(slug)?.category;
	if (category === "media") return ["mediabunny", "jszip"];
	if (category === "images") return ["heic2any", "jszip"];
	return undefined;
}

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
	const engines = enginesFor(slug)?.filter(
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

const RECORD_KEY = "orbit:offline-pack";
/** Engines downloaded under an older app version are treated as missing. */
const BUILD = config.appVersion;

interface OfflineRecord {
	build: string;
	engines: Partial<Record<EngineId, number>>;
}

function readRecord(): OfflineRecord {
	try {
		const raw = JSON.parse(localStorage.getItem(RECORD_KEY) ?? "null") as OfflineRecord | null;
		if (raw && raw.build === BUILD) return raw;
	} catch {
		/* unreadable record: start again */
	}
	return { build: BUILD, engines: {} };
}

function writeRecord(record: OfflineRecord) {
	try {
		localStorage.setItem(RECORD_KEY, JSON.stringify(record));
	} catch {
		/* storage unavailable: the next check just reports less */
	}
}

/** Forgets what was downloaded, for example after the caches are cleared. */
export function clearOfflineRecord() {
	if (!browser) return;
	try {
		localStorage.removeItem(RECORD_KEY);
	} catch {
		/* nothing stored */
	}
	warmed.clear();
}

export interface OfflineStatus {
	done: number;
	total: number;
	ready: boolean;
	/** When the most recent engine finished downloading. */
	at?: number;
}

/** What is stored on this device, checked against the cache for the large engine. */
export async function offlineStatus(): Promise<OfflineStatus> {
	const ids = Object.keys(loaders) as EngineId[];
	if (!browser) return { done: 0, total: ids.length, ready: false };
	const record = readRecord();
	if (record.engines.pandoc) {
		const { isPandocCached } = await import("$lib/docs/convert");
		if (!(await isPandocCached())) {
			delete record.engines.pandoc;
			writeRecord(record);
		}
	}
	const times = ids.map((id) => record.engines[id]).filter((v): v is number => typeof v === "number");
	return { done: times.length, total: ids.length, ready: times.length === ids.length, at: times.length ? Math.max(...times) : undefined };
}

/**
 * Downloads every engine that is not already stored, so all tools work offline. Engines recorded
 * for this app version are skipped unless `force` is set. Reports each engine as it settles.
 */
export async function warmAllEngines(onProgress: (done: number, total: number) => void, force = false) {
	const ids = Object.keys(loaders) as EngineId[];
	const record = force ? { build: BUILD, engines: {} as OfflineRecord["engines"] } : readRecord();
	let done = 0;
	for (const id of ids) {
		if (!record.engines[id]) {
			try {
				await loaders[id]();
				warmed.add(id);
				record.engines[id] = Date.now();
				writeRecord(record);
			} catch {
				/* offline or blocked: the engine downloads when first used */
			}
		}
		onProgress(++done, ids.length);
	}
}
