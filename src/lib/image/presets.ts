import type { OutputFormat } from './codec';

export type PresetGroup = 'photo' | 'signature' | 'limit' | 'social';
export type Unit = 'px' | 'mm' | 'in';

export interface ImagePreset {
    id: string;
    label: string;
    group: PresetGroup;
    width?: number;
    height?: number;
    unit?: Unit;
    /** Pixels per inch, used to turn mm and inch sizes into pixels. */
    dpi?: number;
    maxKB?: number;
    minKB?: number;
    format?: OutputFormat;
    note?: string;
}

export const GROUP_LABEL: Record<PresetGroup, string> = {
    photo: 'Photo size',
    signature: 'Signature',
    limit: 'File size limit',
    social: 'Social media'
};

const LIMITS = [10, 20, 50, 100, 200, 500, 1024, 2048];
const limitLabel = (kb: number) => (kb >= 1024 ? `Under ${kb / 1024} MB` : `Under ${kb} KB`);

export const PRESETS: ImagePreset[] = [
    { id: 'passport-35x45', label: 'Passport 35 x 45 mm', group: 'photo', width: 35, height: 45, unit: 'mm', dpi: 300, format: 'jpeg', note: 'India, UK, EU and Schengen passports and visas' },
    { id: 'passport-2x2', label: 'Passport or visa 2 x 2 in', group: 'photo', width: 2, height: 2, unit: 'in', dpi: 300, format: 'jpeg', note: 'US passport and visa, 600 x 600 px' },
    { id: 'visa-33x48', label: 'Visa 33 x 48 mm', group: 'photo', width: 33, height: 48, unit: 'mm', dpi: 300, format: 'jpeg', note: 'China visa' },
    { id: 'id-25x35', label: 'ID photo 25 x 35 mm', group: 'photo', width: 25, height: 35, unit: 'mm', dpi: 300, format: 'jpeg', note: 'PAN style ID photos' },
    { id: 'exam-200x230', label: 'Exam form photo 200 x 230 px', group: 'photo', width: 200, height: 230, unit: 'px', maxKB: 50, format: 'jpeg', note: 'Common for entrance and recruitment forms' },
    { id: 'sig-140x60', label: 'Signature 140 x 60 px', group: 'signature', width: 140, height: 60, unit: 'px', maxKB: 20, format: 'jpeg', note: 'Common for exam forms' },
    { id: 'sig-200x80', label: 'Signature 200 x 80 px', group: 'signature', width: 200, height: 80, unit: 'px', maxKB: 30, format: 'jpeg' },
    ...LIMITS.map<ImagePreset>((kb) => ({ id: `under-${kb}kb`, label: limitLabel(kb), group: 'limit', maxKB: kb })),
    { id: 'ig-square', label: 'Instagram square 1080 x 1080', group: 'social', width: 1080, height: 1080, unit: 'px' },
    { id: 'ig-portrait', label: 'Instagram portrait 1080 x 1350', group: 'social', width: 1080, height: 1350, unit: 'px' },
    { id: 'story', label: 'Story or Reel 1080 x 1920', group: 'social', width: 1080, height: 1920, unit: 'px' },
    { id: 'linkedin-profile', label: 'LinkedIn profile 400 x 400', group: 'social', width: 400, height: 400, unit: 'px' },
    { id: 'whatsapp-dp', label: 'WhatsApp picture 500 x 500', group: 'social', width: 500, height: 500, unit: 'px' },
    { id: 'yt-thumb', label: 'YouTube thumbnail 1280 x 720', group: 'social', width: 1280, height: 720, unit: 'px', maxKB: 2048 },
    { id: 'x-header', label: 'X header 1500 x 500', group: 'social', width: 1500, height: 500, unit: 'px' }
];

export const getPreset = (id: string | undefined) => PRESETS.find((p) => p.id === id);

export const presetsByGroup = (groups?: PresetGroup[]) =>
    (Object.keys(GROUP_LABEL) as PresetGroup[])
        .filter((g) => !groups || groups.includes(g))
        .map((group) => ({ group, label: GROUP_LABEL[group], items: PRESETS.filter((p) => p.group === group) }))
        .filter((g) => g.items.length > 0);

/** Output size in pixels, or undefined when the preset only sets a byte limit. */
export function presetPixels(p: ImagePreset): { width: number; height: number } | undefined {
    if (!p.width || !p.height) return undefined;
    const dpi = p.dpi ?? 300;
    if (p.unit === 'mm') return { width: Math.round((p.width / 25.4) * dpi), height: Math.round((p.height / 25.4) * dpi) };
    if (p.unit === 'in') return { width: Math.round(p.width * dpi), height: Math.round(p.height * dpi) };
    return { width: p.width, height: p.height };
}

export interface AspectOption {
    id: string;
    label: string;
    /** width / height, or undefined for free crop. */
    ratio?: number;
}

export const ASPECTS: AspectOption[] = [
    { id: 'free', label: 'Free' },
    { id: '1:1', label: '1:1', ratio: 1 },
    { id: '4:5', label: '4:5', ratio: 4 / 5 },
    { id: '3:4', label: '3:4', ratio: 3 / 4 },
    { id: '4:3', label: '4:3', ratio: 4 / 3 },
    { id: '3:2', label: '3:2', ratio: 3 / 2 },
    { id: '16:9', label: '16:9', ratio: 16 / 9 },
    { id: '9:16', label: '9:16', ratio: 9 / 16 },
    { id: '35:45', label: '35:45', ratio: 35 / 45 },
    { id: 'a4', label: 'A4', ratio: 210 / 297 }
];
