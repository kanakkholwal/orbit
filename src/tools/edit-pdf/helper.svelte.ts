import { formatBytes } from '$utils/helper';

export interface EditorFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

export interface EditPdfStateData {
  files: EditorFile[];
  pendingFiles: File[];
  isEditorReady: boolean;
  activeDocId: string | null;
  isLoading: boolean;
}

export class EditPdfState {
  state = $state<EditPdfStateData>({
    files: [],
    pendingFiles: [],
    isEditorReady: false,
    activeDocId: null,
    isLoading: false
  });

  private viewerInstance: any = null;
  private docManager: any = null;
  private exportPlugin: any = null;


  queueFiles(files: File[]) {
    // Pushing to pending triggers the UI switch to Editor View
    this.state.pendingFiles.push(...files);
  }

  async initEditor(container: HTMLElement) {
    // 1. Prevent double-init and SSR errors
    if (typeof window === 'undefined' || !container || this.viewerInstance) return;

    this.state.isLoading = true;

    try {
      const { default: EmbedPDF } = await import('@embedpdf/snippet');

      this.viewerInstance = await EmbedPDF.init({
        type: 'container',
        target: container,
        worker: true,
        wasmUrl: '/pdfium.wasm', // Ensure this file is in /static folder
        documentManager: { maxDocuments: 10 },
        tabBar: 'always',
      });

      const registry = await this.viewerInstance.registry;
      this.docManager = registry.getPlugin('document-manager').provides();

      // Setup listeners
      this.docManager.onDocumentOpened((data: any) => {
        this.state.activeDocId = data?.id;
      });

      this.state.isEditorReady = true;
      await this.processPendingQueue();
    } catch (e) {
      console.error("PDF Editor Init Failed:", e);
    } finally {
      this.state.isLoading = false;
    }
  }

  async processPendingQueue() {
    if (!this.docManager || this.state.pendingFiles.length === 0) return;

    const queue = [...this.state.pendingFiles];
    this.state.pendingFiles = [];

    for (const file of queue) {
      await this.openDocument(file);
    }
  }

  async addFiles(files: File[]) {
    if (!this.state.isEditorReady) {
      this.queueFiles(files);
    } else {
      for (const file of files) {
        await this.openDocument(file);
      }
    }
  }

  private async openDocument(file: File) {
    try {
      const buffer = await file.arrayBuffer();
      const docInfo = await this.docManager.openDocumentBuffer({
        buffer,
        name: file.name,
        autoActivate: true
      });

      const docId = docInfo?.id || docInfo;

      this.state.files.push({
        id: docId,
        file: file,
        name: file.name,
        size: formatBytes(file.size)
      });
    } catch (e) {
      console.error("Failed to open file", file.name, e);
    }
  }

  async closeDocument(id: string) {
    if (this.docManager) {
      await this.docManager.closeDocument(id);
    }
  }

  private handleExternalClose(id: string) {
    this.state.files = this.state.files.filter(f => f.id !== id);
    if (this.state.activeDocId === id) {
      this.state.activeDocId = null;
    }
  }

  async downloadActivePdf() {
    if (!this.exportPlugin) return;
    this.state.isLoading = true;
    try {
      const arrayBuffer = await this.exportPlugin.saveAsCopy().toPromise();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      const activeFile = this.state.files.find(f => f.id === this.state.activeDocId);
      const name = activeFile ? `edited_${activeFile.name}` : 'edited_document.pdf';

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to download PDF.");
    } finally {
      this.state.isLoading = false;
    }
  }
}