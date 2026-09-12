export type ComparisonRow = { label: string; orbit: string; them: string };

export interface Alternative {
  slug: string;
  name: string;
  /** Search title, kept under 65 characters. */
  title: string;
  description: string;
  keywords: string[];
  lede: string;
  rows: ComparisonRow[];
  /** Where the other product is honestly the better pick. */
  theyWin: string[];
  whySwitch: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  tools: string[];
}

/** Date the comparison facts were last reviewed. */
export const REVIEWED = "2026-09-13";

const orbitRows = {
  processing: "On your device, in the browser or desktop app",
  account: "Never",
  limits: "None, only your device's memory",
  watermark: "Never",
  offline: "Yes, after the first visit or with the desktop app",
  desktop: "Free for Windows, macOS and Linux",
  source: "Open source on GitHub",
  price: "Free",
};

export const ALTERNATIVES: Alternative[] = [
  {
    slug: "ilovepdf-alternative",
    name: "iLovePDF",
    title: "A Private iLovePDF Alternative with No Uploads",
    description:
      "Looking for an iLovePDF alternative? Orbit merges, compresses, splits and signs PDFs on your own device, free, with no uploads, limits or account.",
    keywords: ["ilovepdf alternative", "i love pdf alternative", "sites like ilovepdf", "ilovepdf without upload", "free ilovepdf alternative", "ilovepdf offline", "ilovepdf free limit", "private pdf tools"],
    lede: "iLovePDF is one of the most popular PDF sites, and for good reason. Orbit does the everyday jobs differently: your files are processed on your own computer or phone instead of being sent to a server.",
    rows: [
      { label: "Where files are processed", orbit: orbitRows.processing, them: "Uploaded to iLovePDF's servers for most online tools" },
      { label: "Account", orbit: orbitRows.account, them: "Optional for basic tools, needed for some features" },
      { label: "Free usage limits", orbit: orbitRows.limits, them: "Free plan with limits on file size and batch size" },
      { label: "Watermarks", orbit: orbitRows.watermark, them: "No watermarks on common tools" },
      { label: "Works offline", orbit: orbitRows.offline, them: "Online tools need a connection; desktop app available" },
      { label: "Desktop app", orbit: orbitRows.desktop, them: "Yes, with paid features" },
      { label: "Source code", orbit: orbitRows.source, them: "Closed source" },
      { label: "Price", orbit: orbitRows.price, them: "Free plan and paid Premium plans" },
    ],
    theyWin: [
      "More conversions between Office formats, and polished mobile apps.",
      "Cloud storage connections such as Google Drive and Dropbox.",
      "Team accounts, billing and admin features for businesses.",
    ],
    whySwitch: [
      { title: "Files that never leave you", body: "Contracts, medical letters and bank statements stay on your device. Nothing is uploaded, so there is nothing to delete later." },
      { title: "No daily limits", body: "Merge a hundred files or compress a 500-page scan. The only limit is your computer's memory." },
      { title: "Works on a plane", body: "Install Orbit or open it once, and the tools keep working without internet." },
    ],
    faqs: [
      { q: "Is Orbit a good free alternative to iLovePDF?", a: "For everyday tasks like merging, splitting, compressing, rotating, signing and converting images, yes. Orbit is free with no limits and processes files on your device. iLovePDF offers more cloud and team features." },
      { q: "Does Orbit upload my PDF like iLovePDF does?", a: "No. Orbit opens your file inside your browser or the desktop app and saves the result back to your device. You can check this by turning off your internet after the page loads: the tools still work." },
      { q: "Is Orbit affiliated with iLovePDF?", a: "No. Orbit is an independent open source project. iLovePDF is a trademark of its owner and is mentioned here only for comparison." },
    ],
    tools: ["merge-pdf", "compress-pdf", "split-pdf", "esign-pdf", "img-to-pdf", "pdf-to-img"],
  },
  {
    slug: "smallpdf-alternative",
    name: "Smallpdf",
    title: "A Free Smallpdf Alternative with No Daily Limit",
    description:
      "A free Smallpdf alternative with no daily task limit, no account and no uploads. Compress, merge, split and sign PDFs privately on your own device.",
    keywords: ["smallpdf alternative", "free smallpdf alternative", "smallpdf limit", "sites like smallpdf", "smallpdf without subscription", "smallpdf free alternative no limit", "private pdf compressor"],
    lede: "Smallpdf is a well designed PDF service with a friendly interface. If you have hit its free limit or would rather not upload a sensitive file, Orbit covers the common tasks for free, on your own device.",
    rows: [
      { label: "Where files are processed", orbit: orbitRows.processing, them: "Uploaded to Smallpdf's servers" },
      { label: "Account", orbit: orbitRows.account, them: "Needed for some tools and for Pro" },
      { label: "Free usage limits", orbit: orbitRows.limits, them: "Free plan limits how many tasks you can run" },
      { label: "Watermarks", orbit: orbitRows.watermark, them: "No watermarks on common tools" },
      { label: "Works offline", orbit: orbitRows.offline, them: "Online tools need a connection" },
      { label: "Desktop app", orbit: orbitRows.desktop, them: "Yes, part of the paid plan" },
      { label: "Source code", orbit: orbitRows.source, them: "Closed source" },
      { label: "Price", orbit: orbitRows.price, them: "Free plan and paid Pro subscription" },
    ],
    theyWin: [
      "E-signature requests you can send to other people and track.",
      "Built-in cloud storage and sharing across devices.",
      "Office conversions with very good layout accuracy.",
    ],
    whySwitch: [
      { title: "No task counter", body: "Use every tool as often as you like. There is no daily allowance to run out of." },
      { title: "No sign-in wall", body: "Open a tool and use it. Orbit never asks for an email address." },
      { title: "Private by design", body: "Your document is processed locally, so it is never stored on anyone else's server." },
    ],
    faqs: [
      { q: "What is the best free alternative to Smallpdf?", a: "If you want free PDF tools without a daily limit or account, Orbit is a strong option because it runs on your device. For sending signature requests to other people, Smallpdf's paid plan does more." },
      { q: "Can Orbit compress PDFs as well as Smallpdf?", a: "Orbit offers several compression levels and works well on scanned and image-heavy PDFs. Results depend on the file, so try a file you have and compare the sizes." },
      { q: "Is Orbit affiliated with Smallpdf?", a: "No. Orbit is an independent open source project. Smallpdf is a trademark of its owner and is named only for comparison." },
    ],
    tools: ["compress-pdf", "merge-pdf", "split-pdf", "esign-pdf", "rotate-pdf", "pdf-to-docx"],
  },
  {
    slug: "adobe-acrobat-online-alternative",
    name: "Adobe Acrobat online",
    title: "A Free Adobe Acrobat Online Alternative, No Sign-In",
    description:
      "Need to merge, split or sign a PDF without an Adobe account? Orbit is a free Acrobat online alternative that works on your device with no uploads.",
    keywords: ["adobe acrobat alternative", "acrobat online alternative", "free adobe pdf alternative", "merge pdf without adobe", "adobe acrobat free alternative", "pdf editor without adobe account"],
    lede: "Adobe created the PDF format, and Acrobat remains the most complete PDF editor. For quick jobs, you may not want to sign in or pay. Orbit handles them for free, without an account, on your own device.",
    rows: [
      { label: "Where files are processed", orbit: orbitRows.processing, them: "Uploaded to Adobe's cloud for online tools" },
      { label: "Account", orbit: orbitRows.account, them: "Sign-in required for many online tools" },
      { label: "Free usage limits", orbit: orbitRows.limits, them: "Free tools are limited; full features need a subscription" },
      { label: "Watermarks", orbit: orbitRows.watermark, them: "No watermarks on free tools" },
      { label: "Works offline", orbit: orbitRows.offline, them: "Desktop Acrobat works offline" },
      { label: "Desktop app", orbit: orbitRows.desktop, them: "Acrobat Reader free, Acrobat Pro paid" },
      { label: "Source code", orbit: orbitRows.source, them: "Closed source" },
      { label: "Price", orbit: orbitRows.price, them: "Free Reader, paid Acrobat subscriptions" },
    ],
    theyWin: [
      "Editing the existing text and images of a PDF with the highest accuracy.",
      "Advanced prepress, accessibility and legal redaction workflows.",
      "Certified signatures and enterprise document management.",
    ],
    whySwitch: [
      { title: "No Adobe ID", body: "Merge, split or compress a file in seconds without creating an account." },
      { title: "Free for good", body: "Orbit has no trial period and no subscription to cancel." },
      { title: "Light and quick", body: "Tools open in a browser tab or a small desktop app instead of a large install." },
    ],
    faqs: [
      { q: "Can I merge PDFs without Adobe Acrobat?", a: "Yes. Orbit's Merge PDF combines files for free in your browser or desktop app, with no account and no uploads." },
      { q: "Can Orbit replace Acrobat Pro?", a: "For everyday tasks such as merging, splitting, compressing, signing, rotating and adding page numbers, often yes. For detailed text editing of existing PDFs and professional prepress work, Acrobat Pro does more." },
      { q: "Is Orbit affiliated with Adobe?", a: "No. Orbit is an independent open source project. Adobe and Acrobat are trademarks of Adobe and are named only for comparison." },
    ],
    tools: ["merge-pdf", "split-pdf", "esign-pdf", "edit-pdf", "compress-pdf", "organize-pdf"],
  },
  {
    slug: "sejda-alternative",
    name: "Sejda",
    title: "A Sejda Alternative with No Hourly Limits",
    description:
      "A free Sejda alternative with no hourly task or page limits. Orbit edits, merges, splits and compresses PDFs on your own device without uploads.",
    keywords: ["sejda alternative", "sejda pdf alternative", "sejda limit", "sites like sejda", "free sejda alternative", "sejda desktop alternative"],
    lede: "Sejda offers a thoughtful set of PDF tools online and on the desktop. Its free online use has limits on how much you can do. Orbit is free without limits and keeps your files on your device.",
    rows: [
      { label: "Where files are processed", orbit: orbitRows.processing, them: "Uploaded to Sejda's servers online; local in Sejda Desktop" },
      { label: "Account", orbit: orbitRows.account, them: "Not needed for free online use" },
      { label: "Free usage limits", orbit: orbitRows.limits, them: "Free online use has task, page and size limits" },
      { label: "Watermarks", orbit: orbitRows.watermark, them: "No watermarks within free limits" },
      { label: "Works offline", orbit: orbitRows.offline, them: "Yes with Sejda Desktop" },
      { label: "Desktop app", orbit: orbitRows.desktop, them: "Sejda Desktop, with a paid upgrade" },
      { label: "Source code", orbit: orbitRows.source, them: "Closed source" },
      { label: "Price", orbit: orbitRows.price, them: "Free within limits, paid passes and plans" },
    ],
    theyWin: [
      "Editing existing text directly on the page.",
      "A long list of niche tools built over many years.",
    ],
    whySwitch: [
      { title: "No waiting an hour", body: "There is no cap on tasks per hour or pages per file." },
      { title: "Free desktop app", body: "Orbit's desktop app is free on Windows, macOS and Linux." },
      { title: "Open source", body: "Anyone can read the code and confirm that files stay on the device." },
    ],
    faqs: [
      { q: "Is there a Sejda alternative without limits?", a: "Yes. Orbit has no task, page or file size limits beyond what your device can handle, and it is free." },
      { q: "Is Orbit affiliated with Sejda?", a: "No. Orbit is an independent open source project. Sejda is a trademark of its owner and is named only for comparison." },
    ],
    tools: ["merge-pdf", "split-pdf", "compress-pdf", "crop-pdf", "add-page-no-pdf", "organize-pdf"],
  },
  {
    slug: "pdf24-alternative",
    name: "PDF24",
    title: "A PDF24 Alternative for Mac, Linux and the Browser",
    description:
      "PDF24 alternative that runs in any browser and on Windows, macOS and Linux. Orbit is free, open source and processes PDFs without uploading them.",
    keywords: ["pdf24 alternative", "pdf24 for mac", "pdf24 linux alternative", "sites like pdf24", "pdf24 creator alternative", "free pdf tools like pdf24"],
    lede: "PDF24 is generous: its online tools are free, and PDF24 Creator is a free offline app for Windows. Orbit gives you the same freedom in any browser and on macOS and Linux too, with processing on your device.",
    rows: [
      { label: "Where files are processed", orbit: orbitRows.processing, them: "Uploaded to PDF24's servers online; local in PDF24 Creator" },
      { label: "Account", orbit: orbitRows.account, them: "Not needed" },
      { label: "Free usage limits", orbit: orbitRows.limits, them: "Free, with no strict limits for normal use" },
      { label: "Watermarks", orbit: orbitRows.watermark, them: "No watermarks" },
      { label: "Works offline", orbit: orbitRows.offline, them: "Yes with PDF24 Creator on Windows" },
      { label: "Desktop app", orbit: orbitRows.desktop, them: "PDF24 Creator for Windows" },
      { label: "Source code", orbit: orbitRows.source, them: "Closed source" },
      { label: "Price", orbit: orbitRows.price, them: "Free, supported by ads online" },
    ],
    theyWin: [
      "A virtual PDF printer on Windows that turns anything you print into a PDF.",
      "A very large collection of tools, including many file conversions.",
    ],
    whySwitch: [
      { title: "Works on every computer", body: "Use Orbit in any modern browser, or install the free app on macOS and Linux as well as Windows." },
      { title: "A focused workspace", body: "Tools open in a calm, full-width workspace that keeps your file and its options in view." },
      { title: "Private in the browser too", body: "Even the web version keeps files on your device, not just the desktop app." },
    ],
    faqs: [
      { q: "Is there a PDF24 Creator for Mac?", a: "PDF24 Creator is made for Windows. Orbit's desktop app is free on macOS, Windows and Linux, and its web version works in any modern browser." },
      { q: "Is Orbit affiliated with PDF24?", a: "No. Orbit is an independent open source project. PDF24 is a trademark of its owner and is named only for comparison." },
    ],
    tools: ["merge-pdf", "compress-pdf", "ocr-pdf", "img-to-pdf", "split-pdf", "add-watermark-pdf"],
  },
  {
    slug: "ihatepdf-alternative",
    name: "iHatePDF",
    title: "iHatePDF Alternative: Open Source PDF Tools That Stay Local",
    description:
      "Comparing iHatePDF sites? Orbit is an open source, no-upload PDF toolkit with a free desktop app for Windows, macOS and Linux, and no AI data sharing.",
    keywords: ["ihatepdf", "ihatepdf alternative", "i hate pdf", "ihatepdf.cv", "ihatepdf sites", "ihatepdf vs ilovepdf", "no upload pdf tools", "open source ihatepdf alternative"],
    lede: "iHatePDF became popular as a browser-based answer to upload-heavy PDF sites, and several unrelated sites now use similar names. Orbit shares the same idea of keeping files local, and adds open source code you can check and a native desktop app.",
    rows: [
      { label: "Where files are processed", orbit: orbitRows.processing, them: "In the browser, according to the site" },
      { label: "Account", orbit: orbitRows.account, them: "Not needed" },
      { label: "Free usage limits", orbit: orbitRows.limits, them: "Free" },
      { label: "Watermarks", orbit: orbitRows.watermark, them: "No watermarks" },
      { label: "Works offline", orbit: orbitRows.offline, them: "Offline use is advertised" },
      { label: "Desktop app", orbit: orbitRows.desktop, them: "Browser based" },
      { label: "Source code", orbit: orbitRows.source, them: "Not published" },
      { label: "AI features", orbit: "None, nothing is sent to an AI service", them: "Chat and summary tools that use an AI service" },
    ],
    theyWin: [
      "More experimental tools, such as AI chat and summaries, P2P sharing and a whiteboard.",
      "Business extras like invoice and billing generators.",
    ],
    whySwitch: [
      { title: "Check it yourself", body: "Orbit's code is public, so anyone can confirm that files are processed locally." },
      { title: "A real desktop app", body: "Install Orbit on Windows, macOS or Linux and open PDFs from your file manager." },
      { title: "One name, one site", body: "Orbit lives at orbit.nexonauts.com and on GitHub, so you always know you are using the original." },
    ],
    faqs: [
      { q: "Which iHatePDF site is the original?", a: "Several unrelated sites use iHatePDF-style names on different domains. Check the domain carefully before opening sensitive files on any of them." },
      { q: "Is Orbit the same as iHatePDF?", a: "No. Orbit is a separate, independent open source project with its own code, desktop app and website." },
      { q: "Do Orbit's tools send my document to AI services?", a: "No. Orbit has no AI chat or summary tools, and no part of your document is sent to any online service." },
    ],
    tools: ["merge-pdf", "compress-pdf", "create-pdf", "edit-pdf", "ocr-pdf", "esign-pdf"],
  },
];

export function getAlternative(slug: string): Alternative | null {
  return ALTERNATIVES.find((a) => a.slug === slug) ?? null;
}
