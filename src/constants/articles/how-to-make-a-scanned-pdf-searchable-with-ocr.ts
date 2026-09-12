import type { Article } from "./index";

const article: Article = {
  slug: "how-to-make-a-scanned-pdf-searchable-with-ocr",
  title: "How to Make a Scanned PDF Searchable With OCR",
  description:
    "Can't search or copy text in a scanned PDF? Learn what OCR does, how to make a scanned PDF searchable, and which settings give the most accurate results.",
  published: "2026-09-05",
  readingMinutes: 6,
  keywords: [
    "make scanned pdf searchable",
    "ocr pdf",
    "scanned pdf to text",
    "copy text from scanned pdf",
    "searchable pdf free",
    "ocr pdf without uploading",
    "text recognition pdf",
    "ocr accuracy tips",
  ],
  tools: ["ocr-pdf", "compress-pdf", "pdf-to-text", "img-to-pdf"],
  body: `You press Ctrl+F in a scanned contract and nothing is found, even though the word is right there on the page. You try to copy a paragraph and end up selecting the whole page as a picture. That happens because a scan is an image of text, not text. The fix is OCR. This guide explains how to make a scanned PDF searchable with OCR, and how to get the most accurate result.

## What OCR actually does

OCR stands for optical character recognition. Software looks at the image of each page, works out which shapes are letters and words, and turns them into real text.

In a searchable PDF, that recognised text is placed as an invisible layer lined up with the words in the image. The page looks the same as before, but now you can:

- Search for words with Ctrl+F (or Cmd+F on a Mac)
- Select and copy text
- Let screen readers read the document aloud
- Find the file by its contents in your computer's search, depending on your system

## How to tell whether a PDF needs OCR

Open the PDF and try to select a single word with your cursor. If you can highlight individual words, the PDF already has text and does not need OCR. If you can only draw a box, or nothing highlights at all, it is an image-only scan.

Files from scanners, fax services, phone scanning apps and [photos converted to PDF](/articles/how-to-convert-jpg-or-phone-photos-to-pdf) are usually image-only.

## How to make a scanned PDF searchable with OCR

1. Open [OCR PDF](/tools/ocr-pdf).
2. Drop in your scanned PDF.
3. Under **Languages**, search for and pick **every language that appears in the document**. A letter in French with an English address block needs both.
4. Choose the **Detail** level:
   - **Standard**: faster, fine for clear printed pages
   - **High**: recommended for most scans
   - **Very high**: slower, helps with small or faint text
5. Optionally switch on **Boost contrast** under Clean-up. It turns pages black and white before reading, which helps with grey or uneven scans.
6. Optionally limit the **Characters to look for** (see below).
7. Click **Make text searchable** and wait while each page is read. Progress is shown as it works.
8. When it finishes, download the **PDF**, the **plain text**, or both.

Recognition runs on your device, so the document is not uploaded. The first time you use a language, Orbit may need an internet connection to fetch that language's recognition data. Your file stays on your device either way.

## Settings that improve accuracy

### Pick the right languages

This matters more than anything else. OCR guesses words using what it knows about a language. Choosing the wrong one produces nonsense, and leaving out a second language garbles those sections. Only add languages that are actually present, though, since extra ones can slow things down.

### Match the detail to the scan

Standard is fine for crisp office documents. For small print, footnotes, faded receipts or low-resolution scans, use High or Very high. Higher detail takes longer, particularly on long documents or slower devices.

### Limit the characters on forms and receipts

If a document only contains certain kinds of characters, telling OCR that stops it misreading, for example, a zero as the letter O. Options include **Numbers only**, **Numbers and currency**, **Letters only**, **Invoices and receipts**, or **Custom**, where you type exactly which characters to look for. Use **Any character** for normal documents.

### Start with a better scan

OCR cannot read what it cannot see. If you are scanning yourself:

- Scan at a sensible resolution. 300 dpi is a common recommendation for text.
- Keep pages straight. If they came out tilted, straighten them with [Deskew PDF](/tools/deskew-pdf) first.
- Avoid shadows and curved pages from thick books.
- Clean the scanner glass. Specks can become stray punctuation.

## What to expect from the result

**OCR is not perfect.** Clean printed text is often recognised very well. Handwriting, unusual fonts, stamps, tables and poor-quality scans produce more mistakes. Always check important details such as names, amounts and dates against the image.

**The file may grow.** The searchable PDF is rebuilt with page images and the new text layer, so it can be larger than the original. If size matters, run it through [Compress PDF](/tools/compress-pdf) using the **Optimize** method, which keeps text selectable. Avoid the Flatten method here, because it turns pages back into images without a text layer.

**Layout is not rebuilt.** A searchable PDF looks like the original scan. If you want an editable document, try [PDF to Docx](/tools/pdf-to-docx) on the OCR result, and expect to tidy up formatting.

## What to do with the text

- **Paste it somewhere else.** The downloaded text file works in any notes app or email.
- **Feed it to other tools.** Once text exists, [PDF to Text](/tools/pdf-to-text) and [PDF for AI](/tools/pdf-for-ai) can work with the document.
- **Archive it.** Searchable scans are much easier to find years later.

## FAQ

### Can OCR read handwriting?

It can sometimes pick up very neat block capitals, but it is designed for printed text. Expect poor results on joined-up handwriting.

### How long does OCR take?

It depends on page count, the detail level and your device. A few pages are usually quick. A long book at Very high detail can take a while.

### Does OCR change how my document looks?

No. The page images stay as they are. The recognised text is invisible and sits underneath.

### Is my document uploaded for OCR?

No. The text is recognised on your own device.

### Why are some words still not found when I search?

They were probably misread. Try High or Very high detail, turn on Boost contrast, and check that the right languages are selected.
`,
};

export default article;
