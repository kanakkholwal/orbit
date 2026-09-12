import { PDFDocument } from 'pdf-lib';

export interface QpdfLike {
    callMain: (args: string[]) => number;
    FS: {
        writeFile: (path: string, data: Uint8Array) => void;
        readFile: (path: string) => Uint8Array;
        unlink: (path: string) => void;
    };
}

export type RepairOutcome = 'healthy' | 'repaired' | 'locked' | 'failed';

export interface RepairResult {
    outcome: RepairOutcome;
    bytes?: Uint8Array;
    pages?: number;
}

const QPDF_OK = 0;
const QPDF_WARNINGS = 3;
let runId = 0;

function runQpdf(qpdf: QpdfLike, input: Uint8Array): { code: number; bytes?: Uint8Array } {
    const id = runId++;
    const inPath = `/repair_in_${id}.pdf`;
    const outPath = `/repair_out_${id}.pdf`;
    let code = -1;
    let bytes: Uint8Array | undefined;
    try {
        qpdf.FS.writeFile(inPath, input);
        try {
            code = qpdf.callMain([inPath, outPath]);
        } catch (e) {
            code = typeof (e as { status?: unknown })?.status === 'number' ? (e as { status: number }).status : -1;
        }
        if (code === QPDF_OK || code === QPDF_WARNINGS) {
            const out = qpdf.FS.readFile(outPath);
            if (out.length > 0) bytes = new Uint8Array(out);
        }
    } catch (e) {
        console.warn('repair-pdf: qpdf pass failed', e);
    } finally {
        for (const path of [inPath, outPath]) {
            try {
                qpdf.FS.unlink(path);
            } catch {}
        }
    }
    return { code, bytes };
}

async function countPages(bytes: Uint8Array): Promise<number | undefined> {
    try {
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
        return doc.getPageCount();
    } catch {
        return undefined;
    }
}

function cutAfterLastObject(bytes: Uint8Array): Uint8Array | undefined {
    const text = new TextDecoder('latin1').decode(bytes);
    const end = text.lastIndexOf('endobj');
    if (end < 0) return undefined;
    return bytes.slice(0, end + 'endobj'.length);
}

async function loadLeniently(bytes: Uint8Array): Promise<PDFDocument | undefined> {
    const options = { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false, capNumbers: true };
    for (const candidate of [bytes, cutAfterLastObject(bytes)]) {
        if (!candidate) continue;
        try {
            return await PDFDocument.load(candidate, options);
        } catch (e) {
            console.warn('repair-pdf: lenient load failed', e);
        }
    }
    return undefined;
}

/** Rewrites a PDF with qpdf when it can, then rebuilds it object by object with pdf-lib. */
export async function repairBytes(input: Uint8Array, qpdf: QpdfLike | null): Promise<RepairResult> {
    if (qpdf) {
        const first = runQpdf(qpdf, input);
        if (first.bytes) {
            const pages = await countPages(first.bytes);
            if (pages) return { outcome: first.code === QPDF_OK ? 'healthy' : 'repaired', bytes: first.bytes, pages };
        }
    }

    const doc = await loadLeniently(input);
    if (!doc) return { outcome: 'failed' };
    if (doc.isEncrypted) return { outcome: 'locked' };

    let pages = 0;
    try {
        pages = doc.getPageCount();
    } catch {
        return { outcome: 'failed' };
    }
    if (pages === 0) return { outcome: 'failed' };

    let bytes: Uint8Array = await doc.save({ updateFieldAppearances: false });
    if (qpdf) {
        const tidy = runQpdf(qpdf, bytes);
        if (tidy.bytes && (await countPages(tidy.bytes)) === pages) bytes = tidy.bytes;
    }
    const check = await countPages(bytes);
    if (!check) return { outcome: 'failed' };
    return { outcome: 'repaired', bytes, pages: check };
}
