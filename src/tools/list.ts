import {
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
        category: 'PDF Management',
        icon: FileStack,
        component: () => import('./merge-pdf/tool.svelte'),
        color: 'text-indigo-500'
    },
    "multi-pdf": {
        slug: "multi-pdf",
        title: "PDF Multi-Tool",
        description: "Upload, rearrange, rotate, and export multiple PDF pages with ease.",
        category: 'Essential',
        icon: FileText,
        component: () => import('./multi-pdf/tool.svelte'),
        color: "text-primary",
    },
    'split-pdf': {
        slug: 'split-pdf',
        title: 'Split PDF',
        description: 'Extract pages, split ranges, or divide your PDF into multiple files.',
        category: 'Essential',
        icon: Scissors,
        component: () => import('./split-pdf/tool.svelte'),
        color: 'text-pink-500'
    },
    'compress-pdf': {
        slug: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Reduce file size while maintaining quality. Advanced optimization options.',
        category: 'Essential',
        icon: Zap,
        component: () => import('./compress-pdf/tool.svelte'),
        color: 'text-yellow-500'
    },
    'img-to-pdf': {
        slug: 'img-to-pdf',
        title: 'Image to PDF',
        description: 'Convert images to PDF instantly. Supports JPG, PNG, and more.',
        category: 'Conversion',
        icon: ImageIcon,
        component: () => import('./img-to-pdf/tool.svelte'),
        color: 'text-orange-500'
    },
    "pdf-to-img": {
        slug: "pdf-to-img",
        title: "PDF to Image",
        description: "Convert PDF pages into high-quality images. Supports JPG and PNG formats.",
        category: 'Conversion',
        icon: ImageIcon,
        component: () => import('./pdf-to-img/tool.svelte'),
        color: 'text-blue-500'
    },
    'encrypt-pdf': {
        slug: 'encrypt-pdf',
        title: 'Encrypt PDF',
        description: 'Protect your PDF with a password. Simple and secure encryption.',
        category: 'Security',
        icon: Lock,
        component: () => import('./encrypt-pdf/tool.svelte'),
        color: 'text-green-500'
    },
    'decrypt-pdf': {
        slug: 'decrypt-pdf',
        title: 'Decrypt PDF',
        description: 'Remove password protection from your PDF. Simple and secure decryption.',
        category: 'Security',
        icon: Unlock,
        component: () => import('./decrypt-pdf/tool.svelte'),
        color: 'text-green-500'
    },
    'rotate-pdf': {
        slug: 'rotate-pdf',
        title: 'Rotate PDF',
        description: 'Easily rotate PDF pages to the correct orientation. Supports batch processing.',
        category: 'PDF Management',
        icon: RotateCw,
        component: () => import('./rotate-pdf/tool.svelte'),
        color: 'text-purple-500'
    },
    'organize-pdf': {
        slug: 'organize-pdf',
        title: 'Organize PDF',
        description: 'Easily organize PDF pages. Supports batch processing.',
        category: 'PDF Management',
        icon: MoveIcon,
        component:() => import('./organize-pdf/tool.svelte'),
        color: 'text-purple-500'
    }
};


Object.freeze(tools);

export const getTool = (slug: string) => tools[slug] || null;
export { tools };
export const availableTools = Object.keys(tools)