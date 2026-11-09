import { degrees, PDFDocument } from "pdf-lib";

export interface PlanPage {
  src: string;
  page: number;
  /** Extra clockwise rotation in degrees, on top of the page's own. */
  rotate?: number;
}

export interface AssembleRequest {
  sources: Record<string, File>;
  /** One output file per plan. */
  plans: PlanPage[][];
}

export type AssembleReply =
  | { type: "progress"; done: number; total: number }
  | { type: "done"; outputs: Uint8Array[] }
  | { type: "error"; message: string };

const post = (message: AssembleReply, transfer: Transferable[] = []) => postMessage(message, { transfer });

onmessage = async (event: MessageEvent<AssembleRequest>) => {
  try {
    const { sources, plans } = event.data;
    const lastPlan = new Map<string, number>();
    plans.forEach((plan, i) => {
      for (const p of plan) lastPlan.set(p.src, i);
    });
    const open = new Map<string, PDFDocument>();
    const outputs: Uint8Array[] = [];
    const total = plans.reduce((n, p) => n + p.length, 0);
    let done = 0;

    for (let planIndex = 0; planIndex < plans.length; planIndex++) {
      const plan = plans[planIndex];
      const out = await PDFDocument.create();
      let i = 0;
      while (i < plan.length) {
        const src = plan[i].src;
        let j = i;
        while (j < plan.length && plan[j].src === src) j++;
        let doc = open.get(src);
        if (!doc) {
          doc = await PDFDocument.load(await sources[src].arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
          open.set(src, doc);
        }
        const run = plan.slice(i, j);
        const copied = await out.copyPages(doc, run.map((p) => p.page));
        copied.forEach((page, k) => {
          const extra = run[k].rotate ?? 0;
          if (extra) page.setRotation(degrees((page.getRotation().angle + extra) % 360));
          out.addPage(page);
        });
        done += run.length;
        i = j;
        post({ type: "progress", done, total });
      }
      for (const src of new Set(plan.map((p) => p.src))) {
        if ((lastPlan.get(src) ?? -1) <= planIndex) open.delete(src);
      }
      outputs.push(await out.save());
    }
    post({ type: "done", outputs }, outputs.map((o) => o.buffer));
  } catch (error) {
    post({ type: "error", message: error instanceof Error ? error.message : "The PDF could not be assembled." });
  }
};
