import {
    IconAlignLeft as AlignLeft,
    IconArrowsUpDown as ArrowDownUp,
    IconBookmark as Bookmark,
    IconBookmarkOff as BookMinus,
    IconCopy as Copy,
    IconCrop as CropIcon,
    IconPencil as Edit3Icon,
    IconEye as Eye,
    IconFile as FileIcon,
    IconFileMinus as FileMinus2,
    IconFileStack as FileStack,
    IconFilePlus as FilePlus,
    IconFileText as FileText,
    IconGauge as Gauge,
    IconHighlight as Highlighter,
    IconPhoto as ImageIcon,
    IconInfoCircle as Info,
    IconStack2 as Layers,
    IconTemplate as LayoutTemplate,
    IconLock as Lock,
    IconMaximize as Maximize2,
    IconArrowsMove as MoveIcon,
    IconBucketDroplet as PaintBucket,
    IconRefresh as RefreshCw,
    IconPencil as PenLine,
    IconRotateClockwise as RotateCw,
    IconScan as ScanText,
    IconScissors as Scissors,
    IconSettings as Settings,
    IconShieldCheck as ShieldCheck,
    IconLetterT as Text,
    IconTrash as Trash2,
    IconLockOpen as Unlock,
    IconWand as WandIcon,
    IconBolt as Zap,
    type Icon
} from '@tabler/icons-svelte';
import {
    IconArrowsShuffle,
    IconBook2,
    IconColorFilter,
    IconFileDiff,
    IconFileSpreadsheet,
    IconFirstAidKit,
    IconForms,
    IconGitCompare,
    IconHash,
    IconHeadphones,
    IconLayoutColumns,
    IconLayoutGrid,
    IconPaperclip,
    IconPhotoScan,
    IconScan,
    IconShieldSearch,
    IconStackFront,
} from '@tabler/icons-svelte';
import type { Component } from 'svelte';



/** `form` centres a settings-style tool, `canvas` uses the full width, `immersive` takes the whole workspace. */
export type ToolLayout = 'form' | 'canvas' | 'immersive';

