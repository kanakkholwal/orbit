export type SiblingProduct = {
	name: string;
	href: string;
	tagline: string;
	summary: string;
};

/** Other Nexonauts products, linked from the footer and the About page. */
export const siblingProducts: SiblingProduct[] = [
	{
		name: "Recast",
		href: "https://recast.li",
		tagline: "Record. Polish. Share.",
		summary:
			"Turns a raw screen capture into a polished demo, with smart auto-edits and a timeline anyone can drive.",
	},
	{
		name: "GlyphTeX",
		href: "https://glyphtex.nexonauts.com",
		tagline: "LaTeX in your browser",
		summary:
			"A local-first LaTeX editor that compiles on your device, works offline and keeps its history in Git.",
	},
	{
		name: "Docvia",
		href: "https://docvia.dev",
		tagline: "Docs, compiled",
		summary:
			"Compiles Markdown into typed, pre-rendered modules for React, Svelte and any framework with an adapter.",
	},
	{
		name: "Specimen",
		href: "https://specimen.nexonauts.com",
		tagline: "Type, in context",
		summary:
			"A place to set type, compare faces and see how a typeface behaves before it lands in a design.",
	},
];
