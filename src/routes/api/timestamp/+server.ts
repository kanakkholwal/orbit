import type { RequestHandler } from './$types';

/**
 * RFC 3161 trusted-timestamp proxy (SvelteKit endpoint).
 *
 * Orbit signs PDFs entirely in your browser. The one thing a browser cannot do
 * directly is fetch a trusted timestamp from a Time-Stamping Authority (TSA):
 * those endpoints don't send CORS headers, and hitting them from many client
 * IPs gets them rate-limited or banned. This same-origin endpoint forwards a
 * standard RFC 3161 timestamp *request* (a SHA-256 hash of your signature — NOT
 * your document) to a public TSA and returns the timestamp token.
 *
 * Deploys with the app on Cloudflare (adapter-cloudflare / adapter-auto). On the
 * web it is same-origin (no URL to configure); the desktop app calls the
 * deployed copy via an absolute URL (see `src/lib/runtime/proxy-url.ts`).
 *
 * Minimal and auditable: only accepts `application/timestamp-query`, forwards to
 * one fixed TSA (no open relay), returns the token verbatim, logs nothing.
 */

export const prerender = false;

// A public, free RFC 3161 TSA. DigiCert's is widely trusted and needs no account.
const TSA_URL = 'http://timestamp.digicert.com';

const CORS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export const OPTIONS: RequestHandler = async () =>
    new Response(null, { status: 204, headers: CORS });

export const POST: RequestHandler = async ({ request }) => {
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('application/timestamp-query')) {
        return new Response('Expected application/timestamp-query', { status: 415, headers: CORS });
    }

    const body = await request.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > 64 * 1024) {
        return new Response('Invalid timestamp request', { status: 400, headers: CORS });
    }

    try {
        const upstream = await fetch(TSA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/timestamp-query' },
            body
        });
        if (!upstream.ok) {
            return new Response(`TSA error: ${upstream.status}`, { status: 502, headers: CORS });
        }
        const token = await upstream.arrayBuffer();
        return new Response(token, {
            status: 200,
            headers: {
                ...CORS,
                'Content-Type': 'application/timestamp-reply',
                'Cache-Control': 'no-store'
            }
        });
    } catch {
        return new Response('Failed to reach timestamp authority', { status: 502, headers: CORS });
    }
};
