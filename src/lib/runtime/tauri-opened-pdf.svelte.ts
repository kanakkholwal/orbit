import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { pdfViewerState } from "$lib/runtime/pdf-viewer-state.svelte";

const OPENED_EVENT = "desktop-opened-pdfs";

let initialized = false;

async function pathsToFiles(paths: string[]): Promise<File[]> {
  const { readFile } = await import("@tauri-apps/plugin-fs");

  const files = await Promise.all(
    paths.map(async (path) => {
      const bytes = await readFile(path);
      const name = path.split(/[\\/]/).pop() || "document.pdf";
      return new File([bytes as BlobPart], name, { type: "application/pdf" });
    })
  );

  return files.filter((file) => file.name.toLowerCase().endsWith(".pdf"));
}

async function handleOpenedPaths(paths: string[]) {
  if (!paths.length) return;

  const files = await pathsToFiles(paths);
  if (!files.length) return;

  await pdfViewerState.addFiles(files);
  await goto("/tools/view-pdf");
}

export async function initTauriOpenedPdfs(): Promise<() => void> {
  if (!browser || initialized) return () => {};
  initialized = true;

  try {
    const [{ invoke }, { listen }] = await Promise.all([
      import("@tauri-apps/api/core"),
      import("@tauri-apps/api/event"),
    ]);

    const initialPaths = await invoke<string[]>("opened_pdf_paths");
    await handleOpenedPaths(initialPaths);

    const unlisten = await listen<string[]>(OPENED_EVENT, async (event) => {
      await handleOpenedPaths(event.payload ?? []);
    });

    return () => {
      unlisten();
      initialized = false;
    };
  } catch (error) {
    console.error("tauri-opened-pdf: init failed", error);
    initialized = false;
    return () => {};
  }
}
