import { defineContentScript } from 'wxt/utils/define-content-script';

/**
 * Known PDF tool sites — opening these triggers the side panel just like a
 * raw PDF would, since the user is clearly working with PDFs.
 */
const PDF_TOOL_HOSTNAMES = new Set([
  'smallpdf.com',
  'ilovepdf.com',
  'acrobat.adobe.com',
  'pdfcandy.com',
  'pdf24.org',
  'sodapdf.com',
  'pdfforge.org',
]);

function isPdfContext(): boolean {
  // Native browser PDF renderer sets this content type
  if (document.contentType === 'application/pdf') return true;

  const url = location.href.toLowerCase();

  // Direct .pdf URL (covers file://, http://, blob:, etc.)
  if (url.endsWith('.pdf') || url.includes('.pdf?') || url.includes('.pdf#')) {
    return true;
  }

  // Known PDF tool sites
  try {
    const hostname = new URL(location.href).hostname.replace(/^www\./, '');
    if (PDF_TOOL_HOSTNAMES.has(hostname)) return true;
  } catch {
    // malformed URL — skip
  }

  return false;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    if (!isPdfContext()) return;

    browser.runtime.sendMessage({ type: 'PDF_DETECTED' }).catch(() => {
      // Background service worker may not be ready on first load; ignore.
    });
  },
});
