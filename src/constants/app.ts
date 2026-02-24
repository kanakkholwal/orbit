import { dev } from '$app/environment';
import {
    PUBLIC_ADSENSE_PUBLISHER_ID,
    PUBLIC_GOOGLE_ANALYTICS_ID
} from '$env/static/public';

export const config = {
    appName: 'Orbit PDF',
    appVersion: '0.1.0',
    appDescription: `The privacy-first PDF toolkit for professionals. Process documents
          locally via WebAssembly without them ever touching a server.`,
    supportEmail: "support@nexonauts.com",
    appDomain: "orbit.nexonauts.com",
    github: "https://github.com/kanakkholwal/orbit",
    adsensePublisherId: dev ? "" : (PUBLIC_ADSENSE_PUBLISHER_ID?.trim() || ""),
    googleAnalyticsId: dev ? "" : (PUBLIC_GOOGLE_ANALYTICS_ID?.trim() || ""),
}