import { PdfEngine } from '$lib/pdf-engine.svelte';
import { toast } from 'svelte-sonner';

export interface MetadataSection {
  title: string;
  items: { key: string; value: string; indentLevel: number }[];
  rawString?: string;
}

export class ViewMetadataState extends PdfEngine {
  file = $state<{ file: File; originalSize: number } | null>(null);

  isProcessing = $state(false);

  // The structured metadata to display
  infoDictionary = $state<MetadataSection | null>(null);
  formFields = $state<MetadataSection | null>(null);
  xmpMetadata = $state<MetadataSection | null>(null);

  // Flat record for JSON copy feature
  flatMetadataRecord = $state<Record<string, string>>({});

  // Actions 

  async loadFile(files: File[]) {
    const validFile = files.find(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (!validFile) {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    this.file = { file: validFile, originalSize: validFile.size };
    await this.extractMetadata();
  }

  reset() {
    this.file = null;
    this.isProcessing = false;
    this.infoDictionary = null;
    this.formFields = null;
    this.xmpMetadata = null;
    this.flatMetadataRecord = {};
  }

  //  Processing 

  private async extractMetadata() {
    if (!this.file) return;
    this.isProcessing = true;

    try {


      const arrayBuffer = await this.file.file.arrayBuffer();
      const pdfjs = await this.getPdfJs();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfjsDoc = await loadingTask.promise;

      const [metadataResult, fieldObjects] = await Promise.all([
        pdfjsDoc.getMetadata(),
        pdfjsDoc.getFieldObjects(),
      ]);

      const { info, metadata } = metadataResult;
      const rawXmpString = metadata ? metadata.getRaw() : null;

      this.flatMetadataRecord = {};

      // 1. Parse Info Dictionary
      this.infoDictionary = { title: 'Info Dictionary', items: [] };
      if (info && Object.keys(info).length > 0) {
        for (const key in info) {
          const value = (info as any)[key];
          let displayValue: string;

          if (value === null || typeof value === 'undefined') {
            displayValue = '- Not Set -';
          } else if (typeof value === 'object' && value !== null && 'name' in value) {
            displayValue = String((value as { name: string }).name);
          } else if (typeof value === 'object') {
            try {
              displayValue = JSON.stringify(value);
            } catch {
              displayValue = '[object Object]';
            }
          } else if ((key === 'CreationDate' || key === 'ModDate') && typeof value === 'string') {
            displayValue = this.parsePdfDate(value);
          } else {
            displayValue = String(value);
          }

          this.infoDictionary.items.push({ key, value: displayValue, indentLevel: 0 });
          this.flatMetadataRecord[key] = displayValue;
        }
      }

      // 2. Parse Form Fields
      this.formFields = { title: 'Interactive Form Fields', items: [] };
      if (fieldObjects && Object.keys(fieldObjects).length > 0) {
        for (const fieldName in fieldObjects) {
          const field = (fieldObjects as any)[fieldName][0];
          const value = field.fieldValue || '- Not Set -';
          this.formFields.items.push({ key: fieldName, value: String(value), indentLevel: 0 });
        }
      }

      // 3. Parse XMP Metadata
      this.xmpMetadata = { title: 'XMP Metadata', items: [], rawString: rawXmpString || undefined };
      if (rawXmpString) {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(rawXmpString, 'application/xml');

          const descriptions = xmlDoc.getElementsByTagName('rdf:Description');
          if (descriptions.length > 0) {
            for (let i = 0; i < descriptions.length; i++) {
              this.appendXmpNodes(descriptions[i], 0);
            }
          } else {
            this.appendXmpNodes(xmlDoc.documentElement, 0);
          }
        } catch (xmlError) {
          console.error('Failed to parse XMP XML:', xmlError);
        }
      }

    } catch (e) {
      console.error('Failed to view metadata:', e);
      toast.error('Could not fully analyze the PDF. It may be corrupted or encrypted.');
    } finally {
      this.isProcessing = false;
    }
  }

  //  Helpers 

  private appendXmpNodes(xmlNode: Element, indentLevel: number) {
    if (!this.xmpMetadata) return;
    const xmpDateKeys = ['xap:CreateDate', 'xap:ModifyDate', 'xap:MetadataDate'];
    const childNodes = Array.from(xmlNode.children);

    for (const child of childNodes) {
      if (child.nodeType !== 1) continue;

      let key = child.tagName;
      const elementChildren = Array.from(child.children).filter(c => c.nodeType === 1);

      if (key === 'rdf:li') {
        this.appendXmpNodes(child, indentLevel);
        continue;
      }
      if (key === 'rdf:Alt') {
        key = '(alt container)';
      }

      if (child.getAttribute('rdf:parseType') === 'Resource' && elementChildren.length === 0) {
        this.xmpMetadata.items.push({ key, value: '(Empty Resource)', indentLevel });
        continue;
      }

      if (elementChildren.length > 0) {
        // Header item (no value, just a category)
        this.xmpMetadata.items.push({ key, value: '', indentLevel });
        this.appendXmpNodes(child, indentLevel + 1);
      } else {
        let value = (child.textContent || '').trim();
        if (value) {
          if (xmpDateKeys.includes(key)) {
            // Attempt basic ISO formatting if possible, otherwise leave raw
            try { value = new Date(value).toLocaleString(); } catch { }
          }
          this.xmpMetadata.items.push({ key, value, indentLevel });
        }
      }
    }
  }

  private parsePdfDate(pdfDate: string): string {
    if (!pdfDate.startsWith('D:')) return pdfDate;
    try {
      const year = pdfDate.substring(2, 6);
      const month = pdfDate.substring(6, 8);
      const day = pdfDate.substring(8, 10);
      const hour = pdfDate.substring(10, 12);
      const minute = pdfDate.substring(12, 14);
      const second = pdfDate.substring(14, 16);
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toLocaleString();
    } catch {
      return pdfDate;
    }
  }

  copyAsJson() {
    if (Object.keys(this.flatMetadataRecord).length === 0) return;
    const jsonString = JSON.stringify(this.flatMetadataRecord, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      // Optional: You could add a toast notification here
    });
  }
}