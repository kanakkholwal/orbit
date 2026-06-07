import type { ToolConfig } from '$tools/list';

/**
 * Long-form, SEO-oriented content for each tool page: a plain-language intro,
 * a "how it works" walkthrough, real use cases, and an FAQ. Every tool gets
 * useful content via a generator; bespoke entries below override it with
 * hand-written copy. The FAQ is also emitted as JSON-LD (FAQPage) on the page.
 */

export interface ToolFaq {
    q: string;
    a: string;
}

export interface ToolUseCase {
    title: string;
    body: string;
}

export interface ToolContent {
    intro: string;
    howItWorks: string[];
    useCases: ToolUseCase[];
    faqs: ToolFaq[];
}

type ToolMeta = Pick<ToolConfig, 'slug' | 'title' | 'description' | 'category'>;

/* ── Universal facts, true for every Orbit tool ───────────────────────────── */

function universalFaqs(tool: ToolMeta): ToolFaq[] {
    return [
        {
            q: `Is ${tool.title} free to use?`,
            a: `Yes. ${tool.title} is completely free, with no sign-up, watermarks, daily quotas, or file-size caps. You can process as many files as your device can handle.`
        },
        {
            q: `Are my files uploaded to a server?`,
            a: `No. ${tool.title} runs entirely in your browser using WebAssembly. Your documents never leave your device — there are no uploads, no servers, and nothing is stored or logged. That is what makes Orbit private by architecture.`
        },
        {
            q: `Does ${tool.title} work offline?`,
            a: `Yes. After the page has loaded once, the tool keeps working without an internet connection. You can also install Orbit as a desktop app or PWA for a fully offline experience.`
        },
        {
            q: `Is my data safe?`,
            a: `Because all processing happens locally on your machine, your files are as safe as the device they sit on. Nothing is transmitted to Orbit or any third party.`
        }
    ];
}

function defaultHowItWorks(tool: ToolMeta): string[] {
    return [
        `Open ${tool.title} and drag your file into the upload area, or click to browse from your device.`,
        `Adjust the available options to match what you need.`,
        `Run the tool — all processing happens locally, in your browser, in seconds.`,
        `Download the result. Your original file is never modified or uploaded.`
    ];
}

function defaultUseCases(tool: ToolMeta): ToolUseCase[] {
    return [
        {
            title: 'Private, sensitive documents',
            body: `Contracts, IDs, medical records and financial statements should not be uploaded to a stranger's server. With ${tool.title}, they never leave your device.`
        },
        {
            title: 'Working offline or on the move',
            body: `On a plane, on a train, or behind a strict firewall — ${tool.title} keeps working without a connection once loaded.`
        },
        {
            title: 'Quick, repeatable tasks',
            body: `No accounts, no installs, no daily limits. Open the page, get the job done, and close the tab.`
        }
    ];
}

/* ── Bespoke content (hand-written, overrides the generator) ──────────────── */

