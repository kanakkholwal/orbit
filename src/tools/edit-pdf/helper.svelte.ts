import type { InitialDocumentOptions } from '@embedpdf/plugin-document-manager/svelte';

export const EDIT_PDF_STATE_KEY = Symbol('EDIT_PDF_STATE');

export class EditPdfState {
  initialDocuments = $state<InitialDocumentOptions[]>([]);
  hasFiles = $derived(this.initialDocuments.length > 0);

  async addFiles(files: File[]) {
    const docs: InitialDocumentOptions[] = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        return {
          buffer,
          name: file.name,
          autoActivate: true,
        } satisfies InitialDocumentOptions;
      }),
    );
    this.initialDocuments.push(...docs);
  }

  reset() {
    this.initialDocuments = [];
  }
}
