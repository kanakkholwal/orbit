import type { InitialDocumentOptions } from "@embedpdf/plugin-document-manager/svelte";

const PDF_MIME = "application/pdf";

function isPdfFile(file: File) {
  return file.type === PDF_MIME || file.name.toLowerCase().endsWith(".pdf");
}

async function filesToDocuments(files: File[]): Promise<InitialDocumentOptions[]> {
  return Promise.all(
    files
      .filter(isPdfFile)
      .map(async (file) => {
        const buffer = await file.arrayBuffer();
        return {
          buffer,
          name: file.name,
          autoActivate: true,
        } satisfies InitialDocumentOptions;
      })
  );
}

export class PdfViewerState {
  initialDocuments = $state<InitialDocumentOptions[]>([]);
  incomingDocuments = $state<InitialDocumentOptions[]>([]);
  viewerMounted = $state(false);
  hasDocuments = $derived(
    this.initialDocuments.length > 0 || this.incomingDocuments.length > 0
  );

  async addFiles(files: File[]) {
    const documents = await filesToDocuments(files);
    if (!documents.length) return;

    if (this.viewerMounted) {
      this.incomingDocuments.push(...documents);
      return;
    }

    this.initialDocuments.push(...documents);
  }

  reset() {
    this.initialDocuments = [];
    this.incomingDocuments = [];
  }
}

export const pdfViewerState = new PdfViewerState();
