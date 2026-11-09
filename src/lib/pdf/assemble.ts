import type { AssembleReply, AssembleRequest, PlanPage } from "./assemble.worker";

export type { PlanPage };

/**
 * Builds PDFs from pages of source files in a Web Worker, so the page stays responsive and only the
 * documents still needed are held in memory. Each plan produces one output file.
 */
export function assemblePdfs(sources: Record<string, File>, plans: PlanPage[][], onProgress?: (done: number, total: number) => void): Promise<Uint8Array[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./assemble.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<AssembleReply>) => {
      const msg = event.data;
      if (msg.type === "progress") onProgress?.(msg.done, msg.total);
      else {
        worker.terminate();
        if (msg.type === "done") resolve(msg.outputs);
        else reject(new Error(msg.message));
      }
    };
    worker.onerror = () => {
      worker.terminate();
      reject(new Error("The PDF could not be assembled."));
    };
    const request: AssembleRequest = { sources, plans };
    worker.postMessage(request);
  });
}

export async function assemblePdf(sources: Record<string, File>, plan: PlanPage[], onProgress?: (done: number, total: number) => void): Promise<Uint8Array> {
  return (await assemblePdfs(sources, [plan], onProgress))[0];
}
