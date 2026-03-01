import { BaseEngine } from '$lib/base-engine.svelte';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { toast } from 'svelte-sonner';

export interface CustomField {
  id: string;
  key: string;
  value: string;
}

export class EditMetadataState extends BaseEngine {
  file = $state<{ file: File; originalSize: number } | null>(null);
  isProcessing = $state(false);
  pageCount = $state(0);

  // Standard Metadata Fields
  title = $state('');
  author = $state('');
  subject = $state('');
  keywords = $state('');
  creator = $state('');
  producer = $state('');
  creationDate = $state('');
  modDate = $state('');

  // Custom Metadata Fields
  customFields = $state<CustomField[]>([]);

  private pdfDoc: PDFDocument | null = null;

  //  Actions 

  async loadFile(files: File[]) {
    const validFile = files.find(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (!validFile) {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    this.isProcessing = true;
    try {
      const arrayBuffer = await validFile.arrayBuffer();

      // Load document ignoring encryption so we can still attempt to read/write properties
      this.pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        throwOnInvalidObject: false
      });

      this.file = { file: validFile, originalSize: validFile.size };
      this.pageCount = this.pdfDoc.getPageCount();

      this.populateFields();
    } catch (e) {
      console.error("Failed to load PDF:", e);
      toast.error("Failed to read the PDF document.");
      this.reset();
    } finally {
      this.isProcessing = false;
    }
  }

  reset() {
    this.file = null;
    this.pdfDoc = null;
    this.pageCount = 0;
    this.isProcessing = false;

    this.title = '';
    this.author = '';
    this.subject = '';
    this.keywords = '';
    this.creator = '';
    this.producer = '';
    this.creationDate = '';
    this.modDate = '';
    this.customFields = [];
  }

  addCustomField() {
    this.customFields.push({ id: crypto.randomUUID(), key: '', value: '' });
  }

  removeCustomField(id: string) {
    this.customFields = this.customFields.filter(f => f.id !== id);
  }

  //  Processing 

  private populateFields() {
    if (!this.pdfDoc) return;

    this.title = this.pdfDoc.getTitle() || '';
    this.author = this.pdfDoc.getAuthor() || '';
    this.subject = this.pdfDoc.getSubject() || '';
    this.keywords = this.pdfDoc.getKeywords() || '';
    this.creator = this.pdfDoc.getCreator() || '';
    this.producer = this.pdfDoc.getProducer() || '';

    this.creationDate = this.formatDateForInput(this.pdfDoc.getCreationDate());
    this.modDate = this.formatDateForInput(this.pdfDoc.getModificationDate());

    this.customFields = [];

    try {
      // @ts-expect-error getInfoDict is protected but accessible
      const infoDict = this.pdfDoc.getInfoDict();
      const standardKeys = new Set([
        'Title', 'Author', 'Subject', 'Keywords', 'Creator',
        'Producer', 'CreationDate', 'ModDate'
      ]);

      // @ts-expect-error keys() exists on PDFDict
      const allKeys: string[] = infoDict.keys().map(k => k.asString().substring(1));

      for (const key of allKeys) {
        if (!standardKeys.has(key)) {
          const rawValue = infoDict.lookup(PDFName.of(key));
          let displayValue = '';

          if (rawValue) {
            if (typeof (rawValue as any).decodeText === 'function') {
              displayValue = (rawValue as any).decodeText();
            } else if (typeof (rawValue as any).asString === 'function') {
              displayValue = (rawValue as any).asString();
            } else {
              displayValue = String(rawValue);
            }
          }

          this.customFields.push({
            id: crypto.randomUUID(),
            key,
            value: displayValue
          });
        }
      }
    } catch (e) {
      console.warn('Could not read custom metadata fields:', e);
    }
  }

  async save() {
    if (!this.pdfDoc || !this.file) return;


    this.isProcessing = true;
    this.handleProcess(async () => {
      if (!this.pdfDoc) return;
      // Set standard fields
      this.pdfDoc.setTitle(this.title);
      this.pdfDoc.setAuthor(this.author);
      this.pdfDoc.setSubject(this.subject);
      this.pdfDoc.setCreator(this.creator);
      this.pdfDoc.setProducer(this.producer);

      // Keywords are set as a single string, but pdf-lib expects a string array internally sometimes, 
      // though setKeywords accepts a string array, or we can comma split it.
      const kws = this.keywords.split(',').map(k => k.trim()).filter(Boolean);
      this.pdfDoc.setKeywords(kws);

      // Handle Dates
      if (this.creationDate) {
        this.pdfDoc.setCreationDate(new Date(this.creationDate));
      }
      if (this.modDate) {
        this.pdfDoc.setModificationDate(new Date(this.modDate));
      } else {
        this.pdfDoc.setModificationDate(new Date()); // Auto-update mod date if empty
      }

      // Handle Custom Fields
      // @ts-expect-error getInfoDict is protected
      const infoDict = this.pdfDoc.getInfoDict();
      const standardKeys = new Set([
        'Title', 'Author', 'Subject', 'Keywords', 'Creator',
        'Producer', 'CreationDate', 'ModDate'
      ]);

      // 1. Remove existing custom keys to cleanly apply the new state
      // @ts-expect-error keys()
      const allKeys: string[] = infoDict.keys().map(k => k.asString().substring(1));
      for (const key of allKeys) {
        if (!standardKeys.has(key)) {
          infoDict.delete(PDFName.of(key));
        }
      }

      // 2. Add custom fields from UI state
      for (const field of this.customFields) {
        const key = field.key.trim();
        const val = field.value.trim();
        if (key && val) {
          infoDict.set(PDFName.of(key), PDFString.of(val));
        }
      }

      const newPdfBytes = await this.pdfDoc.save();
      const blob = new Blob([newPdfBytes as BlobPart], { type: 'application/pdf' });

      const originalName = this.file?.file.name.replace(/\.pdf$/i, '');
      this.downloadBlob(blob, `${originalName}_metadata-edited.pdf`);

    },{
      loading: "Saving metadata...",
      success: "Metadata saved successfully! Your download should start shortly.",
      error: (e: any) => `Could not save metadata: ${e.message}`
    })
    
  }

  //  Helpers

  private formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  }


}