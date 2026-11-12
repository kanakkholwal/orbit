declare module 'pandoc-wasm/core' {
    export interface PandocResult {
        stdout: string;
        stderr: string;
        files: Record<string, File>;
        mediaFiles: Record<string, Blob>;
    }

    export interface PandocInstance {
        convert(options: Record<string, unknown>, stdin: string | null, files: Record<string, File | Blob>): Promise<PandocResult>;
    }

    /** Starts pandoc from the compiled WebAssembly binary. */
    export function createPandocInstance(wasm: ArrayBuffer): Promise<PandocInstance>;
}
