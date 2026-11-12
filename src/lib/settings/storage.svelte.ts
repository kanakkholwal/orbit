import { browser } from '$app/environment';

/** Wraps the Storage API and Cache API so Settings can show and manage offline data. */
class OfflineStorage {
    usage = $state(0);
    quota = $state(0);
    persisted = $state(false);
    supported = $state(false);

    async refresh() {
        if (!browser || !navigator.storage?.estimate) return;
        this.supported = true;
        const { usage = 0, quota = 0 } = await navigator.storage.estimate();
        this.usage = usage;
        this.quota = quota;
        this.persisted = (await navigator.storage.persisted?.()) ?? false;
    }

    /** Asks the browser not to evict cached engines under storage pressure. */
    async requestPersistence() {
        if (!browser || !navigator.storage?.persist) return false;
        this.persisted = await navigator.storage.persist();
        return this.persisted;
    }

    async clearCaches() {
        if (!browser || !('caches' in window)) return;
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        await this.refresh();
    }
}

export const offlineStorage = new OfflineStorage();

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let value = bytes / 1024;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) {
        value /= 1024;
        i++;
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}
