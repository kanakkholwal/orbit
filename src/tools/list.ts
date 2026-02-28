import {
    Bookmark,
    BookMinus,
    CropIcon,
    Edit3Icon,
    FileIcon,
    FileMinus2,
    FileStack,
    FileText,
    Highlighter,
    ImageIcon,
    LayoutTemplate,
    Lock,
    MoveIcon,
    PaintBucket,
    RotateCw,
    Scissors,
    Text,
    Trash2,
    Unlock,
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
    category?: string;
    keywords?: string[]
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
        description: 'Combine multiple PDF files into one single document in seconds. Drag and drop to reorder pages.',
        category: "essentials",
        icon: FileStack,
        component: () => import('./merge-pdf/tool.svelte'),
        color: 'text-indigo-500'
    },
    "multi-pdf": {
        slug: "multi-pdf",
        title: "PDF Multi-Tool",
        description: "Upload, rearrange, rotate, and export multiple PDF pages with ease.",
        category: "essentials",
        icon: FileText,
        component: () => import('./multi-pdf/tool.svelte'),
        color: "text-primary",
    },
    'split-pdf': {
        slug: 'split-pdf',
        title: 'Split PDF',
        description: 'Extract pages, split ranges, or divide your PDF into multiple files.',
        category: "essentials",
        icon: Scissors,
        component: () => import('./split-pdf/tool.svelte'),
        color: 'text-pink-500'
    },
    'compress-pdf': {
        slug: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Reduce file size while maintaining quality. Advanced optimization options.',
        category: "essentials",
        icon: Zap,
        component: () => import('./compress-pdf/tool.svelte'),
        color: 'text-yellow-500'
    },
    'img-to-pdf': {
        slug: 'img-to-pdf',
        title: 'Image to PDF',
        description: 'Convert images to PDF instantly. Supports JPG, PNG, and more.',
        category: 'conversion',
        icon: ImageIcon,
        component: () => import('./img-to-pdf/tool.svelte'),
        color: 'text-orange-500'
    },
    "pdf-to-img": {
        slug: "pdf-to-img",
        title: "PDF to Image",
        description: "Convert PDF pages into high-quality images. Supports JPG and PNG formats.",
        category: 'conversion',
        icon: FileIcon,
        component: () => import('./pdf-to-img/tool.svelte'),
        color: 'text-blue-500'
    },
    'encrypt-pdf': {
        slug: 'encrypt-pdf',
        title: 'Encrypt PDF',
        description: 'Protect your PDF with a password. Simple and secure encryption.',
        category: 'security',
        icon: Lock,
        component: () => import('./encrypt-pdf/tool.svelte'),
        color: 'text-green-500'
    },
    'decrypt-pdf': {
        slug: 'decrypt-pdf',
        title: 'Decrypt PDF',
        description: 'Remove password protection from your PDF. Simple and secure decryption.',
        category: 'security',
        icon: Unlock,
        component: () => import('./decrypt-pdf/tool.svelte'),
        color: 'text-green-500'
    },
    'rotate-pdf': {
        slug: 'rotate-pdf',
        title: 'Rotate PDF',
        description: 'Easily rotate PDF pages to the correct orientation. Supports batch processing.',
        category: 'pdf-management',
        icon: RotateCw,
        component: () => import('./rotate-pdf/tool.svelte'),
        color: 'text-purple-500'
    },
    'organize-pdf': {
        slug: 'organize-pdf',
        title: 'Organize PDF',
        description: 'Easily organize PDF pages. Supports batch processing.',
        category: 'pdf-management',
        icon: MoveIcon,
        component: () => import('./organize-pdf/tool.svelte'),
        color: 'text-purple-500'
    },
    "extract-pages": {
        slug: "extract-pages",
        title: "Extract PDF Pages",
        description: "Select and extract specific pages from your PDF into a new file.",
        category: 'pdf-management',
        icon: Scissors,
        component: () => import('./extract-pages/tool.svelte'),
        color: 'text-pink-500'
    },
    "crop-pdf": {
        slug: "crop-pdf",
        title: "Crop PDF",
        description: "Crop PDF pages to remove unwanted areas or adjust layout.",
        category: 'pdf-management',
        icon: CropIcon,
        component: () => import('./crop-pdf/tool.svelte'),
        color: 'text-red-500'
    },
    "edit-pdf": {
        slug: "edit-pdf",
        title: "Edit PDF",
        description: "Edit PDF content directly. Add text, images, and annotations.",
        category: 'pdf-management',
        icon: Edit3Icon,
        component: () => import('./edit-pdf/tool.svelte'),
        color: 'text-blue-500'
    },
    "bookmark-pdf": {
        slug: "bookmark-pdf",
        title: "Bookmark PDF",
        description: "Add, edit, and manage bookmarks in your PDF for easy navigation.",
        category: 'pdf-management',
        icon: Bookmark,
        component: () => import('./bookmark-pdf/tool.svelte'),
        color: 'text-blue-500'
    },
    // "add-toc-pdf":{
    //     slug: "add-toc-pdf",
    //     title: "Table of Contents",
    //     description: "Generate and add a table of contents to your PDF for better organization.",
    //     category: 'pdf-management',
    //     icon: FileText,
    //     component: () => import('./add-toc-pdf/tool.svelte'),
    //     color: 'text-blue-500'
    // },
    "add-page-no-pdf": {
        slug: "add-page-no-pdf",
        title: "Add Page Numbers",
        description: "Easily add page numbers to your PDF for better readability.",
        category: 'pdf-management',
        icon: Text,
        component: () => import('./add-page-no-pdf/tool.svelte'),
        color: 'text-blue-500'
    },
    "add-watermark-pdf": {
        slug: "add-watermark-pdf",
        title: "Add Watermark",
        description: "Protect your PDF by adding a custom watermark to your pages.",
        category: 'pdf-management',
        icon: Highlighter,
        component: () => import('./add-watermark-pdf/tool.svelte'),
        color: 'text-blue-500'
    },
    "delete-pages": {
        slug: "delete-pages",
        title: "Delete PDF Pages",
        description: "Remove unwanted pages from your PDF quickly and easily.",
        category: 'pdf-management',
        icon: FileMinus2,
        component: () => import('./delete-pages/tool.svelte'),
        color: 'text-pink-500'
    },
    "header-footer": {
        slug: "header-footer",
        title: "Add Header & Footer",
        description: "Easily add headers and footers to your PDF for a professional look.",
        category: 'pdf-management',
        icon: LayoutTemplate,
        component: () => import('./header-footer/tool.svelte'),
        color: 'text-blue-500'
    },
    "background-color": {
        slug: "background-color",
        title: "Change Background Color",
        description: "Customize your PDF by changing the background color of your pages.",
        category: 'pdf-management',
        icon: PaintBucket,
        component: () => import('./background-color/tool.svelte'),
        color: 'text-blue-500'
    },
    "remove-annotations": {
        slug: "remove-annotations",
        title: "Remove Annotations",
        description: "Easily remove annotations from your PDF pages for a cleaner look.",
        category: 'pdf-management',
        icon: Trash2,
        component: () => import('./remove-annotations/tool.svelte'),
        color: 'text-red-500'
    },
    "remove-blank-pages": {
        slug: "remove-blank-pages",
        title: "Remove Blank Pages",
        description: "Automatically detect and remove blank pages from your PDF.",
        category: 'pdf-management',
        icon: BookMinus,
        component: () => import('./remove-blank-pages/tool.svelte'),
        color: 'text-red-500'
    },
    "extract-images": {
        slug: "extract-images",
        title: "Extract Images from PDF",
        description: "Easily extract all images from your PDF into separate files.",
        category: 'pdf-management',
        icon: ImageIcon,
        component: () => import('./extract-images/tool.svelte'),
        color: 'text-green-500'
    },
    "txt-to-pdf": {
        slug: "txt-to-pdf",
        title: "Text to PDF",
        description: "Convert plain text files into PDF format with customizable options.",
        category: 'pdf-management',
        icon: FileText,
        component: () => import('./txt-to-pdf/tool.svelte'),
        color: 'text-green-500'
    },
    "pdf-to-docx": {
        slug: "pdf-to-docx",
        title: "PDF to Docx",
        description: "Convert PDF files to editable Word documents.",
        category: 'pdf-management',
        icon: FileText,
        component: () => import('./pdf-to-docx/tool.svelte'),
        color: 'text-green-500'
    }
};


Object.freeze(tools);

export const getTool = (slug: string) => tools[slug] || null;

export { tools };

export const toolKeys = Object.keys(tools);
export const toolList = Object.values(tools);

export const getToolsByCategory = (category: string) => Object.values(tools)
    .filter(tool => tool.category === category);
