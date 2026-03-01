import {
    Bookmark,
    BookMinus,
    Copy,
    CropIcon,
    Edit3Icon,
    Eye,
    FileIcon,
    FileMinus2,
    FileStack,
    FileText,
    Highlighter,
    ImageIcon,
    Info,
    Layers,
    LayoutTemplate,
    Lock,
    Maximize2,
    MoveIcon,
    PaintBucket,
    RefreshCw,
    RotateCw,
    Scissors,
    Settings,
    Text,
    Trash2,
    Unlock,
    WandIcon,
    Zap,
    type Icon
} from '@lucide/svelte';
import type { Component } from 'svelte';



export interface ToolConfig {
    slug: string;
    title: string;
    description: string;
    icon: typeof Icon;
    component: () => Promise<{ default: Component }>;
    color: string;
    category: string;
    keywords?: string[]; // Optional array of keywords for SEO and search functionality
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
        icon: ImageIcon,
        component: () => import('./img-to-pdf/tool.svelte'),
        color: 'text-orange-500',
        keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert image to pdf', 'image converter', 'pdf converter', 'free image to pdf', 'batch image to pdf', 'photo to pdf']
    },
    "pdf-to-img": {
        slug: "pdf-to-img",
        title: "PDF to Image",
        description: "Convert PDF pages into high-quality images in JPG and PNG formats. Free online PDF to image converter with batch processing and custom resolution settings.",
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
        description: "Crop PDF pages to remove unwanted areas or adjust layout precisely. Advanced cropping tool with visual preview and batch processing support.",
        category: 'pdf-management',
        icon: CropIcon,
        component: () => import('./crop-pdf/tool.svelte'),
        color: 'text-red-500',
        keywords: ['crop pdf', 'crop pdf pages', 'pdf cropping tool', 'trim pdf', 'remove margins from pdf', 'adjust pdf layout', 'pdf crop editor', 'page cropper']
    },
    "edit-pdf": {
        slug: "edit-pdf",
        title: "Edit PDF",
        description: "Edit PDF content directly with advanced tools. Add and edit text, insert images, and manage annotations without external software.",
        category: 'pdf-management',
        icon: Edit3Icon,
        component: () => import('./edit-pdf/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['edit pdf', 'pdf editor', 'edit pdf online', 'add text to pdf', 'pdf annotation', 'modify pdf', 'free pdf editor', 'edit pdf text', 'pdf markup tool']
    },
    "bookmark-pdf": {
        slug: "bookmark-pdf",
        title: "Bookmark PDF",
        description: "Add, edit, and manage bookmarks in your PDF for easy navigation. Create interactive table of contents with customizable bookmark hierarchy.",
        category: 'pdf-management',
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
        description: "Protect your PDF by adding custom text or image watermarks to pages. Prevent unauthorized copying with visible or invisible watermark options.",
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
        description: "Customize your PDF by changing the background color of your pages. Apply solid colors or gradients with flexible customization options.",
        category: 'pdf-management',
        icon: PaintBucket,
        component: () => import('./background-color/tool.svelte'),
        color: 'text-blue-500',
        keywords: ['change pdf background color', 'pdf background', 'customize pdf appearance', 'background color tool', 'pdf styling', 'color pdf pages', 'document customization']
    },
    "remove-annotations": {
        slug: "remove-annotations",
        title: "Remove Annotations",
        description: "Easily remove annotations from your PDF pages for a cleaner appearance. Delete comments, highlights, stamps, and markup objects selectively.",
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
        description: "Convert PDF files to editable Word documents seamlessly. Preserve formatting, fonts, and layout with intelligent conversion technology.",
        category: 'conversion',
        icon: Layers,
        component: () => import('./pdf-to-docx/tool.svelte'),
        color: 'text-green-500',
        keywords: ['pdf to docx', 'pdf to word', 'convert pdf to word', 'pdf to document', 'editable word document', 'pdf conversion', 'doc converter', 'word document creator']
    },
    "pdf-to-excel": {
        slug: "pdf-to-excel",
        title: "PDF to Excel",
        description: "Convert PDF tables into editable Excel spreadsheets with high accuracy. Preserve data structure and formatting for seamless spreadsheet creation.",
        category: 'conversion',
        icon: Maximize2,
        component: () => import('./pdf-to-excel/tool.svelte'),
        color: 'text-green-500',
        keywords: ['pdf to excel', 'convert pdf to excel', 'pdf table to spreadsheet', 'pdf data extraction', 'editable excel file', 'pdf conversion', 'excel converter', 'spreadsheet creator']
    },
    "pdf-for-ai": {
        slug: "pdf-for-ai",
        title: "PDF for AI",
        description: "Optimize your PDF documents for AI processing and analysis. Clean, structure, and format PDFs to enhance machine learning performance.",
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
        icon: Copy,
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
        icon: RefreshCw,
        component: () => import('./reverse-pages/tool.svelte'),
        color: 'text-purple-500',
        keywords: ['reverse pdf pages', 'flip pdf page order', 'pdf page reversal', 'change pdf reading direction', 'pdf booklet maker', 'reverse page sequence', 'pdf page flipper']
    },
    "pdf-to-text": {
        slug: "pdf-to-text",
        title: "PDF to Text",
        description: "Extract plain text from your PDF files with high accuracy. Ideal for repurposing content, creating summaries, or preparing documents for AI processing.",
        category: 'conversion',
        icon: Text,
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
        icon: Zap,
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
    }
};


Object.freeze(tools);

export const getTool = (slug: string) => tools[slug] || null;

export { tools };

export const toolKeys = Object.keys(tools);
export const toolList = Object.values(tools);

export const getToolsByCategory = (category: string) => Object.values(tools)
    .filter(tool => tool.category === category);
