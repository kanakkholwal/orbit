import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../src/lib/icons");
const OUT = join(ROOT, "icons");
const check = process.argv.includes("--check");
const require = createRequire(import.meta.url);

/** "arrow-up-right" becomes "IconArrowUpRight". */
const exportName = (name) =>
	`Icon${name.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase())}`;

const SOLAR = JSON.parse(
	readFileSync(require.resolve("@iconify-json/solar/icons.json"), "utf8"),
);

/**
 * The source as one `<svg>` string. "solar:<name-weight>" is Solar (rounded corners, CC BY 4.0),
 * "simple:<slug>" a Simple Icons brand mark (CC0), "custom:<file>" custom/<file>.svg.
 */
function source(ref) {
	const [set, name] = ref.split(":");
	if (set === "solar") {
		const icon = SOLAR.icons[name];
		if (!icon) throw new Error(`icons.json: Solar has no "${name}"`);
		const size = `0 0 ${icon.width ?? SOLAR.width ?? 24} ${icon.height ?? SOLAR.height ?? 24}`;
		return `<svg viewBox="${size}">${icon.body}</svg>`;
	}
	if (set === "simple") {
		const svg = readFileSync(require.resolve(`simple-icons/icons/${name}.svg`), "utf8");
		// Brand marks are one filled path; the title would duplicate the component's own label.
		return svg
			.replace(/<title>[\s\S]*?<\/title>/, "")
			.replace(' role="img"', ' fill="currentColor"');
	}
	if (set === "custom") return readFileSync(join(ROOT, "custom", `${name}.svg`), "utf8");
	throw new Error(`icons.json: unknown source "${ref}"`);
}

function component(ref) {
	const svg = source(ref).trim();
	const match = svg.match(/^<svg([^>]*)>([\s\S]*)<\/svg>$/);
	if (!match) throw new Error(`icons.json: ${ref} is not a single <svg> element`);
	// Size, class and namespace come from the component; the source keeps viewBox and paint.
	const attrs = [...match[1].matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)]
		.filter(([, key]) => !["xmlns", "width", "height", "class"].includes(key))
		.map(([, key, value]) => `${key}="${value}"`)
		.join(" ");
	const body = match[2].replace(/\s*\n\s*/g, "").trim();
	return [
		'<script lang="ts">',
		'import type { IconProps } from "../types";',
		"",
		"let { size = 24, ...rest }: IconProps = $props();",
		"</script>",
		"",
		`<svg xmlns="http://www.w3.org/2000/svg" ${attrs} width={size} height={size} aria-hidden={rest["aria-label"] === undefined ? "true" : undefined} {...rest}>${body}</svg>`,
		"",
	].join("\n");
}

const manifest = JSON.parse(readFileSync(join(ROOT, "icons.json"), "utf8"));
const names = Object.keys(manifest).sort();
const files = new Map(
	names.map((name) => [join(OUT, `${name}.svelte`), component(manifest[name])]),
);
files.set(
	join(ROOT, "index.ts"),
	[
		...names.map(
			(name) =>
				`export { default as ${exportName(name)} } from "./icons/${name}.svelte";`,
		),
		'export type { Icon, IconProps } from "./types";',
		"",
	].join("\n"),
);

const stale = [...files].filter(
	([path, text]) => !existsSync(path) || readFileSync(path, "utf8") !== text,
);
const orphans = existsSync(OUT)
	? readdirSync(OUT)
			.map((file) => join(OUT, file))
			.filter((path) => !files.has(path))
	: [];

if (check) {
	for (const [path] of stale) console.error(`icons: stale ${path}`);
	for (const path of orphans) console.error(`icons: not in icons.json ${path}`);
	if (stale.length || orphans.length) process.exit(1);
	console.log(`icons: ${names.length} up to date`);
} else {
	mkdirSync(OUT, { recursive: true });
	for (const [path, text] of stale) writeFileSync(path, text);
	for (const path of orphans) rmSync(path);
	console.log(
		`icons: ${names.length} icons, ${stale.length} written, ${orphans.length} removed`,
	);
}
