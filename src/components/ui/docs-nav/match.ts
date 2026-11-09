export type DocsNavMatch = {
	href: string;
	match?: readonly string[];
};

export function matchesCurrent(item: DocsNavMatch, current?: string): boolean {
	if (!current) return false;
	if (!item.match?.length) return current === item.href;
	return item.match.some(
		(pattern) => current === pattern || current.startsWith(`${pattern}/`),
	);
}
