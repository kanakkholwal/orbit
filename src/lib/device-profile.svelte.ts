import { browser } from '$app/environment';

export type DeviceTier = 'low' | 'mid' | 'high';
export type CapKind = 'video' | 'audio' | 'image' | 'zip';

const MB = 1024 * 1024;
const GB = 1024 * MB;

/** Largest input, in bytes, per tier. Streaming output only needs disk, so its video cap is much higher. */
const CAPS: Record<DeviceTier, { streaming: number; buffered: number; audio: number; image: number; zip: number }> = {
    low: { streaming: 500 * MB, buffered: 60 * MB, audio: 200 * MB, image: 30 * MB, zip: 100 * MB },
    mid: { streaming: 2 * GB, buffered: 200 * MB, audio: 500 * MB, image: 80 * MB, zip: 300 * MB },
    high: { streaming: 6 * GB, buffered: 600 * MB, audio: 1 * GB, image: 200 * MB, zip: 800 * MB }
};

type NavigatorWithHints = Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
};

/**
 * What this device can safely do, from native hints: deviceMemory (Chromium, rounded and capped at 8),
 * hardwareConcurrency, Save-Data, and the Storage and OPFS APIs. Unknown values fall back to the user agent.
 */
class DeviceProfile {
    memoryGB = $state<number | null>(null);
    cores = $state(4);
    mobile = $state(false);
    saveData = $state(false);
    /** True when OPFS can write files, so big outputs go to disk instead of memory. */
    streaming = $state(false);
    freeBytes = $state<number | null>(null);
    ready = $state(false);

    get tier(): DeviceTier {
        let tier: DeviceTier;
        if (this.memoryGB !== null) tier = this.memoryGB <= 2 ? 'low' : this.memoryGB <= 4 ? 'mid' : 'high';
        else if (this.mobile) tier = this.cores <= 4 ? 'low' : 'mid';
        else tier = this.cores >= 8 ? 'high' : 'mid';
        if (this.cores <= 2) tier = 'low';
        if (this.saveData && tier !== 'low') tier = tier === 'high' ? 'mid' : 'low';
        return tier;
    }

    /** Max input size in bytes for a kind of file on this device. */
    capFor(kind: CapKind): number {
        const caps = CAPS[this.tier];
        if (kind === 'video') {
            const cap = this.streaming ? caps.streaming : caps.buffered;
            // Output is roughly input sized, so keep half the free disk as headroom.
            return this.streaming && this.freeBytes !== null ? Math.min(cap, Math.max(this.freeBytes / 2, 50 * MB)) : cap;
        }
        return caps[kind];
    }

    /** Files processed at once. */
    get concurrency() {
        return this.tier === 'low' ? 1 : this.tier === 'mid' ? 2 : 3;
    }

    async init() {
        if (!browser || this.ready) return;
        const nav = navigator as NavigatorWithHints;
        this.memoryGB = nav.deviceMemory ?? null;
        this.cores = nav.hardwareConcurrency || 4;
        this.mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent) || (nav.maxTouchPoints > 1 && /Mac/i.test(nav.platform));
        this.saveData = !!nav.connection?.saveData;
        try {
            const { usage = 0, quota = 0 } = (await nav.storage?.estimate?.()) ?? {};
            if (quota) this.freeBytes = Math.max(0, quota - usage);
        } catch {
            /* estimate unavailable */
        }
        this.streaming = await probeOpfsWritable();
        this.ready = true;
    }
}

/** Safari and some webviews expose OPFS but not createWritable on the main thread. */
async function probeOpfsWritable(): Promise<boolean> {
    try {
        const root = await navigator.storage?.getDirectory?.();
        if (!root) return false;
        const name = `orbit-probe-${Date.now()}`;
        const handle = await root.getFileHandle(name, { create: true });
        if (typeof handle.createWritable !== 'function') return false;
        const stream = await handle.createWritable();
        await stream.close();
        await root.removeEntry(name);
        return true;
    } catch {
        return false;
    }
}

export const deviceProfile = new DeviceProfile();

export function formatCap(bytes: number): string {
    return bytes >= GB ? `${(bytes / GB).toFixed(bytes % GB === 0 ? 0 : 1)} GB` : `${Math.round(bytes / MB)} MB`;
}

export const TIER_LABEL: Record<DeviceTier, string> = { low: 'Light', mid: 'Standard', high: 'Powerful' };
