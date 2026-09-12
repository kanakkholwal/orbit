import type { Article } from "./index";

const article: Article = {
  slug: "how-to-convert-jpg-or-phone-photos-to-pdf",
  title: "How to Convert JPG or Phone Photos to PDF",
  description:
    "Turn JPG, PNG or iPhone HEIC photos into a single PDF. Step-by-step guide to page size, margins and order, plus tips for photographing documents clearly.",
  published: "2026-08-21",
  readingMinutes: 5,
  keywords: [
    "convert jpg to pdf",
    "photos to pdf",
    "heic to pdf",
    "iphone photo to pdf",
    "image to pdf free",
    "combine images into one pdf",
    "png to pdf",
    "scan document with phone to pdf",
  ],
  tools: ["img-to-pdf", "compress-pdf", "ocr-pdf", "merge-pdf"],
  body: `A form asks you to "upload as PDF", and all you have is a photo of the document on your phone. Or you have fifteen pictures of receipts and need one file for an expense claim. This guide shows how to convert JPG or phone photos to PDF in a few steps, with the pages in the right order and a sensible page size.

## What you can convert

[Orbit's Image to PDF tool](/tools/img-to-pdf) accepts the image formats you are likely to have:

- **JPG / JPEG**, the usual format for photos from Android phones, cameras and most websites
- **HEIC / HEIF**, the default photo format on recent iPhones
- **PNG**, common for screenshots
- **WebP, GIF, BMP, AVIF and ICO**

You can mix formats in a single PDF, for example a screenshot followed by two iPhone photos.

## How to convert JPG or phone photos to PDF

1. Open [Image to PDF](/tools/img-to-pdf).
2. Drop your images onto the page, or click to choose them. On a phone, tapping the drop area lets you pick from your photo library or files.
3. The images appear as a grid of pages. **Drag them into the order you want.** Need more? Click **Add images**.
4. On the right, choose a **Page size**:
   - **Match each image** makes every page the exact size of its picture. Good for screenshots and artwork.
   - **A4** is standard paper in most countries.
   - **US Letter** is standard in the US and Canada.
   - **US Legal** is taller paper used for some contracts and forms.
5. If you picked a paper size, choose an **Orientation**: Auto, Portrait or Landscape. Auto turns each page to suit its image.
6. Choose **Margins**: None, Small or Large. Margins add white space around each picture, which looks tidier when printed.
7. Click **Create PDF**. The file downloads to your device.

Your photos are converted on your own device. They are not uploaded, which is reassuring when the photos are of ID cards, prescriptions or bank letters.

## Which settings to pick

**For an official form or application:** use A4 or US Letter (whichever is normal where you live), Auto orientation and Small margins. The result looks like a scanned document and prints properly.

**For screenshots or a photo album:** use Match each image with no margins, so nothing is shrunk or padded.

**For receipts:** A4 or US Letter with Small margins works well. Long thin receipts will be scaled to fit the page height.

## How to photograph documents so the PDF is readable

The PDF can only be as good as the photo. A few habits make a big difference:

1. **Use daylight or a bright room.** Avoid the flash, which causes a glare spot in the middle of the page.
2. **Hold the phone directly above the page**, parallel to it. Shooting at an angle makes the page look like a trapezium.
3. **Put the page on a contrasting surface.** White paper on a dark table is easy to see and crop.
4. **Fill the frame** with the document, but leave a small border so no edge gets cut off.
5. **Check sharpness** by zooming in before moving on. Small print should be readable.
6. **Crop before converting** using your phone's photo editor, so the table and your fingers do not end up in the PDF.

Many phones also have a document scanning mode in their camera, notes or files app that straightens pages automatically. Those scans can go straight into Image to PDF too.

## Keep the file size under control

Phone photos are large, often several megabytes each, so a PDF of twenty photos can be too big for an email or an upload form. Two easy fixes:

- **Compress the PDF afterwards** with [Compress PDF](/tools/compress-pdf). Balanced strength usually keeps text readable while shrinking the file a lot. See [how to compress a PDF for email](/articles/how-to-compress-a-pdf-for-email).
- **Take fewer, better photos.** One sharp photo per page beats three blurry ones.

## Make the text searchable

A PDF made from photos contains pictures of text, not text itself. You cannot search it or copy words out of it. To fix that, run it through [OCR PDF](/tools/ocr-pdf), which recognises the words and adds a hidden text layer. Our guide on [making a scanned PDF searchable with OCR](/articles/how-to-make-a-scanned-pdf-searchable-with-ocr) explains how.

## Adding the photos to an existing PDF

If you already have a PDF and want to add photos to the end, convert the photos first, then combine both files with [Merge PDF](/tools/merge-pdf).

## FAQ

### Can I convert iPhone HEIC photos directly?

Yes. HEIC and HEIF files are accepted, so you do not need to convert them to JPG first.

### Will the photo quality drop?

JPG and PNG images go into the PDF without being re-compressed. HEIC photos are converted to high-quality JPG first, which looks the same at normal viewing. Compressing the result is a separate, optional step.

### How many images can I put in one PDF?

There is no fixed limit in Orbit. Very large batches of high-resolution photos can be slow on older phones, because all the work happens on your device.

### Can I convert a PDF back into images?

Yes, use [PDF to Image](/tools/pdf-to-img).

### Do I need to install an app?

No. Image to PDF works in your phone or computer browser. The desktop app is available if you prefer an installed program.
`,
};

export default article;
