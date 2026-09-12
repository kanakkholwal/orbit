import { ALTERNATIVES, REVIEWED } from "$constants/alternatives";
import { config } from "$constants/app";
import { articles } from "$constants/articles";
import { toolList } from "$tools/list";
import type { RequestHandler } from "./$types";

export const prerender = true;

type Entry = { path: string; lastmod?: string; priority: number };

const PAGES: Entry[] = [
  { path: "/", priority: 1 },
  { path: "/explore", priority: 0.9 },
  { path: "/download", priority: 0.7 },
  { path: "/compare", priority: 0.6 },
  { path: "/articles", priority: 0.6 },
  { path: "/about", priority: 0.5 },
  { path: "/docs", priority: 0.5 },
  { path: "/changelog", priority: 0.4 },
  { path: "/install-pwa", priority: 0.3 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

export const GET: RequestHandler = () => {
  const today = new Date().toISOString().slice(0, 10);
  const entries: Entry[] = [
    ...PAGES,
    ...toolList.map((tool) => ({ path: `/tools/${tool.slug}`, priority: 0.8 })),
    ...ALTERNATIVES.map((alt) => ({ path: `/compare/${alt.slug}`, lastmod: REVIEWED, priority: 0.6 })),
    ...articles.map((article) => ({ path: `/articles/${article.slug}`, lastmod: article.updated ?? article.published, priority: 0.6 })),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (e) =>
        `  <url><loc>https://${config.appDomain}${e.path}</loc><lastmod>${e.lastmod ?? today}</lastmod><priority>${e.priority.toFixed(1)}</priority></url>`
    ),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
};
