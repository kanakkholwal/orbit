/** Lifts exact and prefix matches of an item's value above looser fuzzy matches.
 * Without it, "line chart" ranks "Live Line Chart" first. */
export function rankCommandMatch(base: number, value: string, search: string): number {
	if (base <= 0) return 0;
	const query = search.trim().toLowerCase();
	if (!query) return base;
	const name = value.trim().toLowerCase();
	if (name === query) return 2;
	if (name.startsWith(query)) return 1 + base / 2;
	return base;
}
