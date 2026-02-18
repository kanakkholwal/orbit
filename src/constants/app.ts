import { dev } from '$app/environment';
import {
    PUBLIC_ADSENSE_PUBLISHER_ID,
    PUBLIC_GOOGLE_ANALYTICS_ID
} from '$env/static/public';

export const config = {
    appName: 'Nexo PDF',
    appVersion: '0.1.0',
    appDescription: `The privacy-first PDF toolkit for professionals. Process documents
          locally via WebAssembly without them ever touching a server.`,
    supportEmail: "support@nexonauts.com",
    github: "https://github.com/kanakkholwal/nexo-pdf",
    adsensePublisherId: dev ? "" : PUBLIC_ADSENSE_PUBLISHER_ID || "",
    googleAnalyticsId: dev ? "" : PUBLIC_GOOGLE_ANALYTICS_ID || "",
}