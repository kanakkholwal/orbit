import {
    CropIcon,
    FileStack,
    FileText,
    ImageIcon,
    Lock,
    MoveIcon,
    RotateCw,
    Scissors,
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
        icon: ImageIcon,
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
    "edit-pdf":{
        slug: "edit-pdf",
        title: "Edit PDF",
        description: "Edit PDF content directly. Add text, images, and annotations.",
        category: 'pdf-management',
        icon: FileText,
        component: () => import('./edit-pdf/tool.svelte'),
        color: 'text-blue-500'
    },
    "bookmark-pdf":{
        slug: "bookmark-pdf",
        title: "Bookmark PDF",
        description: "Add, edit, and manage bookmarks in your PDF for easy navigation.",
        category: 'pdf-management',
        icon: FileText,
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
    "add-page-no-pdf":{
        slug: "add-page-no-pdf",
        title: "Add Page Numbers",
        description: "Easily add page numbers to your PDF for better readability.",
        category: 'pdf-management',
        icon: FileText,
        component: () => import('./add-page-no-pdf/tool.svelte'),
        color: 'text-blue-500'
    },
    "add-watermark-pdf":{
        slug: "add-watermark-pdf",
        title: "Add Watermark",
        description: "Protect your PDF by adding a custom watermark to your pages.",
        category: 'pdf-management',
        icon: FileText,
        component: () => import('./add-watermark-pdf/tool.svelte'),
        color: 'text-blue-500'
    }
};


Object.freeze(tools);

export const getTool = (slug: string) => tools[slug] || null;

export { tools };

export const toolKeys = Object.keys(tools);
export const toolList = Object.values(tools);

export const getToolsByCategory = (category: string) => Object.values(tools)
    .filter(tool => tool.category === category);
