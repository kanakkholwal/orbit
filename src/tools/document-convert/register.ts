import type { ToolConfig } from '../list';
import { DOC_BASE, DOC_DEFS } from './defs';

export const DOC_ALIAS_BASE: Record<string, string> = Object.fromEntries(
    DOC_DEFS.filter((d) => d !== DOC_BASE).map((d) => [d.slug, DOC_BASE.slug])
);

export function buildDocTools(): Record<string, ToolConfig> {
    const out: Record<string, ToolConfig> = {};
    for (const d of DOC_DEFS) {
        out[d.slug] = {
            slug: d.slug,
            title: d.title,
            seoTitle: d.seoTitle,
            description: d.description,
            category: 'conversion',
            alias: d !== DOC_BASE,
            isNew: d === DOC_BASE,
            layout: 'canvas',
            icon: d.icon,
            color: 'text-blue-600',
            keywords: d.keywords,
            related: [...new Set([DOC_BASE.slug, 'word-to-pdf', 'md-to-pdf', 'pdf-to-docx', 'pdf-to-md', 'html-to-pdf'].filter((s) => s !== d.slug))],
            component: () => import('./tool.svelte')
        };
    }
    return out;
}
