import { browser } from '$app/environment';

export type WasmPackage = 'pymupdf' | 'ghostscript' | 'cpdf';

interface WasmProviderConfig {
    pymupdf?: string;
    ghostscript?: string;
    cpdf?: string;
}

const STORAGE_KEY = 'orbit:wasm-providers';

const CDN_DEFAULTS: Record<WasmPackage, string> = {
    pymupdf: 'https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.14/',
    ghostscript: 'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm/assets/',
    cpdf: 'https://cdn.jsdelivr.net/npm/coherentpdf/dist/',
};

// Helper to safely get env vars
const getEnv = (key: string, fallback: string) => {
    // @ts-ignore - Handle Vite vs SvelteKit env
    return (import.meta.env?.[key] as string) || fallback;
};

const ENV_DEFAULTS: Record<WasmPackage, string> = {
    pymupdf: getEnv('VITE_WASM_PYMUPDF_URL', CDN_DEFAULTS.pymupdf),
    ghostscript: getEnv('VITE_WASM_GS_URL', CDN_DEFAULTS.ghostscript),
    cpdf: getEnv('VITE_WASM_CPDF_URL', CDN_DEFAULTS.cpdf),
};

export class WasmStore {
    // Reactive State
    config = $state<WasmProviderConfig>({});
    
    // Dialog State
    dialogState = $state<{
        isOpen: boolean;
        packageName?: WasmPackage;
        onConfigure?: () => void;
    }>({ isOpen: false });

    private validationCache = new Map<WasmPackage, boolean>();

    constructor() {
        if (browser) {
            this.loadConfig();
        }
    }

    private loadConfig() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.config = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('[WasmProvider] Failed to load config:', e);
        }
    }

    private saveConfig() {
        if (!browser) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
        } catch (e) {
            console.error('[WasmProvider] Failed to save config:', e);
        }
    }

    // --- Configuration Methods ---

    getUrl(packageName: WasmPackage): string | undefined {
        return this.config[packageName] || ENV_DEFAULTS[packageName];
    }

    setUrl(packageName: WasmPackage, url: string) {
        const normalizedUrl = url.endsWith('/') ? url : `${url}/`;
        this.config[packageName] = normalizedUrl;
        this.validationCache.delete(packageName);
        this.saveConfig();
    }

    removeUrl(packageName: WasmPackage) {
        delete this.config[packageName];
        this.validationCache.delete(packageName);
        this.saveConfig();
    }

    isConfigured(packageName: WasmPackage): boolean {
        return !!(this.config[packageName] || ENV_DEFAULTS[packageName]);
    }

    resetToDefaults() {
        this.config = {};
        this.validationCache.clear();
        if (browser) localStorage.removeItem(STORAGE_KEY);
    }

    // --- Validation Logic ---

    async validateUrl(packageName: WasmPackage, url?: string): Promise<{ valid: boolean; error?: string }> {
        const testUrl = url || this.config[packageName];
        if (!testUrl) return { valid: false, error: 'No URL configured' };

        try {
            const parsedUrl = new URL(testUrl);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                return { valid: false, error: 'URL must start with http:// or https://' };
            }
        } catch {
            return { valid: false, error: 'Invalid URL format.' };
        }

        const normalizedUrl = testUrl.endsWith('/') ? testUrl : `${testUrl}/`;
        const testFiles: Record<WasmPackage, string> = {
            pymupdf: 'dist/index.js',
            ghostscript: 'gs.js',
            cpdf: 'coherentpdf.browser.min.js',
        };

        try {
            const fullUrl = `${normalizedUrl}${testFiles[packageName]}`;
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 10000);

            const res = await fetch(fullUrl, { method: 'GET', mode: 'cors', signal: controller.signal });
            clearTimeout(id);

            if (!res.ok) return { valid: false, error: `File not found (HTTP ${res.status})` };
            
            // Abort stream immediately to save bandwidth
            await res.body?.cancel();

            if (!url || url === this.config[packageName]) {
                this.validationCache.set(packageName, true);
            }
            return { valid: true };
        } catch (e: any) {
            return { valid: false, error: e.message || 'Connection failed' };
        }
    }

    // --- Dialog Management ---

    /**
     * Checks if a package is available. If not, opens the dialog.
     */
    require(packageName: WasmPackage, onAvailable?: () => void): boolean {
        if (this.isConfigured(packageName)) {
            onAvailable?.();
            return true;
        }
        
        // Open the dialog via reactive state
        this.dialogState = {
            isOpen: true,
            packageName,
            onConfigure: onAvailable
        };
        return false;
    }

    closeDialog() {
        this.dialogState.isOpen = false;
    }

    // --- Metadata Helpers ---

    getDisplayName(packageName: WasmPackage): string {
        const names: Record<WasmPackage, string> = {
            pymupdf: 'PyMuPDF (Document Processing)',
            ghostscript: 'Ghostscript (PDF/A Conversion)',
            cpdf: 'CoherentPDF (Bookmarks & Metadata)',
        };
        return names[packageName] || packageName;
    }

    getFeatures(packageName: WasmPackage): string[] {
        const features: Record<WasmPackage, string[]> = {
            pymupdf: ['PDF to Text', 'PDF to Image', 'Compress PDF', 'Convert Formats'],
            ghostscript: ['PDF/A Compliance', 'Font Outlining'],
            cpdf: ['Merge/Split', 'Bookmarks', 'Metadata Editing'],
        };
        return features[packageName] || [];
    }
}

// Singleton Instance
export const wasmStore = new WasmStore();