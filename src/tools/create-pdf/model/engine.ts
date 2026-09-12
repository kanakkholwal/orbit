import type { CreatorDoc } from "./types";

let ready: Promise<typeof import("@formepdf/core/pkg-web/forme.js")> | null = null;

/** Loads the Forme WASM engine once, on first use. */
export function loadEngine() {
  ready ??= (async () => {
    const [forme, wasm] = await Promise.all([
      import("@formepdf/core/pkg-web/forme.js"),
      import("@formepdf/core/pkg-web/forme_bg.wasm?url"),
    ]);
    await forme.default({ module_or_path: wasm.default });
    return forme;
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}

/** Renders a creator document to PDF bytes. */
export async function renderDocument(doc: CreatorDoc): Promise<Uint8Array> {
  const [forme, { compileDocument }] = await Promise.all([loadEngine(), import("./compile")]);
  return forme.render_pdf(JSON.stringify(compileDocument(doc)));
}
