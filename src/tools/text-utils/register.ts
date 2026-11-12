import type { ToolConfig } from '../list';
import { TEXT_DEFS } from './defs';

const GROUPS: string[][] = [
    ['json-formatter', 'minify-json', 'json-to-csv', 'csv-to-json'],
    ['srt-to-vtt', 'vtt-to-srt'],
    ['base64-encode', 'base64-decode']
];

export function buildTextTools(): Record<string, ToolConfig> {
    const out: Record<string, ToolConfig> = {};
    for (const d of TEXT_DEFS) {
        const group = GROUPS.find((g) => g.includes(d.slug)) ?? [];
        out[d.slug] = {
            slug: d.slug,
            title: d.title,
            seoTitle: d.seoTitle,
            description: d.description,
            category: 'conversion',
            isNew: true,
            layout: 'form',
            icon: d.icon,
            color: d.color,
            keywords: d.keywords,
            related: group.filter((s) => s !== d.slug),
            component: () => import('./tool.svelte')
        };
    }
    return out;
}
