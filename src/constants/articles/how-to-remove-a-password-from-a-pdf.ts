import type { Article } from "./index";

const article: Article = {
  slug: "how-to-remove-a-password-from-a-pdf",
  title: "How to Remove a Password From a PDF You Own",
  description:
    "Tired of typing the same PDF password? Learn how to remove a password from a PDF you own, and the difference between open passwords and permission passwords.",
  published: "2026-08-12",
  readingMinutes: 5,
  keywords: [
    "remove password from pdf",
    "unlock pdf",
    "pdf owner password",
    "pdf user password",
    "decrypt pdf",
    "save pdf without password",
    "remove pdf restrictions",
  ],
  tools: ["decrypt-pdf", "encrypt-pdf", "view-metadata"],
  body: `Banks, payroll systems and phone companies love to send password-protected PDFs. That is sensible when the file is in transit, but annoying when it sits in your own documents folder and asks for your date of birth every time you open it. This guide shows how to remove a password from a PDF you own, so you can save a copy that opens normally.

**An important note first:** this is for files that belong to you, where you already know the password. Removing protection from documents you are not entitled to open can break the law and the terms under which you received them. Orbit does not guess or crack passwords. You have to type the correct one.

## Two kinds of PDF password

PDFs can carry two different passwords, and they do different jobs. Knowing which one you are dealing with saves a lot of confusion.

### The open password (user password)

This is the one most people mean. Without it, the PDF will not open at all, and the contents are encrypted so they cannot be read. Statements and payslips usually use this kind, often set to something like part of your account number or your date of birth.

### The permissions password (owner password)

This one does not stop the file opening. Instead it controls what you can do once it is open, such as printing, copying text or editing. You might notice greyed-out menu items in your PDF reader, or a "secured" label in the title bar. These restrictions are enforced by the reader app, which is why the PDF format treats them as a request rather than a lock.

A single PDF can have one, the other, or both.

## How to remove a password from a PDF

1. Open [Decrypt PDF](/tools/decrypt-pdf).
2. Drop your protected PDF onto the page, or click to choose it.
3. Type the password in the **Password** box. Use the eye button if you want to see what you typed.
4. Click **Remove password**.
5. An unlocked copy downloads to your device. The original file is left untouched.

If the password is wrong, Orbit tells you and you can try again. Unlocking happens on your device, and neither the file nor the password is sent anywhere. That is worth caring about: the password to a bank statement is often a piece of personal information in its own right.

## Tips for getting the password right

- **Check the email or letter that came with the file.** Banks usually explain the format, for example "the first four letters of your surname followed by your birth year".
- **Watch capital letters.** PDF passwords are case sensitive. "SMITH1985" and "smith1985" are different.
- **Date formats vary.** If the password is a date, try the format the sender uses in the rest of their paperwork (day first or month first, with or without the century).
- **Copy and paste carefully.** Pasting from an email can include an invisible space at the start or end.

If you have genuinely lost the password to your own document, the most reliable route is to ask the sender for a fresh copy. They can almost always reissue it.

## Should you remove the password at all?

Think about where the unlocked copy will live. A password on a file in your email inbox gives some protection if the mailbox is ever compromised. Removing it makes sense when:

- The file is stored on a device that is itself encrypted and password protected.
- You need to merge it with other documents (see [how to merge PDF files without uploading](/articles/how-to-merge-pdf-files-without-uploading)).
- You need to compress, split, sign or edit it, which most tools cannot do with an encrypted file.
- You are archiving statements and do not want to remember a dozen different passwords in five years.

If you need protection again later, add your own password with [Encrypt PDF](/tools/encrypt-pdf). You can choose a strong password you control rather than one based on your birthday.

## A safer workflow for sensitive paperwork

1. Download the protected PDF from your bank or employer.
2. Unlock it with [Decrypt PDF](/tools/decrypt-pdf).
3. Do what you needed to do: merge, compress, or rename.
4. If the file is leaving your device again, protect it with [Encrypt PDF](/tools/encrypt-pdf) and share the password through a different channel (for example, a text message rather than the same email).
5. Delete the unlocked copy you no longer need.

Because every step runs locally, the document never passes through a third-party server along the way.

## What removing the password does not do

- It does not change the content, layout or quality of the PDF.
- It does not remove a digital signature's history, although changing a signed file later will show as a modification.
- It does not remove other hidden information. If you want to see what else is in the file, such as author and creation details, open it in [View PDF Metadata](/tools/view-metadata).

## FAQ

### Can Orbit unlock a PDF if I forgot the password?

No. Orbit needs the correct password. It does not attempt to guess or break passwords.

### My PDF opens without a password but I cannot print or copy. What do I do?

That file has a permissions password. If it is your document and you have that password, enter it in Decrypt PDF to save a copy without the restrictions.

### Is the unlocked PDF identical to the original?

The pages, text and images are the same. The only difference is that the encryption is gone, so it opens without asking.

### Is it safe to type my password into a website?

With Orbit, the password is used by code running in your own browser and is not transmitted. If you prefer, the desktop app does the same job as an installed program.

### Can I unlock several PDFs at once?

Decrypt PDF handles one file at a time, since each file usually has its own password.
`,
};

export default article;
