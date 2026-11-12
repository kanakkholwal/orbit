import type { ToolConfig } from '../list';
import { MEDIA_BASE, MEDIA_DEFS } from './defs';

/** Popular presets that stay listed in menus next to the base tools. */
const LISTED = new Set(['compress-video', 'video-to-audio', 'mute-video', 'rotate-video', 'trim-video', 'trim-audio']);
const baseFor = (kind: string) => (kind === 'audio' ? 'audio-converter' : 'video-converter');

export const MEDIA_ALIAS_BASE: Record<string, string> = Object.fromEntries(
    MEDIA_DEFS.filter((d) => !MEDIA_BASE.includes(d)).map((d) => [d.slug, baseFor(d.kind)])
);

export function buildMediaTools(): Record<string, ToolConfig> {
    const out: Record<string, ToolConfig> = {};
    for (const d of MEDIA_DEFS) {
        const hub = ['video-converter', 'audio-converter', 'compress-video', 'video-to-audio', 'image-convert'];
        out[d.slug] = {
            slug: d.slug,
            title: d.title,
            seoTitle: d.seoTitle,
            description: d.description,
            category: 'media',
            alias: !MEDIA_BASE.includes(d) && !LISTED.has(d.slug),
            isNew: MEDIA_BASE.includes(d),
            layout: 'canvas',
            icon: d.icon,
            color: d.color ?? 'text-primary',
            keywords: d.keywords,
            related: [...new Set([baseFor(d.kind), ...hub].filter((s) => s !== d.slug))],
            component: () => import('./tool.svelte')
        };
    }
    return out;
}
