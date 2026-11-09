import wordToPdf from "./how-to-convert-word-to-pdf-without-uploading";
import largeCsv from "./how-to-open-a-large-csv-file-without-excel";
import redactPdf from "./how-to-redact-a-pdf-properly";
import hiddenData from "./what-is-hidden-inside-a-pdf-metadata-and-privacy";
import pdfToPowerpoint from "./how-to-convert-a-pdf-to-powerpoint";
import extractTables from "./how-to-extract-tables-from-a-pdf-to-csv-or-excel";
import chromeAi from "./how-to-summarize-a-pdf-privately-with-chrome-built-in-ai";
import cheatSheet from "./pdf-conversion-cheat-sheet-every-format-both-ways";
import markdownReadme from "./how-to-convert-a-markdown-readme-to-pdf";
import pageOrder from "./how-to-rotate-reorder-and-delete-pdf-pages";
import fillForm from "./how-to-fill-in-and-flatten-a-pdf-form";
import htmlPdf from "./how-to-convert-a-web-page-or-html-file-to-pdf";
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
  wordToPdf,
  largeCsv,
  redactPdf,
  hiddenData,
  pdfToPowerpoint,
  extractTables,
  chromeAi,
  cheatSheet,
  markdownReadme,
  pageOrder,
  fillForm,
  htmlPdf,
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
