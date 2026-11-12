import { IconGauge } from '$lib/icons';
import type { ToolConfig } from '../list';

const SIZES = [100, 200, 500, 1024, 2048];
const noUpload = ['no upload', 'free', 'offline'];

const label = (kb: number) => (kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`);
const slugSize = (kb: number) => (kb >= 1024 ? `${kb / 1024}mb` : `${kb}kb`);

/** Pages for "compress PDF to N KB", all backed by the Compress PDF tool. */
export const COMPRESS_PDF_ALIASES = SIZES.map((kb) => `compress-pdf-to-${slugSize(kb)}`);

export function buildCompressPdfAliases(): Record<string, ToolConfig> {
    const out: Record<string, ToolConfig> = {};
    for (const kb of SIZES) {
        const s = slugSize(kb);
        const slug = `compress-pdf-to-${s}`;
        out[slug] = {
            slug,
            title: `Compress PDF to ${label(kb)}`,
            seoTitle: `Compress PDF to ${label(kb)} Online Without Uploading`,
            description: `Shrink a PDF to under ${label(kb)} for forms, portals and email. The tool tightens compression step by step until the file fits. Free, private, and nothing is uploaded.`,
            category: 'essentials',
            icon: IconGauge,
            color: 'text-yellow-500',
            keywords: [`compress pdf to ${s}`, `reduce pdf size to ${s}`, `pdf under ${s}`, `pdf ${s}`, 'compress pdf to size', ...noUpload],
            related: ['compress-pdf', 'image-compress', 'photo-for-forms', 'img-to-pdf', ...COMPRESS_PDF_ALIASES.filter((x) => x !== slug).slice(0, 2)],
            component: () => import('./tool.svelte')
        };
    }
    return out;
}
