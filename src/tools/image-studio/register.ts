import type { ToolConfig } from '../list';
import { STUDIO_BASE, STUDIO_DEFS, type StudioMode } from './defs';

/** Alias pages reuse the written guide of the base tool for their mode. */
export const MODE_BASE: Record<StudioMode, string> = {
    resize: 'image-resize',
    compress: 'image-compress',
    crop: 'image-crop',
    convert: 'image-convert',
    form: 'photo-for-forms'
};

export const IMAGE_ALIAS_BASE: Record<string, string> = Object.fromEntries(
    STUDIO_DEFS.filter((d) => !STUDIO_BASE.includes(d)).map((d) => [d.slug, MODE_BASE[d.mode]])
);

/** Links shown as "related" in both directions, ahead of keyword matches. */
const HUB = ['photo-for-forms', 'image-compress', 'image-resize', 'image-crop', 'image-convert'];
const OUTSIDE: Record<string, string[]> = {
    'image-compress': ['compress-pdf', 'compress-pdf-to-100kb', 'img-to-pdf'],
    'image-convert': ['img-to-pdf', 'pdf-to-img'],
    'photo-for-forms': ['img-to-pdf', 'compress-pdf'],
    'image-resize': ['img-to-pdf'],
    'image-crop': ['img-to-pdf']
};

export function buildImageTools(): Record<string, ToolConfig> {
    const out: Record<string, ToolConfig> = {};
    for (const d of STUDIO_DEFS) {
        const base = MODE_BASE[d.mode];
        out[d.slug] = {
            slug: d.slug,
            title: d.title,
            seoTitle: d.seoTitle,
            description: d.description,
            category: 'images',
            alias: !STUDIO_BASE.includes(d),
            isNew: STUDIO_BASE.includes(d),
            layout: 'canvas',
            icon: d.icon,
            color: d.color ?? 'text-primary',
            keywords: d.keywords,
            related: [...new Set([base, ...HUB.filter((s) => s !== d.slug), ...(OUTSIDE[base] ?? [])])],
            component: () => import('./tool.svelte')
        };
    }
    return out;
}
