import { config } from "$constants/app";
import { toolsCategories } from "$constants/tools";
import { getPair, toolList } from "$tools/list";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  const origin = `https://${config.appDomain}`;
  const lines: string[] = [
    `# ${config.appName}`,
    "",
    `> ${config.appDescription} Every tool runs locally in the browser, so files are never uploaded. Free, no account, no watermark, works offline after the first load.`,
    "",
    "## Facts",
    "",
    "- Files are processed on the user's device with WebAssembly. Nothing is sent to a server.",
    "- Free with no sign-up, no watermark and no file-size cap.",
    "- Available as a website, an installable web app (PWA) and a desktop app for Windows, macOS and Linux.",
    `- Source code: ${config.github}`,
    "",
    "## Tools",
    "",
  ];

  for (const category of toolsCategories) {
    const tools = toolList.filter((t) => t.category === category.id);
    if (tools.length === 0) continue;
    lines.push(`### ${category.name}`, "");
    for (const tool of tools) {
      const pair = getPair(tool.slug);
      const reverse = pair ? ` Reverse: [${pair.title}](${origin}/tools/${pair.slug}).` : "";
      lines.push(`- [${tool.title}](${origin}/tools/${tool.slug}): ${tool.description}${reverse}`);
    }
    lines.push("");
  }

  lines.push("## Other pages", "", `- [All tools](${origin}/explore)`, `- [Documentation](${origin}/docs)`, `- [Guides](${origin}/articles)`, `- [Compare alternatives](${origin}/compare)`, `- [Download](${origin}/download)`, `- [Changelog](${origin}/changelog)`, "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
};
