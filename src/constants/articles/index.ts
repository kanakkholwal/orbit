import compressPdfForEmail from "./how-to-compress-a-pdf-for-email";
import convertPhotosToPdf from "./how-to-convert-jpg-or-phone-photos-to-pdf";
import addPageNumbers from "./how-to-add-page-numbers-to-a-pdf";
import invoicePdf from "./how-to-make-an-invoice-pdf-for-free";
import ocrScannedPdf from "./how-to-make-a-scanned-pdf-searchable-with-ocr";
import mergePdfWithoutUploading from "./how-to-merge-pdf-files-without-uploading";
import removePdfPassword from "./how-to-remove-a-password-from-a-pdf";
import signPdf from "./how-to-sign-a-pdf-for-free";
import splitPdf from "./how-to-split-a-pdf-into-separate-pages";
import comparison from "./ilovepdf-vs-smallpdf-vs-orbit-private-pdf-tools";
import uploadSafety from "./is-it-safe-to-upload-pdfs-to-online-converters";
import duplicateSlides from "./why-powerpoint-pdf-has-duplicate-slides";

export interface Article {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated?: string;
  readingMinutes: number;
  keywords: string[];
  tools: string[];
  body: string;
}

export const articles: Article[] = [
  comparison,
  addPageNumbers,
  uploadSafety,
  ocrScannedPdf,
  splitPdf,
  invoicePdf,
  duplicateSlides,
  convertPhotosToPdf,
  signPdf,
  removePdfPassword,
  compressPdfForEmail,
  mergePdfWithoutUploading,
];
