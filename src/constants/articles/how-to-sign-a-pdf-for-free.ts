import type { Article } from "./index";

const article: Article = {
  slug: "how-to-sign-a-pdf-for-free",
  title: "How to Sign a PDF for Free (E-Signature or Digital Signature)",
  description:
    "Sign a PDF for free by drawing, typing or adding your signature, or by applying a certificate-based digital signature. Learn which one your document needs.",
  published: "2026-08-17",
  readingMinutes: 6,
  keywords: [
    "sign a pdf for free",
    "electronic signature pdf",
    "digital signature pdf",
    "draw signature on pdf",
    "sign pdf without printing",
    "certificate signature pdf",
    "e-sign pdf no account",
  ],
  tools: ["esign-pdf", "sign-pdf", "validate-signature-pdf", "create-pdf"],
  body: `Printing a document, signing it with a pen, and scanning it back in is slow, and the result often looks crooked. You can sign a PDF for free on your computer or phone instead. Before you start, though, it helps to know that "signing a PDF" can mean two quite different things. This guide explains both and shows how to do each one.

## E-signature vs digital signature

### Drawn or typed e-signature

This is the picture of your signature placed on the page, the digital equivalent of pen on paper. You draw it with a mouse, finger or stylus, type your name, or use a photo of your real signature.

It is quick and familiar, and it is what most everyday paperwork needs: a tenancy form, a school permission slip, a freelance contract, an HR document. On its own, though, it is only an image. Anyone could copy it, and the PDF cannot prove who placed it or whether the document changed afterwards.

### Certificate-based digital signature

A digital signature uses cryptography. The PDF is sealed with a certificate, a small file that identifies the signer. Signature checkers can then tell whether the document has been changed since it was signed, and whose certificate was used.

Whether the signer's identity is trusted depends on where the certificate came from. A certificate issued by your company or a recognised certificate provider can be verified by other people's software. A certificate you create yourself still shows tampering, but checkers will report that your identity is not verified.

### Which one do you need?

- If someone just asked you to "sign and send back", a drawn e-signature is usually what they expect.
- If the organisation mentions a certificate, a signing ID, a .p12 or .pfx file, or "advanced" or "qualified" signatures, you need a digital signature, and often a certificate from a specific provider.
- For legally sensitive documents, check what the recipient accepts. Rules on electronic signatures differ between countries and document types, and this article is not legal advice.

## How to sign a PDF for free with a drawn signature

1. Open [Sign PDF (eSign)](/tools/esign-pdf).
2. Drop in the PDF you need to sign.
3. Create your signature. Choose **Draw** to sign with your mouse, finger or pen, **Type** to write your name in a signature style, or **Image** to use a picture of your signature.
4. Your signature appears on the page. Drag it into position, or use the arrow keys for fine adjustments.
5. Use the page arrows to move to the page that needs signing, usually the last one.
6. Adjust the **Size** so it fits the signature line.
7. Click **Save signed PDF**. The signed copy downloads to your device.

**Tip for a good image signature:** sign in dark ink on plain white paper, photograph it in good light from directly above, and crop it tightly. A clean image looks far more natural than a shadowy one.

## How to add a digital signature with a certificate

1. Open [Digitally Sign PDF](/tools/sign-pdf).
2. Drop in your PDF.
3. Under **Your certificate**, choose one of two options:
   - **Use my certificate** if your employer or a certificate provider gave you a .p12 or .pfx file. Choose the file and enter the **Certificate password** that came with it.
   - **Create one** to generate a certificate in the app. Enter your name, and optionally an organisation and country code, then pick a password to protect it. You can save the new certificate to sign more files with the same identity later.
4. Optionally fill in the **Signature details**, such as reason, place and contact. People checking the signature can see these.
5. Click **Sign PDF**. The signed copy downloads to your device.

Signing happens on your device, and neither your PDF nor your certificate is uploaded.

To confirm it worked, open the signed copy in [Validate PDF Signature](/tools/validate-signature-pdf).

## Mistakes to avoid

**Signing before the document is final.** With a digital signature, any later change, even compressing or rotating a page, shows up as a modification. Merge, compress and fill everything in first, then sign last.

**Using both in the wrong order.** If you want a visible drawn signature and a digital seal, add the drawn signature first with eSign, then apply the digital signature to that file.

**Sending your certificate file around.** A .p12 file plus its password lets someone sign as you. Keep it private, like a house key.

**Leaving the signature floating.** Zoom in before saving to check it sits on the line and does not cover any printed text.

## Need to create the document too?

If you are the one sending the paperwork, you can build it from a template with [Create PDF](/tools/create-pdf), which includes blocks for signature lines. Our guide on [making an invoice PDF for free](/articles/how-to-make-an-invoice-pdf-for-free) walks through it.

## FAQ

### Is a drawn signature on a PDF legally binding?

In many countries electronic signatures can be valid for many kinds of agreement, but requirements vary by country and document type. When it matters, ask the recipient or a legal professional what they accept.

### Do I need an account to sign a PDF?

No. Both Orbit signing tools work without an account and do not add a watermark.

### Why does a checker say my signature's identity is not verified?

That is expected for a certificate you created yourself. The signature still detects changes, but only a certificate from a trusted issuer proves identity to other people's software.

### Can I sign a PDF on my phone?

Yes. Open the eSign tool in your mobile browser and draw with your finger.

### Can the other person tell if the PDF was edited after I signed?

With a digital signature, yes, checkers flag changes. With a drawn e-signature alone, no, which is why important documents often use both.
`,
};

export default article;
