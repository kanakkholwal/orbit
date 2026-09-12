import { articles } from "$constants/articles";
import { getTool, type ToolConfig } from "$tools/list";
import { error } from "@sveltejs/kit";
import { marked } from "marked";
import type { EntryGenerator, PageLoad } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () => articles.map((a) => ({ slug: a.slug }));

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const load: PageLoad = ({ params }) => {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) error(404, "Not found");

  const toc: { id: string; text: string }[] = [];
  const html = (marked.parse(article.body, { async: false }) as string).replace(/<h2>(.*?)<\/h2>/g, (_, inner: string) => {
    const id = slugify(inner);
    toc.push({ id, text: inner.replace(/<[^>]+>/g, "") });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  const tools = article.tools.map((slug) => getTool(slug)).filter((t): t is ToolConfig => t !== null);
  const related = articles
    .filter((a) => a.slug !== article.slug)
    .map((a) => ({ a, score: a.tools.filter((t) => article.tools.includes(t)).length }))
    .sort((x, y) => y.score - x.score)
    .slice(0, 3)
    .map(({ a }) => a);

  return { article, html, toc, tools, related };
};
