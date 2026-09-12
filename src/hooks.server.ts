import { config } from "$constants/app";
import type { Handle } from "@sveltejs/kit";

/** Hosts that serve the same site; Search Console treats them as duplicates, so they redirect. */
const ALIAS_HOSTS = new Set(["pdf.nexonauts.com", "pdf.multi-tools.eu.org", `www.${config.appDomain}`]);

export const handle: Handle = async ({ event, resolve }) => {
  const { url } = event;
  if (ALIAS_HOSTS.has(url.hostname)) {
    return new Response(null, {
      status: 301,
      headers: { location: `https://${config.appDomain}${url.pathname}${url.search}` },
    });
  }
  return resolve(event);
};
