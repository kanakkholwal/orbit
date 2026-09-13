import { initializeQpdf } from '$utils/helper';

interface QpdfLike {
    callMain: (args: string[]) => number;
    FS: {
        writeFile: (path: string, data: Uint8Array) => void;
        readFile: (path: string) => Uint8Array;
        unlink: (path: string) => void;
    };
}

/** Thrown when qpdf cannot open a PDF with the given password. */
export class PdfPasswordError extends Error {
    constructor() {
        super('That password did not unlock this file.');
        this.name = 'PdfPasswordError';
    }
}

/** True when pdf.js refused to open a document because it needs a password (or got a wrong one). */
export function isPdfPasswordException(error: unknown): boolean {
    return (error as { name?: string } | null)?.name === 'PasswordException';
}

const ENCRYPT_MARKER = [0x2f, 0x45, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74];

/** Cheap scan for an `/Encrypt` entry. False means the file is certainly not encrypted. */
export function mayBeEncrypted(bytes: Uint8Array): boolean {
    const last = bytes.length - ENCRYPT_MARKER.length;
    outer: for (let i = 0; i <= last; i++) {
        for (let j = 0; j < ENCRYPT_MARKER.length; j++) {
            if (bytes[i + j] !== ENCRYPT_MARKER[j]) continue outer;
        }
        return true;
    }
    return false;
}

function safeUnlink(qpdf: QpdfLike, path: string) {
    try {
        qpdf.FS.unlink(path);
    } catch {}
}

/** Returns a decrypted copy of `bytes`; an empty password removes owner-only locks. Throws PdfPasswordError. */
export async function decryptPdfBytes(bytes: Uint8Array, password = '', qpdf?: QpdfLike): Promise<Uint8Array> {
    const engine: QpdfLike = qpdf ?? (await initializeQpdf());
    const id = Math.random().toString(36).slice(2);
    const inputPath = `/unlock-in-${id}.pdf`;
    const outputPath = `/unlock-out-${id}.pdf`;

    engine.FS.writeFile(inputPath, bytes);
    try {
        const args = password ? [inputPath, `--password=${password}`, '--decrypt', outputPath] : [inputPath, '--decrypt', outputPath];
        let exitCode: number;
        try {
            exitCode = engine.callMain(args);
        } catch {
            exitCode = 2;
        }
        let output: Uint8Array | null = null;
        try {
            output = engine.FS.readFile(outputPath);
        } catch {}
        if (exitCode === 2 || !output || output.length === 0) throw new PdfPasswordError();
        return output;
    } finally {
        safeUnlink(engine, inputPath);
        safeUnlink(engine, outputPath);
    }
}

/** Strips owner-only encryption so pdf-lib writes readable output; other bytes come back unchanged. */
export async function removeOwnerLock(bytes: Uint8Array): Promise<Uint8Array> {
    if (!mayBeEncrypted(bytes)) return bytes;
    try {
        return await decryptPdfBytes(bytes);
    } catch {
        return bytes;
    }
}