export interface ToolConfig {
    slug: string;
    title: string;
    description: string;
    icon: Icon;
    component: () => Promise<{ default: Component }>;
    color: string;
    category: string;
    keywords?: string[]; // Optional array of keywords for SEO and search functionality
    layout?: ToolLayout;
    /** Search-engine title when the tool name alone doesn't describe the problem it solves. */
    seoTitle?: string;
}
/*
* Centralized configuration for all tools in the application.
* Each tool is defined with its slug, title, description, icon, Svelte component, and branding color.
* This allows for easy addition of new tools and consistent rendering across the app.
*/
const tools: Record<string, ToolConfig> = {
    'merge-pdf': {
        slug: 'merge-pdf',
        title: 'Merge PDF',
        description: 'Combine multiple PDF files into one single document in seconds. Drag and drop to reorder pages. Free online PDF merger with batch processing support.',
        category: "essentials",
        layout: 'canvas',
        icon: FileStack,
        component: () => import('./merge-pdf/tool.svelte'),
        color: 'text-indigo-500',
        keywords: ['merge pdf', 'combine pdf', 'pdf merger', 'join pdf files', 'pdf combiner', 'merge pdf online', 'free pdf merger', 'pdf concatenate', 'batch merge pdf', 'reorder pdf pages']
    },
    "multi-pdf": {
        slug: "multi-pdf",
        title: "PDF Multi-Tool",
        description: "Upload, rearrange, rotate, and export multiple PDF pages with advanced editing capabilities. All-in-one PDF manager for quick page manipulation and batch operations.",
        category: "essentials",
        layout: 'canvas',
        icon: FileMinus2,
        component: () => import('./multi-pdf/tool.svelte'),
        color: "text-primary",
        keywords: ['pdf multi-tool', 'pdf page manager', 'rearrange pdf pages', 'rotate pdf', 'export pdf', 'pdf editor', 'batch pdf processing', 'manage pdf pages']
    },
    'split-pdf': {
        slug: 'split-pdf',
        title: 'Split PDF',
        description: 'Extract pages, split ranges, or divide your PDF into multiple files instantly. Free online PDF splitter with advanced range selection and batch processing.',
        category: "essentials",
        layout: 'canvas',
        icon: Copy,
        component: () => import('./split-pdf/tool.svelte'),
        color: 'text-pink-500',
        keywords: ['split pdf', 'extract pdf pages', 'pdf splitter', 'divide pdf', 'separate pdf pages', 'free pdf splitter', 'pdf page extractor', 'crop pdf pages', 'pdf range selector']
    },
    'compress-pdf': {
        slug: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Reduce PDF file size while maintaining quality. Advanced optimization options for faster sharing and storage. Free online PDF compressor.',
        category: "essentials",
        icon: Zap,
        component: () => import('./compress-pdf/tool.svelte'),
        color: 'text-yellow-500',
        keywords: ['compress pdf', 'reduce pdf size', 'pdf compressor', 'shrink pdf', 'optimize pdf', 'pdf compression', 'free pdf compressor', 'small pdf file', 'pdf file size reducer']
    },
    'img-to-pdf': {
        slug: 'img-to-pdf',
        title: 'Image to PDF',
        description: 'Convert images to PDF instantly. Supports JPG, PNG, BMP, TIFF and more formats. Free online image to PDF converter with batch processing.',
        category: 'conversion',
        layout: 'canvas',
        icon: ImageIcon,
        component: () => import('./img-to-pdf/tool.svelte'),
        color: 'text-orange-500',
        keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert image to pdf', 'image converter', 'pdf converter', 'free image to pdf', 'batch image to pdf', 'photo to pdf']
    },
    "pdf-to-img": {
        slug: "pdf-to-img",
        title: "PDF to Image",
        description: "Turn every page of a PDF into a sharp JPG, PNG or WebP image and download them together. Free, private and runs entirely in your browser.",
        category: 'conversion',
        icon: Bookmark,
        component: () => import('./pdf-to-img/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf to image', 'extract images from pdf', 'pdf image converter', 'free pdf to image', 'pdf page to image', 'export pdf as image']
    },
    'encrypt-pdf': {
        slug: 'encrypt-pdf',
        title: 'Encrypt PDF',
        description: 'Protect your PDF with password encryption. Simple and secure AES encryption with user and owner permissions. Free online PDF encryptor.',
        category: 'security',
        icon: Lock,
        component: () => import('./encrypt-pdf/tool.svelte'),
        color: 'text-green-500',
        keywords: ['encrypt pdf', 'password protect pdf', 'secure pdf', 'pdf encryption', 'protect pdf with password', 'pdf security', 'free pdf encryption', 'aes encryption', 'pdf password protection']
    },
    'decrypt-pdf': {
        slug: 'decrypt-pdf',
        title: 'Decrypt PDF',
        description: 'Remove password protection from your PDF securely. Unlock encrypted PDFs instantly without software installation. Free online PDF decryption tool.',
        category: 'security',
        icon: Unlock,
        component: () => import('./decrypt-pdf/tool.svelte'),
        color: 'text-green-500',
        keywords: ['decrypt pdf', 'remove password from pdf', 'unlock pdf', 'pdf decryption', 'unprotect pdf', 'remove encryption from pdf', 'free pdf decryptor', 'unlock encrypted pdf', 'open password protected pdf']
    },
    'rotate-pdf': {
        slug: 'rotate-pdf',
        title: 'Rotate PDF',
        description: 'Easily rotate PDF pages to the correct orientation. Supports 90, 180, and 270-degree rotations with batch processing capabilities.',
        category: 'pdf-management',
        layout: 'canvas',
        icon: RotateCw,
        component: () => import('./rotate-pdf/tool.svelte'),
        color: 'text-purple-500',
        keywords: ['rotate pdf', 'rotate pdf pages', 'pdf rotation', 'flip pdf', 'turn pdf pages', 'rotate pdf online', 'free pdf rotator', 'batch rotate pdf', 'pdf page rotation']
    },
    'organize-pdf': {
        slug: 'organize-pdf',
        title: 'Organize PDF',
        description: 'Easily organize and rearrange PDF pages with drag-and-drop interface. Reorder pages, delete sections, and create custom page arrangements with batch support.',
        category: 'pdf-management',
        layout: 'canvas',
        icon: MoveIcon,
        component: () => import('./organize-pdf/tool.svelte'),
        color: 'text-purple-500',
        keywords: ['organize pdf', 'rearrange pdf pages', 'reorder pdf', 'pdf page organizer', 'arrange pdf pages', 'pdf manager', 'manage pdf pages', 'drag and drop pdf']
    },
    "extract-pages": {
        slug: "extract-pages",
        title: "Extract PDF Pages",
        description: "Select and extract specific pages from your PDF into a new file. Advanced page range selection tool for precise document extraction and organization.",
        category: 'pdf-management',
        icon: Scissors,
        component: () => import('./extract-pages/tool.svelte'),
        color: 'text-pink-500',
        keywords: ['extract pdf pages', 'extract pages from pdf', 'pdf page extractor', 'select pdf pages', 'extract specific pages', 'save pdf pages', 'pdf extractor tool', 'page extraction']
    },
    "crop-pdf": {
        slug: "crop-pdf",
        title: "Crop PDF",
        description: "Trim margins and unwanted areas from PDF pages with a visual crop box. Apply it to one page or all pages, and optionally remove the hidden content.",
        category: 'pdf-management',
        layout: 'canvas',
        icon: CropIcon,
        component: () => import('./crop-pdf/tool.svelte'),
        color: 'text-red-500',
        keywords: ['crop pdf', 'crop pdf pages', 'pdf cropping tool', 'trim pdf', 'remove margins from pdf', 'adjust pdf layout', 'pdf crop editor', 'page cropper']
    },
    "edit-pdf": {
        slug: "edit-pdf",
        title: "Edit PDF",
        description: "Mark up a PDF in your browser: add text boxes, highlights, shapes, drawings, stamps, links and comments, or redact sensitive parts. Existing text is not rewritten.",
        category: 'pdf-management',
        layout: 'immersive',
        icon: Edit3Icon,
        component: () => import('./edit-pdf/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['edit pdf', 'pdf editor', 'edit pdf online', 'add text to pdf', 'pdf annotation', 'modify pdf', 'free pdf editor', 'edit pdf text', 'pdf markup tool']
    },
    "create-pdf": {
        slug: "create-pdf",
        title: "Create PDF",
        description: "Design invoices, resumes, reports, letters and certificates on the page, then download a clean PDF. 31 blocks, 16 templates and 10 themes, all on your device.",
        category: "essentials",
        layout: "immersive",
        icon: FilePlus,
        component: () => import("./create-pdf/tool.svelte"),
        color: "text-emerald-600",
        seoTitle: "PDF Maker: Create Invoices, Resumes and Reports as PDF",
        keywords: ["create pdf", "pdf maker", "pdf creator", "invoice generator", "resume builder pdf", "make a pdf", "pdf designer", "report template pdf", "certificate maker", "free pdf creator", "wysiwyg pdf editor", "quote template", "letter template pdf"]
    },
    "view-pdf": {
        slug: "view-pdf",
        title: "View PDF",
        description: "Open PDFs in a dedicated desktop-style viewer with thumbnails, outline, search, zoom controls, spread layouts, and multiple reading modes.",
        category: 'essentials',
        layout: 'immersive',
        icon: Eye,
        component: () => import('./view-pdf/tool.svelte'),
        color: 'text-sky-500',
        keywords: ['view pdf', 'pdf viewer', 'open pdf', 'read pdf', 'pdf reader', 'thumbnail view pdf', 'pdf layout modes', 'offline pdf viewer']
    },
    "bookmark-pdf": {
        slug: "bookmark-pdf",
        title: "Bookmark PDF",
        description: "Add, edit, and manage bookmarks in your PDF for easy navigation. Create interactive table of contents with customizable bookmark hierarchy.",
        category: 'pdf-management',
        layout: 'canvas',
        icon: FileIcon,
        component: () => import('./bookmark-pdf/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['bookmark pdf', 'add bookmarks to pdf', 'pdf bookmarking tool', 'pdf navigation', 'create pdf bookmarks', 'edit bookmarks', 'pdf outlining', 'interactive pdf']
    },
    "add-page-no-pdf": {
        slug: "add-page-no-pdf",
        title: "Add Page Numbers",
        description: "Easily add page numbers to your PDF for better readability and organization. Customize font, size, color, and position with flexible placement options.",
        category: 'pdf-management',
        icon: Highlighter,
        component: () => import('./add-page-no-pdf/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['add page numbers to pdf', 'page numbering', 'number pdf pages', 'pdf pagination', 'add numbering to pdf', 'page counter', 'pdf page numbers']
    },
    "add-watermark-pdf": {
        slug: "add-watermark-pdf",
        title: "Add Watermark",
        description: "Stamp a text or image watermark across the centre of every page, with your own opacity, size and rotation. Mark drafts and confidential copies.",
        category: 'pdf-management',
        icon: WandIcon,
        component: () => import('./add-watermark-pdf/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['add watermark to pdf', 'pdf watermark', 'watermark tool', 'protect pdf', 'add text watermark', 'image watermark', 'copyright protection', 'branded watermark']
    },
    "delete-pages": {
        slug: "delete-pages",
        title: "Delete PDF Pages",
        description: "Remove unwanted pages from your PDF quickly and easily with advanced selection options. Permanently delete specific page ranges or individual pages.",
        category: 'pdf-management',
        layout: 'canvas',
        icon: Text,
        component: () => import('./delete-pages/tool.svelte'),
        color: 'text-pink-500',
        keywords: ['delete pdf pages', 'remove pages from pdf', 'pdf page deletion', 'eliminate pages', 'remove unwanted pages', 'delete from pdf', 'page removal tool']
    },
    "header-footer": {
        slug: "header-footer",
        title: "Add Header & Footer",
        description: "Easily add headers and footers to your PDF for a professional look. Customize fonts, sizes, colors, and positions with automatic page numbering options.",
        category: 'pdf-management',
        icon: LayoutTemplate,
        component: () => import('./header-footer/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['add header footer to pdf', 'pdf headers', 'pdf footers', 'header footer tool', 'professional pdf layout', 'add text to header', 'page header', 'document footer']
    },
    "background-color": {
        slug: "background-color",
        title: "Change Background Color",
        description: "Give PDF pages a solid background colour, for easier reading or print-ready tinted pages. Choose the colour and which pages to change.",
        category: 'pdf-management',
        icon: PaintBucket,
        component: () => import('./background-color/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['change pdf background color', 'pdf background', 'customize pdf appearance', 'background color tool', 'pdf styling', 'color pdf pages', 'document customization']
    },
    "remove-annotations": {
        slug: "remove-annotations",
        title: "Remove Annotations",
        description: "Strip every comment, highlight, stamp, drawing, link and form field from a PDF in one step, leaving a clean copy of the page content.",
        category: 'pdf-management',
        icon: Trash2,
        component: () => import('./remove-annotations/tool.svelte'),
        color: 'text-red-500',
        keywords: ['remove annotations from pdf', 'delete pdf comments', 'remove highlights from pdf', 'strip annotations', 'clean pdf', 'remove markup from pdf', 'annotation removal tool']
    },
    "remove-blank-pages": {
        slug: "remove-blank-pages",
        title: "Remove Blank Pages",
        description: "Automatically detect and remove blank pages from your PDF with intelligent algorithms. Reduce file size and improve document quality efficiently.",
        category: 'pdf-management',
        layout: 'canvas',
        icon: BookMinus,
        component: () => import('./remove-blank-pages/tool.svelte'),
        color: 'text-red-500',
        keywords: ['remove blank pages from pdf', 'delete blank pages', 'detect blank pages', 'clean pdf document', 'remove empty pages', 'pdf cleaning tool', 'automated page removal']
    },
    "extract-images": {
        slug: "extract-images",
        title: "Extract Images from PDF",
        description: "Easily extract all images from your PDF into separate files with high quality. Batch extraction with support for multiple image formats.",
        category: 'pdf-management',
        layout: 'canvas',
        icon: Eye,
        component: () => import('./extract-images/tool.svelte'),
        color: 'text-green-500',
        keywords: ['extract images from pdf', 'save images from pdf', 'pdf image extractor', 'download images from pdf', 'batch image extraction', 'image recovery tool', 'extract graphics from pdf']
    },
    "txt-to-pdf": {
        slug: "txt-to-pdf",
        title: "Text to PDF",
        description: "Convert plain text files into PDF format with customizable options. Preserve formatting with advanced typography and layout controls.",
        category: 'conversion',
        icon: FileText,
        component: () => import('./txt-to-pdf/tool.svelte'),
        color: 'text-green-500',
        keywords: ['text to pdf', 'convert text to pdf', 'txt to pdf converter', 'text file to pdf', 'create pdf from text', 'free text converter', 'document conversion']
    },
    "pdf-to-docx": {
        slug: "pdf-to-docx",
        title: "PDF to Docx",
        description: "Convert a PDF into an editable Word document. Works best on text-based files with simple layouts; scanned pages and complex columns need touching up.",
        category: 'conversion',
        icon: Layers,
        component: () => import('./pdf-to-docx/tool.svelte'),
        color: 'text-green-500',
        keywords: ['pdf to docx', 'pdf to word', 'convert pdf to word', 'pdf to document', 'editable word document', 'pdf conversion', 'doc converter', 'word document creator']
    },
    "pdf-to-excel": {
        slug: "pdf-to-excel",
        title: "PDF to Excel",
        description: "Pull the tables out of a PDF into an Excel spreadsheet you can sort and edit. Works best on tables with clear lines; cell values only.",
        category: 'conversion',
        icon: Maximize2,
        component: () => import('./pdf-to-excel/tool.svelte'),
        color: 'text-green-500',
        keywords: ['pdf to excel', 'convert pdf to excel', 'pdf table to spreadsheet', 'pdf data extraction', 'editable excel file', 'pdf conversion', 'excel converter', 'spreadsheet creator']
    },
    "pdf-for-ai": {
        slug: "pdf-for-ai",
        title: "PDF for AI",
        description: "Turn a PDF into structured JSON with one Markdown chunk per page and document details, ready for AI search and retrieval pipelines.",
        category: 'pdf-management',
        icon: RefreshCw,
        component: () => import('./pdf-for-ai/tool.svelte'),
        color: 'text-yellow-500',
        keywords: ['pdf for ai', 'optimize pdf for ai', 'clean pdf for ai', 'structure pdf for ai', 'format pdf for ai', 'ai document preparation', 'machine learning pdf', 'pdf preprocessing']
    },
    "ocr-pdf": {
        slug: "ocr-pdf",
        title: "OCR PDF",
        description: "Convert scanned PDFs into searchable and editable documents with OCR technology. Extract text from images for easy editing and indexing.",
        category: 'conversion',
        icon: ScanText,
        component: () => import('./ocr-pdf/tool.svelte'),
        color: 'text-green-500',
        keywords: ['ocr pdf', 'pdf ocr', 'optical character recognition', 'convert scanned pdf', 'searchable pdf', 'editable pdf', 'text extraction from pdf', 'ocr converter']
    },
    "view-metadata": {
        slug: "view-metadata",
        title: "View PDF Metadata",
        description: "Easily view and analyze metadata embedded in your PDF files. Access information like author, creation date, and custom properties with a simple interface.",
        category: 'pdf-management',
        icon: Info,
        component: () => import('./view-metadata/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['view pdf metadata', 'pdf properties viewer', 'pdf information tool', 'access pdf metadata', 'pdf author info', 'pdf creation date', 'custom pdf properties']
    },
    "edit-metadata": {
        slug: "edit-metadata",
        title: "Edit PDF Metadata",
        description: "Modify the metadata of your PDF files with ease. Update author, title, keywords, and custom properties to keep your documents organized.",
        category: 'pdf-management',
        icon: Settings,
        component: () => import('./edit-metadata/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['edit pdf metadata', 'modify pdf properties', 'update pdf information', 'change pdf author', 'edit pdf title', 'manage pdf keywords', 'customize pdf metadata']
    },
    "reverse-pages": {
        slug: "reverse-pages",
        title: "Reverse PDF Pages",
        description: "Quickly reverse the order of pages in your PDF document. Ideal for creating booklets or changing reading direction with a simple click.",
        category: 'pdf-management',
        icon: ArrowDownUp,
        component: () => import('./reverse-pages/tool.svelte'),
        color: 'text-purple-500',
        keywords: ['reverse pdf pages', 'flip pdf page order', 'pdf page reversal', 'change pdf reading direction', 'pdf booklet maker', 'reverse page sequence', 'pdf page flipper']
    },
    "pdf-to-text": {
        slug: "pdf-to-text",
        title: "PDF to Text",
        description: "Extract plain text from your PDF files with high accuracy. Ideal for repurposing content, creating summaries, or preparing documents for AI processing.",
        category: 'conversion',
        icon: AlignLeft,
        component: () => import('./pdf-to-text/tool.svelte'),
        color: 'text-green-500',
        keywords: ['pdf to text', 'extract text from pdf', 'pdf text extractor', 'convert pdf to text', 'plain text from pdf', 'pdf content extraction', 'text output from pdf', 'pdf to txt']
    },
    "fix-page-size": {
        slug: "fix-page-size",
        title: "Fix PDF Page Size",
        description: "Standardize the page size of your PDF documents for consistent printing and viewing. Adjust dimensions to fit common paper sizes or custom specifications.",
        category: 'pdf-management',
        icon: LayoutTemplate,
        component: () => import('./fix-page-size/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['fix pdf page size', 'standardize pdf dimensions', 'adjust pdf page size', 'pdf page resizing', 'set pdf page size', 'customize pdf dimensions', 'pdf layout adjustment']
    },
    "linearize-pdf":{
        slug: "linearize-pdf",
        title: "Linearize PDF",
        description: "Optimize your PDF for fast web viewing by linearizing its structure. Enable progressive loading of pages for a smoother online experience.",
        category: 'pdf-management',
        icon: Gauge,
        component: () => import('./linearize-pdf/tool.svelte'),
        color: 'text-yellow-500',
        keywords: ['linearize pdf', 'optimize pdf for web', 'progressive pdf loading', 'fast web viewing pdf', 'pdf linearization', 'web-optimized pdf', 'pdf streaming optimization']
    },
    "page-dimensions":{
        slug: "page-dimensions",
        title: "View Page Dimensions",
        description: "Easily view the dimensions of each page in your PDF document. Get detailed information about page size and layout for better document management.",
        category: 'pdf-management',
        icon: Info,
        component: () => import('./page-dimensions/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['view page dimensions', 'pdf page size viewer', 'page layout information', 'pdf page details', 'get pdf page dimensions', 'pdf page measurement', 'analyze pdf pages']
    },
    "deskew-pdf":{
        slug: "deskew-pdf",
        title: "Deskew PDF",
        description: "Automatically correct skewed pages in your PDF documents. Enhance readability and presentation by straightening scanned or misaligned pages with advanced algorithms.",
        category: 'pdf-management',
        icon: CropIcon,
        component: () => import('./deskew-pdf/tool.svelte'),
        color: 'text-red-500',
        keywords: ['deskew pdf', 'correct skewed pages', 'straighten pdf pages', 'pdf page alignment', 'fix misaligned pages', 'pdf deskewing tool', 'automated page correction']
    },
    "validate-signature-pdf":{
        slug: "validate-signature-pdf",
        title: "Validate PDF Signature",
        description: "Inspect the digital signatures in a PDF: who signed, their certificate, when it expires and whether the signature covers the whole file.",
        category: 'security',
        icon: Lock,
        component: () => import('./validate-signature-pdf/tool.svelte'),
        color: 'text-green-500',
        keywords: ['validate pdf signature', 'verify digital signature', 'pdf signature validation', 'check pdf signature authenticity', 'pdf document integrity', 'signature verification tool', 'trusted pdf signatures']
        
    },
    'strip-pdf': {
        slug: 'strip-pdf',
        title: 'Strip PDF',
        description: 'Remove duplicate and half-empty slide pages from presentations saved as PDF. When a PowerPoint or lecture deck is exported with its animation steps, every step becomes its own page; Strip PDF keeps only the last, complete page of each slide. Free, private and runs entirely in your browser.',
        seoTitle: 'Remove Duplicate Slides from PowerPoint PDFs',
        category: 'pdf-management',
        icon: Scissors,
        component: () => import('./strip-pdf/tool.svelte'),
        color: 'text-pink-500',
        keywords: [
            'remove duplicate slides from pdf',
            'remove animation slides from pdf',
            'powerpoint pdf duplicate pages',
            'pptx to pdf duplicate slides',
            'remove build steps from slides pdf',
            'one page per slide pdf',
            'lecture slides pdf remove duplicates',
            'remove incomplete slides pdf',
            'beamer overlays remove pdf',
            'flatten animated presentation pdf',
            'slide handout pdf',
            'strip pdf',
            'pdf stripper',
            'pdf page labels',
            'keep last page of each slide'
        ]
    },
    'md-to-pdf': {
        slug: 'md-to-pdf',
        title: 'Markdown to PDF',
        description: 'Convert Markdown into a clean, formatted PDF with headings, lists, code blocks and emphasis all rendered. Paste your Markdown or load a .md file. Free and fully offline; nothing is uploaded.',
        category: 'conversion',
        icon: FileText,
        component: () => import('./md-to-pdf/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['markdown to pdf', 'md to pdf', 'convert markdown to pdf', 'markdown pdf converter', 'render markdown as pdf', 'md file to pdf', 'export markdown to pdf', 'free markdown to pdf']
    },
    'pdf-to-md': {
        slug: 'pdf-to-md',
        title: 'PDF to Markdown',
        description: 'Extract a text-based PDF into clean Markdown, with headings, lists, and paragraphs inferred automatically. Ideal for repurposing documents or preparing content for AI. Runs entirely in your browser.',
        category: 'conversion',
        icon: Text,
        component: () => import('./pdf-to-md/tool.svelte'),
        color: 'text-green-500',
        keywords: ['pdf to markdown', 'pdf to md', 'convert pdf to markdown', 'extract markdown from pdf', 'pdf markdown converter', 'pdf to md file', 'pdf to text markdown', 'free pdf to markdown']
    },
    'esign-pdf': {
        slug: 'esign-pdf',
        title: 'Sign PDF (eSign)',
        description: 'Add your signature to a PDF: draw it, type it or upload an image, then place it on any page and download. A fast, free electronic signature that works entirely on your device.',
        category: 'security',
        layout: 'canvas',
        icon: PenLine,
        component: () => import('./esign-pdf/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['sign pdf', 'esign pdf', 'electronic signature pdf', 'add signature to pdf', 'draw signature on pdf', 'fill and sign pdf', 'free pdf signature', 'sign document online']
    },
    'sign-pdf': {
        slug: 'sign-pdf',
        title: 'Digitally Sign PDF',
        description: 'Apply a real cryptographic (PAdES) digital signature to a PDF using your certificate. It is tamper-evident and independently verifiable. Or generate a self-signed certificate in seconds. 100% on-device; your document and private key never leave the browser.',
        category: 'security',
        icon: ShieldCheck,
        component: () => import('./sign-pdf/tool.svelte'),
        color: 'text-green-500',
        keywords: ['digital signature pdf', 'sign pdf with certificate', 'pades signature', 'pkcs7 pdf signature', 'cryptographic pdf signature', 'self-signed certificate pdf', 'tamper evident pdf', 'free digital signing']
    },
    'excel-to-pdf': {
        slug: 'excel-to-pdf',
        title: "Excel to PDF",
        description: "Turn Excel, CSV and OpenDocument spreadsheets into clean, printable PDF tables. Pick sheets, repeat the header on every page, and nothing leaves your device.",
        seoTitle: "Convert Excel and CSV to PDF Without Uploading",
        category: 'conversion',
        layout: 'form',
        icon: IconFileSpreadsheet,
        component: () => import('./excel-to-pdf/tool.svelte'),
        color: 'text-green-600',
        keywords: ["excel to pdf","xlsx to pdf","csv to pdf","convert excel to pdf","spreadsheet to pdf","xls to pdf","ods to pdf","print excel sheet to pdf","excel table to pdf","repeat header row pdf","landscape excel pdf","free excel to pdf converter","excel to pdf offline"]
    },
    'scan-to-pdf': {
        slug: 'scan-to-pdf',
        title: "Scan to PDF",
        description: "Photograph documents with your phone or webcam and turn them into one PDF. Reorder, rotate and sharpen pages for reading. Private, with nothing uploaded.",
        seoTitle: "Scan Documents to PDF with Your Phone or Webcam",
        category: 'conversion',
        layout: 'canvas',
        icon: IconScan,
        component: () => import('./scan-to-pdf/tool.svelte'),
        color: 'text-sky-500',
        keywords: ["scan to pdf","scan document to pdf","phone scanner pdf","webcam scanner","camera to pdf","photo to pdf scanner","scan receipts to pdf","document scanner online","scan multiple pages into one pdf","free pdf scanner","scan without app","private document scanner"]
    },
    'compare-pdf': {
        slug: 'compare-pdf',
        title: "Compare PDFs",
        description: "Compare two versions of a PDF and see every added and removed word, page by page. Jump from change to change. Free, private and runs entirely in your browser.",
        seoTitle: "Compare Two PDF Files and Find the Differences",
        category: 'pdf-management',
        layout: 'canvas',
        icon: IconGitCompare,
        component: () => import('./compare-pdf/tool.svelte'),
        color: 'text-sky-500',
        keywords: ["compare pdf","compare two pdf files","pdf diff","find differences between pdfs","pdf comparison tool","compare pdf versions","track changes pdf","what changed in pdf","compare contracts pdf","text difference pdf","pdf compare without upload","redline pdf"]
    },
    'read-pdf-aloud': {
        slug: 'read-pdf-aloud',
        title: "Read PDF Aloud",
        description: "Listen to any PDF read aloud with a voice from your device. Pick a voice and speed, start from any page and follow along as each sentence is highlighted. Free and private.",
        seoTitle: "Read PDF Aloud: Listen to Any PDF for Free",
        category: 'essentials',
        layout: 'canvas',
        icon: IconHeadphones,
        component: () => import('./read-pdf-aloud/tool.svelte'),
        color: 'text-violet-500',
        keywords: ["read pdf aloud","pdf text to speech","listen to pdf","pdf reader voice","pdf to speech online","read my pdf out loud","text to speech pdf free","pdf narrator","accessibility pdf reader","dyslexia pdf reader"]
    },
    'pages-per-sheet': {
        slug: 'pages-per-sheet',
        title: "Pages per Sheet",
        description: "Print 2, 4, 6, 8 or 9 pages on each sheet of paper. Choose the sheet size, orientation, margins, gaps and page order, and see a live preview. Free and runs entirely in your browser.",
        seoTitle: "Print Multiple PDF Pages per Sheet (N-up)",
        category: 'pdf-management',
        layout: 'form',
        icon: IconLayoutGrid,
        component: () => import('./pages-per-sheet/tool.svelte'),
        color: 'text-amber-500',
        keywords: ["pages per sheet pdf","n-up pdf","multiple pages per sheet","2 pages per sheet pdf","4 pages per sheet pdf","print slides handout pdf","pdf imposition","combine pages on one sheet","print several pages on one page","save paper printing pdf"]
    },
    'flatten-pdf': {
        slug: 'flatten-pdf',
        title: "Flatten PDF",
        description: "Lock filled-in form fields, highlights, stamps and comments into the page so nobody can edit them. Works on many files at once, free and private; files never leave your browser.",
        seoTitle: "Flatten PDF Forms and Comments",
        category: 'pdf-management',
        layout: 'form',
        icon: Layers,
        component: () => import('./flatten-pdf/tool.svelte'),
        color: 'text-teal-500',
        keywords: ["flatten pdf","flatten pdf form","flatten pdf annotations","make pdf form uneditable","lock pdf form fields","flatten fillable pdf","flatten pdf comments","pdf form to static pdf","prevent pdf editing","flatten pdf online free"]
    },
    'repair-pdf': {
        slug: 'repair-pdf',
        title: "Repair PDF",
        description: "Fix PDFs that will not open or show errors. Orbit rebuilds damaged or half-downloaded files from the parts it can still read and tells you what it recovered. Runs in your browser.",
        seoTitle: "Repair Damaged or Corrupted PDF Files",
        category: 'pdf-management',
        layout: 'form',
        icon: IconFirstAidKit,
        component: () => import('./repair-pdf/tool.svelte'),
        color: 'text-rose-500',
        keywords: ["repair pdf","fix corrupted pdf","recover damaged pdf","pdf will not open","fix broken pdf","pdf repair tool","restore pdf file","fix pdf xref error","repair pdf online free","corrupt pdf recovery"]
    },
    'pdf-privacy-check': {
        slug: 'pdf-privacy-check',
        title: "PDF Privacy Check",
        description: "Check a PDF for hidden names, metadata, attached files, scripts and comments before you share it, then remove them in one click. Runs entirely in your browser.",
        seoTitle: "Check a PDF for Hidden Data Before Sharing",
        category: 'security',
        layout: 'form',
        icon: IconShieldSearch,
        component: () => import('./pdf-privacy-check/tool.svelte'),
        color: 'text-emerald-500',
        keywords: ["pdf privacy check","remove hidden data from pdf","pdf metadata remover","remove author from pdf","sanitize pdf","remove javascript from pdf","check pdf for hidden information","clean pdf before sharing","pdf document inspector","strip pdf metadata"]
    },
    'pdf-color-filters': {
        slug: 'pdf-color-filters',
        title: "PDF Color Filters",
        description: "Make a PDF grayscale, black and white, inverted for night reading, sepia or scanner style, or adjust brightness and contrast. Live preview, all in your browser.",
        seoTitle: "Make a PDF Grayscale, Black and White or Dark Mode",
        category: 'conversion',
        layout: 'form',
        icon: IconColorFilter,
        component: () => import('./pdf-color-filters/tool.svelte'),
        color: 'text-fuchsia-500',
        keywords: ["pdf grayscale","black and white pdf","invert pdf colors","pdf dark mode","sepia pdf","make pdf look scanned","scanner effect pdf","pdf brightness contrast","convert pdf to grayscale","pdf night mode"]
    },
    'rasterize-pdf': {
        slug: 'rasterize-pdf',
        title: "Rasterize PDF",
        description: "Turn every PDF page into a flat image to lock in forms, comments and layers, stop text copying, or fix pages that print wrongly. Choose DPI, JPG or PNG, and grayscale.",
        seoTitle: "Rasterize PDF: Flatten Pages Into Images",
        category: 'security',
        layout: 'form',
        icon: IconPhotoScan,
        component: () => import('./rasterize-pdf/tool.svelte'),
        color: 'text-slate-500',
        keywords: ["rasterize pdf","flatten pdf to image","prevent copying pdf text","flatten pdf layers","fix pdf printing problems","convert pdf pages to images","image only pdf","remove hidden text pdf","non editable pdf"]
    },
    'insert-blank-pages': {
        slug: 'insert-blank-pages',
        title: "Insert Blank Pages",
        description: "Add blank pages to a PDF at the start, the end, after every few pages or after the pages you pick. Match the page size or use A4 or Letter.",
        seoTitle: "Add Blank Pages to a PDF",
        category: 'pdf-management',
        layout: 'canvas',
        icon: IconFileDiff,
        component: () => import('./insert-blank-pages/tool.svelte'),
        color: 'text-teal-500',
        keywords: ["insert blank page pdf","add blank page to pdf","add empty page pdf","blank page between pdf pages","add page to pdf","insert page in pdf","pdf notes pages","add blank page at end of pdf"]
    },
    'alternate-mix-pdf': {
        slug: 'alternate-mix-pdf',
        title: "Alternate & Mix Pages",
        description: "Combine PDFs by taking pages from each in turn. Collate double-sided scans, reverse a file, or take several pages per turn. Free and private; files never leave your device.",
        seoTitle: "Collate Double-Sided Scans into One PDF",
        category: 'pdf-management',
        layout: 'form',
        icon: IconArrowsShuffle,
        component: () => import('./alternate-mix-pdf/tool.svelte'),
        color: 'text-teal-500',
        keywords: ["alternate pages pdf","mix pdf pages","collate double sided scans","combine front and back scans pdf","interleave pdf pages","merge odd and even pages pdf","duplex scan merge","reverse back pages scan","combine two pdfs alternately"]
    },
    'divide-pages': {
        slug: 'divide-pages',
        title: "Divide Pages",
        description: "Cut PDF pages into parts. Split scanned book spreads into single pages, separate top and bottom halves, or divide a poster into a grid. Text stays sharp and nothing is uploaded.",
        seoTitle: "Split Scanned Book Pages in Half",
        category: 'pdf-management',
        layout: 'form',
        icon: IconLayoutColumns,
        component: () => import('./divide-pages/tool.svelte'),
        color: 'text-orange-500',
        keywords: ["split pdf page in half","divide pdf pages","split scanned book pages","cut pdf page into two","split two page spread pdf","split pdf page vertically","split poster pdf into tiles","separate double page scan","split a3 to a4 pdf"]
    },
    'pdf-booklet': {
        slug: 'pdf-booklet',
        title: "Make a Booklet",
        description: "Arrange a PDF for booklet printing. Pages are laid out two to a sheet in the right order, so you print double-sided, fold and staple. A4, Letter or original size, left or right binding.",
        seoTitle: "Print a PDF as a Booklet",
        category: 'pdf-management',
        layout: 'form',
        icon: IconBook2,
        component: () => import('./pdf-booklet/tool.svelte'),
        color: 'text-violet-500',
        keywords: ["pdf booklet maker","print pdf as booklet","booklet printing pdf","saddle stitch imposition","make a booklet from pdf","zine maker pdf","fold and staple booklet","a5 booklet from a4 pdf","imposition pdf free"]
    },
    'bates-numbering': {
        slug: 'bates-numbering',
        title: "Bates Numbering",
        description: "Stamp sequential Bates numbers like ABC000001 on every page of one or many PDFs. Set prefix, suffix, digits, start number and position, and see the range each file gets. Private, in your browser.",
        seoTitle: "Add Bates Numbers to PDFs Free",
        category: 'pdf-management',
        layout: 'form',
        icon: IconHash,
        component: () => import('./bates-numbering/tool.svelte'),
        color: 'text-slate-600',
        keywords: ["bates numbering pdf","bates stamp pdf","add bates numbers to pdf","legal document numbering","bates numbering free","discovery document numbering","number pages across multiple pdfs","bates numbering without acrobat","exhibit numbering pdf"]
    },
    'fill-pdf-form': {
        slug: 'fill-pdf-form',
        title: "Fill PDF Form",
        description: "Fill in PDF forms in your browser: type into text boxes, tick checkboxes, pick options, then download a filled copy that stays editable or is flattened. Nothing is uploaded.",
        seoTitle: "Fill Out PDF Forms Online Free",
        category: 'pdf-management',
        layout: 'canvas',
        icon: IconForms,
        component: () => import('./fill-pdf-form/tool.svelte'),
        color: 'text-teal-500',
        keywords: ["fill pdf form","fill out pdf","pdf form filler","fillable pdf","type on pdf form","complete pdf form online","fill pdf without adobe","edit pdf form fields","free pdf form filler"]
    },
    'overlay-pdf': {
        slug: 'overlay-pdf',
        title: "Overlay PDF",
        description: "Place the pages of one PDF on top of or behind another: add letterhead, stamps, backgrounds or a Confidential template to every page. Set opacity, size and which pages. Runs in your browser.",
        seoTitle: "Add Letterhead or Stamp to PDF Pages",
        category: 'pdf-management',
        layout: 'form',
        icon: IconStackFront,
        component: () => import('./overlay-pdf/tool.svelte'),
        color: 'text-violet-500',
        keywords: ["overlay pdf","pdf overlay","add letterhead to pdf","stamp pdf pages","pdf background","merge pdf on top of another","superimpose pdf","pdf template overlay","pdf underlay","letterhead pdf free"]
    },
    'pdf-attachments': {
        slug: 'pdf-attachments',
        title: "PDF Attachments",
        description: "See the files embedded in a PDF, download them one by one or as a ZIP, remove the ones you do not want, and attach new files. Free, private and runs entirely in your browser.",
        seoTitle: "Extract, Add or Remove PDF Attachments",
        category: 'pdf-management',
        layout: 'form',
        icon: IconPaperclip,
        component: () => import('./pdf-attachments/tool.svelte'),
        color: 'text-amber-500',
        keywords: ["pdf attachments","extract attachments from pdf","embedded files in pdf","add attachment to pdf","remove attachment from pdf","attach file to pdf","download files inside pdf","zugferd xml extract","embed file in pdf free"]
    },
};


Object.freeze(tools);

export const getTool = (slug: string) => tools[slug] || null;

export { tools };

export const toolKeys = Object.keys(tools);
export const toolList = Object.values(tools);

export const getRecommendedTools = (slug: string): Omit<ToolConfig & {relevance: number}, 'component'>[] => {
    const tool = getTool(slug);
    if (!tool) return [];
    return toolList.map(({component, ...t}) => {
        if (t.slug === slug) return null;
        const sharedKeywords = t.keywords?.filter(keyword => tool.keywords?.includes(keyword)) || [];
        return { ...t, relevance: sharedKeywords.length };
    }).filter((t): t is Omit<ToolConfig & {relevance: number}, 'component'> => t !== null).sort((a, b) => (b?.relevance || 0) - (a?.relevance || 0)).slice(0, 5);
}

export const getToolsByCategory = (category: string) => Object.values(tools)
    .filter(tool => tool.category === category);
