import { browser } from '$app/environment';

/**
 * Recently-used tools, persisted to localStorage (works on web + desktop).
 *
 * NOTE: Orbit never retains the actual files (privacy by architecture), so a
 * "recent files" list isn't possible — what's useful and honest is a "jump
 * back in" list of recently-opened tools, surfaced on the workspace home.
 */

export interface RecentTool {
    slug: string;
    at: number;
}

const KEY = 'orbit:recent-tools';
const MAX = 6;

export const recentTools = $state<{ items: RecentTool[] }>({ items: [] });

export function loadRecentTools() {
    if (!browser) return;
    try {
        const raw = localStorage.getItem(KEY);
        recentTools.items = raw ? JSON.parse(raw) : [];
    } catch {
        recentTools.items = [];
    }
}

export function recordRecentTool(slug: string) {
    if (!browser || !slug) return;
    const next = [
        { slug, at: Date.now() },
        ...recentTools.items.filter((t) => t.slug !== slug)
    ].slice(0, MAX);
    recentTools.items = next;
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        /* storage unavailable — keep in-memory only */
    }
}

export function clearRecentTools() {
    recentTools.items = [];
    if (browser) {
        try {
            localStorage.removeItem(KEY);
        } catch {
            /* ignore */
        }
    }
}
