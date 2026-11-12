import { browser } from '$app/environment';

export interface DefaultFormats {
    image: string;
    audio: string;
    video: string;
    document: string;
}

export interface OrbitSettings {
    /** Output name template. `%name%` is the source name without extension. */
    filenameTemplate: string;
    defaultFormats: DefaultFormats;
    /** 1-100, used by lossy image encoders. */
    imageQuality: number;
    analytics: boolean;
    /** Skip large engine downloads until the user opts in (mobile data). */
    confirmLargeDownloads: boolean;
}

const KEY = 'orbit:settings';
const VERSION = 1;

const DEFAULTS: OrbitSettings = {
    filenameTemplate: '%name%',
    defaultFormats: { image: 'webp', audio: 'mp3', video: 'mp4', document: 'docx' },
    imageQuality: 90,
    analytics: true,
    confirmLargeDownloads: true
};

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/** Persisted, versioned app settings. Unknown or missing keys fall back to DEFAULTS. */
class SettingsStore {
    value = $state<OrbitSettings>(clone(DEFAULTS));
    #loaded = false;

    load() {
        if (!browser || this.#loaded) return;
        this.#loaded = true;
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as { v?: number; data?: Partial<OrbitSettings> };
            if (parsed.v !== VERSION || !parsed.data) return;
            const { defaultFormats, ...rest } = parsed.data;
            this.value = {
                ...clone(DEFAULTS),
                ...rest,
                defaultFormats: { ...DEFAULTS.defaultFormats, ...defaultFormats }
            };
        } catch {
            this.value = clone(DEFAULTS);
        }
    }

    save() {
        if (!browser) return;
        try {
            localStorage.setItem(KEY, JSON.stringify({ v: VERSION, data: $state.snapshot(this.value) }));
        } catch {
            /* storage unavailable, keep in memory */
        }
    }

    reset() {
        this.value = clone(DEFAULTS);
        this.save();
    }

    /** Applies the filename template to a source file name and target extension. */
    outputName(sourceName: string, extension: string): string {
        const dot = sourceName.lastIndexOf('.');
        const base = dot > 0 ? sourceName.slice(0, dot) : sourceName;
        const name = this.value.filenameTemplate.replaceAll('%name%', base).trim() || base;
        return `${name}.${extension.replace(/^\./, '')}`;
    }
}

export const settings = new SettingsStore();
