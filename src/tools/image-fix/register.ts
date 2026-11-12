import type { ToolConfig } from '../list';
import { FIX_DEFS } from './defs';

const HUB = ['image-resize', 'image-crop', 'image-compress', 'image-convert', 'remove-background'];

export function buildImageFixTools(): Record<string, ToolConfig> {
    const out: Record<string, ToolConfig> = {};
    for (const d of FIX_DEFS) {
        out[d.slug] = {
            slug: d.slug,
            title: d.title,
            seoTitle: d.seoTitle,
            description: d.description,
            category: 'images',
            isNew: true,
            layout: 'canvas',
            icon: d.icon,
            color: d.color,
            keywords: d.keywords,
            related: [...FIX_DEFS.map((f) => f.slug), ...HUB].filter((s) => s !== d.slug),
            component: () => import('./tool.svelte')
        };
    }
    return out;
}
