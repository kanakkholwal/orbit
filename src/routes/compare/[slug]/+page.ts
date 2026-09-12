import { ALTERNATIVES, getAlternative } from "$constants/alternatives";
import { getTool, type ToolConfig } from "$tools/list";
import { error } from "@sveltejs/kit";
import type { EntryGenerator, PageLoad } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = () => ALTERNATIVES.map((a) => ({ slug: a.slug }));

export const load: PageLoad = ({ params }) => {
  const alternative = getAlternative(params.slug);
  if (!alternative) error(404, "Not found");
  const tools = alternative.tools.map((slug) => getTool(slug)).filter((t): t is ToolConfig => t !== null);
  const others = ALTERNATIVES.filter((a) => a.slug !== alternative.slug);
  return { alternative, tools, others };
};