const bespoke: Record<string, Partial<ToolContent>> = {
    'md-to-pdf': {
        intro:
            'Markdown is perfect for writing, but most people need a PDF to share or print. This tool renders your Markdown — headings, lists, bold and italic text, code blocks, blockquotes and horizontal rules — into a clean, paginated PDF, entirely in your browser. Paste your Markdown directly or load a .md file, and the conversion happens on your device with nothing uploaded.',
        howItWorks: [
            'Paste your Markdown into the editor, or click "Load .md" to import a file.',
            'Use the "Sample" button if you want to see how formatting is rendered.',
            'Click "Convert to PDF" — the document is laid out locally using a WebAssembly PDF engine.',
            'Download your PDF. The Markdown source never leaves your browser.'
        ],
        useCases: [
            {
                title: 'README and documentation exports',
                body: 'Turn a project README or technical doc written in Markdown into a polished PDF for sharing with people who do not live in a code editor.'
            },
            {
                title: 'Notes and meeting minutes',
                body: 'Write quickly in Markdown, then export a tidy PDF for distribution or archiving.'
            },
            {
                title: 'AI and chat output',
                body: 'Large language models love Markdown. Paste their output here to get a clean, formatted PDF in one step.'
            }
        ],
        faqs: [
            {
                q: 'Which Markdown features are supported?',
                a: 'Headings, paragraphs, ordered and unordered lists, bold and italic emphasis, inline code, fenced code blocks, blockquotes, and horizontal rules are all rendered. Images and complex tables are not yet supported.'
            },
            {
                q: 'Can I convert a .md file directly?',
                a: 'Yes. Click "Load .md" to import a Markdown file from your device; its contents are loaded into the editor, and the output PDF is named after the file.'
            },
            {
                q: 'Does it support non-English characters?',
                a: 'The current renderer uses standard PDF fonts, which cover Latin-based languages well. Characters outside that range may be simplified. Full Unicode font embedding is on the roadmap.'
            }
        ]
    },
    'pdf-to-md': {
        intro:
            'This tool reverses the usual flow: it reads a text-based PDF and reconstructs clean Markdown from it, inferring headings from font sizes, detecting bullet and numbered lists, and grouping text into paragraphs. It is ideal for repurposing existing documents, moving content into a notes app or static site, or preparing PDFs as structured input for AI tools — all without uploading anything.',
        howItWorks: [
            'Drop a text-based PDF into the upload area.',
            'Orbit extracts the text locally and infers structure — headings, lists and paragraphs.',
            'Review and edit the generated Markdown directly in the output panel.',
            'Copy it to your clipboard or download a .md file.'
        ],
        useCases: [
            {
                title: 'Repurposing published documents',
                body: 'Move the content of a PDF report or article into a CMS, wiki, or static-site generator that speaks Markdown.'
            },
            {
                title: 'Feeding documents to AI',
                body: 'Markdown is a clean, token-efficient format for large language models. Convert a PDF first, then paste the result into your assistant.'
            },
            {
                title: 'Editing locked-down content',
                body: 'Get editable text out of a PDF when you only have the finished document and not the source.'
            }
        ],
        faqs: [
            {
                q: 'Does it work on scanned PDFs?',
                a: 'No — scanned PDFs are images with no selectable text, so there is nothing to extract. Run the OCR tool first to add a text layer, then convert to Markdown.'
            },
            {
                q: 'How accurate is the structure detection?',
                a: 'Headings and lists are inferred using heuristics (relative font size, line spacing, list markers), so results are a strong starting point rather than a perfect reproduction. The output is fully editable before you download it.'
            }
        ]
    },
    'strip-pdf': {
        intro:
            'Some PDFs use page labels to mark sections — for example batched scans or multi-page records where each entry spans several pages. This tool strips the document down to the last page of each labeled range (plus the final page), which is often the page that actually matters. Files without page labels are left untouched.',
        useCases: [
            {
                title: 'Batched scans',
                body: 'Reduce a large scanned batch to the final page of each labeled section in one pass.'
            },
            {
                title: 'Summary pages',
                body: 'When the meaningful content sits on the last page of each range, strip away the rest to get a compact summary document.'
            }
        ],
        faqs: [
            {
                q: 'What are PDF page labels?',
                a: 'Page labels are metadata that name ranges of pages (for example "i, ii, iii" then "1, 2, 3"). This tool reads that structure to decide which pages to keep.'
            },
            {
                q: 'Why did my file come back unchanged?',
                a: 'Most PDFs do not contain page labels. If a file has none, there is nothing to strip, so it is marked as skipped and left exactly as it was.'
            }
        ]
    },
    'merge-pdf': {
        useCases: [
            {
                title: 'Combining scanned pages',
                body: 'Merge separately-scanned pages into a single document in the right order, with drag-and-drop reordering.'
            },
            {
                title: 'Assembling reports',
                body: 'Stitch a cover page, body, and appendices from different files into one deliverable PDF.'
            },
            {
                title: 'Bundling invoices or receipts',
                body: 'Collect a month of receipts into one file for expenses or bookkeeping.'
            }
        ],
        faqs: [
            {
                q: 'Can I reorder the files before merging?',
                a: 'Yes. Drag files (or individual pages in page mode) into any order before you merge.'
            },
            {
                q: 'Is there a limit on how many PDFs I can merge?',
                a: 'There is no fixed limit — you are bounded only by your device memory, since everything is processed locally.'
            }
        ]
    },
    'split-pdf': {
        faqs: [
            {
                q: 'Can I extract a specific range of pages?',
                a: 'Yes. Enter ranges like "1-3, 5, 8-10" to pull out exactly the pages you want into a new PDF.'
            }
        ]
    },
    'compress-pdf': {
        faqs: [
            {
                q: 'Will compression reduce the quality of my PDF?',
                a: 'Compression trades some image fidelity for a smaller file. You can choose a compression level to balance size against quality, and text remains crisp.'
            },
            {
                q: 'How small can the file get?',
                a: 'It depends on the content — image-heavy PDFs shrink the most, while text-only PDFs are already compact. The tool shows the before-and-after size for every file.'
            }
        ]
    },
    'img-to-pdf': {
        faqs: [
            {
                q: 'Which image formats are supported?',
                a: 'JPG, PNG, and HEIC are supported, among others. HEIC photos from iPhones are converted automatically.'
            },
            {
                q: 'Can I combine several images into one PDF?',
                a: 'Yes. Add multiple images, drag them into the order you want, and export them as a single multi-page PDF.'
            }
        ]
    },
    'ocr-pdf': {
        faqs: [
            {
                q: 'What languages does OCR support?',
                a: 'The OCR engine supports a wide range of languages; pick the ones in your document for the best accuracy.'
            },
            {
                q: 'Does OCR happen on a server?',
                a: 'No. Text recognition runs locally in your browser using a WebAssembly build of Tesseract, so scanned documents stay private.'
            }
        ]
    }
};

/* ── Public accessor ──────────────────────────────────────────────────────── */

export function getToolContent(tool: ToolMeta): ToolContent {
    const b = bespoke[tool.slug] ?? {};
    const faqs = b.faqs ? [...b.faqs, ...universalFaqs(tool)] : universalFaqs(tool);
    return {
        intro: b.intro ?? tool.description,
        howItWorks: b.howItWorks ?? defaultHowItWorks(tool),
        useCases: b.useCases ?? defaultUseCases(tool),
        faqs
    };
}
