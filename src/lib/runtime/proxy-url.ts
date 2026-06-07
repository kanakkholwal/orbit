import { config } from '$constants/app';
import { appState } from '$stores/app-state.svelte';

/**
 * Resolve the URL for a server-side proxy endpoint (deployed as a Cloudflare
 * Pages Function alongside the static site).
 *
 * Why this exists: a handful of standards features — RFC 3161 trusted
 * timestamps and OCSP/CRL revocation checks for signature *verification* —
 * require contacting external authorities, which browsers block via CORS and
 * which would also expose Orbit's IP to rate-limiting/bans. A single same-origin
 * proxy solves both.
 *
 *  • On the web build the site and the proxy share an origin, so a relative
 *    path is enough — no URL needs to be configured.
 *  • In the Tauri desktop build the app is served from a custom protocol
 *    (e.g. `tauri://localhost`), so a relative `/api/...` would resolve to the
 *    app bundle, not the deployed proxy. There we fall back to an absolute URL
 *    derived from `config.appDomain` — again, nothing extra to configure.
 */
export function proxyUrl(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    if (appState.isTauri) {
        return `https://${config.appDomain}${p}`;
    }
    return p;
}

/** Public source link so users can audit exactly what the proxy does. */
export const PROXY_SOURCE_URL = `${config.github}/blob/main/src/routes/api/timestamp/+server.ts`;
