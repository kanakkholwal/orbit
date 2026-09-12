/** The desktop app ships a static client bundle; the web build renders on the server for search engines. */
export const ssr = !import.meta.env.TAURI_ENV_PLATFORM;
