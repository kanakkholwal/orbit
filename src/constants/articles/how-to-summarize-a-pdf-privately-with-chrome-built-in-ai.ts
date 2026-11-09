import type { Article } from "./index";

const article: Article = {
  slug: "how-to-summarize-a-pdf-privately-with-chrome-built-in-ai",
  title: "How to Summarize or Translate a PDF Privately With Chrome's Built-in AI",
  description:
    "Chrome ships on-device AI for summarizing and translating text. See how it works, what it needs, its limits, and how to use it on a PDF without sending the text to a server.",
  published: "2026-11-09",
  readingMinutes: 6,
  keywords: [
    "summarize pdf with ai",
    "private pdf summarizer",
    "chrome built-in ai",
    "chrome summarizer api",
    "translate pdf offline",
    "on-device ai pdf",
    "summarize pdf without uploading",
  ],
  tools: ["summarize-pdf", "translate-pdf", "ocr-pdf", "pdf-to-text"],
  body: `Most AI summarizers ask you to upload your document to a company's servers. Chrome now includes AI features that run on your own device, which makes it possible to summarize or translate a PDF without sending its text anywhere. This article explains how that works and what to watch for.

## What Chrome's built-in AI is

Chrome offers a set of AI features through the browser itself. According to Chrome's documentation, the Summarizer, Translator and Language Detector APIs are stable from Chrome 138, and the Prompt API is stable from Chrome 148. Other APIs, such as Writer, Rewriter and Proofreader, are still in trials.

The browser manages the AI model. A web page asks the browser to summarize or translate some text, and the browser does the work on your device.

## What you need

- **Desktop Chrome** of a recent version. Other browsers do not have these APIs, and the desktop apps from Orbit do not include them.
- **Enough free space and a capable computer.** Chrome may download its own model the first time you use a feature. This download can be large, and it is done by Chrome, not by Orbit.
- **A PDF with real text.** Scanned PDFs have no text. Run [OCR](/tools/ocr-pdf) first.

## How to use it on a PDF

1. Open [Summarize PDF](/tools/summarize-pdf) or [Translate PDF](/tools/translate-pdf).
2. Turn on **Experimental AI**. It is off by default, and a warning explains the limits.
3. Drop in your PDF.
4. Click **Summarize** or pick a language and click **Translate**.
5. Copy the result or save it as a text file.

If your browser does not support the feature, the tool says so and explains what is missing.

## What stays on your device

Orbit reads the text of the PDF in your browser and hands it to Chrome's on-device model. Orbit does not ship, download or run a model of its own, and it does not send the text to a server. Chrome may need a network connection once, to download its model.

## Limits you should know about

- **It can be wrong.** Summaries can leave out important points or state things the document does not say. Treat the result as a reading aid and check anything that matters against the original.
- **Long documents are split.** The model can only read a limited amount of text at a time. Orbit summarizes the document in pieces and then combines them, so detail can be lost.
- **Translation is plain text.** The result is text, not a PDF that keeps the original layout.
- **Language pairs vary.** Chrome decides which language pairs are available on your device.
- **It is experimental.** Browser AI features change quickly, so behaviour may differ between Chrome versions.

## When not to use it

For contracts, medical records or anything where a mistake has consequences, do not rely on a summary. Use it to decide what to read, not to replace reading.

## Related reading

- [Is it safe to upload PDFs to online converters?](/articles/is-it-safe-to-upload-pdfs-to-online-converters)
- Need plain text for another tool? Use [PDF to Text](/tools/pdf-to-text).
`,
};

export default article;
