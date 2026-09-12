import type { Article } from "./index";

const article: Article = {
  slug: "how-to-make-an-invoice-pdf-for-free",
  title: "How to Make an Invoice PDF for Free",
  description:
    "Create a professional invoice PDF for free from a template: add your details, line items and totals, reuse it for each client, and download with no watermark.",
  published: "2026-08-29",
  readingMinutes: 6,
  keywords: [
    "make an invoice pdf",
    "free invoice template pdf",
    "create invoice pdf",
    "invoice maker no sign up",
    "freelance invoice pdf",
    "what to include on an invoice",
    "invoice without watermark",
  ],
  tools: ["create-pdf", "encrypt-pdf", "esign-pdf", "merge-pdf"],
  body: `Freelancers, small businesses and people selling the odd item all need to send an invoice sooner or later. You do not need accounting software for that. This guide shows how to make an invoice PDF for free from a template, reuse it for the next client, and send a clean file with no watermark and no account.

## What to put on an invoice

Requirements depend on your country, your tax registration and your industry, so check the rules that apply to you. Most invoices include:

- **Your details**: business or trading name, address, email, and any registration or tax number you are required to show
- **Your client's details**: name and billing address
- **A unique invoice number**, ideally in a sequence you can keep track of (for example 2026-001, 2026-002)
- **Issue date and due date**
- **Line items**: what you supplied, quantity or hours, rate and amount
- **Subtotal, tax (if you charge it) and total due**, with the currency
- **Payment details**: bank transfer details, a payment link, or other accepted methods
- **Payment terms**, such as how many days the client has to pay

## How to make an invoice PDF for free

1. Open [Create PDF](/tools/create-pdf).
2. Under **Start from a template**, pick **Invoice** (a classic layout with payment details) or **Modern invoice** (a bold amount due and a space for a payment QR code). You can filter templates by group, such as Business.
3. The editor opens with sample content. Click any block on the page to edit it in the panel. For example, click the letterhead to change the business name, contact details and add your logo.
4. Edit the line items in the **Table** block. If you keep your hours or products in a spreadsheet, copy the cells and paste them in. The first line becomes the header row.
5. Update the **Totals** block with your subtotal, tax and total due. These are typed values, so double-check the maths (a quick sum in a calculator or spreadsheet is enough).
6. Edit the payment details and the fine print with your own bank information and terms.
7. Click **Preview** to see the exact PDF with real page breaks.
8. Click **Download PDF**.

## Reuse the invoice with fields

The templates use **fields**: placeholders written in double braces, like {{client}} or {{number}}. Anywhere a field appears in the document, it is replaced with the value you type in the **Fields** panel.

That makes reuse easy. For the next invoice, change the client, number, date and due date in one place, and every mention updates at once, including the footer. You can add your own fields by typing any name in double braces.

Two helpful details:

- Switch off **Show values on the page** when you want to edit the placeholders themselves.
- Empty fields stay visible in the PDF, so an invoice does not go out with a silently missing client name.

## Customise the look

Open the **Document** settings to change:

- **Page**: paper size (A4, A5, US Letter, US Legal) and orientation
- **Margins**: Narrow, Normal or Wide
- **Theme** and **Accent colour**, to match your brand
- **Header** and **Footer** text on every page, and **Page numbers**
- **Watermark** text, useful for marking a quote or proforma as DRAFT

Need something the template does not have? Use **Add block** to insert blocks such as Details, From and to, Callout, QR code or Signatures. Blocks can be moved up or down or duplicated from the block panel.

## Keep your drafts

Your work is saved as a draft on your device automatically. Next time you open Create PDF, it appears under **Continue editing**. To back up a template or move it to another computer, use **Save draft as file** from the more actions menu.

Because drafts are stored in your browser's storage, clearing site data for Orbit will remove them. Save a draft file for anything you rely on.

## Before you send it

1. **Check the numbers again.** Totals are not calculated for you.
2. **Name the file clearly**, for example "Invoice 2026-014 Northwind.pdf". Clients searching their inbox will thank you.
3. **Add a signature if your client needs one**, using [Sign PDF (eSign)](/tools/esign-pdf). See [how to sign a PDF for free](/articles/how-to-sign-a-pdf-for-free).
4. **Attach supporting documents**, such as receipts for expenses, by combining them with [Merge PDF](/tools/merge-pdf).
5. **Protect it if it contains sensitive details.** [Encrypt PDF](/tools/encrypt-pdf) adds a password. Share the password separately.
6. **Keep a copy** in a folder for your records. Many tax authorities expect invoices to be kept for several years.

## Other documents from the same tool

The same editor has templates for a **Quote**, **Receipt**, **Packing slip**, **Business letter** and more, so your paperwork can share one consistent style.

## FAQ

### Is it really free, with no watermark?

Yes. Create PDF does not require an account and does not add a watermark. The only watermark is one you add yourself in the settings.

### Does the tool calculate tax and totals?

No. Totals and tax are values you type. Work them out first, then enter them.

### Where is my invoice data stored?

On your device. Drafts are kept in your browser's local storage and the PDF is built locally. Nothing is uploaded.

### Can I add my logo?

Yes. Click the letterhead block and add an image in the Logo field.

### Is a PDF invoice legally valid?

In many places a PDF invoice is accepted, but rules on content, numbering and electronic invoicing vary. Check the requirements for your country, or ask an accountant.
`,
};

export default article;
